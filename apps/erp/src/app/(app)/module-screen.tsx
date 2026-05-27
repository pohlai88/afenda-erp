import {
  buildDocumentRegistryListSurface,
  buildModuleRecordListSurface,
  buildModuleWorkItemListSurface,
  buildModuleWorkItemKanbanSurface,
  buildModuleWorkspaceCountStatGrid,
  buildModuleWorkspaceStatGrid,
  buildSavedViewsListSurface,
  describeWorkspaceDataSource,
  getModuleListSurfaceKeys,
  getModuleStatSurfaceKey,
  getModuleWorkItemKanbanSurfaceKey,
  formatModuleObservabilityFooter,
  getAccessibleModules,
  getErpModuleById,
  getModuleObservabilityIndicators,
  getModuleWorkspace,
  getModuleWorkspaceStats,
  getResolvedModuleMetrics,
  moduleScreenDetailListLabels,
  moduleScreenSections,
  resolveWorkspaceDataMode,
  type ModuleId,
  type ModuleWorkspaceListQuery,
} from "@afenda/domain";
import { requireCapability } from "@afenda/auth/server";
import {
  BulletColumns,
  DetailList,
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
  const savedViewsListSurface = buildSavedViewsListSurface({
    views: workspace.savedViews,
    moduleId,
  });
  const documentListSurface = buildDocumentRegistryListSurface({
    documents: workspace.documents,
    moduleId,
  });
  const workItemKanbanSurface =
    moduleId === "approvals"
      ? buildModuleWorkItemKanbanSurface({
          moduleId,
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

      <GovernedPatternBStatSection
        title="Workspace counts"
        surfaceKey={`${getModuleStatSurfaceKey(moduleId)}-counts`}
        layout="embedded"
        statGroups={[
          {
            groupKey: "workspace-counts",
            configuration: buildModuleWorkspaceCountStatGrid({
              moduleId,
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
        surfaceKey={getModuleStatSurfaceKey(moduleId)}
        layout="embedded"
        statGroups={[
          {
            groupKey: "module-kpis",
            configuration: buildModuleWorkspaceStatGrid({
              moduleId,
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
          surfaceKey={getModuleWorkItemKanbanSurfaceKey(moduleId)}
          title={moduleScreenSections.workflowQueue.title}
          description="Workflow items by current stage."
          layout="titled"
        >
          <GovernedKanbanReadOnlyBoard
            configuration={workItemKanbanSurface}
            surfaceKey={getModuleWorkItemKanbanSurfaceKey(moduleId)}
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
          <DocumentUploadForm moduleId={moduleId} />
          <DocumentExtractionForm moduleId={moduleId} />
        </div>
        <GovernedPatternCListSection
          title={moduleScreenSections.documents.title}
          surfaceKey={surfaceKeys.documents}
          listConfiguration={documentListSurface}
          parentAccessAllowed
          layout="embedded"
        />
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
