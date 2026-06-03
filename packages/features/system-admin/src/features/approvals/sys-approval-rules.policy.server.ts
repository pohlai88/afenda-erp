import type { SystemAdminApprovalRuleStatus } from "../contracts/system-admin.approval-rule.contract";

export {
  requireSystemAdminApprovalsManage,
  requireSystemAdminApprovalsRead,
  requireSystemAdminApprovalsReview,
} from "../../overview/policies/system-admin.capability.policy.server";

export function assertApprovalRuleChangeAllowed(input: {
  mode: "create" | "update";
  status: SystemAdminApprovalRuleStatus;
  enabled: boolean;
  approverRoleKeys: readonly string[];
  minApprovals: number;
  previousStatus?: SystemAdminApprovalRuleStatus;
}) {
  if (input.minApprovals > input.approverRoleKeys.length) {
    throw new Error(
      "Minimum approvals cannot exceed the number of configured approver roles.",
    );
  }

  if (
    input.mode === "update" &&
    input.previousStatus === "deprecated" &&
    input.status === "active" &&
    input.enabled
  ) {
    throw new Error(
      "Deprecated approval rules cannot be reactivated without review.",
    );
  }

  if (input.enabled && input.status === "deprecated") {
    throw new Error(
      "Deprecated approval rules cannot be enabled for new assignments.",
    );
  }
}
