import { describe, expect, it } from "vitest";
import {
  buildLynxActivityLedgerListSurface,
  buildLynxClaimValidationListSurface,
  buildLynxFailedEvalCaseListSurface,
  buildLynxLatencyAnalyticsListSurface,
  buildLynxObservabilityStatGrid,
  buildLynxOutcomeMonitorControlListSurface,
  buildLynxProactiveOutcomeAnalyticsListSurface,
  buildLynxQualityAnalyticsListSurface,
  buildLynxRepresentativeEvalFailureListSurface,
  buildLynxRunDetailStatGrid,
  buildLynxRunEventTimelineListSurface,
  buildLynxRunFeedbackListSurface,
  buildLynxRunManagementListSurface,
  buildLynxRunManagementQualityStatGrid,
  buildLynxRunManagementStatGrid,
  buildLynxSpendAnalyticsListSurface,
  buildLynxWorkflowLinkedRunListSurface,
  buildLynxWorkflowSessionDetailStatGrid,
  buildLynxWorkflowSessionListSurface,
  buildLynxEnterpriseControlsListSurface,
  buildLynxModuleReadinessListSurface,
  buildLynxReadinessStatGrid,
  buildLynxToolAvailabilityListSurface,
} from "../../src/metadata";
import type { LynxReadinessSnapshot } from "../../src/contracts/lynx.readiness.contract";

const snapshot: LynxReadinessSnapshot = {
  organizationId: "org_1",
  generatedAt: new Date().toISOString(),
  status: "partial",
  summary: "Lynx is partially ready.",
  knowledge: {
    status: "partial",
    sourceCount: 1,
    documentCount: 2,
    chunkCount: 3,
    latestEvalAt: null,
    evalGate: {
      status: "unavailable",
      reasons: ["No Lynx eval run has been recorded."],
    },
  },
  modules: [
    {
      moduleId: "finance",
      moduleLabel: "Finance",
      status: "partial",
      safeNextAction:
        "Treat module results as directional until persisted records are available.",
      signals: [
        {
          id: "records",
          label: "Records",
          status: "available",
          value: "4",
          detail: "Record availability for read-only Lynx inspection.",
        },
        {
          id: "work-items",
          label: "Work items",
          status: "partial",
          value: "0",
          detail: "Workflow availability for read-only Lynx inspection.",
        },
        {
          id: "documents",
          label: "Documents",
          status: "available",
          value: "2",
          detail: "Document availability for read-only Lynx inspection.",
        },
      ],
      tools: [
        {
          toolName: "inspectFinanceSignals",
          status: "partial",
          reason: "ERP-native read inspection is available with caveats.",
        },
      ],
    },
  ],
  tools: [
    {
      toolName: "inspectFinanceSignals",
      status: "partial",
      reason: "Read-only finance signal inspection is available.",
    },
  ],
  enterpriseControls: [
    {
      id: "run-ledger",
      label: "Run ledger",
      status: "partial",
      value: "0",
      detail: "Run ledger is ready; no Lynx runs have been recorded yet.",
    },
  ],
};

