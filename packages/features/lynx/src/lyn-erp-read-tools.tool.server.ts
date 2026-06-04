import {
  assertCapabilityAllowed,
  recordGovernedToolAudit,
  type GovernedToolAuditLogger,
} from "@afenda/ai/server";
import type { ModuleId } from "@afenda/config/module-ids";
import {
  listAiActionSandboxes,
  listAiApprovalProposals,
  type AiActionSandboxSummary,
  type AiApprovalProposalSummary,
} from "@afenda/db";
import {
  getErpModuleById,
  getModuleWorkspace,
  getModuleWorkspaceStats,
  resolveWorkspaceDataMode,
  type ModuleWorkspace,
  type ModuleWorkspaceRecord,
  type ModuleWorkspaceStats,
} from "@afenda/kernel";
import { tool } from "ai";
import {
  LYNX_ERP_READ_TOOL_IDS,
  lynxErpReadToolInputSchema,
  lynxErpReadToolOutputSchema,
  type LynxErpReadEvidence,
  type LynxErpReadToolInput,
  type LynxErpReadToolOutput,
} from "./lyn-erp-read-tools-schema";
import {
  getAggregateLynxReadinessStatus,
  type LynxReadinessSnapshot,
  type LynxReadinessStatus,
} from "./lyn-readiness-contract";
import { lynxToolMeta } from "./lynx.tool-meta";

type SessionSource = "dev" | "neon";

type WorkspaceBundle = {
  moduleId: ModuleId;
  moduleLabel: string;
  readinessStatus: LynxReadinessStatus;
  workspace: ModuleWorkspace;
  stats: ModuleWorkspaceStats;
};

type ToolContext = {
  organizationId: string;
  userAuthId: string;
  capabilities: readonly string[];
  sessionSource: SessionSource;
  readinessSnapshot: LynxReadinessSnapshot;
  recordToolAudit?: GovernedToolAuditLogger;
};

type BuildOutputInput = {
  context: ToolContext;
  toolName: LynxErpReadToolOutput["toolName"];
  summary: string;
  modules: readonly WorkspaceBundle[];
  signals: LynxErpReadToolOutput["signals"];
  evidence: LynxErpReadEvidence[];
  missingData: string[];
  safeNextActions: string[];
};

function requireModuleAccess(
  moduleId: ModuleId,
  capabilities: readonly string[],
) {
  const moduleDefinition = getErpModuleById(moduleId);

  if (!moduleDefinition) {
    throw new Error(`Unknown ERP module: ${moduleId}`);
  }

  assertCapabilityAllowed({
    capability: moduleDefinition.requiredCapability,
    capabilities,
  });

  return moduleDefinition;
}

function getModuleReadiness(
  snapshot: LynxReadinessSnapshot,
  moduleId: ModuleId,
): LynxReadinessStatus {
  return (
    snapshot.modules.find((module) => module.moduleId === moduleId)?.status ??
    "unavailable"
  );
}

async function loadWorkspaceBundle(
  context: ToolContext,
  moduleId: ModuleId,
): Promise<WorkspaceBundle> {
  const moduleDefinition = requireModuleAccess(moduleId, context.capabilities);
  const workspace = await getModuleWorkspace({
    organizationId: context.organizationId,
    moduleId,
    dataMode: resolveWorkspaceDataMode(context.sessionSource),
  });

  return {
    moduleId,
    moduleLabel: moduleDefinition.label,
    readinessStatus: getModuleReadiness(context.readinessSnapshot, moduleId),
    workspace,
    stats: getModuleWorkspaceStats(workspace),
  };
}

function moduleSummary(bundle: WorkspaceBundle) {
  return {
    moduleId: bundle.moduleId,
    moduleLabel: bundle.moduleLabel,
    readinessStatus: bundle.readinessStatus,
    dataMode: bundle.workspace.dataMode,
    fallbackApplied: bundle.workspace.fallbackApplied,
    stats: bundle.stats,
  };
}

function countRecords(
  records: readonly ModuleWorkspaceRecord[],
  predicate: (record: ModuleWorkspaceRecord) => boolean,
) {
  return records.filter(predicate).length;
}

