import { systemAdminApprovalsUiCopy } from "@afenda/feature-system-admin/metadata";
import {
  buildSystemAdminApprovalsPageModel,
  buildSystemAdminApprovalsQueuePageModel,
  hasSystemAdminApprovalsQueueView,
  hasSystemAdminApprovalsRulesRead,
  reactivateDeprecatedSystemAdminApprovalRuleAction,
  requireSystemAdminApprovalsPageAccess,
  SystemAdminApprovalsAccessDenied,
  SystemAdminApprovalsSection,
  updateSystemAdminApprovalRuleAction,
} from "@afenda/feature-system-admin/server";
import {
  hasExecutionPermission,
} from "@afenda/kernel/execution";
import { resolveWorkspaceDataMode } from "@afenda/kernel";
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
    ReturnType<typeof requireSystemAdminApprovalsPageAccess>
  >["organization"];
  let context: Awaited<
    ReturnType<typeof requireSystemAdminApprovalsPageAccess>
  >["context"];

  try {
    ({ organization, context } = await requireSystemAdminApprovalsPageAccess());
  } catch {
    return (
      <div data-testid="system-admin-approvals-access-denied" className="contents">
        <SystemAdminApprovalsAccessDenied />
      </div>
    );
  }

  const canViewRules = hasSystemAdminApprovalsRulesRead(context);
  const canViewQueue = hasSystemAdminApprovalsQueueView(context);
  const canMutate =
    hasExecutionPermission(context, "system-admin.approvals.manage") ||
    hasExecutionPermission(context, "system-admin.settings.write");
  const canReview = hasExecutionPermission(
    context,
    "system-admin.approvals.review",
  );
  const canDecide = hasExecutionPermission(context, "approvals.decide");
  const dataMode = resolveWorkspaceDataMode(context.sessionSource);

  const [rulesPageModel, queuePageModel] = await Promise.all([
    canViewRules
      ? buildSystemAdminApprovalsPageModel({
          organizationId: organization.id,
          actorId: context.userId,
          actorType: context.actorType,
          searchParams: resolvedSearchParams,
        })
      : Promise.resolve(null),
    canViewQueue
      ? buildSystemAdminApprovalsQueuePageModel({
          organizationId: organization.id,
          dataMode,
          searchParams: resolvedSearchParams,
        })
      : Promise.resolve(null),
  ]);

  return (
    <div data-testid="system-admin-approvals-page" className="contents">
      <SystemAdminApprovalsSection
        approvals={rulesPageModel?.approvals ?? []}
        searchValue={rulesPageModel?.searchValue}
        canMutate={canMutate}
        canReview={canReview}
        canViewRules={canViewRules}
        canViewQueue={canViewQueue}
        canDecide={canDecide}
        queueWorkspace={queuePageModel?.workspace}
        queueModuleQuery={queuePageModel?.moduleQuery}
        approverRoleOptions={rulesPageModel?.approverRoleOptions ?? []}
        updateApprovalRuleAction={updateSystemAdminApprovalRuleAction}
        reactivateDeprecatedApprovalRuleAction={
          reactivateDeprecatedSystemAdminApprovalRuleAction
        }
        selectedApprovalKey={rulesPageModel?.selectedApprovalKey}
        approvalDetail={rulesPageModel?.approvalDetail}
        editorDefaults={rulesPageModel?.editorDefaults}
      />
    </div>
  );
}
