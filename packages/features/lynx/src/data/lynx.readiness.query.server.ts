import {
  listAiActionSandboxes,
  listAiApprovalProposals,
  listLynxRunLedger,
} from "@afenda/db";
import {
  getAccessibleModules,
  getModuleWorkspace,
  getModuleWorkspaceStats,
  resolveWorkspaceDataMode,
} from "@afenda/kernel";
import {
  countKnowledgeChunks,
  countKnowledgeDocuments,
  listKnowledgeSources,
  listLynxEvalRuns,
} from "@afenda/feature-knowledge/server";
import {
  evaluateLynxEvalGate,
  getAggregateLynxReadinessStatus,
} from "../contracts/lynx.readiness.contract";
import {
  lynxReadinessSnapshotSchema,
  type LynxModuleReadiness,
  type LynxReadinessSignal,
  type LynxReadinessSnapshot,
  type LynxReadinessStatus,
  type LynxToolAvailability,
} from "../schemas/lynx.readiness.schema";

type SessionSource = "dev" | "neon";

function statusForCount(count: number): LynxReadinessStatus {
  return count > 0 ? "available" : "unavailable";
}

function buildKnowledgeSignals(input: {
  sourceCount: number;
  documentCount: number;
  chunkCount: number;
  evalGateStatus: LynxReadinessStatus;
}): LynxReadinessSignal[] {
  return [
    {
      id: "knowledge-sources",
      label: "Knowledge sources",
      status: statusForCount(input.sourceCount),
      value: String(input.sourceCount),
      detail:
        input.sourceCount > 0
          ? "At least one tenant Knowledge source is configured."
          : "No tenant Knowledge source is configured.",
    },
    {
      id: "knowledge-documents",
      label: "Knowledge documents",
      status: statusForCount(input.documentCount),
      value: String(input.documentCount),
      detail:
        input.documentCount > 0
          ? "Tenant documents are available for chunking and retrieval."
          : "No tenant documents have been committed.",
    },
    {
      id: "knowledge-chunks",
      label: "Knowledge chunks",
      status: statusForCount(input.chunkCount),
      value: String(input.chunkCount),
      detail:
        input.chunkCount > 0
          ? "Truth Retrieval can ground answers in indexed chunks."
          : "Truth Retrieval has no indexed chunks to cite.",
    },
    {
      id: "eval-gate",
      label: "Eval quality gate",
      status: input.evalGateStatus,
      detail: "Latest Lynx eval run is checked against enterprise thresholds.",
    },
  ];
}

function moduleSafeNextAction(status: LynxReadinessStatus) {
  if (status === "available") {
    return "Use read-only Lynx tools for module inspection.";
  }

  if (status === "partial") {
    return "Treat module results as directional until persisted records are available.";
  }

  return "Build the module substrate before adding ERP-native Lynx tools.";
}

function toolNameForModule(moduleId: string) {
  if (moduleId === "finance") return "inspectFinanceSignals";
  if (moduleId === "approvals") return "inspectApprovalControls";
  if (moduleId === "system-admin" || moduleId === "reports") {
    return "inspectAuditReadiness";
  }

  return `inspect-${moduleId}`;
}

function toolReasonForModule(input: {
  status: LynxReadinessStatus;
  moduleId: string;
}) {
  if (
    input.moduleId === "finance" ||
    input.moduleId === "approvals" ||
    input.moduleId === "system-admin" ||
    input.moduleId === "reports"
  ) {
    return input.status === "available"
      ? "ERP-native read inspection is enabled for this tenant module."
      : "ERP-native read inspection is available with readiness caveats.";
  }

  return input.status === "available"
    ? "Module has persisted tenant substrate."
    : "Deep ERP-native tools are deferred until the module substrate is durable.";
}

