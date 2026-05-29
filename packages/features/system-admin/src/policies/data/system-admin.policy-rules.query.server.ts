import type { TenantPolicySettingRow } from "@afenda/db";
import { listTenantPolicySettings } from "../../tenant-execution/data/system-admin.execution-settings.repository.server";
import { filterSystemAdminListRows } from "../../overview/contracts/system-admin.list-filter.shared";
import {
  resolveSystemAdminListSearch,
  resolveSystemAdminPolicyDetailKey,
} from "../../overview/contracts/system-admin.list-search.shared";
import { listTenantApprovalSettings } from "../../tenant-execution/data/system-admin.execution-settings.repository.server";
import { buildSystemAdminPolicyRuleDetail } from "./system-admin.policy-rules.detail.server";
import {
  mapTenantPolicySettingToListRow,
  mapTenantPolicySettingToRule,
} from "./system-admin.policy-rules.mapper";

export function buildSystemAdminPolicyRuleRows(input: {
  settings: readonly TenantPolicySettingRow[];
}) {
  return input.settings.map(mapTenantPolicySettingToListRow);
}

export async function buildSystemAdminPoliciesPageModel(input: {
  organizationId: string;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const searchValue = resolveSystemAdminListSearch(
    input.searchParams,
    "policies",
  );
  const selectedPolicyKey = resolveSystemAdminPolicyDetailKey(
    input.searchParams,
  );
  const [settings, approvalSettings] = await Promise.all([
    listTenantPolicySettings({
      organizationId: input.organizationId,
      limit: 200,
    }),
    listTenantApprovalSettings({
      organizationId: input.organizationId,
      limit: 200,
    }),
  ]);
  const policies = filterSystemAdminListRows(
    buildSystemAdminPolicyRuleRows({ settings }),
    searchValue,
    ["key", "name", "moduleKey", "action", "targetType", "effect"],
  );
  const effectOptions = [
    "allow",
    "deny",
    "lock",
    "require_approval",
    "warn",
  ] as const;

  const policyDetail = selectedPolicyKey
    ? buildSystemAdminPolicyRuleDetail({
        policyKey: selectedPolicyKey,
        settings,
        approvalSettings,
      })
    : null;
  const selectedRule = selectedPolicyKey
    ? settings.find((row) => row.policyKey === selectedPolicyKey)
    : undefined;

  return {
    searchValue,
    policies,
    effectOptions,
    selectedPolicyKey,
    policyDetail,
    editorDefaults: selectedRule
      ? {
          mode: "update" as const,
          policyRuleId: selectedRule.policyKey,
          name: selectedRule.label,
          ...(() => {
            const rule = mapTenantPolicySettingToRule(selectedRule);
            return {
              moduleKey: rule.moduleKey,
              action: rule.action,
              targetType: rule.targetType,
              effect: rule.effect,
              conditionJson: JSON.stringify(rule.condition),
              status: rule.status,
              priority: rule.priority,
              enabled: rule.enabled,
            };
          })(),
        }
      : undefined,
  };
}
