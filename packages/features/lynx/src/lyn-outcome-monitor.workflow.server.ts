import type {
  AiActionSandboxSummary,
  AiApprovalProposalSummary,
  LynxOutcomeMonitorSetting,
} from "@afenda/db";
import type {
  ModuleWorkspace,
  ModuleWorkspaceDocument,
  ModuleWorkspaceItem,
  ModuleWorkspaceRecord,
} from "@afenda/kernel";
import { moduleIds } from "@afenda/config/module-ids";
import { combineLynxQualityGates } from "../contracts/lynx.evidence-trust.contract";
import {
  LYNX_OUTCOME_MONITOR_IDS,
  lynxOutcomeMonitorResultSchema,
  type LynxOutcomeEvidenceReference,
  type LynxOutcomeMonitorId,
  type LynxOutcomeMonitorResult,
  type LynxOutcomeMonitorSeverity,
  type LynxOutcomeMonitorStatus,
} from "../schemas/lynx.outcome-monitor.schema";
import type { LynxQualityGateResult } from "../schemas/lynx.evidence-trust.schema";
import type { LynxReadinessSnapshot } from "../schemas/lynx.readiness.schema";

const LYNX_OUTCOME_SWEEP_ORIGIN = "proactive-outcome-sweep";
const LYNX_OUTCOME_SWEEP_ROUTE = "/api/internal/v1/cron/lynx-outcomes";
const LYNX_OUTCOME_SWEEP_MODEL = "deterministic/lynx-outcome-monitor";
const LYNX_OUTCOME_SWEEP_TARGET_CONCURRENCY = 4;
const lynxOutcomeSweepCapabilities = [
  "dashboard.view",
  "finance.view",
  "approvals.view",
  "reports.view",
  "system-admin.view",
] as const;

type OutcomeWorkspaceSet = {
  finance: ModuleWorkspace;
  approvals: ModuleWorkspace;
  reports: ModuleWorkspace;
  "system-admin": ModuleWorkspace;
};

export type EvaluateLynxOutcomeMonitorsInput = {
  organizationId: string;
  readinessSnapshot: LynxReadinessSnapshot;
  workspaces: OutcomeWorkspaceSet;
  approvalProposals: readonly AiApprovalProposalSummary[];
  sandboxes: readonly AiActionSandboxSummary[];
  monitorSettings?: readonly LynxOutcomeMonitorSetting[];
};

export type LynxOutcomeSweepResult = {
  checkedAt: string;
  organizationCount: number;
  runCount: number;
  monitorCount: number;
  watchCount: number;
  blockedCount: number;
  failedOrganizationCount: number;
  workflowSessionsCreated: number;
  workflowSessionsUpdated: number;
};

async function mapWithConcurrency<TInput, TOutput>(
  items: readonly TInput[],
  concurrency: number,
  task: (item: TInput, index: number) => Promise<TOutput>,
): Promise<TOutput[]> {
  if (items.length === 0) {
    return [];
  }

  const workerCount = Math.min(Math.max(1, concurrency), items.length);
  const results = new Array<TOutput>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      const item = items[index];
      if (item === undefined) {
        throw new Error(`Missing Lynx outcome sweep target at index ${index}.`);
      }
      results[index] = await task(item, index);
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results;
}

function isPersistedWorkspace(workspace: ModuleWorkspace) {
  return workspace.dataMode === "persisted" && !workspace.fallbackApplied;
}

function countRecords(
  records: readonly ModuleWorkspaceRecord[],
  predicate: (record: ModuleWorkspaceRecord) => boolean,
) {
  return records.filter(predicate).length;
}

function countWorkItems(
  items: readonly ModuleWorkspaceItem[],
  predicate: (item: ModuleWorkspaceItem) => boolean,
) {
  return items.filter(predicate).length;
}

function maxStatus(
  statuses: readonly LynxOutcomeMonitorStatus[],
): LynxOutcomeMonitorStatus {
  if (statuses.includes("blocked")) return "blocked";
  if (statuses.includes("watch")) return "watch";
  return "healthy";
}

