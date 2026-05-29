import type { TenantApprovalSettingRow } from "@afenda/db";
import { organizationRoles } from "@afenda/auth";
import { listTenantApprovalSettings } from "../../tenant-execution/data/system-admin.execution-settings.repository.server";
import { mapTenantApprovalSettingToListRow } from "./system-admin.approval-rules.mapper";

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
    limit: input.limit ?? 200,
  });

  return buildSystemAdminApprovalRuleRows({ settings });
}

export const listSystemAdminApprovalRules = listSystemAdminApprovals;

export function buildSystemAdminApproverRoleOptions() {
  return organizationRoles.map((role) => ({
    value: role,
    label: role,
  }));
}
