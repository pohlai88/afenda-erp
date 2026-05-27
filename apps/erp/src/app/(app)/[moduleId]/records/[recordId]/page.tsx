import { requireCapability } from "@afenda/auth/server";
import { GovernedAuditPanel } from "@afenda/governed-surface/server";
import {
  describeWorkspaceDataSource,
  getErpModuleById,
  getModuleWorkspaceRecord,
  isModuleId,
  resolveWorkspaceDataMode,
  type ModuleId,
} from "@afenda/domain";
import { DetailList, SectionPanel, StatusBadge } from "@afenda/ui";
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
  const metadataEntries = Object.entries(record.metadata);

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
        <DetailList
          items={[
            { label: "Record type", value: record.recordType },
            { label: "Owner", value: record.owner },
            { label: "Amount", value: record.amount },
            { label: "Due", value: record.due },
            { label: "Updated", value: record.updatedAt },
            {
              label: "Extension schema",
              value: record.extensionValid ? "Valid" : "Needs review",
            },
            {
              label: "Data source",
              value: describeWorkspaceDataSource({
                dataMode,
                fallbackApplied: false,
              }),
            },
          ]}
        />
        <div className="mt-4">
          <Link
            className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
            href={moduleDefinition.href}
          >
            Back to {moduleDefinition.label}
          </Link>
        </div>
      </SectionPanel>

      <SectionPanel
        title="Governed metadata"
        description="Validated extension values and operational descriptors for this record."
      >
        {!record.extensionValid && record.extensionIssues.length > 0 ? (
          <div className="mb-4 rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm leading-6 text-warning-foreground">
            {record.extensionIssues.join("; ")}
          </div>
        ) : null}
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
            No extension metadata is attached to this record.
          </div>
        )}
      </SectionPanel>

      <SectionPanel
        title="Audit trail"
        description="Read-only governed audit entries for this record."
      >
        <GovernedAuditPanel model={record.auditPanel} />
      </SectionPanel>
    </div>
  );
}
