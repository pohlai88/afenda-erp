import type { TenantPolicySettingRow } from "@afenda/db";
import { listTenantPolicySettings } from "../../data/repositories/system-admin.execution-settings.repository.server";
import { filterSystemAdminListRows } from "../../contracts/system-admin.list-filter.shared";
import { resolveSystemAdminListSearch } from "../../contracts/system-admin.list-search.shared";
import { mapTenantPolicySettingToListRow } from "./system-admin.policy-rules.mapper";

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
  const settings = await listTenantPolicySettings({
    organizationId: input.organizationId,
    limit: 200,
  });
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

  return {
    searchValue,
    policies,
    effectOptions,
  };
}
