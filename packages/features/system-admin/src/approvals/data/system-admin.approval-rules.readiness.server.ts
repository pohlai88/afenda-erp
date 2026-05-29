import {
  getExecutionCapability,
  listExecutionCapabilities,
} from "@afenda/kernel/execution-capabilities";
import type {
  ApprovalReadinessVerdict,
  SystemAdminApprovalRule,
} from "../contracts/system-admin.approval-rule.contract";

function resolveCapabilityForAction(action: string) {
  const direct = getExecutionCapability(action);
  if (direct) {
    return direct;
  }

  return (
    listExecutionCapabilities().find(
      (capability) => capability.requiredPermission === action,
    ) ?? null
  );
}

export function evaluateApprovalRuleReadiness(
  rule: SystemAdminApprovalRule,
): ApprovalReadinessVerdict {
  if (rule.status === "deprecated" || !rule.enabled || rule.status === "disabled") {
    return "warning";
  }

  if (rule.approverRoleKeys.length === 0) {
    return "blocked";
  }

  if (rule.minApprovals > rule.approverRoleKeys.length) {
    return "blocked";
  }

  const moduleKey = rule.moduleKey.trim();
  if (moduleKey.length > 0 && moduleKey !== "*") {
    const moduleCapabilities = listExecutionCapabilities().filter(
      (capability) => capability.moduleKey === moduleKey,
    );
    if (moduleCapabilities.length === 0) {
      return "blocked";
    }
  }

  const actionCapability = resolveCapabilityForAction(rule.action);
  if (!actionCapability) {
    return "blocked";
  }

  if (actionCapability.status === "deprecated") {
    return "warning";
  }

  if (
    rule.approvalMode === "sequential" &&
    rule.minApprovals > rule.approverRoleKeys.length
  ) {
    return "blocked";
  }

  return "ready";
}
