import {
  LynxOutcomeMonitorSection,
  updateLynxOutcomeMonitorSettingAction,
} from "@afenda/feature-system-admin/server";
import type { LynxRunLedgerFilters } from "@afenda/feature-lynx/server";
import {
  buildLynxLatencyAnalyticsListSurface,
  buildLynxObservabilityStatGrid,
  buildLynxFailedEvalCaseListSurface,
  buildLynxProactiveOutcomeAnalyticsListSurface,
  buildLynxQualityAnalyticsListSurface,
  buildLynxRepresentativeEvalFailureListSurface,
  buildLynxRunManagementListSurface,
  buildLynxRunManagementQualityStatGrid,
  buildLynxRunManagementStatGrid,
  buildLynxSpendAnalyticsListSurface,
  getLynxReadinessSurfaceKeys,
} from "@afenda/feature-lynx/metadata";
import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import {
  formatPercent,
  getEventQualityGate,
  getQualityGateStatus,
  getUnsupportedClaimCount,
} from "@/routes/workspace/lynx/lynx-runs-route.shared";
import {
  loadLynxRunsLedgerBundle,
  loadLynxRunsMonitorBundle,
  loadLynxRunsObservabilityListsBundle,
  loadLynxRunsRepresentativeFailuresBundle,
  loadLynxRunsSession,
  loadLynxRunsStatsBundle,
} from "@/routes/workspace/shared/workspace-route-cache";

export async function LynxRunsStatsSection({
  filters,
}: {
  filters: LynxRunLedgerFilters;
}) {
  const { analytics, observabilityOverview } =
    await loadLynxRunsStatsBundle(filters);
  const surfaceKeys = getLynxReadinessSurfaceKeys();

  return (
    <GovernedPatternBStatSection
      title="Cross-run analytics"
      surfaceKey={surfaceKeys.managementStats}
      layout="embedded"
      statGroups={[
        {
          groupKey: "lynx-run-management",
          configuration: buildLynxRunManagementStatGrid(analytics),
        },
        {
          groupKey: "lynx-run-quality",
          configuration: buildLynxRunManagementQualityStatGrid(analytics),
        },
        {
          groupKey: "lynx-observability",
          configuration: buildLynxObservabilityStatGrid(observabilityOverview),
        },
      ]}
    />
  );
}

export async function LynxRunsLedgerSection({
  filters,
  exportTriggerElementId,
}: {
  filters: LynxRunLedgerFilters;
  exportTriggerElementId: string;
}) {
  const { runs, runDetails } = await loadLynxRunsLedgerBundle(filters);
  const surfaceKeys = getLynxReadinessSurfaceKeys();
  const listSurface = buildLynxRunManagementListSurface({
    filters: {
      status: filters.status,
      route: filters.route,
      workflowId: filters.workflowId,
      model: filters.model,
      toolName: filters.toolName,
      qualityGate: filters.qualityGate,
      origin: filters.origin,
      monitorStatus: filters.monitorStatus,
      severity: filters.severity,
      provider: filters.provider,
      search: filters.search,
    },
    exportTriggerElementId,
    rows: runs.map((run) => ({
      id: run.id,
      promptSummary: run.promptSummary || run.id,
      route: run.route,
      workflowId: run.workflowId ?? "-",
      model: run.model,
      status: run.status,
      qualityGate: getQualityGateStatus(run.metadata),
      unsupportedClaims: getUnsupportedClaimCount(run.metadata),
      latency: `${run.latencyMs} ms`,
      startedAt: run.startedAt.toLocaleString(),
      href: `/lynx/runs/${run.id}`,
    })),
  });
  const failedEvalCaseSurface = buildLynxFailedEvalCaseListSurface({
    rows: runDetails
      .filter((detail): detail is NonNullable<typeof detail> => Boolean(detail))
      .flatMap((detail) =>
        detail.events.flatMap((event) => {
          const gate = getEventQualityGate(event.validationMetrics);
          if (!gate || gate.status !== "failed") {
            return [];
          }

          return [
            {
              id: event.id,
              workflowId: detail.workflowId ?? "-",
              moduleId:
                typeof event.metadata.moduleId === "string"
                  ? event.metadata.moduleId
                  : "lynx",
              status: "failed",
              unsupportedClaims:
                typeof gate.unsupportedClaimCount === "number"
                  ? String(gate.unsupportedClaimCount)
                  : "-",
              citationPrecision: formatPercent(gate.citationPrecision),
              reason: Array.isArray(gate.reasons)
                ? gate.reasons.join(" ")
                : event.summary,
              href: `/lynx/runs/${detail.id}`,
            },
          ];
        }),
      ),
  });

  return (
    <>
      <GovernedPatternCListSection
        title="Filtered runs"
        description="Rows open replay details with tools, evidence, approvals, sandboxes, and feedback."
        surfaceKey={surfaceKeys.management}
        listConfiguration={listSurface}
        parentAccessAllowed
        layout="embedded"
      />
      <GovernedPatternCListSection
        title="Quality gate failures"
        description="Failed claim and citation checks from the filtered run set."
        surfaceKey={surfaceKeys.failedEvalCases}
        listConfiguration={failedEvalCaseSurface}
        parentAccessAllowed
        layout="embedded"
      />
    </>
  );
}

