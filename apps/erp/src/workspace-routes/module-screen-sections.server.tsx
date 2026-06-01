import { getBlobEnv } from "@/app-env/blob";
import {
  describeWorkspaceDataSource,
  formatModuleObservabilityFooter,
  getAccessibleModules,
  getModuleObservabilityIndicators,
  getResolvedModuleMetrics,
  moduleScreenDetailListLabels,
  moduleScreenSections,
  type CoreModuleId,
  type ModuleWorkspaceSearchParams,
} from "@afenda/kernel";
import { loadModuleWorkspaceSession } from "@/workspace-routes/workspace-route-cache";
import {
  BulletColumns,
  ModuleLinkGrid,
  ObservabilityIndicatorList,
  SectionPanel,
  StatusBadge,
} from "@afenda/ui";
import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import Link from "next/link";
import { DocumentExtractionForm } from "./document-extraction-form";
import { DocumentUploadForm } from "./document-upload-form";
import { ErpAssistantPanel } from "./erp-assistant-panel";
import { getResolvedModuleWorkspaceStats } from "@/lib/module-workspace-resolver";

export async function ModuleScreenHeaderSection({
  moduleId,
  searchParams,
}: {
  moduleId: CoreModuleId;
  searchParams?: ModuleWorkspaceSearchParams;
}) {
  const { moduleDefinition, organization, metadata, workspace } =
    await loadModuleWorkspaceSession({ moduleId, searchParams });
  const dataSourceLabel = describeWorkspaceDataSource(workspace);

  return (
    <SectionPanel
      eyebrow={moduleDefinition.ownerTeam}
      headingLevel={1}
      title={moduleDefinition.label}
      description={moduleDefinition.summary}
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
        title="Module context"
        surfaceKey={metadata.getOverviewStatSurfaceKey()}
        layout="embedded"
        statGroups={[
          {
            groupKey: "module-overview",
            configuration: metadata.buildOverviewStatGrid({
              stats: [
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
              ],
            }),
          },
        ]}
      />
      {moduleDefinition.actions.length > 0 ? (
        <div className="mt-surface-lg flex flex-wrap gap-2">
          {moduleDefinition.actions.map((action) => (
            <Link
              key={action.href}
              className="rounded-control border border-line bg-surface-strong px-3 py-2 type-body font-medium text-foreground transition hover:border-border hover:bg-surface-hover"
              href={action.href}
            >
              {action.label}
            </Link>
          ))}
        </div>
      ) : null}
    </SectionPanel>
  );
}

export async function ModuleScreenMetricsSection({
  moduleId,
  searchParams,
}: {
  moduleId: CoreModuleId;
  searchParams?: ModuleWorkspaceSearchParams;
}) {
  const { moduleDefinition, organization, resolvedWorkspace, metadata, workspace } =
    await loadModuleWorkspaceSession({ moduleId, searchParams });
  const workspaceStats = getResolvedModuleWorkspaceStats(resolvedWorkspace);
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
    <>
      <GovernedPatternBStatSection
        title="Workspace counts"
        surfaceKey={`${metadata.getStatSurfaceKey()}-counts`}
        layout="embedded"
        statGroups={[
          {
            groupKey: "workspace-counts",
            configuration: metadata.buildCountStatGrid({
              recordCount: workspaceStats.recordCount,
              workItemCount: workspaceStats.workItemCount,
              documentCount: workspaceStats.documentCount,
              highPriorityWorkItemCount: workspaceStats.highPriorityWorkItemCount,
            }),
          },
        ]}
      />
      <GovernedPatternBStatSection
        title="Module KPIs"
        surfaceKey={metadata.getStatSurfaceKey()}
        layout="embedded"
        statGroups={[
          {
            groupKey: "module-kpis",
            configuration: metadata.buildStatGrid({
              metrics: headlineMetrics,
            }),
          },
        ]}
      />
      <SectionPanel
        title={moduleScreenSections.controlDesign.title}
        description={moduleDefinition.description}
      >
        <BulletColumns items={moduleDefinition.focusAreas} />
      </SectionPanel>
    </>
  );
}

