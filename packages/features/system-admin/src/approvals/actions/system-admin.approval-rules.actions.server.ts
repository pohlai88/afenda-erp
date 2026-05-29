"use server";

import {
  listTenantApprovalSettings,
  upsertTenantApprovalSettings,
} from "@afenda/db";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";
import {
  systemAdminActionFailure,
  systemAdminActionSuccess,
  type SystemAdminActionResult,
  zodActionFailure,
} from "../../tenant-execution/contracts/system-admin.action-result.contract";
import { systemAdminRoutePaths } from "../../overview/contracts/system-admin.route-paths.contract";
import { dispatchSystemAdminWebhook } from "../../integrations";
import {
  assertApprovalRuleChangeAllowed,
  requireSystemAdminApprovalsManage,
} from "../policies/system-admin.approval-rules.policy.server";
import {
  mapTenantApprovalSettingToRule,
  serializeApprovalRuleConfiguration,
} from "../data/system-admin.approval-rules.mapper";
import {
  systemAdminApprovalRuleAuditActionsByMode,
  systemAdminApprovalRuleWebhookEvents,
  type SystemAdminApprovalRuleAuditAction,
} from "../events/system-admin.approval-rules.event";
import { systemAdminApprovalRuleActionSchema } from "../schemas/system-admin.approval-rule.schema";

function resolveApprovalRuleAuditAction(input: {
  mode: "create" | "update";
  status: string;
}): SystemAdminApprovalRuleAuditAction {
  if (input.mode === "create") {
    return systemAdminApprovalRuleAuditActionsByMode.create;
  }
  if (input.status === "disabled") {
    return systemAdminApprovalRuleAuditActionsByMode.disable;
  }
  if (input.status === "deprecated") {
    return systemAdminApprovalRuleAuditActionsByMode.deprecate;
  }
  return systemAdminApprovalRuleAuditActionsByMode.update;
}

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
    approvalMode: formData.get("approvalMode"),
    approverRoleKeys: formData.get("approverRoleKeys"),
    delegateToRoleKeys: formData.get("delegateToRoleKeys") || undefined,
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
  const previousRule = previous
    ? mapTenantApprovalSettingToRule(previous)
    : undefined;

  try {
    assertApprovalRuleChangeAllowed({
      mode: parsed.data.mode,
      status: parsed.data.status,
      enabled: parsed.data.enabled,
      approverRoleKeys: parsed.data.approverRoleKeys,
      minApprovals: parsed.data.minApprovals,
      previousStatus: previousRule?.status,
    });
  } catch (error) {
    return systemAdminActionFailure(
      error instanceof Error
        ? error.message
        : "Approval rule change rejected.",
    );
  }

  const configuration = serializeApprovalRuleConfiguration({
    moduleKey: parsed.data.moduleKey,
    action: parsed.data.action,
    targetType: parsed.data.targetType,
    approvalMode: parsed.data.approvalMode,
    approverRoleKeys: parsed.data.approverRoleKeys,
    delegateToRoleKeys: parsed.data.delegateToRoleKeys,
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

  const auditAction = resolveApprovalRuleAuditAction({
    mode: parsed.data.mode,
    status: parsed.data.status,
  });

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
        approvalMode: parsed.data.approvalMode,
        approverRoleKeys: parsed.data.approverRoleKeys,
        delegateToRoleKeys: parsed.data.delegateToRoleKeys,
        minApprovals: parsed.data.minApprovals,
        configuration,
      },
    },
  });

  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: session.id,
    eventType: systemAdminApprovalRuleWebhookEvents[0],
    payload: {
      approvalKey,
      status: parsed.data.status,
      approvalMode: parsed.data.approvalMode,
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
