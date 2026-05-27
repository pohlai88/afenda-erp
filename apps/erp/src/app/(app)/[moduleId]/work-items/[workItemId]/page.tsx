import { requireCapability } from "@afenda/auth/server";
import {
  buildWorkItemDetailTabs,
  describeWorkspaceDataSource,
  getErpModuleById,
  getModuleWorkspaceWorkItem,
  isModuleId,
  resolveWorkspaceDataMode,
  type ModuleId,
} from "@afenda/domain";
import { GovernedDetailTabs } from "@afenda/governed-surface/server";
import { SectionPanel, StatusBadge } from "@afenda/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type WorkItemDetailPageProps = {
  params: Promise<{
    moduleId: string;
    workItemId: string;
  }>;
};

function resolveModuleId(moduleId: string): ModuleId {
  if (!isModuleId(moduleId) || moduleId === "dashboard") {
    notFound();
  }

  return moduleId;
}

async function loadWorkItemDetail({ params }: WorkItemDetailPageProps) {
  const { moduleId, workItemId } = await params;
  const resolvedModuleId = resolveModuleId(moduleId);
  const moduleDefinition = getErpModuleById(resolvedModuleId);

  if (!moduleDefinition) {
    notFound();
  }

  const { session, organization } = await requireCapability(
    moduleDefinition.requiredCapability,
  );
  const dataMode = resolveWorkspaceDataMode(session.source);
  const workItem = await getModuleWorkspaceWorkItem({
    organizationId: organization.id,
    moduleId: resolvedModuleId,
    workItemId,
    dataMode,
  });

  if (!workItem) {
    notFound();
  }

  return {
    moduleDefinition,
    organization,
    workItem,
    dataMode,
  };
}

export async function generateMetadata(
  props: WorkItemDetailPageProps,
): Promise<Metadata> {
  const { moduleDefinition, workItem } = await loadWorkItemDetail(props);

  return {
    title: `${workItem.subject} | ${moduleDefinition.label}`,
    description: `${workItem.status} ${workItem.priority} work item`,
  };
}

export default async function WorkItemDetailPage(
  props: WorkItemDetailPageProps,
) {
  const { moduleDefinition, organization, workItem, dataMode } =
    await loadWorkItemDetail(props);

  const detailTabsModel = buildWorkItemDetailTabs({
    moduleId: moduleDefinition.id,
    workItem,
  });

  return (
    <div className="space-y-6">
      <SectionPanel
        eyebrow={moduleDefinition.label}
        headingLevel={1}
        title={workItem.subject}
        description="Workflow item drilldown with governed audit readiness."
        aside={
          <div className="space-y-3 text-right">
            <StatusBadge label={workItem.status} tone="neutral" />
            <div className="text-xs uppercase tracking-wide text-muted">
              {organization.slug}
            </div>
          </div>
        }
      >
        <p className="text-xs text-muted-foreground">
          Data source:{" "}
          {describeWorkspaceDataSource({ dataMode, fallbackApplied: false })}
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <Link
            className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
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