export async function ModuleScreenPrimaryListsSection({
  moduleId,
  searchParams,
}: {
  moduleId: CoreModuleId;
  searchParams?: ModuleWorkspaceSearchParams;
}) {
  const { metadata, workspace, moduleQuery } = await loadModuleWorkspaceSession({
    moduleId,
    searchParams,
  });
  const surfaceKeys = metadata.getListSurfaceKeys();

  return (
    <div className="@container grid gap-surface-2xl @xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
      <GovernedPatternCListSection
        title={moduleScreenSections.tenantRecords.title}
        description={moduleScreenSections.tenantRecords.description}
        surfaceKey={surfaceKeys.records}
        listConfiguration={metadata.buildRecordListSurface({
          records: workspace.records,
          window: workspace.recordWindow,
          query: moduleQuery,
        })}
        parentAccessAllowed
        layout="embedded"
        trailingColumn={{
          header: "Action",
          cellId: "governed.metadata",
          context: { surfaceKey: surfaceKeys.records, moduleId },
        }}
      />
      <GovernedPatternCListSection
        title={moduleScreenSections.workflowQueue.title}
        description={moduleScreenSections.workflowQueue.description}
        surfaceKey={surfaceKeys.workItems}
        listConfiguration={metadata.buildWorkItemListSurface({
          workItems: workspace.workItems,
          window: workspace.workItemWindow,
          query: moduleQuery,
        })}
        parentAccessAllowed
        layout="embedded"
        trailingColumn={{
          header: "Action",
          cellId: "governed.metadata",
          context: { surfaceKey: surfaceKeys.workItems, moduleId },
        }}
      />
    </div>
  );
}

export async function ModuleScreenKanbanSection(_props: {
  moduleId: CoreModuleId;
  searchParams?: ModuleWorkspaceSearchParams;
}) {
  return null;
}

export async function ModuleScreenObservabilitySection({
  moduleId,
  searchParams,
}: {
  moduleId: CoreModuleId;
  searchParams?: ModuleWorkspaceSearchParams;
}) {
  const { metadata, workspace } = await loadModuleWorkspaceSession({
    moduleId,
    searchParams,
  });
  const observabilityIndicators = getModuleObservabilityIndicators(moduleId);
  const highPriorityCount = workspace.workItems.filter(
    (item) => item.priority === "high",
  ).length;
  const escalationCount = workspace.workItems.filter(
    (item) => item.status === "escalated",
  ).length;
  const surfaceKeys = metadata.getListSurfaceKeys();

  return (
    <div className="@container grid gap-surface-2xl @xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
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
      <GovernedPatternCListSection
        title={moduleScreenSections.savedViews.title}
        description={moduleScreenSections.savedViews.description}
        surfaceKey={surfaceKeys.savedViews}
        listConfiguration={metadata.buildSavedViewsListSurface({
          views: workspace.savedViews,
        })}
        parentAccessAllowed
        layout="embedded"
      />
    </div>
  );
}

export async function ModuleScreenDocumentsSection({
  moduleId,
  searchParams,
}: {
  moduleId: CoreModuleId;
  searchParams?: ModuleWorkspaceSearchParams;
}) {
  const { organization, metadata, workspace, moduleQuery } =
    await loadModuleWorkspaceSession({ moduleId, searchParams });
  const blobEnv = getBlobEnv();
  const surfaceKeys = metadata.getListSurfaceKeys();

  return (
    <SectionPanel
      title={moduleScreenSections.documents.title}
      description={moduleScreenSections.documents.description}
    >
      <div className="@container mb-surface-lg grid gap-surface-lg @xl:grid-cols-2">
        <DocumentUploadForm
          blobConfigured={blobEnv.configured}
          moduleId={moduleId}
          organizationId={organization.id}
        />
        <DocumentExtractionForm moduleId={moduleId} />
      </div>
      <GovernedPatternCListSection
        title="Document registry"
        surfaceKey={surfaceKeys.documents}
        listConfiguration={metadata.buildDocumentRegistryListSurface({
          documents: workspace.documents,
          window: workspace.documentWindow,
          query: moduleQuery,
        })}
        parentAccessAllowed
        layout="embedded"
      />
    </SectionPanel>
  );
}

export async function ModuleScreenFooterSection({
  moduleId,
  searchParams,
}: {
  moduleId: CoreModuleId;
  searchParams?: ModuleWorkspaceSearchParams;
}) {
  const { organization } = await loadModuleWorkspaceSession({
    moduleId,
    searchParams,
  });
  const neighboringModules = getAccessibleModules(organization.capabilities)
    .filter((module) => module.id !== moduleId)
    .slice(0, 3);

  return (
    <>
      <SectionPanel
        title={moduleScreenSections.aiAssistant.title}
        description={moduleScreenSections.aiAssistant.description}
      >
        <ErpAssistantPanel contextModuleId={moduleId} />
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
    </>
  );
}