export async function getLynxReadinessSnapshot(input: {
  organizationId: string;
  capabilities: readonly string[];
  sessionSource: SessionSource;
}): Promise<LynxReadinessSnapshot> {
  const dataMode = resolveWorkspaceDataMode(input.sessionSource);
  const accessibleModules = getAccessibleModules(
    input.capabilities as Parameters<typeof getAccessibleModules>[0],
  );

  const [
    sources,
    documentCount,
    chunkCount,
    evalRuns,
    approvals,
    sandboxes,
    runLedger,
  ] = await Promise.all([
    listKnowledgeSources(input.organizationId),
    countKnowledgeDocuments(input.organizationId),
    countKnowledgeChunks(input.organizationId),
    listLynxEvalRuns(input.organizationId, 1),
    listAiApprovalProposals({
      organizationId: input.organizationId,
      limit: 20,
    }),
    listAiActionSandboxes({ organizationId: input.organizationId, limit: 20 }),
    listLynxRunLedger({ organizationId: input.organizationId, limit: 10 }),
  ]);

  const latestEval = evalRuns[0];
  const evalGate = evaluateLynxEvalGate({
    latestEvalAt: latestEval?.ranAt,
    qualityMetrics: latestEval?.qualityMetrics,
    failureSampleCount: latestEval?.failureSamples.length ?? 0,
  });
  const knowledgeSignals = buildKnowledgeSignals({
    sourceCount: sources.length,
    documentCount,
    chunkCount,
    evalGateStatus: evalGate.status,
  });
  const knowledgeStatus = getAggregateLynxReadinessStatus(
    knowledgeSignals.map((signal) => signal.status),
  );

  const modules: LynxModuleReadiness[] = await Promise.all(
    accessibleModules.map(async (moduleDefinition) => {
      const workspace = await getModuleWorkspace({
        organizationId: input.organizationId,
        moduleId: moduleDefinition.id,
        dataMode,
      });
      const stats = getModuleWorkspaceStats(workspace);
      const hasPersistedSubstrate =
        workspace.dataMode === "persisted" && !workspace.fallbackApplied;
      const hasSignals =
        stats.recordCount +
          stats.workItemCount +
          stats.documentCount +
          stats.savedViewCount >
        0;
      const status: LynxReadinessStatus = hasPersistedSubstrate
        ? "available"
        : hasSignals
          ? "partial"
          : "unavailable";

      return {
        moduleId: moduleDefinition.id,
        moduleLabel: moduleDefinition.label,
        status,
        safeNextAction: moduleSafeNextAction(status),
        signals: [
          {
            id: "module-substrate",
            label: "Module substrate",
            status,
            detail: hasPersistedSubstrate
              ? "Persisted tenant module data is available."
              : "Module currently depends on metadata or has no persisted tenant rows.",
          },
          {
            id: "records",
            label: "Records",
            status: stats.recordCount > 0 ? "available" : "partial",
            value: String(stats.recordCount),
            detail: "Record availability for read-only Lynx inspection.",
          },
          {
            id: "work-items",
            label: "Work items",
            status: stats.workItemCount > 0 ? "available" : "partial",
            value: String(stats.workItemCount),
            detail: "Workflow availability for read-only Lynx inspection.",
          },
          {
            id: "documents",
            label: "Documents",
            status: stats.documentCount > 0 ? "available" : "partial",
            value: String(stats.documentCount),
            detail: "Document availability for read-only Lynx inspection.",
          },
        ],
        tools: [
          {
            toolName: toolNameForModule(moduleDefinition.id),
            status,
            reason: toolReasonForModule({
              status,
              moduleId: moduleDefinition.id,
            }),
          },
        ],
      };
    }),
  );

  const openApprovals = approvals.filter((item) => item.status !== "executed");
  const openSandboxes = sandboxes.filter((item) => item.status === "pending");
  const latestRunQualityGate = runLedger
    .map((run) =>
      typeof run.metadata.qualityGate === "object" &&
      run.metadata.qualityGate !== null
        ? (run.metadata.qualityGate as Record<string, unknown>)
        : null,
    )
    .find((gate): gate is Record<string, unknown> => Boolean(gate));
  const latestRunQualityGateStatus =
    typeof latestRunQualityGate?.status === "string"
      ? latestRunQualityGate.status
      : null;
  const tools: LynxToolAvailability[] = [
    {
      toolName: "searchKnowledge",
      status: chunkCount > 0 ? "available" : "unavailable",
      reason:
        chunkCount > 0
          ? "Indexed chunks are available for tenant Knowledge search."
          : "Knowledge search has no indexed chunks.",
    },
    {
      toolName: "inspectLynxReadiness",
      status: "available",
      reason: "Readiness inspection is read-only and tenant-scoped.",
    },
    {
      toolName: "inspectFinanceSignals",
      status:
        modules.find((module) => module.moduleId === "finance")?.status ??
        "unavailable",
      reason:
        "Read-only finance signal inspection uses tenant records, work items, documents, and readiness status.",
    },
    {
      toolName: "inspectApprovalControls",
      status:
        modules.find((module) => module.moduleId === "approvals")?.status ??
        "unavailable",
      reason:
        "Read-only approval control inspection includes queue pressure, open proposals, and pending sandboxes.",
    },
    {
      toolName: "inspectAuditReadiness",
      status: getAggregateLynxReadinessStatus(
        modules
          .filter((module) =>
            ["finance", "approvals", "reports", "system-admin"].includes(
              module.moduleId,
            ),
          )
          .map((module) => module.status),
      ),
      reason:
        "Read-only audit readiness inspection spans accessible control modules and Lynx eval readiness.",
    },
    {
      toolName: "proposeHumanApprovedAction",
      status: openSandboxes.length > 0 ? "partial" : "available",
      reason:
        openSandboxes.length > 0
          ? "Pending sandboxes require operator review before more write proposals."
          : "Write proposals remain sandboxed and human-approved.",
    },
  ];

  const enterpriseControls: LynxReadinessSignal[] = [
    {
      id: "ai-gateway-tags",
      label: "AI Gateway tags",
      status: "available",
      detail:
        "Lynx routes send feature, module, organization, workflow, and quality-gate tags through Gateway options.",
    },
    {
      id: "run-ledger",
      label: "Run ledger",
      status: runLedger.length > 0 ? "available" : "partial",
      value: String(runLedger.length),
      detail:
        runLedger.length > 0
          ? "Recent Lynx runs are available for replay-oriented audit."
          : "Run ledger is ready; no Lynx runs have been recorded yet.",
    },
    {
      id: "approval-review",
      label: "Approval review",
      status:
        openApprovals.length + openSandboxes.length > 0
          ? "partial"
          : "available",
      value: String(openApprovals.length + openSandboxes.length),
      detail: "Open proposals and sandboxes are visible before execution.",
    },
    {
      id: "latest-quality-gate",
      label: "Latest run quality gate",
      status:
        latestRunQualityGateStatus === "passed"
          ? "available"
          : latestRunQualityGateStatus
            ? "partial"
            : "unavailable",
      value: latestRunQualityGateStatus ?? "none",
      detail:
        latestRunQualityGateStatus === "passed"
          ? "Latest replayable Lynx run passed claim-level evidence validation."
          : latestRunQualityGateStatus
            ? "Latest replayable Lynx run needs quality review."
            : "No run-level claim validation has been recorded yet.",
    },
    {
      id: "vercel-agent-review",
      label: "Vercel Agent review",
      status: "partial",
      detail:
        "Enable Vercel Agent Code Review in project settings for Lynx/Knowledge PR gates.",
    },
  ];

  const status = getAggregateLynxReadinessStatus([
    knowledgeStatus,
    ...modules.map((module) => module.status),
    ...tools.map((tool) => tool.status),
    ...enterpriseControls.map((control) => control.status),
  ]);

  return lynxReadinessSnapshotSchema.parse({
    organizationId: input.organizationId,
    generatedAt: new Date().toISOString(),
    status,
    summary:
      status === "available"
        ? "Lynx is ready for enterprise read-only operation."
        : status === "partial"
          ? "Lynx is partially ready; module substrate and eval gates need attention before deeper ERP-native tools."
          : "Lynx is not ready for enterprise operation; configure Knowledge and module substrate before enabling operator workflows.",
    knowledge: {
      status: knowledgeStatus,
      sourceCount: sources.length,
      documentCount,
      chunkCount,
      latestEvalAt: latestEval?.ranAt.toISOString() ?? null,
      evalGate,
    },
    modules,
    tools,
    enterpriseControls,
  });
}
