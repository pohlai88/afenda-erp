"use server";

import {
  listTenantApprovalSettings,
  upsertTenantApprovalSettings,
} from "@afenda/db";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";
import {
  systemAdminActionSuccess,
  type SystemAdminActionResult,
  zodActionFailure,
} from "../../contracts";
import { systemAdminRoutePaths } from "../../contracts/system-admin.route-paths.contract";
import { dispatchSystemAdminWebhook } from "../../events";
import { requireSystemAdminApprovalsManage } from "../../policies/system-admin.capability.policy.server";
import { serializeApprovalRuleConfiguration } from "../data/system-admin.approval-rules.mapper";
import { systemAdminApprovalRuleActionSchema } from "../schemas/system-admin.approval-rule.schema";

function revalidateApprovals() {
  revalidatePath(systemAdminRoutePaths.approvals);
  revalidatePath(systemAdminRoutePaths.hub);
}

export async function updateSystemAdminApprovalRuleAction(
  _previous: SystemAdminActionResult | undefined,
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { context, organization, session } =
    await requireSystemAdminApprovalsManage();

  const mode = formData.get("mode") === "create" ? "create" : "update";
  const parsed = systemAdminApprovalRuleActionSchema.safeParse({
    mode,
    approvalKey:
      mode === "create"
        ? formData.get("approvalKey")
        : formData.get("approvalRuleId"),
    approvalRuleId: formData.get("approvalRuleId"),
    name: formData.get("name"),
    moduleKey: formData.get("moduleKey"),
    action: formData.get("action"),
    targetType: formData.get("targetType"),
    approverRoleKeys: formData.get("approverRoleKeys"),
    minApprovals: formData.get("minApprovals"),
    escalationAfterHours: formData.get("escalationAfterHours") || undefined,
    status: formData.get("status"),
    enabled: formData.get("enabled"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const approvalKey =
    parsed.data.mode === "create"
      ? parsed.data.approvalKey
      : parsed.data.approvalRuleId;

  const existingSettings = await listTenantApprovalSettings({
    organizationId: organization.id,
    limit: 200,
  });
  const previous = existingSettings.find((row) => row.approvalKey === approvalKey);

  const configuration = serializeApprovalRuleConfiguration({
    moduleKey: parsed.data.moduleKey,
    action: parsed.data.action,
    targetType: parsed.data.targetType,
    approverRoleKeys: parsed.data.approverRoleKeys,
    minApprovals: parsed.data.minApprovals,
    escalationAfterHours: parsed.data.escalationAfterHours,
    status: parsed.data.status,
  });

  await upsertTenantApprovalSettings({
    organizationId: organization.id,
    actorAuthUserId: session.id,
    approvalKey,
    label: parsed.data.name,
    enabled: parsed.data.enabled,
    approverRole: parsed.data.approverRoleKeys[0] ?? null,
    escalationMinutes: parsed.data.escalationAfterHours
      ? parsed.data.escalationAfterHours * 60
      : null,
    configuration,
  });

  const auditAction =
    parsed.data.mode === "create"
      ? "system-admin.approval_rule.create"
      : parsed.data.status === "disabled"
        ? "system-admin.approval_rule.disable"
        : parsed.data.status === "deprecated"
          ? "system-admin.approval_rule.deprecate"
          : "system-admin.approval_rule.update";

  await writeExecutionAuditEvent({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: auditAction,
    targetType: "approval_rule",
    targetId: approvalKey,
    metadata: {
      previous: previous
        ? {
            label: previous.label,
            enabled: previous.enabled,
            approverRole: previous.approverRole,
            configuration: previous.configuration,
          }
        : null,
      next: {
        label: parsed.data.name,
        enabled: parsed.data.enabled,
        status: parsed.data.status,
        approverRoleKeys: parsed.data.approverRoleKeys,
        minApprovals: parsed.data.minApprovals,
        configuration,
      },
    },
  });

  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: session.id,
    eventType: "system-admin.approval.updated",
    payload: {
      approvalKey,
      status: parsed.data.status,
      minApprovals: parsed.data.minApprovals,
    },
  });

  revalidateApprovals();
  return systemAdminActionSuccess(undefined);
}

export async function updateSystemAdminApprovalAction(
  previous: SystemAdminActionResult | undefined,
  formData: FormData,
): Promise<SystemAdminActionResult> {
  return updateSystemAdminApprovalRuleAction(previous, formData);
}
