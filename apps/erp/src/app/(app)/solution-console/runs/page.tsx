import { requireCapability } from "@afenda/auth/server";
import {
  getLynxLatencyAnalytics,
  getLynxObservabilityOverview,
  getLynxOutcomeMonitorSettings,
  getLynxProactiveOutcomeAnalytics,
  getLynxQualityAnalytics,
  getLynxRunAnalytics,
  getLynxRunDetail,
  getLynxSpendAnalytics,
  listRepresentativeLynxEvalFailures,
  listLynxRunLedger,
} from "@afenda/db";
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
import { LYNX_OUTCOME_MONITOR_IDS } from "@afenda/feature-lynx";
import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import {
  Button,
  Input,
  NativeSelect,
  NativeSelectOption,
  SectionPanel,
} from "@afenda/ui";
import Link from "next/link";
import {
  buildLynxRunFilterSearchParams,
  parseLynxRunFilters,
} from "@/lib/api/lynx-run-filters";
import { LynxOutcomeMonitorSection } from "@/components/system-admin/lynx-outcome-monitor-section";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function formDefault(value: string | undefined) {
  return value ?? "";
}

function getRunQualityGate(metadata: Record<string, unknown>) {
  const gate = metadata.qualityGate;
  return typeof gate === "object" && gate !== null
    ? (gate as Record<string, unknown>)
    : null;
}

function getEventQualityGate(metrics: Record<string, unknown>) {
  const gate = metrics.qualityGate;
  return typeof gate === "object" && gate !== null
    ? (gate as Record<string, unknown>)
    : null;
}

function formatPercent(value: unknown) {
  return typeof value === "number" ? `${Math.round(value * 100)}%` : "-";
}

function getQualityGateStatus(metadata: Record<string, unknown>) {
  const gate = getRunQualityGate(metadata);
  return typeof gate?.status === "string" ? gate.status : "-";
}

function getUnsupportedClaimCount(metadata: Record<string, unknown>) {
  const gate = getRunQualityGate(metadata);
  return typeof gate?.unsupportedClaimCount === "number"
    ? String(gate.unsupportedClaimCount)
    : "-";
}