describe("Lynx metadata builders", () => {
  it("builds governed readiness stat and list surfaces", () => {
    const stats = buildLynxReadinessStatGrid({ snapshot });
    const modules = buildLynxModuleReadinessListSurface({
      modules: snapshot.modules,
    });
    const controls = buildLynxEnterpriseControlsListSurface({
      controls: snapshot.enterpriseControls,
    });
    const tools = buildLynxToolAvailabilityListSurface({
      tools: snapshot.tools,
    });

    expect(stats.stats).toHaveLength(5);
    expect(modules.rows[0]?.cells.module).toBe("Finance");
    expect(controls.rows[0]?.rowTone).toBe("attention");
    expect(tools.rows[0]?.cells.tool).toBe("inspectFinanceSignals");
    expect(tools.surface.rowKey).toBe("toolName");
  });

  it("builds a governed activity ledger surface", () => {
    const surface = buildLynxActivityLedgerListSurface({
      rows: [
        {
          id: "run_1",
          kind: "run",
          label: "Lynx run completed",
          detail: "/api/lynx/operator",
          status: "completed",
          moduleId: "lynx",
          createdAt: "2026-05-28 10:00",
          href: "/lynx/runs/run_1",
        },
      ],
    });

    expect(surface.rows[0]?.cells.status).toBe("completed");
    expect(surface.rows[0]?.rowHref).toBe("/lynx/runs/run_1");
    expect(surface.surface.rowKey).toBe("id");
  });

  it("builds governed run detail surfaces", () => {
    const stats = buildLynxRunDetailStatGrid({
      eventCount: 3,
      toolCallCount: 1,
      evidenceReferenceCount: 2,
      feedbackCount: 1,
      latencyMs: 1200,
      status: "completed",
    });
    const timeline = buildLynxRunEventTimelineListSurface({
      rows: [
        {
          id: "event_1",
          eventType: "tool.called",
          summary: "Governed tool called.",
          toolName: "inspectLynxReadiness",
          evidenceCount: "0",
          validation: "-",
          approvalProposalId: "-",
          sandboxId: "-",
          createdAt: "2026-05-28 10:01",
        },
        {
          id: "event_2",
          eventType: "output-denied",
          summary: "Tool output was denied.",
          toolName: "requestApproval",
          evidenceCount: "0",
          validation: "-",
          approvalProposalId: "approval_1",
          sandboxId: "-",
          createdAt: "2026-05-28 10:02",
        },
      ],
    });
    const feedback = buildLynxRunFeedbackListSurface({
      rows: [
        {
          id: "feedback_1",
          rating: "positive",
          category: "accurate",
          note: "Useful answer.",
          createdAt: "2026-05-28 10:02",
        },
      ],
    });

    expect(stats.stats[0]?.value).toBe("completed");
    expect(timeline.rows[0]?.cells.toolName).toBe("inspectLynxReadiness");
    expect(timeline.rows[1]?.rowTone).toBe("critical");
    expect(feedback.rows[0]?.cells.category).toBe("accurate");
  });

  it("builds governed run management filters and analytics surfaces", () => {
    const analytics = {
      totalRuns: 4,
      completedRuns: 3,
      failedRuns: 1,
      startedRuns: 0,
      averageLatencyMs: 900,
      toolCallCount: 2,
      evidenceReferenceCount: 5,
      feedbackCount: 1,
      negativeFeedbackCount: 1,
      unsupportedClaimCount: 2,
      failedQualityGateCount: 1,
      lowCitationPrecisionCount: 1,
    };
    const stats = buildLynxRunManagementStatGrid(analytics);
    const quality = buildLynxRunManagementQualityStatGrid(analytics);
    const list = buildLynxRunManagementListSurface({
      filters: { status: "completed", search: "audit" },
      exportTriggerElementId: "export-link",
      rows: [
        {
          id: "run_1",
          promptSummary: "Audit readiness",
          route: "/api/lynx/operator",
          workflowId: "audit",
          model: "anthropic/test",
          status: "completed",
          qualityGate: "failed",
          unsupportedClaims: "2",
          latency: "900 ms",
          startedAt: "2026-05-28 10:00",
          href: "/lynx/runs/run_1",
        },
      ],
    });

    expect(stats.stats[0]?.value).toBe("4");
    expect(quality.stats[4]?.value).toBe("2");
    expect(list.presentation?.toolbar?.search?.value).toBe("audit");
    expect(list.presentation?.toolbar?.export?.triggerElementId).toBe(
      "export-link",
    );
  });

  it("builds enterprise observability and control surfaces", () => {
    const overview = buildLynxObservabilityStatGrid({
      totalRuns: 12,
      completedRuns: 10,
      failedRuns: 2,
      failedQualityGateCount: 1,
      unsupportedClaimCount: 3,
      lowCitationPrecisionCount: 1,
      proactiveWatchCount: 2,
      proactiveBlockedCount: 1,
      workflowSessionsCreated: 2,
      workflowSessionsUpdated: 4,
    });
    const latency = buildLynxLatencyAnalyticsListSurface({
      rows: [
        {
          id: "operator",
          route: "/api/lynx/operator",
          workflowId: "audit_readiness",
          model: "openai/test",
          runCount: "4",
          p50LatencyMs: "100 ms",
          p95LatencyMs: "300 ms",
          maxLatencyMs: "500 ms",
        },
      ],
    });
    const quality = buildLynxQualityAnalyticsListSurface({
      rows: [
        {
          id: "quality",
          workflowId: "audit_readiness",
          route: "/api/lynx/operator",
          failedQualityGateCount: "1",
          unsupportedClaimCount: "2",
          lowCitationPrecisionCount: "1",
        },
      ],
    });
    const outcomes = buildLynxProactiveOutcomeAnalyticsListSurface({
      rows: [
        {
          id: "outcome",
          monitorId: "audit-readiness-watch",
          status: "blocked",
          severity: "critical",
          count: "1",
        },
      ],
    });
    const controls = buildLynxOutcomeMonitorControlListSurface({
      canMutate: true,
      rows: [
        {
          id: "control",
          monitorId: "audit-readiness-watch",
          enabled: "disabled",
          ownerAuthUserId: "owner_1",
          thresholds: "{}",
          severityPolicy: "{}",
          updatedAt: "2026-05-28 10:00",
        },
      ],
    });
    expect(controls.rows[0]?.trailingAction?.state).toBe("ready");

    const readOnlyControls = buildLynxOutcomeMonitorControlListSurface({
      canMutate: false,
      rows: [
        {
          id: "control",
          monitorId: "audit-readiness-watch",
          enabled: "disabled",
          ownerAuthUserId: "owner_1",
          thresholds: "{}",
          severityPolicy: "{}",
          updatedAt: "2026-05-28 10:00",
        },
      ],
    });
    expect(readOnlyControls.rows[0]?.trailingAction?.state).toBe("disabled");
    expect(readOnlyControls.rows[0]?.trailingAction?.disabledReason).toContain(
      "lynx.approve",
    );
    const spend = buildLynxSpendAnalyticsListSurface({
      rows: [
        {
          id: "spend",
          feature: "lynx-operator",
          model: "openai/test",
          provider: "openai",
          totalRequests: "3",
          totalTokens: "1200",
          estimatedCostUsd: "$0.10",
        },
      ],
    });
    const failures = buildLynxRepresentativeEvalFailureListSurface({
      rows: [
        {
          id: "failure",
          caseId: "case_1",
          query: "What evidence supports close readiness?",
          reasons: "unsupported-claim",
          semanticGrade: "unsupported",
          observedAnswer: "Unsupported answer.",
          retrievedEvidence: "0",
          createdAt: "2026-05-28 10:00",
        },
      ],
    });

    expect(overview.stats[0]?.value).toBe("12");
    expect(latency.surface.columnsId).toBe("lynx-latency-analytics");
    expect(quality.rows[0]?.rowTone).toBe("critical");
    expect(outcomes.rows[0]?.rowTone).toBe("critical");
    expect(controls.rows[0]?.rowTone).toBe("attention");
    expect(spend.rows[0]?.cells.provider).toBe("openai");
    expect(failures.rows[0]?.rowTone).toBe("critical");
  });

  it("builds claim validation and failed quality gate surfaces", () => {
    const claims = buildLynxClaimValidationListSurface({
      rows: [
        {
          id: "claim_1",
          claim: "Revenue variance requires review [1].",
          status: "supported",
          evidence: "chunk_1",
          reason: "Every citation resolves to trusted evidence.",
        },
      ],
    });
    const failures = buildLynxFailedEvalCaseListSurface({
      rows: [
        {
          id: "event_1",
          workflowId: "audit",
          moduleId: "finance",
          status: "failed",
          unsupportedClaims: "1",
          citationPrecision: "50%",
          reason: "1 unsupported claim.",
          href: "/lynx/runs/run_1",
        },
      ],
    });

    expect(claims.rows[0]?.cells.status).toBe("supported");
    expect(failures.rows[0]?.rowTone).toBe("critical");
    expect(failures.rows[0]?.rowHref).toBe("/lynx/runs/run_1");
  });

  it("builds governed workflow session surfaces", () => {
    const sessions = buildLynxWorkflowSessionListSurface({
      filters: {
        status: "active",
        origin: "proactive-outcome-sweep",
        monitorStatus: "watch",
        severity: "review",
      },
      rows: [
        {
          id: "session_1",
          promptSummary: "Audit recovery workflow",
          workflowId: "audit_readiness",
          origin: "proactive-outcome-sweep",
          monitorStatus: "watch",
          severity: "review",
          status: "active",
          currentStage: "awaiting_operator_review",
          latestRunId: "run_1",
          qualityGate: "passed",
          nextRecommendedStep: "Resume after review.",
          updatedAt: "2026-05-28 10:00",
          href: "/lynx/workflows/session_1",
        },
      ],
    });
    const stats = buildLynxWorkflowSessionDetailStatGrid({
      status: "active",
      origin: "proactive-outcome-sweep",
      monitorStatus: "watch",
      severity: "review",
      currentStage: "awaiting_operator_review",
      linkedRunCount: 1,
      evidenceCount: 2,
      qualityGateStatus: "passed",
      updatedAt: "2026-05-28 10:00",
    });
    const runs = buildLynxWorkflowLinkedRunListSurface({
      rows: [
        {
          id: "run_1",
          promptSummary: "Audit run",
          route: "/api/lynx/operator",
          workflowId: "audit_readiness",
          model: "anthropic/test",
          status: "completed",
          qualityGate: "passed",
          unsupportedClaims: "0",
          latency: "900 ms",
          startedAt: "2026-05-28 10:00",
          href: "/lynx/runs/run_1",
        },
      ],
    });

    expect(sessions.rows[0]?.rowHref).toBe(
      "/lynx/workflows/session_1",
    );
    expect(sessions.rows[0]?.rowTone).toBe("attention");
    expect(sessions.rows[0]?.cells.origin).toBe("proactive-outcome-sweep");
    expect(sessions.rows[0]?.cells.monitorStatus).toBe("watch");
    expect(sessions.presentation?.toolbar?.filters?.[0]?.value).toBe("active");
    expect(sessions.presentation?.toolbar?.filters?.[1]?.value).toBe(
      "proactive-outcome-sweep",
    );
    expect(sessions.presentation?.toolbar?.filters?.[2]?.value).toBe("watch");
    expect(sessions.presentation?.toolbar?.filters?.[3]?.value).toBe("review");
    expect(
      stats.stats.find((stat) => stat.label === "Linked runs")?.value,
    ).toBe("1");
    expect(runs.surface.columnsId).toBe("lynx-workflow-linked-runs");
  });
});
