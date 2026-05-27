import {
  buildModuleRecordListSurface,
  buildModuleWorkItemListSurface,
  describeWorkspaceDataSource,
  getModuleListSurfaceKeys,
  formatModuleObservabilityFooter,
  getAccessibleModules,
  getErpModuleById,
  getModuleObservabilityIndicators,
  getModuleWorkspace,
  getModuleWorkspaceStats,
  getResolvedModuleMetrics,
  moduleScreenDetailListLabels,
  moduleScreenMetrics,
  moduleScreenSections,
  resolveWorkspaceDataMode,
  type ModuleId,
  type ModuleWorkspaceListQuery,
} from "@afenda/domain";
import { requireCapability } from "@afenda/auth/server";
import {
  BulletColumns,
  DetailList,
  MetricCard,
  MetricGrid,
  ModuleLinkGrid,
  ObservabilityIndicatorList,
  SavedViewGrid,
  SectionPanel,
  StatusBadge,
} from "@afenda/ui";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocumentExtractionForm } from "./document-extraction-form";
import { DocumentUploadForm } from "./document-upload-form";

function getModuleOrThrow(moduleId: ModuleId) {
  const moduleDefinition = getErpModuleById(moduleId);

  if (!moduleDefinition) {
    notFound();
  }

  return moduleDefinition;
}

export function createModuleMetadata(moduleId: ModuleId): Metadata {
  const moduleDefinition = getModuleOrThrow(moduleId);

  return {
    title: moduleDefinition.label,
    description: moduleDefinition.description,
  };
}