export default async function LynxRunsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const { organization } = await requireCapability("dashboard.view");
  const canManageMonitors = organization.capabilities.includes(
    "system-admin.machine-layer.approve",
  );
  const filters = parseLynxRunFilters(resolvedSearchParams);
  const observabilityFilters = {
    route: filters.route,
    workflowId: filters.workflowId,
    model: filters.model,
    qualityGate: filters.qualityGate,
    from: filters.startedFrom,
    to: filters.startedTo,
    origin: filters.origin,
    monitorStatus: filters.monitorStatus,
    severity: filters.severity,
    provider: filters.provider,
  };
  const [
    runs,
    analytics,
    observabilityOverview,
    latencyAnalytics,
    qualityAnalytics,
    proactiveOutcomeAnalytics,
    spendAnalytics,
    monitorSettings,
    representativeEvalFailures,
  ] = await Promise.all([
    listLynxRunLedger({
      organizationId: organization.id,
      filters,
      limit: 100,
    }),
    getLynxRunAnalytics({
      organizationId: organization.id,
      filters,
      limit: 500,
    }),
    getLynxObservabilityOverview({
      organizationId: organization.id,
      filters: observabilityFilters,
    }),
    getLynxLatencyAnalytics({
      organizationId: organization.id,
      filters: observabilityFilters,
    }),
    getLynxQualityAnalytics({
      organizationId: organization.id,
      filters: observabilityFilters,
    }),
    getLynxProactiveOutcomeAnalytics({
      organizationId: organization.id,
      filters: observabilityFilters,
    }),
    getLynxSpendAnalytics({
      organizationId: organization.id,
      filters: observabilityFilters,
    }),
    getLynxOutcomeMonitorSettings({
      organizationId: organization.id,
      monitorIds: LYNX_OUTCOME_MONITOR_IDS,
    }),
    listRepresentativeLynxEvalFailures({
      organizationId: organization.id,
      limit: 20,
    }),
  ]);
  const runDetails = await Promise.all(
    runs.map((run) =>
      getLynxRunDetail({
        organizationId: organization.id,
        runId: run.id,
      }),
    ),
  );
  const surfaceKeys = getLynxReadinessSurfaceKeys();
  const filterParams = buildLynxRunFilterSearchParams({ filters });
  const exportHref = `/api/lynx/runs/export${
    filterParams.size > 0 ? `?${filterParams.toString()}` : ""
  }`;
  const exportTriggerElementId = "lynx-runs-export-link";
  const stats = buildLynxRunManagementStatGrid(analytics);
  const qualityStats = buildLynxRunManagementQualityStatGrid(analytics);
  const observabilityStats = buildLynxObservabilityStatGrid(
    observabilityOverview,
  );
  const latencySurface = buildLynxLatencyAnalyticsListSurface({
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
  });
  const qualityAnalyticsSurface = buildLynxQualityAnalyticsListSurface({
    rows: qualityAnalytics.map((row) => ({
      id: `${row.workflowId}:${row.route}`,
      workflowId: row.workflowId,
      route: row.route,
      failedQualityGateCount: String(row.failedQualityGateCount),
      unsupportedClaimCount: String(row.unsupportedClaimCount),
      lowCitationPrecisionCount: String(row.lowCitationPrecisionCount),
    })),
  });
  const proactiveOutcomeSurface = buildLynxProactiveOutcomeAnalyticsListSurface(
    {
      rows: proactiveOutcomeAnalytics.map((row) => ({
        id: `${row.monitorId}:${row.status}:${row.severity}`,
        monitorId: row.monitorId,
        status: row.status,
        severity: row.severity,
        count: String(row.count),
      })),
    },
  );
  const spendSurface = buildLynxSpendAnalyticsListSurface({
    rows: spendAnalytics.map((row) => ({
      id: `${row.feature}:${row.model}:${row.provider}`,
      feature: row.feature,
      model: row.model,
      provider: row.provider,
      totalRequests: String(row.totalRequests),
      totalTokens: String(row.totalTokens),
      estimatedCostUsd:
        row.estimatedCostUsd > 0 ? `$${row.estimatedCostUsd.toFixed(2)}` : "-",
    })),
  });
  const representativeEvalFailureSurface =
    buildLynxRepresentativeEvalFailureListSurface({
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
    });
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
      href: `/solution-console/runs/${run.id}`,
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
              href: `/solution-console/runs/${detail.id}`,
            },
          ];
        }),
      ),
  });

  return (
    <div className="flex flex-col gap-6">
      <SectionPanel
        eyebrow="Lynx run management"
        headingLevel={1}
        title="Run console"
        description="Filter, inspect, replay, and export tenant-scoped Lynx runs."
        aside={
          <div className="flex flex-wrap justify-end gap-2">
            <Button asChild id={exportTriggerElementId} variant="outline">
              <Link href={exportHref}>Export CSV</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/solution-console">Back to console</Link>
            </Button>
          </div>
        }
      >
        <GovernedPatternBStatSection
          title="Cross-run analytics"
          surfaceKey={surfaceKeys.managementStats}
          layout="embedded"
          statGroups={[
            {
              groupKey: "lynx-run-management",
              configuration: stats,
            },
            {
              groupKey: "lynx-run-quality",
              configuration: qualityStats,
            },
            {
              groupKey: "lynx-observability",
              configuration: observabilityStats,
            },
          ]}
        />
      </SectionPanel>

      <SectionPanel
        title="Advanced filters"
        description="Filter runs by operational state, Vercel route, workflow, model, tool, prompt, and start window."
      >
        <form className="grid gap-3 md:grid-cols-3" method="get">
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Search
            <Input
              defaultValue={formDefault(filters.search)}
              name="q"
              placeholder="Prompt summary"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Status
            <NativeSelect
              className="w-full"
              defaultValue={formDefault(filters.status)}
              name="status"
            >
              <NativeSelectOption value="">Any status</NativeSelectOption>
              <NativeSelectOption value="started">Started</NativeSelectOption>
              <NativeSelectOption value="completed">
                Completed
              </NativeSelectOption>
              <NativeSelectOption value="failed">Failed</NativeSelectOption>
            </NativeSelect>
          </label>
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Route
            <NativeSelect
              className="w-full"
              defaultValue={formDefault(filters.route)}
              name="route"
            >
              <NativeSelectOption value="">Any route</NativeSelectOption>
              <NativeSelectOption value="/api/lynx/operator">
                Operator
              </NativeSelectOption>
              <NativeSelectOption value="/api/lynx/truth-search">
                Truth Retrieval
              </NativeSelectOption>
              <NativeSelectOption value="/api/cron/lynx-outcomes">
                Outcome sweep
              </NativeSelectOption>
            </NativeSelect>
          </label>
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Workflow
            <Input
              defaultValue={formDefault(filters.workflowId)}
              name="workflowId"
              placeholder="workflow id"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Model
            <Input
              defaultValue={formDefault(filters.model)}
              name="model"
              placeholder="provider/model"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Tool
            <Input
              defaultValue={formDefault(filters.toolName)}
              name="toolName"
              placeholder="tool name"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Provider
            <Input
              defaultValue={formDefault(filters.provider)}
              name="provider"
              placeholder="gateway provider"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Origin
            <NativeSelect
              className="w-full"
              defaultValue={formDefault(filters.origin)}
              name="origin"
            >
              <NativeSelectOption value="">Any origin</NativeSelectOption>
              <NativeSelectOption value="proactive-outcome-sweep">
                Proactive outcome sweep
              </NativeSelectOption>
            </NativeSelect>
          </label>
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Monitor status
            <NativeSelect
              className="w-full"
              defaultValue={formDefault(filters.monitorStatus)}
              name="monitorStatus"
            >
              <NativeSelectOption value="">
                Any monitor status
              </NativeSelectOption>
              <NativeSelectOption value="healthy">Healthy</NativeSelectOption>
              <NativeSelectOption value="watch">Watch</NativeSelectOption>
              <NativeSelectOption value="blocked">Blocked</NativeSelectOption>
            </NativeSelect>
          </label>
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Severity
            <NativeSelect
              className="w-full"
              defaultValue={formDefault(filters.severity)}
              name="severity"
            >
              <NativeSelectOption value="">Any severity</NativeSelectOption>
              <NativeSelectOption value="info">Info</NativeSelectOption>
              <NativeSelectOption value="review">Review</NativeSelectOption>
              <NativeSelectOption value="critical">Critical</NativeSelectOption>
            </NativeSelect>
          </label>
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Quality
            <NativeSelect
              className="w-full"
              defaultValue={formDefault(filters.qualityGate)}
              name="qualityGate"
            >
              <NativeSelectOption value="">Any quality gate</NativeSelectOption>
              <NativeSelectOption value="unsupported">
                Unsupported claims
              </NativeSelectOption>
              <NativeSelectOption value="lowCitationPrecision">
                Low citation precision
              </NativeSelectOption>
              <NativeSelectOption value="failedQualityGate">
                Failed gate
              </NativeSelectOption>
            </NativeSelect>
          </label>
          <label className="grid gap-2 text-sm font-medium text-foreground">
            From
            <Input
              defaultValue={
                filters.startedFrom
                  ? filters.startedFrom.toISOString().slice(0, 10)
                  : ""
              }
              name="from"
              type="date"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-foreground">
            To
            <Input
              defaultValue={
                filters.startedTo
                  ? filters.startedTo.toISOString().slice(0, 10)
                  : ""
              }
              name="to"
              type="date"
            />
          </label>
          <div className="flex items-end gap-2">
            <Button type="submit">Apply filters</Button>
            <Button asChild variant="ghost">
              <Link href="/solution-console/runs">Reset</Link>
            </Button>
          </div>
        </form>
      </SectionPanel>

      <GovernedPatternCListSection
        title="Filtered runs"
        description="Rows open replay details with tools, evidence, approvals, sandboxes, and feedback."
        surfaceKey={surfaceKeys.management}
        listConfiguration={listSurface}
        parentAccessAllowed
        layout="embedded"
      />

      <GovernedPatternCListSection
        title="Latency analytics"
        description="Route, workflow, and model latency distribution for the selected window."
        surfaceKey={`${surfaceKeys.management}.latency`}
        listConfiguration={latencySurface}
        parentAccessAllowed
        layout="embedded"
      />

      <GovernedPatternCListSection
        title="Quality analytics"
        description="Grouped failed gates, unsupported claims, and low citation precision for the selected window."
        surfaceKey={`${surfaceKeys.management}.quality`}
        listConfiguration={qualityAnalyticsSurface}
        parentAccessAllowed
        layout="embedded"
      />

      <GovernedPatternCListSection
        title="Proactive outcome analytics"
        description="Deterministic monitor outcomes grouped by monitor, status, and severity."
        surfaceKey={`${surfaceKeys.management}.proactive-outcomes`}
        listConfiguration={proactiveOutcomeSurface}
        parentAccessAllowed
        layout="embedded"
      />

      <GovernedPatternCListSection
        title="Spend analytics"
        description="Usage-derived Gateway spend signals grouped by feature, model, and provider where available."
        surfaceKey={`${surfaceKeys.management}.spend`}
        listConfiguration={spendSurface}
        parentAccessAllowed
        layout="embedded"
      />

      <LynxOutcomeMonitorSection
        canWrite={canManageMonitors}
        description="Enable monitors, tune deterministic thresholds, and assign an owner for proactive review sessions."
        listDescription="Current tenant monitor configuration. Use Configure to jump to the editor below."
        listTitle="Monitor settings"
        organizationId={organization.id}
        preloaded={{ monitorSettings }}
        title="Proactive monitor controls"
      />

      <GovernedPatternCListSection
        title="Quality gate failures"
        description="Failed claim and citation checks from the filtered run set."
        surfaceKey={surfaceKeys.failedEvalCases}
        listConfiguration={failedEvalCaseSurface}
        parentAccessAllowed
        layout="embedded"
      />

      <GovernedPatternCListSection
        title="Representative eval failures"
        description="Persisted per-case failures from versioned Lynx eval datasets."
        surfaceKey={`${surfaceKeys.failedEvalCases}.representative`}
        listConfiguration={representativeEvalFailureSurface}
        parentAccessAllowed
        layout="embedded"
      />
    </div>
  );
}
