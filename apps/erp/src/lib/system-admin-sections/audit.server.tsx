import { systemAdminAuditUiCopy } from "@afenda/feature-system-admin/metadata";
import {
  buildSystemAdminAuditPageModel,
  exportSystemAdminAuditLogsAction,
  requireSystemAdminAuditRead,
  SystemAdminAuditAccessDenied,
  SystemAdminAuditSection,
  upsertSystemAdminRetentionPolicyAction,
} from "@afenda/feature-system-admin/server";
import { hasExecutionPermission } from "@afenda/kernel/execution";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit — System admin",
  description: systemAdminAuditUiCopy.page.description,
};

export default async function SystemAdminAuditPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let organization: Awaited<
    ReturnType<typeof requireSystemAdminAuditRead>
  >["organization"];
  let context: Awaited<
    ReturnType<typeof requireSystemAdminAuditRead>
  >["context"];

  try {
    ({ organization, context } = await requireSystemAdminAuditRead());
  } catch {
    return <SystemAdminAuditAccessDenied />;
  }
  const canExport = hasExecutionPermission(
    context,
    "system-admin.audit.export",
  );
  const canReview = hasExecutionPermission(
    context,
    "system-admin.audit.review",
  );

  const pageModel = await buildSystemAdminAuditPageModel({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    searchParams: resolvedSearchParams,
  });

  return (
    <SystemAdminAuditSection
      rows={pageModel.rows}
      params={pageModel.params}
      searchValue={pageModel.searchValue}
      totalCount={pageModel.totalCount}
      pageSize={pageModel.pageSize}
      page={pageModel.page}
      hasNextPage={pageModel.hasNextPage}
      selected={pageModel.selected}
      retentionPolicies={pageModel.retentionPolicies}
      coverageGaps={pageModel.coverageGaps}
      canExport={canExport}
      canReview={canReview}
      exportAuditLogsAction={exportSystemAdminAuditLogsAction}
      upsertRetentionPolicyAction={upsertSystemAdminRetentionPolicyAction}
    />
  );
}
