import {
  listExecutionCapabilitiesForModule,
} from "@afenda/kernel/execution-capabilities";
import { resolveExecutionCapabilityForAction } from "../../tenant-execution/policies/system-admin.execution-capability.shared.server";
import type {
  PolicyReadinessVerdict,
  SystemAdminPolicyRule,
} from "../contracts/system-admin.policy-rule.contract";

export function evaluatePolicyRuleReadiness(
  rule: SystemAdminPolicyRule,
): PolicyReadinessVerdict {
  if (rule.status === "deprecated" || !rule.enabled || rule.status === "disabled") {
    return "warning";
  }

  if (rule.readiness === "blocked") {
    return "blocked";
  }

  if (rule.readiness === "deprecated" || rule.readiness === "preview") {
    return "warning";
  }

  const moduleKey = rule.moduleKey.trim();
  if (moduleKey.length > 0 && moduleKey !== "*") {
    const moduleCapabilities = listExecutionCapabilitiesForModule(moduleKey);
    if (moduleCapabilities.length === 0) {
      return "blocked";
    }
  }

  const actionCapability = resolveExecutionCapabilityForAction(rule.action);
  if (!actionCapability) {
    return "blocked";
  }

  if (actionCapability.status === "deprecated") {
    return "warning";
  }

  if (Object.keys(rule.condition).length > 20) {
    return "blocked";
  }

  return "ready";
}
