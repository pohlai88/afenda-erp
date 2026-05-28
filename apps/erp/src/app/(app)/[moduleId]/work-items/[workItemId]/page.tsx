import { requireCapability } from "@afenda/auth/server";
import {
  describeWorkspaceDataSource,
  getErpModuleById,
  getModuleWorkspaceWorkItem,
  isCoreModuleId,
  isModuleId,
  resolveWorkspaceDataMode,
  type CoreModuleId,
} from "@afenda/domain";
import { getModuleFeatureMetadata } from "@/lib/module-feature-metadata";
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

function resolveModuleId(moduleId: string): CoreModuleId {
  if (!isModuleId(moduleId) || !isCoreModuleId(moduleId)) {
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
    moduleId: resolvedModuleId,
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
  const { moduleDefinition, organization, workItem, dataMode, moduleId } =
    await loadWorkItemDetail(props);

  const detailTabsModel = getModuleFeatureMetadata(moduleId).buildWorkItemDetailTabs({
    workItem,
  });

  return (
    <div className="space-y-6">
      <SectionPanel
        eyebrow={moduleDefinition.label}
        headingLevel={1}
        title={workItem.subject}
        description={`${workItem.priority} priority · ${workItem.status}`}
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
