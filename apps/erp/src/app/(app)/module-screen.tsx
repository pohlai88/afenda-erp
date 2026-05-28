import {
  describeWorkspaceDataSource,
  formatModuleObservabilityFooter,
  getAccessibleModules,
  getErpModuleById,
  getModuleObservabilityIndicators,
  getResolvedModuleMetrics,
  moduleScreenDetailListLabels,
  moduleScreenSections,
  resolveWorkspaceDataMode,
  type CoreModuleId,
  type ModuleWorkspaceSearchParams,
} from "@afenda/domain";
import { requireCapability } from "@afenda/auth/server";
import { getBlobEnv } from "@afenda/config/env";
import { getModuleFeatureMetadata } from "@/lib/module-feature-metadata";
import {
  getResolvedModuleWorkspaceStats,
  resolveModuleWorkspace,
} from "@/lib/module-workspace-resolver";
import {
  BulletColumns,
  ModuleLinkGrid,
  ObservabilityIndicatorList,
  SectionPanel,
  StatusBadge,
} from "@afenda/ui";
import {
  GovernedKanbanFooterSection,
  GovernedKanbanReadOnlyBoard,
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocumentExtractionForm } from "./document-extraction-form";
import { DocumentUploadForm } from "./document-upload-form";
import { ErpAssistantPanel } from "./erp-assistant-panel";
function getModuleOrThrow(moduleId: CoreModuleId) {
  const moduleDefinition = getErpModuleById(moduleId);

  if (!moduleDefinition) {
    notFound();
  }

  return moduleDefinition;
}

export function createModuleMetadata(moduleId: CoreModuleId): Metadata {
  const moduleDefinition = getModuleOrThrow(moduleId);

  return {
    title: moduleDefinition.label,
    description: moduleDefinition.description,
  };
}

export async function ModuleRoutePage({
  moduleId,
  searchParams,
}: {
  moduleId: CoreModuleId;
  searchParams?: ModuleWorkspaceSearchParams;
}) {
  const moduleDefinition = getModuleOrThrow(moduleId);
  const metadata = getModuleFeatureMetadata(moduleId);
  const { session, organization } = await requireCapability(
    moduleDefinition.requiredCapability,
  );

  const blobEnv = getBlobEnv();
  const dataMode = resolveWorkspaceDataMode(session.source);
  const resolvedWorkspace = await resolveModuleWorkspace({
    organizationId: organization.id,
    moduleId,
    dataMode,
    searchParams,
  });
  const workspace = resolvedWorkspace.workspace;
  const observabilityIndicators = getModuleObservabilityIndicators(moduleId);
  const workspaceStats = getResolvedModuleWorkspaceStats(resolvedWorkspace);
  const neighboringModules = getAccessibleModules(organization.capabilities)
    .filter((module) => module.id !== moduleId)
    .slice(0, 3);
  const surfaceKeys = metadata.getListSurfaceKeys();
  const recordListSurface = metadata.buildRecordListSurface({
    records: workspace.records,
    window: workspace.recordWindow,
    query: resolvedWorkspace.moduleQuery,
  });
  const workItemListSurface = metadata.buildWorkItemListSurface({
    workItems: workspace.workItems,
    window: workspace.workItemWindow,
    query: resolvedWorkspace.moduleQuery,
  });
  const savedViewsListSurface = metadata.buildSavedViewsListSurface({
    views: workspace.savedViews,
  });
  const documentListSurface = metadata.buildDocumentRegistryListSurface({
    documents: workspace.documents,
    window: workspace.documentWindow,
    query: resolvedWorkspace.moduleQuery,
  });
  const workItemKanbanSurface =
    moduleId === "approvals"
      ? metadata.buildWorkItemKanbanSurface({
          workItems: workspace.workItems,
        })
      : null;
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
    <div className="flex flex-col gap-6">
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
            <div className="text-xs uppercase tracking-wide text-muted">
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <GovernedPatternCListSection
          title={moduleScreenSections.tenantRecords.title}
          description={moduleScreenSections.tenantRecords.description}
          surfaceKey={surfaceKeys.records}
          listConfiguration={recordListSurface}
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
          listConfiguration={workItemListSurface}
          parentAccessAllowed
          layout="embedded"
          trailingColumn={{
            header: "Action",
            cellId: "governed.metadata",
            context: { surfaceKey: surfaceKeys.workItems, moduleId },
          }}
        />
      </div>

      {workItemKanbanSurface ? (
        <GovernedKanbanFooterSection
          surfaceKey={metadata.getWorkItemKanbanSurfaceKey()}
          title={moduleScreenSections.workflowQueue.title}
          description="Workflow items by current stage."
          layout="titled"
        >
          <GovernedKanbanReadOnlyBoard
            configuration={workItemKanbanSurface}
            surfaceKey={metadata.getWorkItemKanbanSurfaceKey()}
          />
        </GovernedKanbanFooterSection>
      ) : null}

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

        <GovernedPatternCListSection
          title={moduleScreenSections.savedViews.title}
          description={moduleScreenSections.savedViews.description}
          surfaceKey={surfaceKeys.savedViews}
          listConfiguration={savedViewsListSurface}
          parentAccessAllowed
          layout="embedded"
        />
      </div>

      <SectionPanel
        title={moduleScreenSections.documents.title}
        description={moduleScreenSections.documents.description}
      >
        <div className="mb-4 grid gap-4 xl:grid-cols-2">
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
          listConfiguration={documentListSurface}
          parentAccessAllowed
          layout="embedded"
        />
      </SectionPanel>

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
    </div>
  );
}
