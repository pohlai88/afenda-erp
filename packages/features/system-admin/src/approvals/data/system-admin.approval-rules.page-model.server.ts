import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import {
  listTenantApprovalSettings,
  listTenantPolicySettings,
} from "../../tenant-execution/data/system-admin.execution-settings.repository.server";
import { filterSystemAdminListRows } from "../../overview/contracts/system-admin.list-filter.shared";
import {
  resolveSystemAdminApprovalDetailKey,
  resolveSystemAdminListSearch,
} from "../../overview/contracts/system-admin.list-search.shared";
import { APPROVAL_RULE_LIST_SEARCH_FIELDS } from "../contracts/system-admin.approval-rule.limits.shared";
import { buildSystemAdminApprovalRuleDetail } from "./system-admin.approval-rules.detail.server";
import { mapApprovalRuleToEditorDefaults } from "./system-admin.approval-rules.editor-defaults.shared";
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

  const [settings, policySettings, approverRoleOptions] = await Promise.all([
    listTenantApprovalSettings({
      organizationId: input.organizationId,
      limit: SYSTEM_ADMIN_APPROVAL_RULES_QUERY_LIMIT,
    }),
    listTenantPolicySettings({
      organizationId: input.organizationId,
      limit: SYSTEM_ADMIN_APPROVAL_RULES_QUERY_LIMIT,
    }),
    buildSystemAdminApproverRoleOptions({
      organizationId: input.organizationId,
    }),
  ]);

  const catalogRows = buildSystemAdminApprovalRuleRows({ settings });
  const approvals = filterSystemAdminListRows(
    catalogRows,
    searchValue,
    [...APPROVAL_RULE_LIST_SEARCH_FIELDS],
  );

  const approvalDetail = selectedApprovalKey
    ? await buildSystemAdminApprovalRuleDetail({
        organizationId: input.organizationId,
        approvalKey: selectedApprovalKey,
        approvalSettings: settings,
        policySettings,
      })
    : null;

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
      selectedApprovalKey: selectedApprovalKey ?? null,
    },
  });

  return {
    searchValue,
    approvals,
    selectedApprovalKey,
    approvalDetail,
    approverRoleOptions,
    editorDefaults: selectedSetting
      ? mapApprovalRuleToEditorDefaults(
          mapTenantApprovalSettingToRule(selectedSetting),
        )
      : undefined,
  };
}
