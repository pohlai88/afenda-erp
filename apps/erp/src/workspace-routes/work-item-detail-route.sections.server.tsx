import { describeWorkspaceDataSource } from "@afenda/kernel";
import { GovernedDetailTabs } from "@afenda/governed-surface/server";
import { getModuleFeatureMetadata } from "@/lib/module-feature-metadata";
import { loadModuleWorkItemDetailContext } from "@/workspace-routes/workspace-route-cache";
import { SectionPanel, StatusBadge } from "@afenda/ui";
import Link from "next/link";

export async function WorkItemDetailSection({
  moduleId,
  workItemId,
}: {
  moduleId: string;
  workItemId: string;
}) {
  const {
    moduleDefinition,
    organization,
    workItem,
    dataMode,
    moduleId: resolvedModuleId,
  } = await loadModuleWorkItemDetailContext(moduleId, workItemId);

  const detailTabsModel = getModuleFeatureMetadata(
    resolvedModuleId,
  ).buildWorkItemDetailTabs({
    workItem,
  });

  return (
    <div className="flex flex-col gap-surface-2xl">
      <SectionPanel
        eyebrow={moduleDefinition.label}
        headingLevel={1}
        title={workItem.subject}
        description={`${workItem.status} · ${workItem.priority}`}
        aside={
          <div className="flex flex-col gap-3 text-right">
            <StatusBadge label={workItem.status} tone="neutral" />
            <div className="type-caption uppercase tracking-wide text-muted">
              {organization.slug}
            </div>
          </div>
        }
      >
        <p className="type-caption">
          Data source:{" "}
          {describeWorkspaceDataSource({ dataMode, fallbackApplied: false })}
        </p>
        <div className="mt-surface-lg">
          <Link
            className="type-body font-medium text-foreground underline-offset-4 hover:underline"
            href={moduleDefinition.href}
          >
            Back to {moduleDefinition.label}
          </Link>
        </div>
      </SectionPanel>

      <GovernedDetailTabs model={detailTabsModel} />
    </div>
  );
}
