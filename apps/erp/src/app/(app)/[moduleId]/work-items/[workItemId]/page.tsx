import { requireCapability } from "@afenda/auth/server";
import {
  describeWorkspaceDataSource,
  getErpModuleById,
  getModuleWorkspaceWorkItem,
  isModuleId,
  resolveWorkspaceDataMode,
  type ModuleId,
} from "@afenda/domain";
import { GovernedAuditPanel } from "@afenda/governed-surface/server";
import { DetailList, SectionPanel, StatusBadge } from "@afenda/ui";
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
  const metadataEntries = Object.entries(workItem.metadata);

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
        <DetailList
          items={[
            { label: "Owner", value: workItem.owner },
            { label: "Priority", value: workItem.priority },
            { label: "Due", value: workItem.due },
            { label: "Updated", value: workItem.updatedAt },
            { label: "Metadata", value: workItem.metadataSummary },
            {
              label: "Data source",
              value: describeWorkspaceDataSource({
                dataMode,
                fallbackApplied: false,
              }),
            },
          ]}
        />
        <div className="mt-4 flex flex-wrap gap-4">
          <Link
            className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
            href={moduleDefinition.href}
          >
            Back to {moduleDefinition.label}
          </Link>
          {workItem.sourceRecordHref ? (
            <Link
              className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
              href={workItem.sourceRecordHref}
            >
              Open source record
            </Link>
          ) : null}
        </div>
      </SectionPanel>

      <SectionPanel
        title="Work item metadata"
        description="Operational descriptors attached to this workflow item."
      >
        {metadataEntries.length > 0 ? (
          <dl className="grid gap-3 md:grid-cols-2">
            {metadataEntries.map(([key, value]) => (
              <div
                className="rounded-lg border border-line bg-surface-strong p-4"
                key={key}
              >
                <dt className="text-xs uppercase tracking-wide text-muted">
                  {key}
                </dt>
                <dd className="mt-2 text-sm font-medium text-foreground">
                  {String(value)}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <div className="rounded-lg border border-dashed border-line bg-surface-strong p-4 text-sm leading-6 text-muted">
            No metadata is attached to this work item.
          </div>
        )}
      </SectionPanel>

      <SectionPanel
        title="Audit trail"
        description="Read-only governed audit entries for this work item."
      >
        <GovernedAuditPanel model={workItem.auditPanel} />
      </SectionPanel>
    </div>
  );
}
