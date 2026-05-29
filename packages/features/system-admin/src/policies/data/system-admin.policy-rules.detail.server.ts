import {
  getExecutionCapability,
  listExecutionCapabilities,
} from "@afenda/kernel/execution-capabilities";
import type { TenantPolicySettingRow } from "@afenda/db";
import { systemAdminControlLinks } from "../../overview/contracts/system-admin.control-links.contract";
import type { SystemAdminPolicyRuleDetail } from "../contracts/system-admin.policy-rule.contract";
import {
  mapTenantPolicySettingToRule,
} from "./system-admin.policy-rules.mapper";
import { evaluatePolicyRuleReadiness } from "./system-admin.policy-rules.readiness.server";

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

export function buildSystemAdminPolicyRuleDetail(input: {
  policyKey: string;
  settings: readonly TenantPolicySettingRow[];
  approvalSettings: readonly { approvalKey: string; configuration: Record<string, unknown> }[];
}): SystemAdminPolicyRuleDetail | null {
  const row = input.settings.find((setting) => setting.policyKey === input.policyKey);
  if (!row) {
    return null;
  }

  const rule = mapTenantPolicySettingToRule(row);
  const readinessVerdict = evaluatePolicyRuleReadiness(rule);
  const capability = resolveCapabilityForAction(rule.action);
  const relatedApprovalKeys = input.approvalSettings
    .filter((approval) => {
      const configuration = approval.configuration;
      const action =
        typeof configuration.action === "string" ? configuration.action : "";
      return action === rule.action;
    })
    .map((approval) => approval.approvalKey);

  return {
    policyKey: rule.key,
    name: rule.name,
    moduleKey: rule.moduleKey,
    action: rule.action,
    targetType: rule.targetType,
    effect: rule.effect,
    status: rule.status,
    priority: rule.priority,
    enabled: rule.enabled,
    readinessVerdict,
    conditionJson: JSON.stringify(rule.condition, null, 2),
    capabilityKey: capability?.key ?? null,
    capabilityLabel: capability?.label ?? null,
    requiredPermission: capability?.requiredPermission ?? null,
    relatedApprovalKeys,
    coverageSummary:
      rule.effect === "require_approval"
        ? "Approval chain"
        : rule.effect === "warn"
          ? "Warning only"
          : "Execution gate",
    auditHref: systemAdminControlLinks.audit(rule.key),
  };
}
