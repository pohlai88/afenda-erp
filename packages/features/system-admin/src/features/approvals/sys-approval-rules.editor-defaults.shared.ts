import type {
  SystemAdminApprovalRule,
  SystemAdminApprovalRuleEditorDefaults,
} from "./sys-approval-rule.contract";

export function mapApprovalRuleToEditorDefaults(
  rule: SystemAdminApprovalRule,
): SystemAdminApprovalRuleEditorDefaults {
  return {
    mode: "update",
    approvalRuleId: rule.key,
    name: rule.name,
    moduleKey: rule.moduleKey,
    action: rule.action,
    targetType: rule.targetType,
    approvalMode: rule.approvalMode,
    approverRoleKeys: rule.approverRoleKeys.join(","),
    delegateToRoleKeys: rule.delegateToRoleKeys.join(","),
    delegationValidDays: rule.delegationValidDays,
    minApprovals: rule.minApprovals,
    escalationAfterHours: rule.escalationAfterHours,
    escalationBehavior: rule.escalationBehavior,
    escalationRoleKeys: rule.escalationRoleKeys.join(","),
    status: rule.status,
    enabled: rule.enabled,
  };
}