function buildRecordEvidence(
  bundle: WorkspaceBundle,
  limit: number,
): LynxErpReadEvidence[] {
  return bundle.workspace.records.slice(0, limit).map((record) => ({
    id: record.id,
    type: "record",
    moduleId: bundle.moduleId,
    label: `${record.reference} · ${record.title}`,
    signal: `${record.status} ${record.recordType}`,
    href: `/${bundle.moduleId}/records/${encodeURIComponent(record.id)}`,
  }));
}

function buildWorkItemEvidence(
  bundle: WorkspaceBundle,
  limit: number,
): LynxErpReadEvidence[] {
  return bundle.workspace.workItems.slice(0, limit).map((item) => ({
    id: item.id,
    type: "work-item",
    moduleId: bundle.moduleId,
    label: item.subject,
    signal: `${item.priority} priority · ${item.status}`,
    href: `/${item.moduleId}/work-items/${encodeURIComponent(item.id)}`,
  }));
}

function buildDocumentEvidence(
  bundle: WorkspaceBundle,
  limit: number,
): LynxErpReadEvidence[] {
  return bundle.workspace.documents.slice(0, limit).map((document) => ({
    id: document.id,
    type: "document",
    moduleId: bundle.moduleId,
    label: document.title,
    signal: `${document.contentType} · ${document.access}`,
  }));
}

function buildEvidence(
  bundles: readonly WorkspaceBundle[],
  input: LynxErpReadToolInput,
) {
  if (!input.includeEvidence) {
    return [];
  }

  return bundles.flatMap((bundle) => [
    ...buildRecordEvidence(bundle, input.limit),
    ...buildWorkItemEvidence(bundle, input.limit),
    ...buildDocumentEvidence(bundle, Math.min(input.limit, 3)),
  ]);
}

function missingSubstrate(bundle: WorkspaceBundle) {
  return bundle.workspace.fallbackApplied ||
    bundle.workspace.dataMode !== "persisted"
    ? [`${bundle.moduleLabel} has no persisted tenant module substrate yet.`]
    : [];
}

function buildOutput(input: BuildOutputInput): LynxErpReadToolOutput {
  const missingDataStatus: LynxReadinessStatus =
    input.missingData.length > 0 ? "partial" : "available";
  const output = lynxErpReadToolOutputSchema.parse({
    source: "tenant-erp-read-tool",
    organizationId: input.context.organizationId,
    toolName: input.toolName,
    generatedAt: new Date().toISOString(),
    readinessStatus: getAggregateLynxReadinessStatus([
      ...input.modules.map((module) => module.readinessStatus),
      ...input.signals.map((signal) => signal.status),
      missingDataStatus,
    ]),
    summary: input.summary,
    modules: input.modules.map(moduleSummary),
    signals: input.signals,
    evidence: input.evidence,
    missingData: input.missingData,
    safeNextActions: input.safeNextActions,
  });

  return output;
}

async function recordToolCall(input: {
  context: ToolContext;
  toolName: LynxErpReadToolOutput["toolName"];
  toolInput: LynxErpReadToolInput;
  output: LynxErpReadToolOutput;
}) {
  await recordGovernedToolAudit({
    logger: input.context.recordToolAudit,
    toolName: input.toolName,
    meta: lynxToolMeta[input.toolName],
    organizationId: input.context.organizationId,
    userAuthId: input.context.userAuthId,
    input: input.toolInput,
    output: input.output,
  });
}

function approvalSignalStatus(count: number): LynxReadinessStatus {
  return count > 0 ? "partial" : "available";
}

function openApprovalCount(rows: readonly AiApprovalProposalSummary[]) {
  return rows.filter((row) => row.status !== "executed").length;
}

function pendingSandboxCount(rows: readonly AiActionSandboxSummary[]) {
  return rows.filter((row) => row.status === "pending").length;
}

