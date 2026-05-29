import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { filterSystemAdminListRows } from "../../overview/contracts/system-admin.list-filter.shared";
import { resolveSystemAdminListSearch } from "../../overview/contracts/system-admin.list-search.shared";
import { listTenantApprovalSettings } from "../../tenant-execution/data/system-admin.execution-settings.repository.server";
import {
  buildSystemAdminApprovalRuleRows,
  buildSystemAdminApproverRoleOptions,
} from "./system-admin.approval-rules.query.server";

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
  const settings = await listTenantApprovalSettings({
    organizationId: input.organizationId,
    limit: 200,
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
    approverRoleOptions: buildSystemAdminApproverRoleOptions(),
  };
}
