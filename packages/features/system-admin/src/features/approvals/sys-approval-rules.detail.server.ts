import type { TenantApprovalSettingRow, TenantPolicySettingRow } from "@afenda/db";
import { systemAdminControlLinks } from "../../overview/contracts/system-admin.control-links.contract";
import type { SystemAdminApprovalRuleDetail } from "../contracts/system-admin.approval-rule.contract";
import { mapTenantPolicySettingToRule } from "../policies/system-admin.policy-rules.mapper";
import { listSystemAdminApprovalRuleActivity } from "./system-admin.approval-rules.activity.server";
import { mapTenantApprovalSettingToRule } from "./system-admin.approval-rules.mapper";
import { evaluateApprovalRuleReadiness } from "./system-admin.approval-rules.readiness.server";
import { resolveExecutionCapabilityForAction } from "../../tenant-execution/policies/system-admin.execution-capability.shared.server";
import {
  readConfigurationString,
  readExecutionSettingConfiguration,
} from "../../tenant-execution/contracts/system-admin.execution-settings.shared";

function isRelatedPolicyForApprovalRule(input: {
  policy: TenantPolicySettingRow;
  ruleAction: string;
  ruleModuleKey: string;
}) {
  const configuration = readExecutionSettingConfiguration(
    input.policy.configuration,
  );
  const policyRule = mapTenantPolicySettingToRule(input.policy);

  return (
    readConfigurationString(configuration.action, "") === input.ruleAction ||
    (policyRule.effect === "require_approval" &&
      policyRule.moduleKey === input.ruleModuleKey &&
      policyRule.action === input.ruleAction)
  );
}

export async function buildSystemAdminApprovalRuleDetail(input: {
  organizationId: string;
  approvalKey: string;
  approvalSettings: readonly TenantApprovalSettingRow[];
  policySettings: readonly TenantPolicySettingRow[];
}): Promise<SystemAdminApprovalRuleDetail | null> {
  const row = input.approvalSettings.find(
    (setting) => setting.approvalKey === input.approvalKey,
  );
  if (!row) {
    return null;
  }

  const rule = mapTenantApprovalSettingToRule(row);
  const readinessVerdict = evaluateApprovalRuleReadiness(rule);
  const capability = resolveExecutionCapabilityForAction(rule.action);
  const relatedPolicyKeys = input.policySettings
    .filter((policy) =>
      isRelatedPolicyForApprovalRule({
        policy,
        ruleAction: rule.action,
        ruleModuleKey: rule.moduleKey,
      }),
    )
    .map((policy) => policy.policyKey);

  const recentActivity = await listSystemAdminApprovalRuleActivity({
    organizationId: input.organizationId,
    approvalKey: rule.key,
  });

  return {
    approvalKey: rule.key,
    name: rule.name,
    moduleKey: rule.moduleKey,
    action: rule.action,
    targetType: rule.targetType,
    approvalMode: rule.approvalMode,
    approverRoleKeys: rule.approverRoleKeys,
    delegateToRoleKeys: rule.delegateToRoleKeys,
    minApprovals: rule.minApprovals,
    escalationAfterHours: rule.escalationAfterHours,
    escalationBehavior: rule.escalationBehavior,
    escalationRoleKeys: rule.escalationRoleKeys,
    delegationValidDays: rule.delegationValidDays,
    status: rule.status,
    enabled: rule.enabled,
    readinessVerdict,
    capabilityKey: capability?.key ?? null,
    capabilityLabel: capability?.label ?? null,
    requiredPermission: capability?.requiredPermission ?? null,
    relatedPolicyKeys,
    recentActivity,
    auditHref: systemAdminControlLinks.audit(rule.key),
  };
}