export async function LynxRunsObservabilityListsSection({
  filters,
}: {
  filters: LynxRunLedgerFilters;
}) {
  const {
    latencyAnalytics,
    qualityAnalytics,
    proactiveOutcomeAnalytics,
    spendAnalytics,
  } = await loadLynxRunsObservabilityListsBundle(filters);
  const surfaceKeys = getLynxReadinessSurfaceKeys();

  return (
    <>
      <GovernedPatternCListSection
        title="Latency analytics"
        description="Route, workflow, and model latency distribution for the selected window."
        surfaceKey={`${surfaceKeys.management}.latency`}
        listConfiguration={buildLynxLatencyAnalyticsListSurface({
          rows: latencyAnalytics.map((row) => ({
            id: `${row.route}:${row.workflowId}:${row.model}`,
            route: row.route,
            workflowId: row.workflowId,
            model: row.model,
            runCount: String(row.runCount),
            p50LatencyMs: `${row.p50LatencyMs} ms`,
            p95LatencyMs: `${row.p95LatencyMs} ms`,
            maxLatencyMs: `${row.maxLatencyMs} ms`,
          })),
        })}
        parentAccessAllowed
        layout="embedded"
      />
      <GovernedPatternCListSection
        title="Quality analytics"
        description="Grouped failed gates, unsupported claims, and low citation precision for the selected window."
        surfaceKey={`${surfaceKeys.management}.quality`}
        listConfiguration={buildLynxQualityAnalyticsListSurface({
          rows: qualityAnalytics.map((row) => ({
            id: `${row.workflowId}:${row.route}`,
            workflowId: row.workflowId,
            route: row.route,
            failedQualityGateCount: String(row.failedQualityGateCount),
            unsupportedClaimCount: String(row.unsupportedClaimCount),
            lowCitationPrecisionCount: String(row.lowCitationPrecisionCount),
          })),
        })}
        parentAccessAllowed
        layout="embedded"
      />
      <GovernedPatternCListSection
        title="Proactive outcome analytics"
        description="Deterministic monitor outcomes grouped by monitor, status, and severity."
        surfaceKey={`${surfaceKeys.management}.proactive-outcomes`}
        listConfiguration={buildLynxProactiveOutcomeAnalyticsListSurface({
          rows: proactiveOutcomeAnalytics.map((row) => ({
            id: `${row.monitorId}:${row.status}:${row.severity}`,
            monitorId: row.monitorId,
            status: row.status,
            severity: row.severity,
            count: String(row.count),
          })),
        })}
        parentAccessAllowed
        layout="embedded"
      />
      <GovernedPatternCListSection
        title="Spend analytics"
        description="Usage-derived Gateway spend signals grouped by feature, model, and provider where available."
        surfaceKey={`${surfaceKeys.management}.spend`}
        listConfiguration={buildLynxSpendAnalyticsListSurface({
          rows: spendAnalytics.map((row) => ({
            id: `${row.feature}:${row.model}:${row.provider}`,
            feature: row.feature,
            model: row.model,
            provider: row.provider,
            totalRequests: String(row.totalRequests),
            totalTokens: String(row.totalTokens),
            estimatedCostUsd:
              row.estimatedCostUsd > 0
                ? `$${row.estimatedCostUsd.toFixed(2)}`
                : "-",
          })),
        })}
        parentAccessAllowed
        layout="embedded"
      />
    </>
  );
}

export async function LynxRunsMonitorSection() {
  const { organization, canManageMonitors } = await loadLynxRunsSession();
  const { monitorSettings } = await loadLynxRunsMonitorBundle();

  return (
    <LynxOutcomeMonitorSection
      canWrite={canManageMonitors}
      description="Enable monitors, tune deterministic thresholds, and assign an owner for proactive review sessions."
      listDescription="Current tenant monitor configuration. Use Configure to jump to the editor below."
      listTitle="Monitor settings"
      organizationId={organization.id}
      preloaded={{ monitorSettings }}
      title="Proactive monitor controls"
      updateLynxOutcomeMonitorSettingAction={updateLynxOutcomeMonitorSettingAction}
    />
  );
}

export async function LynxRunsRepresentativeFailuresSection() {
  const { representativeEvalFailures } =
    await loadLynxRunsRepresentativeFailuresBundle();
  const surfaceKeys = getLynxReadinessSurfaceKeys();

  return (
    <GovernedPatternCListSection
      title="Representative eval failures"
      description="Persisted per-case failures from versioned Lynx eval datasets."
      surfaceKey={`${surfaceKeys.failedEvalCases}.representative`}
      listConfiguration={buildLynxRepresentativeEvalFailureListSurface({
        rows: representativeEvalFailures.map((failure) => {
          const semanticStatus =
            failure.semanticGrade &&
            typeof failure.semanticGrade.status === "string"
              ? failure.semanticGrade.status
              : "not_run";
          return {
            id: failure.id,
            caseId: failure.caseId,
            query: failure.query,
            reasons: failure.failureReasons.join(", ") || "-",
            semanticGrade: semanticStatus,
            observedAnswer: failure.observedAnswer || "-",
            retrievedEvidence: String(failure.retrievedEvidenceIds.length),
            createdAt: failure.createdAt.toLocaleString(),
          };
        }),
      })}
      parentAccessAllowed
      layout="embedded"
    />
  );
}
