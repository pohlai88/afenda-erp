import { describeWorkspaceDataSource } from "@afenda/kernel";
import { GovernedDetailTabs } from "@afenda/governed-surface/server";
import { getModuleFeatureMetadata } from "@/lib/module-feature-metadata";
import { loadModuleRecordDetailContext } from "@/workspace-routes/workspace-route-cache";
import { SectionPanel, StatusBadge } from "@afenda/ui";
import Link from "next/link";

export async function RecordDetailSection({
  moduleId,
  recordId,
}: {
  moduleId: string;
  recordId: string;
}) {
  const { moduleDefinition, organization, record, dataMode, moduleId: resolvedModuleId } =
    await loadModuleRecordDetailContext(moduleId, recordId);

  const detailTabsModel = getModuleFeatureMetadata(
    resolvedModuleId,
  ).buildRecordDetailTabs({
    record,
  });

  return (
    <div className="flex flex-col gap-surface-2xl">
      <SectionPanel
        eyebrow={moduleDefinition.label}
        headingLevel={1}
        title={record.reference}
        description={record.title}
        aside={
          <div className="flex flex-col gap-3 text-right">
            <StatusBadge label={record.status} tone="neutral" />
            <div className="type-caption uppercase tracking-wide">
              {organization.slug}
            </div>
          </div>
        }
      >
        {!record.extensionValid && record.extensionIssues.length > 0 ? (
          <div className="mb-surface-lg rounded-section border border-warning/40 bg-warning/10 p-4 type-body leading-6 text-warning-foreground">
            {record.extensionIssues.join("; ")}
          </div>
        ) : null}
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
