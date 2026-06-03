import { resolveWorkspaceDataMode } from "@afenda/kernel";
import { hasExecutionPermission } from "@afenda/kernel/execution";

import {
  reactivateDeprecatedSystemAdminApprovalRuleAction,
  updateSystemAdminApprovalRuleAction,
} from "../actions";
import {
  buildSystemAdminApprovalsPageModel,
  buildSystemAdminApprovalsQueuePageModel,
} from "../data";
import {
  hasSystemAdminApprovalsQueueView,
  hasSystemAdminApprovalsRulesRead,
  requireSystemAdminApprovalsPageAccess,
} from "../policies";
import {
  SystemAdminApprovalsAccessDenied,
  SystemAdminApprovalsSection,
} from "./system-admin.approvals-section.component.server";

type SystemAdminApprovalsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function SystemAdminApprovalsPage({
  searchParams,
}: SystemAdminApprovalsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let guard: Awaited<ReturnType<typeof requireSystemAdminApprovalsPageAccess>>;

  try {
    guard = await requireSystemAdminApprovalsPageAccess();
  } catch {
    return (
      <div data-testid="system-admin-approvals-access-denied" className="contents">
        <SystemAdminApprovalsAccessDenied />
      </div>
    );
  }

  const { organization, context } = guard;
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