export function createLynxErpReadTools(context: ToolContext) {
  return {
    inspectFinanceSignals: tool({
      description:
        "Inspect read-only tenant finance signals including blocked records, close controls, invoice holds, and evidence readiness. Never mutates ERP data.",
      inputSchema: lynxErpReadToolInputSchema,
      execute: async (toolInput) => {
        const finance = await loadWorkspaceBundle(context, "finance");
        const blockedRecords = countRecords(
          finance.workspace.records,
          (record) => record.status === "blocked",
        );
        const closeControls = countRecords(
          finance.workspace.records,
          (record) => record.recordType.includes("close"),
        );
        const evidence = buildEvidence([finance], toolInput);
        const output = buildOutput({
          context,
          toolName: "inspectFinanceSignals",
          summary:
            blockedRecords > 0
              ? "Finance has open control pressure that needs human review."
              : "Finance has no blocked records in the current read window.",
          modules: [finance],
          signals: [
            {
              id: "finance-blocked-records",
              moduleId: "finance",
              label: "Blocked finance records",
              status: blockedRecords > 0 ? "partial" : "available",
              value: String(blockedRecords),
              detail:
                "Blocked finance records indicate close, receivable, payable, or control exceptions.",
            },
            {
              id: "finance-close-controls",
              moduleId: "finance",
              label: "Close controls",
              status: closeControls > 0 ? "partial" : "available",
              value: String(closeControls),
              detail:
                "Close-control records are read-only signals until posting-grade finance services exist.",
            },
            {
              id: "finance-high-priority-work",
              moduleId: "finance",
              label: "High-priority work",
              status:
                finance.stats.highPriorityWorkItemCount > 0
                  ? "partial"
                  : "available",
              value: String(finance.stats.highPriorityWorkItemCount),
              detail:
                "High-priority finance work items should be reviewed before proposing recovery actions.",
            },
          ],
          evidence,
          missingData: missingSubstrate(finance),
          safeNextActions: [
            "Review finance evidence and open work items.",
            "Use sandboxed proposal tools only after a human validates the finance exception.",
          ],
        });

        await recordToolCall({
          context,
          toolName: "inspectFinanceSignals",
          toolInput,
          output,
        });

        return output;
      },
    }),
    inspectApprovalControls: tool({
      description:
        "Inspect read-only approval queue controls, escalations, open approval proposals, and pending sandboxes for the active tenant.",
      inputSchema: lynxErpReadToolInputSchema,
      execute: async (toolInput) => {
        const approvals = await loadWorkspaceBundle(context, "approvals");
        const [approvalProposals, sandboxes] = await Promise.all([
          listAiApprovalProposals({
            organizationId: context.organizationId,
            limit: 20,
          }),
          listAiActionSandboxes({
            organizationId: context.organizationId,
            limit: 20,
          }),
        ]);
        const openApprovals = openApprovalCount(approvalProposals);
        const pendingSandboxes = pendingSandboxCount(sandboxes);
        const escalatedWork = approvals.workspace.workItems.filter(
          (item) => item.status === "escalated",
        ).length;
        const output = buildOutput({
          context,
          toolName: "inspectApprovalControls",
          summary:
            openApprovals + pendingSandboxes + escalatedWork > 0
              ? "Approval controls need operator review before additional write proposals."
              : "Approval controls have no open proposal or sandbox pressure in the current read window.",
          modules: [approvals],
          signals: [
            {
              id: "approval-escalations",
              moduleId: "approvals",
              label: "Escalated approval work",
              status: approvalSignalStatus(escalatedWork),
              value: String(escalatedWork),
              detail:
                "Escalated approval work items indicate time-bound decision pressure.",
            },
            {
              id: "approval-open-proposals",
              moduleId: "approvals",
              label: "Open Lynx proposals",
              status: approvalSignalStatus(openApprovals),
              value: String(openApprovals),
              detail:
                "Open approval proposals should be resolved before creating additional write sandboxes.",
            },
            {
              id: "approval-pending-sandboxes",
              moduleId: "approvals",
              label: "Pending sandboxes",
              status: approvalSignalStatus(pendingSandboxes),
              value: String(pendingSandboxes),
              detail:
                "Pending sandboxes require human approval before execution.",
            },
          ],
          evidence: buildEvidence([approvals], toolInput),
          missingData: missingSubstrate(approvals),
          safeNextActions: [
            "Review escalated approval work before drafting new actions.",
            "Resolve pending sandboxes before increasing automated proposal volume.",
          ],
        });

        await recordToolCall({
          context,
          toolName: "inspectApprovalControls",
          toolInput,
          output,
        });

        return output;
      },
    }),
    inspectAuditReadiness: tool({
      description:
        "Inspect read-only audit readiness across accessible finance, approvals, reports, and system-admin control surfaces.",
      inputSchema: lynxErpReadToolInputSchema,
      execute: async (toolInput) => {
        const candidateModules: ModuleId[] = [
          "finance",
          "approvals",
          "reports",
          "system-admin",
        ];
        const accessibleModules = candidateModules.filter((moduleId) => {
          const moduleDefinition = getErpModuleById(moduleId);
          return (
            moduleDefinition !== null &&
            context.capabilities.includes(moduleDefinition.requiredCapability)
          );
        });
        const bundles = await Promise.all(
          accessibleModules.map((moduleId) =>
            loadWorkspaceBundle(context, moduleId),
          ),
        );
        const missingCapabilities = candidateModules.flatMap((moduleId) => {
          const moduleDefinition = getErpModuleById(moduleId);
          if (!moduleDefinition) return [`Unknown audit module: ${moduleId}`];
          return context.capabilities.includes(
            moduleDefinition.requiredCapability,
          )
            ? []
            : [
                `Missing ${moduleDefinition.requiredCapability} for ${moduleDefinition.label}.`,
              ];
        });
        const documentCount = bundles.reduce(
          (total, bundle) => total + bundle.stats.documentCount,
          0,
        );
        const savedViewCount = bundles.reduce(
          (total, bundle) => total + bundle.stats.savedViewCount,
          0,
        );
        const unavailableModules = bundles.filter(
          (bundle) => bundle.readinessStatus === "unavailable",
        ).length;
        const output = buildOutput({
          context,
          toolName: "inspectAuditReadiness",
          summary:
            unavailableModules > 0 || missingCapabilities.length > 0
              ? "Audit readiness is incomplete for at least one control surface."
              : "Accessible audit control surfaces are available for read-only Lynx inspection.",
          modules: bundles,
          signals: [
            {
              id: "audit-documents",
              moduleId: "reports",
              label: "Audit evidence documents",
              status: documentCount > 0 ? "available" : "partial",
              value: String(documentCount),
              detail:
                "Documents across accessible control modules provide evidence for audit review.",
            },
            {
              id: "audit-saved-views",
              moduleId: "reports",
              label: "Control saved views",
              status: savedViewCount > 0 ? "available" : "partial",
              value: String(savedViewCount),
              detail:
                "Saved views indicate tenant-specific reporting and control review surfaces.",
            },
            {
              id: "audit-eval-gate",
              moduleId: "system-admin",
              label: "Lynx eval gate",
              status: context.readinessSnapshot.knowledge.evalGate.status,
              detail:
                context.readinessSnapshot.knowledge.evalGate.reasons[0] ??
                "Latest Lynx eval gate satisfies configured thresholds.",
            },
          ],
          evidence: [
            ...buildEvidence(bundles, toolInput),
            {
              id: "lynx-readiness",
              type: "readiness",
              moduleId: "system-admin",
              label: "Lynx readiness snapshot",
              signal: context.readinessSnapshot.status,
            },
          ],
          missingData: [
            ...bundles.flatMap(missingSubstrate),
            ...missingCapabilities,
          ],
          safeNextActions: [
            "Review missing evidence and module substrate before relying on audit answers.",
            "Keep audit responses read-only until module services and approval trails mature.",
          ],
        });

        await recordToolCall({
          context,
          toolName: "inspectAuditReadiness",
          toolInput,
          output,
        });

        return output;
      },
    }),
  };
}

export { LYNX_ERP_READ_TOOL_IDS };
