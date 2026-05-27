import { requireCapability } from "@afenda/auth/server";
import { GovernedDetailTabs } from "@afenda/governed-surface/server";
import {
  buildRecordDetailTabs,
  describeWorkspaceDataSource,
  getErpModuleById,
  getModuleWorkspaceRecord,
  isModuleId,
  resolveWorkspaceDataMode,
  type ModuleId,
} from "@afenda/domain";
import { SectionPanel, StatusBadge } from "@afenda/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type RecordDetailPageProps = {
  params: Promise<{
    moduleId: string;
    recordId: string;
  }>;
};

function resolveModuleId(moduleId: string): ModuleId {
  if (!isModuleId(moduleId) || moduleId === "dashboard") {
    notFound();
  }

  return moduleId;
}

async function loadRecordDetail({ params }: RecordDetailPageProps) {
  const { moduleId, recordId } = await params;
  const resolvedModuleId = resolveModuleId(moduleId);
  const moduleDefinition = getErpModuleById(resolvedModuleId);

  if (!moduleDefinition) {
    notFound();
  }

  const { session, organization } = await requireCapability(
    moduleDefinition.requiredCapability,
  );
  const dataMode = resolveWorkspaceDataMode(session.source);
  const record = await getModuleWorkspaceRecord({
    organizationId: organization.id,
    moduleId: resolvedModuleId,
    recordId,
    dataMode,
  });

  if (!record) {
    notFound();
  }

  return {
    moduleDefinition,
    organization,
    record,
    dataMode,
  };
}

export async function generateMetadata(
  props: RecordDetailPageProps,
): Promise<Metadata> {
  const { moduleDefinition, record } = await loadRecordDetail(props);

  return {
    title: `${record.reference} | ${moduleDefinition.label}`,
    description: record.title,
  };
}

export default async function RecordDetailPage(props: RecordDetailPageProps) {
  const { moduleDefinition, organization, record, dataMode } =
    await loadRecordDetail(props);

  const detailTabsModel = buildRecordDetailTabs({
    moduleId: moduleDefinition.id,
    record,
  });

  return (
    <div className="space-y-6">
      <SectionPanel
        eyebrow={moduleDefinition.label}
        headingLevel={1}
        title={record.reference}
        description={record.title}
        aside={
          <div className="space-y-3 text-right">
            <StatusBadge label={record.status} tone="neutral" />
            <div className="text-xs uppercase tracking-wide text-muted">
              {organization.slug}
            </div>
          </div>
        }
      >
        {!record.extensionValid && record.extensionIssues.length > 0 ? (
          <div className="mb-4 rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm leading-6 text-warning-foreground">
            {record.extensionIssues.join("; ")}
          </div>
        ) : null}
        <p className="text-xs text-muted-foreground">
          Data source: {describeWorkspaceDataSource({ dataMode, fallbackApplied: false })}
        </p>
        <div className="mt-4">
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
