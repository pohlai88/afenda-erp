import {
  dashboardRouteSections,
  describeWorkspaceDataSource,
  getAccessibleModules,
  getDashboardMetrics,
  getModuleWorkspaceStats,
  getResolvedDashboardMetrics,
  getWorkspaceReadinessSummary,
  roleOperatingPosture,
  type ModuleWorkspaceListQuery,
} from "@afenda/kernel";
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
import { getProductionHardeningChecklist, getWorkspaceObservabilitySummary } from "@afenda/observability";
import {
  loadDashboardSession,
  loadDashboardWorkspaceBundle,
} from "@/routes/workspace/shared/workspace-route-cache";
import {
  ModuleLinkGrid,
  ObservabilityIndicatorList,
  SectionPanel,
  StatusBadge,
} from "@afenda/ui";
import Link from "next/link";
import { ErpAssistantPanel } from "@/routes/workspace/shell/erp-assistant-panel";
import { cache } from "react";

const loadDashboardMetrics = cache(
  async (query?: ModuleWorkspaceListQuery) => {
    const { organization, dashboardWorkspace } =
      await loadDashboardWorkspaceBundle({ query });
    const usesPersistedMetrics =
      dashboardWorkspace.dataMode === "persisted" &&
      !dashboardWorkspace.fallbackApplied;

    return usesPersistedMetrics
      ? getResolvedDashboardMetrics(organization.id)
      : getDashboardMetrics();
  },
);

export async function DashboardHeaderSection({
  query,
}: {
  query?: ModuleWorkspaceListQuery;
}) {
  const { organization, moduleDefinition } = await loadDashboardSession();
  const { dashboardWorkspace } = await loadDashboardWorkspaceBundle({ query });
  const posture = roleOperatingPosture[organization.role];
  const readiness = getWorkspaceReadinessSummary(organization.capabilities);
  const dashboardWorkspaceStats = getModuleWorkspaceStats(dashboardWorkspace);
  const dataSourceLabel = describeWorkspaceDataSource(dashboardWorkspace);

  return (
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
          <div className="type-caption uppercase tracking-wide">
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
                  detail:
                    "Routes available under the current role and organization context.",
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
                  tone:
                    dashboardWorkspaceStats.highPriorityWorkItemCount > 0
                      ? "warning"
                      : "positive",
                },
              ],
            }),
          },
        ]}
      />
    </SectionPanel>
  );
}

export async function DashboardKpiSection({
  query,
}: {
  query?: ModuleWorkspaceListQuery;
}) {
  const dashboardMetrics = await loadDashboardMetrics(query);

  return (
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
  );
}

export async function DashboardWorkflowColumnSection({
  query,
}: {
  query?: ModuleWorkspaceListQuery;
}) {
  const { moduleDefinition } = await loadDashboardSession();
  const { automationRuns, dashboardWorkspace } =
    await loadDashboardWorkspaceBundle({ query });
  const observabilitySummary = getWorkspaceObservabilitySummary();
  const surfaceKeys = getDashboardListSurfaceKeys();
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
    <div className="@container grid gap-surface-2xl @xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
      <GovernedPatternCListSection
        title={dashboardRouteSections.priorityQueue.title}
        description={moduleDefinition.description}
        surfaceKey={surfaceKeys.workflow}
        listConfiguration={buildDashboardWorkflowListSurface({
          workItems: dashboardWorkspace.workItems.slice(0, 5),
          window: dashboardWorkspace.workItemWindow,
          query,
        })}
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
          <ObservabilityIndicatorList indicators={observabilitySummary.indicators} />
          <GovernedPatternBStatSection
            title="Workflow summary"
            surfaceKey={dashboardWorkflowSummaryStatSurfaceKey}
            layout="embedded"
            statGroups={[
              {
                groupKey: "workflow-summary",
                configuration:
                  buildDashboardWorkflowSummaryStatGrid(workflowSummary),
              },
            ]}
          />
          <GovernedPatternCListSection
            title={
              dashboardRouteSections.automationTelemetry.scheduledAutomationsTitle
            }
            surfaceKey={surfaceKeys.automations}
            listConfiguration={buildDashboardAutomationListSurface({
              runs: automationRuns,
            })}
            parentAccessAllowed
            layout="embedded"
          />
        </div>
      </SectionPanel>
    </div>
  );
}

export async function DashboardAssistantSection({
  query,
}: {
  query?: ModuleWorkspaceListQuery;
}) {
  const { aiUsageRows } = await loadDashboardWorkspaceBundle({ query });
  const surfaceKeys = getDashboardListSurfaceKeys();
  const aiUsageListSurface = buildDashboardAiUsageListSurface({
    events: aiUsageRows,
  });

  return (
    <SectionPanel
      title={dashboardRouteSections.aiAssistant.title}
      description={dashboardRouteSections.aiAssistant.description}
    >
      <div
        className={
          aiUsageRows.length > 0
            ? "grid gap-surface-lg @xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]"
            : undefined
        }
      >
        <ErpAssistantPanel />
        {aiUsageRows.length > 0 ? (
          <div className="flex flex-col gap-surface-md">
            <p className="type-muted">
              {dashboardRouteSections.aiAssistant.aiUsageLedger.description}
            </p>
            <GovernedPatternCListSection
              title={dashboardRouteSections.aiAssistant.aiUsageLedger.title}
              surfaceKey={surfaceKeys.aiUsage}
              listConfiguration={aiUsageListSurface}
              parentAccessAllowed
              layout="embedded"
            />
          </div>
        ) : null}
      </div>
    </SectionPanel>
  );
}

export async function DashboardHardeningSection() {
  const productionHardeningChecklist = getProductionHardeningChecklist();
  const surfaceKeys = getDashboardListSurfaceKeys();

  return (
    <SectionPanel
      title={dashboardRouteSections.productionHardening.title}
      description={dashboardRouteSections.productionHardening.description}
    >
      <div className="@container grid gap-surface-2xl @xl:grid-cols-[minmax(360px,0.6fr)_minmax(0,1.4fr)]">
        <GovernedPatternBChartSection
          title="Hardening status"
          surfaceKey={dashboardHardeningChartSurfaceKey}
          chartConfiguration={buildDashboardHardeningChart({
            checklist: productionHardeningChecklist,
          })}
          layout="embedded"
        />
        <GovernedPatternCListSection
          title="Checklist items"
          surfaceKey={surfaceKeys.hardeningChecklist}
          listConfiguration={buildDashboardHardeningChecklistSurface({
            items: productionHardeningChecklist,
          })}
          parentAccessAllowed
          layout="embedded"
        />
      </div>
    </SectionPanel>
  );
}

export async function DashboardSavedViewsSection({
  query,
}: {
  query?: ModuleWorkspaceListQuery;
}) {
  const { dashboardWorkspace } = await loadDashboardWorkspaceBundle({ query });
  const surfaceKeys = getDashboardListSurfaceKeys();

  return (
    <GovernedPatternCListSection
      title={dashboardRouteSections.savedViews.title}
      description={dashboardRouteSections.savedViews.description}
      surfaceKey={surfaceKeys.savedViews}
      listConfiguration={buildSavedViewsListSurface({
        views: dashboardWorkspace.savedViews,
        moduleId: "dashboard",
      })}
      parentAccessAllowed
      layout="embedded"
    />
  );
}

export async function DashboardModulesSection() {
  const { organization } = await loadDashboardSession();
  const accessibleModules = getAccessibleModules(organization.capabilities);

  return (
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
  );
}
