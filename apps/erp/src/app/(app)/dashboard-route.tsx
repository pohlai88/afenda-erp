import { requireCapability } from "@afenda/auth/server";
import {
  buildDashboardAiUsageListSurface,
  buildDashboardWorkflowListSurface,
  dashboardRouteMetrics,
  dashboardRouteSections,
  describeWorkspaceDataSource,
  getAccessibleModules,
  getAiUsageRouteSummary,
  getDashboardListSurfaceKeys,
  getDashboardMetrics,
  getDashboardWorkspace,
  getErpModuleById,
  getModuleWorkspaceStats,
  getResolvedDashboardMetrics,
  getResolvedWorkflowAutomationRuns,
  getWorkspaceReadinessSummary,
  resolveWorkspaceDataMode,
  roleOperatingPosture,
  type ModuleWorkspaceListQuery,
} from "@afenda/domain";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import {
  getProductionHardeningChecklist,
  getWorkspaceObservabilitySummary,
} from "@afenda/observability";
import {
  AutomationRunList,
  HardeningChecklistGrid,
  MetricCard,
  MetricGrid,
  ModuleLinkGrid,
  ObservabilityIndicatorList,
  SavedViewGrid,
  SectionPanel,
  StatusBadge,
  WorkflowSummaryPanel,
} from "@afenda/ui";
import { ErpAssistantPanel } from "./erp-assistant-panel";
import Link from "next/link";

function automationStatusTone(status: string) {
  if (status === "healthy") {
    return "positive" as const;
  }

  if (status === "watch") {
    return "warning" as const;
  }

  return "neutral" as const;
}

function hardeningStatusTone(status: string) {
  return status === "review" ? ("warning" as const) : ("positive" as const);
}