export async function ModuleRoutePage({
  moduleId,
  query,
}: {
  moduleId: ModuleId;
  query?: ModuleWorkspaceListQuery;
}) {
  const moduleDefinition = getModuleOrThrow(moduleId);
  const { session, organization } = await requireCapability(
    moduleDefinition.requiredCapability,
  );
  const workspace = await getModuleWorkspace({
    organizationId: organization.id,
    moduleId,
    dataMode: resolveWorkspaceDataMode(session.source),
    query,
  });
  const observabilityIndicators = getModuleObservabilityIndicators(moduleId);
  const workspaceStats = getModuleWorkspaceStats(workspace);
  const neighboringModules = getAccessibleModules(organization.capabilities)
    .filter((module) => module.id !== moduleId)
    .slice(0, 3);
  const surfaceKeys = getModuleListSurfaceKeys(moduleId);
  const recordListSurface = buildModuleRecordListSurface({
    moduleId,
    records: workspace.records,
    window: workspace.recordWindow,
    query,
  });
  const workItemListSurface = buildModuleWorkItemListSurface({
    moduleId,
    workItems: workspace.workItems,
    window: workspace.workItemWindow,
    query,
  });
  const dataSourceLabel = describeWorkspaceDataSource(workspace);
  const highPriorityCount = workspace.workItems.filter(
    (item) => item.priority === "high",
  ).length;
  const escalationCount = workspace.workItems.filter(
    (item) => item.status === "escalated",
  ).length;
  const usesPersistedMetrics =
    workspace.dataMode === "persisted" && !workspace.fallbackApplied;
  const headlineMetrics = usesPersistedMetrics
    ? await getResolvedModuleMetrics({
        organizationId: organization.id,
        moduleId,
        metrics: moduleDefinition.metrics,
      })
    : moduleDefinition.metrics;

  return (
    <div className="space-y-6">
      <SectionPanel
        eyebrow={moduleDefinition.ownerTeam}
        headingLevel={1}
        title={moduleDefinition.label}
        description={moduleDefinition.summary}
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
        <DetailList
          items={[
            {
              label: moduleScreenDetailListLabels.primaryRoute,
              value: moduleDefinition.href,
            },
            {
              label: moduleScreenDetailListLabels.defaultViews,
              value: moduleDefinition.defaultViews.join(", "),
            },
            {
              label: moduleScreenDetailListLabels.linkedActions,
              value:
                moduleDefinition.actions.length > 0
                  ? moduleScreenDetailListLabels.metadataRoutes(
                      moduleDefinition.actions.length,
                    )
                  : moduleScreenDetailListLabels.noneConfigured,
            },
            {
              label: moduleScreenDetailListLabels.dataSource,
              value: dataSourceLabel,
            },
            {
              label: moduleScreenDetailListLabels.milestones,
              value: moduleScreenDetailListLabels.queuedImprovements(
                moduleDefinition.milestones.length,
              ),
            },
          ]}
        />
        {moduleDefinition.actions.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {moduleDefinition.actions.map((action) => (
              <Link
                key={action.href}
                className="rounded-md border border-line bg-surface-strong px-3 py-2 text-sm font-medium text-foreground transition hover:border-slate-300 hover:bg-slate-50"
                href={action.href}
              >
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
      </SectionPanel>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          detail={moduleScreenMetrics[0].detail}
          label={moduleScreenMetrics[0].label}
          tone={workspaceStats.recordCount > 0 ? "positive" : "neutral"}
          value={String(workspaceStats.recordCount)}
        />
        <MetricCard
          detail={moduleScreenMetrics[1].detail}
          label={moduleScreenMetrics[1].label}
          tone={
            workspaceStats.highPriorityWorkItemCount > 0
              ? "warning"
              : "positive"
          }
          value={String(workspaceStats.workItemCount)}
        />
        <MetricCard
          detail={moduleScreenMetrics[2].detail}
          label={moduleScreenMetrics[2].label}
          tone={workspaceStats.documentCount > 0 ? "positive" : "neutral"}
          value={String(workspaceStats.documentCount)}
        />
      </section>

      <MetricGrid metrics={headlineMetrics} persisted={usesPersistedMetrics} />

      <SectionPanel
        title={moduleScreenSections.controlDesign.title}
        description={moduleDefinition.description}
      >
        <BulletColumns items={moduleDefinition.focusAreas} />
      </SectionPanel>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <GovernedPatternCListSection
          title={moduleScreenSections.tenantRecords.title}
          description={moduleScreenSections.tenantRecords.description}
          surfaceKey={surfaceKeys.records}
          listConfiguration={recordListSurface}
          parentAccessAllowed
          resolveConfiguredPermission={false}
          layout="embedded"
          trailingColumn={{ header: "Action", cellId: "governed.metadata" }}
        />

        <GovernedPatternCListSection
          title={moduleScreenSections.workflowQueue.title}
          description={moduleScreenSections.workflowQueue.description}
          surfaceKey={surfaceKeys.workItems}
          listConfiguration={workItemListSurface}
          parentAccessAllowed
          resolveConfiguredPermission={false}
          layout="embedded"
          trailingColumn={{ header: "Action", cellId: "governed.metadata" }}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <SectionPanel
          title={moduleScreenSections.observability.title}
          description={moduleScreenSections.observability.description}
        >
          <ObservabilityIndicatorList
            footer={formatModuleObservabilityFooter({
              highPriorityCount,
              escalationCount,
            })}
            indicators={observabilityIndicators}
          />
        </SectionPanel>

        <SectionPanel
          title={moduleScreenSections.savedViews.title}
          description={moduleScreenSections.savedViews.description}
        >
          <SavedViewGrid views={workspace.savedViews} />
        </SectionPanel>
      </div>

      <SectionPanel
        title={moduleScreenSections.documents.title}
        description={moduleScreenSections.documents.description}
      >
        <div className="mb-4 grid gap-4 xl:grid-cols-2">
          <DocumentUploadForm moduleId={moduleId} />
          <DocumentExtractionForm moduleId={moduleId} />
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {workspace.documents.length > 0 ? (
            workspace.documents.map((document) => (
              <div
                key={document.id}
                className="rounded-lg border border-line bg-surface-strong p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-foreground">
                    {document.title}
                  </div>
                  <StatusBadge label={document.access} tone="neutral" />
                </div>
                <div className="mt-2 text-sm leading-6 text-muted">
                  {document.contentType} · {document.size}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-line bg-surface-strong p-4 text-sm leading-6 text-muted">
              {moduleScreenSections.documents.emptyState}
            </div>
          )}
        </div>
      </SectionPanel>

      <SectionPanel
        title={moduleScreenSections.connectedModules.title}
        description={moduleScreenSections.connectedModules.description}
      >
        <ModuleLinkGrid
          modules={neighboringModules.map((module) => ({
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