function severityForStatus(
  status: LynxOutcomeMonitorStatus,
): LynxOutcomeMonitorSeverity {
  if (status === "blocked") return "critical";
  if (status === "watch") return "review";
  return "info";
}

function settingForMonitor(
  input: EvaluateLynxOutcomeMonitorsInput,
  monitorId: LynxOutcomeMonitorId,
) {
  return input.monitorSettings?.find(
    (setting) => setting.monitorId === monitorId,
  );
}

function thresholdNumber(
  setting: LynxOutcomeMonitorSetting | undefined,
  key: string,
  fallback: number,
) {
  const value = setting?.thresholds[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function isMonitorEnabled(setting: LynxOutcomeMonitorSetting | undefined) {
  return setting?.enabled ?? true;
}

function qualityGateForMonitor(input: {
  status: LynxOutcomeMonitorStatus;
  generatedAt: string;
  reason: string;
}): LynxQualityGateResult {
  return {
    status:
      input.status === "blocked"
        ? "failed"
        : input.status === "watch"
          ? "review"
          : "passed",
    unsupportedClaimCount: 0,
    citationPrecision: 1,
    noAnswerCorrectness: 1,
    promptInjectionResilience: 1,
    reasons: input.status === "healthy" ? [] : [input.reason],
    generatedAt: input.generatedAt,
  };
}

function recordEvidence(
  moduleId: LynxOutcomeEvidenceReference["moduleId"],
  record: ModuleWorkspaceRecord,
): LynxOutcomeEvidenceReference {
  return {
    id: record.id,
    type: "record",
    moduleId,
    label: `${record.reference} · ${record.title}`,
    signal: `${record.status} ${record.recordType}`,
    href: `/${moduleId}/records/${encodeURIComponent(record.id)}`,
  };
}

function workItemEvidence(
  item: ModuleWorkspaceItem,
): LynxOutcomeEvidenceReference {
  return {
    id: item.id,
    type: "work-item",
    moduleId: item.moduleId,
    label: item.subject,
    signal: `${item.priority} priority · ${item.status}`,
    href: `/${item.moduleId}/work-items/${encodeURIComponent(item.id)}`,
  };
}

function documentEvidence(
  moduleId: LynxOutcomeEvidenceReference["moduleId"],
  document: ModuleWorkspaceDocument,
): LynxOutcomeEvidenceReference {
  return {
    id: document.id,
    type: "document",
    moduleId,
    label: document.title,
    signal: `${document.contentType} · ${document.access}`,
  };
}

function toEvidenceModuleId(
  value: string,
): LynxOutcomeEvidenceReference["moduleId"] {
  return moduleIds.includes(value as LynxOutcomeEvidenceReference["moduleId"])
    ? (value as LynxOutcomeEvidenceReference["moduleId"])
    : "approvals";
}

function financeControlWatch(input: EvaluateLynxOutcomeMonitorsInput) {
  const monitorSetting = settingForMonitor(input, "finance-control-watch");
  const generatedAt = new Date().toISOString();
  const finance = input.workspaces.finance;
  const blockedRecords = countRecords(
    finance.records,
    (record) => record.status === "blocked",
  );
  const closeControls = countRecords(finance.records, (record) =>
    record.recordType.includes("close"),
  );
  const highPriorityWork = countWorkItems(
    finance.workItems,
    (item) => item.priority === "high",
  );
  const status = maxStatus([
    blockedRecords >
    thresholdNumber(monitorSetting, "blockedRecordsWatchAbove", 0)
      ? "watch"
      : "healthy",
    closeControls >
    thresholdNumber(monitorSetting, "closeControlsWatchAbove", 0)
      ? "watch"
      : "healthy",
    highPriorityWork >
    thresholdNumber(monitorSetting, "highPriorityWorkWatchAbove", 0)
      ? "watch"
      : "healthy",
  ]);
  const evidence = [
    ...finance.records
      .filter(
        (record) =>
          record.status === "blocked" || record.recordType.includes("close"),
      )
      .slice(0, 5)
      .map((record) => recordEvidence("finance", record)),
    ...finance.workItems
      .filter((item) => item.priority === "high")
      .slice(0, 5)
      .map(workItemEvidence),
  ];

  return lynxOutcomeMonitorResultSchema.parse({
    monitorId: "finance-control-watch",
    workflowId: "cost_control",
    status,
    severity: severityForStatus(status),
    summary:
      status === "healthy"
        ? "Finance control watch found no blocked records or urgent work."
        : "Finance control watch found records or work that need operator review.",
    signals: [
      {
        id: "finance-blocked-records",
        label: "Blocked finance records",
        status: blockedRecords > 0 ? "watch" : "healthy",
        severity: blockedRecords > 0 ? "review" : "info",
        value: String(blockedRecords),
        detail: "Blocked records can indicate close or control pressure.",
      },
      {
        id: "finance-close-controls",
        label: "Close controls",
        status: closeControls > 0 ? "watch" : "healthy",
        severity: closeControls > 0 ? "review" : "info",
        value: String(closeControls),
        detail:
          "Close-control records should be reviewed before recovery work.",
      },
      {
        id: "finance-high-priority-work",
        label: "High-priority finance work",
        status: highPriorityWork > 0 ? "watch" : "healthy",
        severity: highPriorityWork > 0 ? "review" : "info",
        value: String(highPriorityWork),
        detail: "Urgent finance work items may require operator follow-up.",
      },
    ],
    evidenceReferences: evidence,
    qualityGateSummary: qualityGateForMonitor({
      status,
      generatedAt,
      reason: "Finance monitor requires operator review.",
    }),
    nextRecommendedStep:
      status === "healthy"
        ? "No operator action required for finance controls."
        : "Open the workflow session and review finance evidence before proposing actions.",
    generatedAt,
  } satisfies LynxOutcomeMonitorResult);
}

function approvalThroughputWatch(input: EvaluateLynxOutcomeMonitorsInput) {
  const monitorSetting = settingForMonitor(input, "approval-throughput-watch");
  const generatedAt = new Date().toISOString();
  const approvals = input.workspaces.approvals;
  const escalatedWork = countWorkItems(
    approvals.workItems,
    (item) => item.status === "escalated",
  );
  const openApprovalProposals = input.approvalProposals.filter(
    (proposal) =>
      proposal.status === "proposed" || proposal.status === "approved",
  );
  const pendingActionSandboxes = input.sandboxes.filter(
    (sandbox) => sandbox.status === "pending",
  );
  const pendingSandboxes = pendingActionSandboxes.length;
  const status = maxStatus([
    escalatedWork >
    thresholdNumber(monitorSetting, "escalatedWorkWatchAbove", 0)
      ? "watch"
      : "healthy",
    openApprovalProposals.length >
    thresholdNumber(monitorSetting, "openProposalsWatchAbove", 0)
      ? "watch"
      : "healthy",
    pendingSandboxes >
    thresholdNumber(monitorSetting, "pendingSandboxesWatchAbove", 0)
      ? "watch"
      : "healthy",
  ]);
  const evidence = [
    ...approvals.workItems
      .filter((item) => item.status === "escalated")
      .slice(0, 5)
      .map(workItemEvidence),
    ...openApprovalProposals.slice(0, 3).map((proposal) => ({
      id: proposal.id,
      type: "proposal" as const,
      moduleId: toEvidenceModuleId(proposal.moduleId),
      label: proposal.proposedAction,
      signal: `${proposal.status} · ${proposal.riskLevel}`,
    })),
    ...pendingActionSandboxes.slice(0, 3).map((sandbox) => ({
      id: sandbox.id,
      type: "sandbox" as const,
      moduleId: "approvals" as const,
      label: sandbox.title,
      signal: `${sandbox.status} · ${sandbox.riskLevel}`,
    })),
  ];

  return lynxOutcomeMonitorResultSchema.parse({
    monitorId: "approval-throughput-watch",
    workflowId: "approval_throughput",
    status,
    severity: severityForStatus(status),
    summary:
      status === "healthy"
        ? "Approval throughput watch found no escalations or pending Lynx reviews."
        : "Approval throughput watch found items that need operator review.",
    signals: [
      {
        id: "approval-escalated-work",
        label: "Escalated approval work",
        status: escalatedWork > 0 ? "watch" : "healthy",
        severity: escalatedWork > 0 ? "review" : "info",
        value: String(escalatedWork),
        detail: "Escalated work indicates throughput pressure.",
      },
      {
        id: "approval-open-proposals",
        label: "Open proposals",
        status: openApprovalProposals.length > 0 ? "watch" : "healthy",
        severity: openApprovalProposals.length > 0 ? "review" : "info",
        value: String(openApprovalProposals.length),
        detail: "Open proposals should be resolved before more write planning.",
      },
      {
        id: "approval-pending-sandboxes",
        label: "Pending sandboxes",
        status: pendingSandboxes > 0 ? "watch" : "healthy",
        severity: pendingSandboxes > 0 ? "review" : "info",
        value: String(pendingSandboxes),
        detail: "Pending sandboxes require human approval before execution.",
      },
    ],
    evidenceReferences: evidence,
    qualityGateSummary: qualityGateForMonitor({
      status,
      generatedAt,
      reason: "Approval monitor requires operator review.",
    }),
    nextRecommendedStep:
      status === "healthy"
        ? "No operator action required for approval throughput."
        : "Open the workflow session and review approvals before drafting more proposals.",
    generatedAt,
  } satisfies LynxOutcomeMonitorResult);
}

function readinessStatusForModule(
  snapshot: LynxReadinessSnapshot,
  moduleId: string,
) {
  return (
    snapshot.modules.find((module) => module.moduleId === moduleId)?.status ??
    "unavailable"
  );
}

function auditReadinessWatch(input: EvaluateLynxOutcomeMonitorsInput) {
  const monitorSetting = settingForMonitor(input, "audit-readiness-watch");
  const generatedAt = new Date().toISOString();
  const controlModules = [
    "finance",
    "approvals",
    "reports",
    "system-admin",
  ] as const;
  const unavailableModules = controlModules.filter(
    (moduleId) =>
      readinessStatusForModule(input.readinessSnapshot, moduleId) ===
      "unavailable",
  ).length;
  const partialModules = controlModules.filter(
    (moduleId) =>
      readinessStatusForModule(input.readinessSnapshot, moduleId) === "partial",
  ).length;
  const documentCount =
    input.workspaces.finance.documents.length +
    input.workspaces.approvals.documents.length +
    input.workspaces.reports.documents.length +
    input.workspaces["system-admin"].documents.length;
  const savedViewCount =
    input.workspaces.finance.savedViews.length +
    input.workspaces.approvals.savedViews.length +
    input.workspaces.reports.savedViews.length +
    input.workspaces["system-admin"].savedViews.length;
  const evalGateStatus = input.readinessSnapshot.knowledge.evalGate.status;
  const persistedSubstrateMissing = [
    input.workspaces.finance,
    input.workspaces.approvals,
    input.workspaces.reports,
    input.workspaces["system-admin"],
  ].some((workspace) => !isPersistedWorkspace(workspace));
  const status = maxStatus([
    unavailableModules > 0 ||
    documentCount <
      thresholdNumber(monitorSetting, "minimumEvidenceDocuments", 1) ||
    evalGateStatus === "unavailable"
      ? "blocked"
      : "healthy",
    partialModules > 0 || savedViewCount === 0 || persistedSubstrateMissing
      ? "watch"
      : "healthy",
  ]);
  const evidence = [
    ...input.workspaces.finance.documents
      .slice(0, 2)
      .map((document) => documentEvidence("finance", document)),
    ...input.workspaces.approvals.documents
      .slice(0, 2)
      .map((document) => documentEvidence("approvals", document)),
    ...input.workspaces.reports.documents
      .slice(0, 2)
      .map((document) => documentEvidence("reports", document)),
    {
      id: "lynx-eval-gate",
      type: "quality-gate" as const,
      moduleId: "system-admin" as const,
      label: "Latest Lynx eval gate",
      signal: evalGateStatus,
    },
  ];

  return lynxOutcomeMonitorResultSchema.parse({
    monitorId: "audit-readiness-watch",
    workflowId: "audit_readiness",
    status,
    severity: severityForStatus(status),
    summary:
      status === "healthy"
        ? "Audit readiness watch found sufficient evidence and readiness signals."
        : "Audit readiness watch found missing evidence or readiness gaps.",
    signals: [
      {
        id: "audit-unavailable-modules",
        label: "Unavailable control modules",
        status: unavailableModules > 0 ? "blocked" : "healthy",
        severity: unavailableModules > 0 ? "critical" : "info",
        value: String(unavailableModules),
        detail: "Unavailable control modules prevent complete audit review.",
      },
      {
        id: "audit-evidence-documents",
        label: "Evidence documents",
        status: documentCount > 0 ? "healthy" : "blocked",
        severity: documentCount > 0 ? "info" : "critical",
        value: String(documentCount),
        detail: "Audit readiness requires document evidence across controls.",
      },
      {
        id: "audit-control-views",
        label: "Control saved views",
        status: savedViewCount > 0 ? "healthy" : "watch",
        severity: savedViewCount > 0 ? "info" : "review",
        value: String(savedViewCount),
        detail: "Saved views indicate repeatable control review surfaces.",
      },
      {
        id: "audit-eval-gate",
        label: "Lynx eval gate",
        status:
          evalGateStatus === "available"
            ? "healthy"
            : evalGateStatus === "partial"
              ? "watch"
              : "blocked",
        severity:
          evalGateStatus === "available"
            ? "info"
            : evalGateStatus === "partial"
              ? "review"
              : "critical",
        detail: "Enterprise audit answers require a fresh passing eval gate.",
      },
    ],
    evidenceReferences: evidence,
    qualityGateSummary: qualityGateForMonitor({
      status,
      generatedAt,
      reason: "Audit readiness monitor requires operator review.",
    }),
    nextRecommendedStep:
      status === "healthy"
        ? "No operator action required for audit readiness."
        : "Open the workflow session and close missing evidence or readiness gaps.",
    generatedAt,
  } satisfies LynxOutcomeMonitorResult);
}

export function evaluateLynxOutcomeMonitors(
  input: EvaluateLynxOutcomeMonitorsInput,
): LynxOutcomeMonitorResult[] {
  return [
    isMonitorEnabled(settingForMonitor(input, "finance-control-watch"))
      ? financeControlWatch(input)
      : null,
    isMonitorEnabled(settingForMonitor(input, "approval-throughput-watch"))
      ? approvalThroughputWatch(input)
      : null,
    isMonitorEnabled(settingForMonitor(input, "audit-readiness-watch"))
      ? auditReadinessWatch(input)
      : null,
  ].filter((result): result is LynxOutcomeMonitorResult => Boolean(result));
}

async function loadOutcomeWorkspaceSet(input: {
  organizationId: string;
}): Promise<OutcomeWorkspaceSet> {
  const { getModuleWorkspace, resolveWorkspaceDataMode } =
    await import("@afenda/kernel");
  const dataMode = resolveWorkspaceDataMode("neon");
  const [finance, approvals, reports, systemAdmin] = await Promise.all([
    getModuleWorkspace({
      organizationId: input.organizationId,
      moduleId: "finance",
      dataMode,
    }),
    getModuleWorkspace({
      organizationId: input.organizationId,
      moduleId: "approvals",
      dataMode,
    }),
    getModuleWorkspace({
      organizationId: input.organizationId,
      moduleId: "reports",
      dataMode,
    }),
    getModuleWorkspace({
      organizationId: input.organizationId,
      moduleId: "system-admin",
      dataMode,
    }),
  ]);

  return { finance, approvals, reports, "system-admin": systemAdmin };
}

async function upsertWorkflowSession(input: {
  organizationId: string;
  userAuthId: string;
  runId: string;
  result: LynxOutcomeMonitorResult;
  setting?: LynxOutcomeMonitorSetting;
}) {
  const {
    createLynxWorkflowSession,
    findOpenLynxWorkflowSession,
    updateLynxWorkflowSession,
  } = await import("@afenda/db");
  const current = await findOpenLynxWorkflowSession({
    organizationId: input.organizationId,
    workflowId: input.result.workflowId,
    origin: LYNX_OUTCOME_SWEEP_ORIGIN,
  });
  const evidenceSummary = {
    origin: LYNX_OUTCOME_SWEEP_ORIGIN,
    monitorId: input.result.monitorId,
    monitorStatus: input.result.status,
    severity: input.result.severity,
    evidenceReferenceCount: input.result.evidenceReferences.length,
    ownerAuthUserId: input.setting?.ownerAuthUserId ?? null,
  };
  const metadata = {
    origin: LYNX_OUTCOME_SWEEP_ORIGIN,
    monitorId: input.result.monitorId,
    monitorStatus: input.result.status,
    severity: input.result.severity,
    ownerAuthUserId: input.setting?.ownerAuthUserId ?? null,
  };

  if (current) {
    await updateLynxWorkflowSession({
      organizationId: input.organizationId,
      id: current.id,
      status: "active",
      currentStage: `proactive.${input.result.status}`,
      promptSummary: input.result.summary,
      latestRunId: input.runId,
      evidenceSummary,
      qualityGateSummary: input.result.qualityGateSummary,
      nextRecommendedStep: input.result.nextRecommendedStep,
      metadata,
    });
    return "updated" as const;
  }

  await createLynxWorkflowSession({
    organizationId: input.organizationId,
    userAuthId: input.userAuthId,
    workflowId: input.result.workflowId,
    currentStage: `proactive.${input.result.status}`,
    promptSummary: input.result.summary,
    latestRunId: input.runId,
    evidenceSummary,
    qualityGateSummary: input.result.qualityGateSummary,
    nextRecommendedStep: input.result.nextRecommendedStep,
    metadata,
  });
  return "created" as const;
}

async function runLynxOutcomeSweepForTarget(input: {
  organizationId: string;
  organizationName: string;
  ownerAuthUserId: string;
}) {
  const {
    completeLynxRun,
    createLynxRun,
    getLynxOutcomeMonitorSettings,
    listAiActionSandboxes,
    listAiApprovalProposals,
    recordLynxRunEvent,
  } = await import("@afenda/db");
  const startedAt = Date.now();
  const runId = await createLynxRun({
    organizationId: input.organizationId,
    userAuthId: input.ownerAuthUserId,
    route: LYNX_OUTCOME_SWEEP_ROUTE,
    workflowId: "audit_readiness",
    model: LYNX_OUTCOME_SWEEP_MODEL,
    promptSummary: `Proactive Lynx outcome sweep for ${input.organizationName}`,
    metadata: {
      origin: LYNX_OUTCOME_SWEEP_ORIGIN,
    },
  });

  try {
    const [
      { getLynxReadinessSnapshot },
      workspaces,
      approvalProposals,
      sandboxes,
      monitorSettings,
    ] = await Promise.all([
      import("../data/lynx.readiness.query.server"),
      loadOutcomeWorkspaceSet({ organizationId: input.organizationId }),
      listAiApprovalProposals({
        organizationId: input.organizationId,
        limit: 50,
      }),
      listAiActionSandboxes({
        organizationId: input.organizationId,
        limit: 50,
      }),
      getLynxOutcomeMonitorSettings({
        organizationId: input.organizationId,
        monitorIds: LYNX_OUTCOME_MONITOR_IDS,
      }),
    ]);
    const readinessSnapshot = await getLynxReadinessSnapshot({
      organizationId: input.organizationId,
      capabilities: lynxOutcomeSweepCapabilities,
      sessionSource: "neon",
    });
    const results = evaluateLynxOutcomeMonitors({
      organizationId: input.organizationId,
      readinessSnapshot,
      workspaces,
      approvalProposals,
      sandboxes,
      monitorSettings,
    });
    const qualityGate = combineLynxQualityGates(
      results.map((result) => result.qualityGateSummary),
    );

    for (const result of results) {
      const setting = monitorSettings.find(
        (item) => item.monitorId === result.monitorId,
      );
      await recordLynxRunEvent({
        organizationId: input.organizationId,
        runId,
        eventType: `outcome.${result.status}`,
        summary: result.summary,
        evidenceReferences: result.evidenceReferences,
        validationMetrics: {
          qualityGate: result.qualityGateSummary,
        },
        metadata: {
          origin: LYNX_OUTCOME_SWEEP_ORIGIN,
          monitor: result,
          ownerAuthUserId: setting?.ownerAuthUserId ?? null,
        },
      });
    }

    for (const setting of monitorSettings.filter((item) => !item.enabled)) {
      await recordLynxRunEvent({
        organizationId: input.organizationId,
        runId,
        eventType: "outcome.skipped",
        summary: `Proactive Lynx outcome monitor ${setting.monitorId} is disabled.`,
        metadata: {
          origin: LYNX_OUTCOME_SWEEP_ORIGIN,
          monitorId: setting.monitorId,
          skipped: true,
        },
      });
    }

    let workflowSessionsCreated = 0;
    let workflowSessionsUpdated = 0;
    for (const result of results) {
      if (result.status === "healthy") continue;
      const setting = monitorSettings.find(
        (item) => item.monitorId === result.monitorId,
      );
      const action = await upsertWorkflowSession({
        organizationId: input.organizationId,
        userAuthId: input.ownerAuthUserId,
        runId,
        result,
        setting,
      });
      await recordLynxRunEvent({
        organizationId: input.organizationId,
        runId,
        eventType: "workflow.session-linked",
        summary: `Proactive workflow session ${action}.`,
        metadata: {
          origin: LYNX_OUTCOME_SWEEP_ORIGIN,
          workflowAction: action,
          monitorId: result.monitorId,
          workflowId: result.workflowId,
          ownerAuthUserId: setting?.ownerAuthUserId ?? null,
        },
      });
      if (action === "created") workflowSessionsCreated += 1;
      if (action === "updated") workflowSessionsUpdated += 1;
    }

    await completeLynxRun({
      id: runId,
      organizationId: input.organizationId,
      status: "completed",
      latencyMs: Date.now() - startedAt,
      metadata: {
        origin: LYNX_OUTCOME_SWEEP_ORIGIN,
        qualityGate,
        monitorStatuses: results.map((result) => ({
          monitorId: result.monitorId,
          status: result.status,
          severity: result.severity,
        })),
      },
    });

    return {
      runId,
      results,
      workflowSessionsCreated,
      workflowSessionsUpdated,
      failed: false,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await recordLynxRunEvent({
      organizationId: input.organizationId,
      runId,
      eventType: "outcome.failed",
      summary:
        "Proactive Lynx outcome sweep failed before monitor results were completed.",
      metadata: {
        origin: LYNX_OUTCOME_SWEEP_ORIGIN,
        error: message,
      },
    });
    await completeLynxRun({
      id: runId,
      organizationId: input.organizationId,
      status: "failed",
      latencyMs: Date.now() - startedAt,
      metadata: {
        origin: LYNX_OUTCOME_SWEEP_ORIGIN,
        error: message,
      },
    });

    return {
      runId,
      results: [],
      workflowSessionsCreated: 0,
      workflowSessionsUpdated: 0,
      failed: true,
    };
  }
}

export async function runLynxOutcomeSweep(): Promise<LynxOutcomeSweepResult> {
  const { listLynxOutcomeSweepTargets } = await import("@afenda/db");
  const targets = await listLynxOutcomeSweepTargets();
  const targetResults = await mapWithConcurrency(
    targets,
    LYNX_OUTCOME_SWEEP_TARGET_CONCURRENCY,
    (target) =>
      runLynxOutcomeSweepForTarget({
        organizationId: target.organizationId,
        organizationName: target.organizationName,
        ownerAuthUserId: target.ownerAuthUserId,
      }),
  );
  const monitorResults = targetResults.flatMap((result) => result.results);

  return {
    checkedAt: new Date().toISOString(),
    organizationCount: targets.length,
    runCount: targetResults.length,
    monitorCount: monitorResults.length,
    watchCount: monitorResults.filter((result) => result.status === "watch")
      .length,
    blockedCount: monitorResults.filter((result) => result.status === "blocked")
      .length,
    failedOrganizationCount: targetResults.filter((result) => result.failed)
      .length,
    workflowSessionsCreated: targetResults.reduce(
      (total, result) => total + result.workflowSessionsCreated,
      0,
    ),
    workflowSessionsUpdated: targetResults.reduce(
      (total, result) => total + result.workflowSessionsUpdated,
      0,
    ),
  };
}