export async function DashboardRoutePage({
  query,
}: {
  query?: ModuleWorkspaceListQuery;
}) {
  const { session, organization } = await requireCapability("dashboard.view");
  const moduleDefinition = getErpModuleById("dashboard");

  if (!moduleDefinition) {
    throw new Error("Dashboard module metadata is missing.");
  }

  const accessibleModules = getAccessibleModules(organization.capabilities);
  const posture = roleOperatingPosture[organization.role];
  const readiness = getWorkspaceReadinessSummary(organization.capabilities);
  const observabilitySummary = getWorkspaceObservabilitySummary();
  const productionHardeningChecklist = getProductionHardeningChecklist();
  const automationRuns = await getResolvedWorkflowAutomationRuns({
    organizationId: organization.id,
    dataMode: resolveWorkspaceDataMode(session.source),
  });
  const dashboardWorkspace = await getDashboardWorkspace({
    organizationId: organization.id,
    dataMode: resolveWorkspaceDataMode(session.source),
    query,
  });
  const usesPersistedMetrics =
    dashboardWorkspace.dataMode === "persisted" &&
    !dashboardWorkspace.fallbackApplied;
  const dashboardMetrics = usesPersistedMetrics
    ? await getResolvedDashboardMetrics(organization.id)
    : getDashboardMetrics();
  const aiUsageRows =
    session.source === "neon"
      ? await getAiUsageRouteSummary({
          organizationId: organization.id,
          limit: 6,
        })
      : [];
  const dashboardWorkspaceStats = getModuleWorkspaceStats(dashboardWorkspace);
  const surfaceKeys = getDashboardListSurfaceKeys();
  const workflowListSurface = buildDashboardWorkflowListSurface({
    workItems: dashboardWorkspace.workItems.slice(0, 5),
    window: dashboardWorkspace.workItemWindow,
    query,
  });
  const aiUsageListSurface = buildDashboardAiUsageListSurface({
    events: aiUsageRows,
  });
  const dataSourceLabel = describeWorkspaceDataSource(dashboardWorkspace);
  const workflowSummary = {
    queueDepth: dashboardWorkspace.workItems.length,
    escalations: dashboardWorkspace.workItems.filter(
      (item) => item.status === "escalated",
    ).length,
    highPriority: dashboardWorkspace.workItems.filter(
      (item) => item.priority === "high",
    ).length,
  };

  return (
    <div className="space-y-6">
      <SectionPanel
        eyebrow={moduleDefinition.ownerTeam}
        headingLevel={1}
        title={`${organization.name} workspace`}
        description={posture.description}
        aside={
          <div className="space-y-3 text-right">
            <StatusBadge
              label={moduleDefinition.status.label}
              tone={moduleDefinition.status.tone}
            />
            <div className="text-xs uppercase tracking-wide text-muted">
              {organization.slug}
            </div>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            label={dashboardRouteMetrics[0].label}
            value={String(readiness.accessibleModuleCount)}
            detail={dashboardRouteMetrics[0].detail}
            tone="positive"
          />
          <MetricCard
            label={dashboardRouteMetrics[1].label}
            value={String(dashboardWorkspaceStats.savedViewCount)}
            detail={dashboardRouteMetrics[1].detail(dataSourceLabel)}
            tone="positive"
          />
          <MetricCard
            label={dashboardRouteMetrics[2].label}
            value={String(dashboardWorkspaceStats.workItemCount)}
            detail={dashboardRouteMetrics[2].detail(
              readiness.operationalModules,
              readiness.controlModules,
            )}
            tone={
              dashboardWorkspaceStats.highPriorityWorkItemCount > 0
                ? "warning"
                : "positive"
            }
          />
        </div>
      </SectionPanel>

      <MetricGrid metrics={dashboardMetrics} persisted={usesPersistedMetrics} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <GovernedPatternCListSection
          title={dashboardRouteSections.priorityQueue.title}
          description={moduleDefinition.description}
          surfaceKey={surfaceKeys.workflow}
          listConfiguration={workflowListSurface}
          parentAccessAllowed
          resolveConfiguredPermission={false}
          layout="embedded"
          trailingColumn={{ header: "Action", cellId: "governed.metadata" }}
        />

        <SectionPanel
          title={dashboardRouteSections.automationTelemetry.title}
          description={dashboardRouteSections.automationTelemetry.description}
        >
          <div className="space-y-3">
            <ObservabilityIndicatorList
              indicators={observabilitySummary.indicators}
            />
            <WorkflowSummaryPanel
              escalations={workflowSummary.escalations}
              highPriority={workflowSummary.highPriority}
              queueDepth={workflowSummary.queueDepth}
            />
            <div className="rounded-lg border border-line bg-surface-strong p-4">
              <div className="text-sm font-semibold text-foreground">
                {
                  dashboardRouteSections.automationTelemetry
                    .scheduledAutomationsTitle
                }
              </div>
              <div className="mt-3">
                <AutomationRunList
                  runs={automationRuns.map((automation) => ({
                    ...automation,
                    statusTone: automationStatusTone(automation.status),
                  }))}
                />
              </div>
            </div>
          </div>
        </SectionPanel>
      </div>

      <SectionPanel
        title={dashboardRouteSections.aiAssistant.title}
        description={dashboardRouteSections.aiAssistant.description}
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
          <ErpAssistantPanel />
          <div className="rounded-lg border border-line bg-surface-strong p-4">
            <div className="text-sm font-semibold text-foreground">
              {dashboardRouteSections.aiAssistant.aiUsageLedger.title}
            </div>
            <div className="mt-2 text-sm leading-6 text-muted">
              {dashboardRouteSections.aiAssistant.aiUsageLedger.description}
            </div>
            <div className="mt-4">
              <GovernedPatternCListSection
                title={dashboardRouteSections.aiAssistant.aiUsageLedger.title}
                surfaceKey={surfaceKeys.aiUsage}
                listConfiguration={aiUsageListSurface}
                parentAccessAllowed
                resolveConfiguredPermission={false}
                layout="embedded"
              />
            </div>
          </div>
        </div>
      </SectionPanel>

      <SectionPanel
        title={dashboardRouteSections.productionHardening.title}
        description={dashboardRouteSections.productionHardening.description}
      >
        <HardeningChecklistGrid
          items={productionHardeningChecklist.map((item) => ({
            ...item,
            statusTone: hardeningStatusTone(item.status),
          }))}
        />
      </SectionPanel>

      <SectionPanel
        title={dashboardRouteSections.savedViews.title}
        description={dashboardRouteSections.savedViews.description}
      >
        <SavedViewGrid views={dashboardWorkspace.savedViews} />
      </SectionPanel>

      <SectionPanel
        title={dashboardRouteSections.moduleSurfaces.title}
        description={dashboardRouteSections.moduleSurfaces.description}
      >
        <ModuleLinkGrid
          modules={accessibleModules.map((module) => ({
            id: module.id,
            href: module.href,
            label: module.label,
            summary: module.summary,
            statusLabel: module.status.label,
            statusTone: module.status.tone,
          }))}
          renderLink={({ module, className, children }) => (
            <Link className={className} href={module.href}>
              {children}
            </Link>
          )}
        />
      </SectionPanel>
    </div>
  );
}
