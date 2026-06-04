import { resolveExecutionCapabilityForAction } from "../tenant-execution/sys-execution-capability.shared.server";
import {
  readConfigurationString,
  readExecutionSettingConfiguration,
} from "../tenant-execution/sys-execution-settings.shared";
import type { TenantPolicySettingRow } from "@afenda/db";
import { systemAdminControlLinks } from "../overview/sys-control-links.contract";
import type { SystemAdminPolicyRuleDetail } from "./system-admin.policy-rule.contract";
import {
  mapTenantPolicySettingToRule,
} from "./system-admin.policy-rules.mapper";
import { evaluatePolicyRuleReadiness } from "./system-admin.policy-rules.readiness.server";

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
  const capability = resolveExecutionCapabilityForAction(rule.action);
  const relatedApprovalKeys = input.approvalSettings
    .filter((approval) => {
      const configuration = readExecutionSettingConfiguration(
        approval.configuration,
      );
      return readConfigurationString(configuration.action, "") === rule.action;
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
