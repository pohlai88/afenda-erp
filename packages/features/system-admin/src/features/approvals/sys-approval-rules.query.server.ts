import type { TenantApprovalSettingRow } from "@afenda/db";
import { organizationRoles } from "@afenda/kernel";
import { listTenantApprovalSettings } from "../tenant-execution/sys-execution-settings.repository.server";
import { listDeprecatedOrganizationRoles } from "./sys-approval-rules.roles.server";
import { mapTenantApprovalSettingToListRow } from "./sys-approval-rules.mapper";

export const SYSTEM_ADMIN_APPROVAL_RULES_QUERY_LIMIT = 200;

export function buildSystemAdminApprovalRuleRows(input: {
  settings: readonly TenantApprovalSettingRow[];
}) {
  return input.settings.map(mapTenantApprovalSettingToListRow);
}

/** Architecture alias for tenant-scoped approval rule reads. */
export async function listSystemAdminApprovals(input: {
  organizationId: string;
  limit?: number;
}) {
  const settings = await listTenantApprovalSettings({
    organizationId: input.organizationId,
    limit: input.limit ?? SYSTEM_ADMIN_APPROVAL_RULES_QUERY_LIMIT,
  });

  return buildSystemAdminApprovalRuleRows({ settings });
}

export const listSystemAdminApprovalRules = listSystemAdminApprovals;

export async function findTenantApprovalSetting(input: {
  organizationId: string;
  approvalKey: string;
  limit?: number;
}) {
  const settings = await listTenantApprovalSettings({
    organizationId: input.organizationId,
    limit: input.limit ?? SYSTEM_ADMIN_APPROVAL_RULES_QUERY_LIMIT,
  });

  return settings.find((row) => row.approvalKey === input.approvalKey);
}

export async function buildSystemAdminApproverRoleOptions(input: {
  organizationId: string;
}) {
  const deprecatedRoles = await listDeprecatedOrganizationRoles({
    organizationId: input.organizationId,
  });

  return organizationRoles
    .filter((role) => !deprecatedRoles.has(role))
    .map((role) => ({
      value: role,
      label: role,
    }));
}
