import { systemAdminApprovalsUiCopy } from "@afenda/feature-system-admin/metadata";
import {
  buildSystemAdminApprovalsPageModel,
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
    return <SystemAdminApprovalsAccessDenied />;
  }

  const canMutate =
    hasExecutionPermission(context, "system-admin.approvals.manage") ||
    hasExecutionPermission(context, "system-admin.settings.write");

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
    <SystemAdminApprovalsSection
      approvals={approvals}
      searchValue={searchValue}
      canMutate={canMutate}
      approverRoleOptions={approverRoleOptions}
      updateApprovalRuleAction={updateSystemAdminApprovalRuleAction}
      selectedApprovalKey={selectedApprovalKey}
      approvalDetail={approvalDetail}
      editorDefaults={editorDefaults}
    />
  );
}
