import type { TenantApprovalSettingRow } from "@afenda/db";
import { organizationRoles } from "@afenda/auth";
import { listTenantApprovalSettings } from "../../data/repositories/system-admin.execution-settings.repository.server";
import { filterSystemAdminListRows } from "../../contracts/system-admin.list-filter.shared";
import { resolveSystemAdminListSearch } from "../../contracts/system-admin.list-search.shared";
import { mapTenantApprovalSettingToListRow } from "./system-admin.approval-rules.mapper";

export function buildSystemAdminApprovalRuleRows(input: {
  settings: readonly TenantApprovalSettingRow[];
}) {
  return input.settings.map(mapTenantApprovalSettingToListRow);
}

export async function buildSystemAdminApprovalsPageModel(input: {
  organizationId: string;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const searchValue = resolveSystemAdminListSearch(
    input.searchParams,
    "approvals",
  );
  const settings = await listTenantApprovalSettings({
    organizationId: input.organizationId,
    limit: 200,
  });

  return {
    searchValue,
    approvals: filterSystemAdminListRows(
      buildSystemAdminApprovalRuleRows({ settings }),
      searchValue,
      ["key", "name", "moduleKey", "action", "targetType", "approverRoles"],
    ),
    approverRoleOptions: organizationRoles.map((role) => ({
      value: role,
      label: role,
    })),
  };
}
