import { listExecutionCapabilities } from "@afenda/kernel/execution-capabilities";
import type {
  ApprovalReadinessVerdict,
  SystemAdminApprovalRule,
} from "./sys-approval-rule.contract";
import { resolveExecutionCapabilityForAction } from "../tenant-execution/sys-execution-capability.shared.server";

function isInactiveApprovalRule(rule: SystemAdminApprovalRule) {
  return (
    rule.status === "deprecated" ||
    rule.status === "disabled" ||
    !rule.enabled
  );
}

function hasInvalidApproverCount(rule: SystemAdminApprovalRule) {
  return (
    rule.approverRoleKeys.length === 0 ||
    rule.minApprovals > rule.approverRoleKeys.length
  );
}

function hasInvalidModuleCoverage(moduleKey: string) {
  const normalizedModuleKey = moduleKey.trim();
  if (normalizedModuleKey.length === 0 || normalizedModuleKey === "*") {
    return false;
  }

  return (
    listExecutionCapabilities().filter(
      (capability) => capability.moduleKey === normalizedModuleKey,
    ).length === 0
  );
}

export function evaluateApprovalRuleReadiness(
  rule: SystemAdminApprovalRule,
): ApprovalReadinessVerdict {
  if (isInactiveApprovalRule(rule)) {
    return "warning";
  }

  if (hasInvalidApproverCount(rule)) {
    return "blocked";
  }

  if (hasInvalidModuleCoverage(rule.moduleKey)) {
    return "blocked";
  }

  const actionCapability = resolveExecutionCapabilityForAction(rule.action);
  if (!actionCapability) {
    return "blocked";
  }

  if (actionCapability.status === "deprecated") {
    return "warning";
  }

  if (
    rule.escalationBehavior === "reassign" &&
    rule.escalationRoleKeys.length === 0
  ) {
    return "blocked";
  }

  if (
    rule.delegateToRoleKeys.length > 0 &&
    (!rule.delegationValidDays || rule.delegationValidDays < 1)
  ) {
    return "blocked";
  }

  return "ready";
}
