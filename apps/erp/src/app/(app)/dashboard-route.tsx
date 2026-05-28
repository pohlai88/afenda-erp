import { requireCapability } from "@afenda/auth/server";
import {
  dashboardRouteSections,
  describeWorkspaceDataSource,
  getAccessibleModules,
  getAiUsageRouteSummary,
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
import {
  buildDashboardAiUsageListSurface,
  buildDashboardAutomationListSurface,
  buildDashboardHardeningChart,
  buildDashboardHardeningChecklistSurface,
  buildDashboardKpiStatGrid,
  buildDashboardWorkflowListSurface,
  buildDashboardWorkflowSummaryStatGrid,
  buildSavedViewsListSurface,
  dashboardHardeningChartSurfaceKey,
  dashboardStatSurfaceKey,
  dashboardWorkflowSummaryStatSurfaceKey,
  getDashboardListSurfaceKeys,
} from "@afenda/feature-dashboard/metadata";
import {
  GovernedPatternBChartSection,
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import {
  getProductionHardeningChecklist,
  getWorkspaceObservabilitySummary,
} from "@afenda/observability";
import {
  ModuleLinkGrid,
  ObservabilityIndicatorList,
  SectionPanel,
  StatusBadge,
} from "@afenda/ui";
import { ErpAssistantPanel } from "./erp-assistant-panel";
import Link from "next/link";

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
  const automationListSurface = buildDashboardAutomationListSurface({
    runs: automationRuns,
  });
  const savedViewsListSurface = buildSavedViewsListSurface({
    views: dashboardWorkspace.savedViews,
    moduleId: "dashboard",
  });
  const hardeningChartConfig = buildDashboardHardeningChart({
    checklist: productionHardeningChecklist,
  });
  const hardeningChecklistSurface = buildDashboardHardeningChecklistSurface({
    items: productionHardeningChecklist,
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
    <div className="flex flex-col gap-6">
      <SectionPanel
        eyebrow={moduleDefinition.ownerTeam}
        headingLevel={1}
        title={`${organization.name} workspace`}
        description={posture.description}
        aside={
          <div className="flex flex-col gap-3 text-right">
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
        <GovernedPatternBStatSection
          title="Workspace overview"
          surfaceKey={`${dashboardStatSurfaceKey}-overview`}
          layout="embedded"
          statGroups={[
            {
              groupKey: "workspace-overview",
              configuration: buildDashboardKpiStatGrid({
                metrics: [
                  {
                    label: "Accessible modules",
                    value: String(readiness.accessibleModuleCount),
                    detail: "Routes available under the current role and organization context.",
                    tone: "positive",
                  },
                  {
                    label: "Workspace views",
                    value: String(dashboardWorkspaceStats.savedViewCount),
                    detail: `Saved views resolved from ${dataSourceLabel.toLowerCase()}.`,
                    tone: "positive",
                  },
                  {
                    label: "Workflow items",
                    value: String(dashboardWorkspaceStats.workItemCount),
                    detail: `${readiness.operationalModules} operational modules and ${readiness.controlModules} watchlist modules are in scope.`,
                    tone: dashboardWorkspaceStats.highPriorityWorkItemCount > 0 ? "warning" : "positive",
                  },
                ],
              }),
            },
          ]}
        />
      </SectionPanel>

      <GovernedPatternBStatSection
        title="Module KPIs"
        surfaceKey={dashboardStatSurfaceKey}
        layout="embedded"
        statGroups={[
          {
            groupKey: "module-kpis",
            configuration: buildDashboardKpiStatGrid({ metrics: dashboardMetrics }),
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <GovernedPatternCListSection
          title={dashboardRouteSections.priorityQueue.title}
          description={moduleDefinition.description}
          surfaceKey={surfaceKeys.workflow}
          listConfiguration={workflowListSurface}
          parentAccessAllowed
          layout="embedded"
          trailingColumn={{
            header: "Action",
            cellId: "governed.metadata",
            context: { surfaceKey: surfaceKeys.workflow, moduleId: "dashboard" },
          }}
        />

        <SectionPanel
          title={dashboardRouteSections.automationTelemetry.title}
          description={dashboardRouteSections.automationTelemetry.description}
        >
          <div className="flex flex-col gap-3">
            <ObservabilityIndicatorList
              indicators={observabilitySummary.indicators}
            />
            <GovernedPatternBStatSection
              title="Workflow summary"
              surfaceKey={dashboardWorkflowSummaryStatSurfaceKey}
              layout="embedded"
              statGroups={[
                {
                  groupKey: "workflow-summary",
                  configuration: buildDashboardWorkflowSummaryStatGrid(workflowSummary),
                },
              ]}
            />
            <GovernedPatternCListSection
              title={dashboardRouteSections.automationTelemetry.scheduledAutomationsTitle}
              surfaceKey={surfaceKeys.automations}
              listConfiguration={automationListSurface}
              parentAccessAllowed
              layout="embedded"
            />
          </div>
        </SectionPanel>
      </div>

      <SectionPanel
        title={dashboardRouteSections.aiAssistant.title}
        description={dashboardRouteSections.aiAssistant.description}
      >
        <div
          className={
            aiUsageRows.length > 0
              ? "grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]"
              : undefined
          }
        >
          <ErpAssistantPanel />
          {aiUsageRows.length > 0 ? (
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
                  layout="embedded"
                />
              </div>
            </div>
          ) : null}
        </div>
      </SectionPanel>

      <SectionPanel
        title={dashboardRouteSections.productionHardening.title}
        description={dashboardRouteSections.productionHardening.description}
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(360px,0.6fr)_minmax(0,1.4fr)]">
          <GovernedPatternBChartSection
            title="Hardening status"
            surfaceKey={dashboardHardeningChartSurfaceKey}
            chartConfiguration={hardeningChartConfig}
            layout="embedded"
          />
          <GovernedPatternCListSection
            title={dashboardRouteSections.productionHardening.title}
            surfaceKey={surfaceKeys.hardeningChecklist}
            listConfiguration={hardeningChecklistSurface}
            parentAccessAllowed
            layout="embedded"
          />
        </div>
      </SectionPanel>

      <GovernedPatternCListSection
        title={dashboardRouteSections.savedViews.title}
        description={dashboardRouteSections.savedViews.description}
        surfaceKey={surfaceKeys.savedViews}
        listConfiguration={savedViewsListSurface}
        parentAccessAllowed
        layout="embedded"
      />

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
