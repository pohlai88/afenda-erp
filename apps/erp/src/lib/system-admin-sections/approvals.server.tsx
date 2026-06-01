import { systemAdminApprovalsUiCopy } from "@afenda/feature-system-admin/metadata";
import {
  buildSystemAdminApprovalsPageModel,
  reactivateDeprecatedSystemAdminApprovalRuleAction,
  requireSystemAdminApprovalsRead,
  SystemAdminApprovalsAccessDenied,
  SystemAdminApprovalsSection,
  updateSystemAdminApprovalRuleAction,
} from "@afenda/feature-system-admin/server";
import { hasExecutionPermission } from "@afenda/kernel/execution";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Approvals — System admin",
  description: systemAdminApprovalsUiCopy.page.description,
};

export default async function SystemAdminApprovalsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let organization: Awaited<
    ReturnType<typeof requireSystemAdminApprovalsRead>
  >["organization"];
  let context: Awaited<
    ReturnType<typeof requireSystemAdminApprovalsRead>
  >["context"];

  try {
    ({ organization, context } = await requireSystemAdminApprovalsRead());
  } catch {
    return (
      <div data-testid="system-admin-approvals-access-denied" className="contents">
        <SystemAdminApprovalsAccessDenied />
      </div>
    );
  }

  const canMutate =
    hasExecutionPermission(context, "system-admin.approvals.manage") ||
    hasExecutionPermission(context, "system-admin.settings.write");
  const canReview = hasExecutionPermission(
    context,
    "system-admin.approvals.review",
  );

  const {
    searchValue,
    approvals,
    approverRoleOptions,
    selectedApprovalKey,
    approvalDetail,
    editorDefaults,
  } = await buildSystemAdminApprovalsPageModel({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    searchParams: resolvedSearchParams,
  });

  return (
    <div data-testid="system-admin-approvals-page" className="contents">
      <SystemAdminApprovalsSection
        approvals={approvals}
        searchValue={searchValue}
        canMutate={canMutate}
        canReview={canReview}
        approverRoleOptions={approverRoleOptions}
        updateApprovalRuleAction={updateSystemAdminApprovalRuleAction}
        reactivateDeprecatedApprovalRuleAction={
          reactivateDeprecatedSystemAdminApprovalRuleAction
        }
        selectedApprovalKey={selectedApprovalKey}
        approvalDetail={approvalDetail}
        editorDefaults={editorDefaults}
      />
    </div>
  );
}
