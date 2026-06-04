import { hasExecutionPermission } from "@afenda/kernel/execution";

import {
  exportSystemAdminAuditLogsAction,
  upsertSystemAdminRetentionPolicyAction,
} from "../actions";
import { buildSystemAdminAuditPageModel } from "../data";
import { requireSystemAdminAuditRead } from "./sys-audit-viewer.policy.server";
import {
  SystemAdminAuditAccessDenied,
  SystemAdminAuditSection,
} from "./system-admin.audit-section.component.server";

export async function SystemAdminAuditPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let guard: Awaited<ReturnType<typeof requireSystemAdminAuditRead>>;

  try {
    guard = await requireSystemAdminAuditRead();
  } catch {
    return (
      <div data-testid="system-admin-audit-access-denied" className="contents">
        <SystemAdminAuditAccessDenied />
      </div>
    );
  }

  const pageModel = await buildSystemAdminAuditPageModel({
    organizationId: guard.organization.id,
    actorId: guard.context.userId,
    actorType: guard.context.actorType,
    searchParams: resolvedSearchParams,
  });

  return (
    <div data-testid="system-admin-audit-page" className="contents">
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
        canExport={hasExecutionPermission(
          guard.context,
          "system-admin.audit.export",
        )}
        canReview={hasExecutionPermission(
          guard.context,
          "system-admin.audit.review",
        )}
        exportAuditLogsAction={exportSystemAdminAuditLogsAction}
        upsertRetentionPolicyAction={upsertSystemAdminRetentionPolicyAction}
      />
    </div>
  );
}
