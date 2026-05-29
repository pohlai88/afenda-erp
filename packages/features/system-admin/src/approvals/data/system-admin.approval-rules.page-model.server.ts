import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { filterSystemAdminListRows } from "../../overview/contracts/system-admin.list-filter.shared";
import {
  resolveSystemAdminApprovalDetailKey,
  resolveSystemAdminListSearch,
} from "../../overview/contracts/system-admin.list-search.shared";
import { listTenantApprovalSettings } from "../../tenant-execution/data/system-admin.execution-settings.repository.server";
import {
  buildSystemAdminApprovalRuleRows,
  buildSystemAdminApproverRoleOptions,
  SYSTEM_ADMIN_APPROVAL_RULES_QUERY_LIMIT,
} from "./system-admin.approval-rules.query.server";
import { mapTenantApprovalSettingToRule } from "./system-admin.approval-rules.mapper";

export async function buildSystemAdminApprovalsPageModel(input: {
  organizationId: string;
  actorId: string;
  actorType: "user" | "system" | "agent";
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const searchValue = resolveSystemAdminListSearch(
    input.searchParams,
    "approvals",
  );
  const selectedApprovalKey = resolveSystemAdminApprovalDetailKey(
    input.searchParams,
  );
  const settings = await listTenantApprovalSettings({
    organizationId: input.organizationId,
    limit: SYSTEM_ADMIN_APPROVAL_RULES_QUERY_LIMIT,
  });
  const catalogRows = buildSystemAdminApprovalRuleRows({ settings });
  const approvals = filterSystemAdminListRows(
    catalogRows,
    searchValue,
    [
      "key",
      "name",
      "moduleKey",
      "action",
      "targetType",
      "approvalMode",
      "approverRoles",
      "readinessVerdict",
      "status",
    ],
  );
  const selectedSetting = selectedApprovalKey
    ? settings.find((row) => row.approvalKey === selectedApprovalKey)
    : undefined;

  await writeExecutionAuditEvent({
    organizationId: input.organizationId,
    actorId: input.actorId,
    actorType: input.actorType,
    action: "system-admin.approval_catalog.view",
    targetType: "organization",
    targetId: input.organizationId,
    metadata: {
      approvalRuleCount: approvals.length,
      search: searchValue ?? null,
    },
  });

  return {
    searchValue,
    approvals,
    selectedApprovalKey,
    approverRoleOptions: buildSystemAdminApproverRoleOptions(),
    editorDefaults: selectedSetting
      ? (() => {
          const rule = mapTenantApprovalSettingToRule(selectedSetting);
          return {
            mode: "update" as const,
            approvalRuleId: rule.key,
            name: rule.name,
            moduleKey: rule.moduleKey,
            action: rule.action,
            targetType: rule.targetType,
            approvalMode: rule.approvalMode,
            approverRoleKeys: rule.approverRoleKeys.join(","),
            delegateToRoleKeys: rule.delegateToRoleKeys.join(","),
            minApprovals: rule.minApprovals,
            escalationAfterHours: rule.escalationAfterHours,
            status: rule.status,
            enabled: rule.enabled,
          };
        })()
      : undefined,
  };
}
