"use server";

import { upsertTenantApprovalSettings } from "../../tenant-execution/data/system-admin.execution-settings.repository.server";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";
import {
  systemAdminActionFailure,
  systemAdminActionSuccess,
  type SystemAdminActionResult,
  zodActionFailure,
} from "../../tenant-execution/contracts/system-admin.action-result.contract";
import { systemAdminRoutePaths } from "../../overview/contracts/system-admin.route-paths.contract";
import { dispatchSystemAdminWebhook } from "../../integrations/server";
import {
  assertApprovalRuleChangeAllowed,
  requireSystemAdminApprovalsManage,
} from "../policies/system-admin.approval-rules.policy.server";
import {
  mapTenantApprovalSettingToRule,
  serializeApprovalRuleConfiguration,
} from "../data/system-admin.approval-rules.mapper";
import { findTenantApprovalSetting } from "../data/system-admin.approval-rules.query.server";
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

  const previous = await findTenantApprovalSetting({
    organizationId: organization.id,
    approvalKey,
  });

  if (parsed.data.mode === "create" && previous) {
    return systemAdminActionFailure(
      "An approval rule with this key already exists for this organization.",
    );
  }

  if (parsed.data.mode === "update" && !previous) {
    return systemAdminActionFailure(
      "Approval rule was not found for this organization.",
    );
  }
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

export async function setSystemAdminApprovalRuleEnabledAction(input: {
  approvalKey: string;
  enabled: boolean;
}): Promise<SystemAdminActionResult> {
  const { context, organization, session } =
    await requireSystemAdminApprovalsManage();

  const previous = await findTenantApprovalSetting({
    organizationId: organization.id,
    approvalKey: input.approvalKey,
  });

  if (!previous) {
    return systemAdminActionFailure(
      "Approval rule was not found for this organization.",
    );
  }

  const configuration =
    previous.configuration &&
    typeof previous.configuration === "object" &&
    !Array.isArray(previous.configuration)
      ? (previous.configuration as Record<string, unknown>)
      : {};

  const configuredStatus =
    typeof configuration.status === "string" ? configuration.status : "active";
  const nextStatus = input.enabled ? configuredStatus : "disabled";

  if (
    input.enabled &&
    (configuredStatus === "deprecated" || nextStatus === "deprecated")
  ) {
    return systemAdminActionFailure(
      "Deprecated approval rules cannot be enabled for new assignments.",
    );
  }

  await upsertTenantApprovalSettings({
    organizationId: organization.id,
    actorAuthUserId: session.id,
    approvalKey: input.approvalKey,
    label: previous.label,
    enabled: input.enabled,
    approverRole: previous.approverRole,
    escalationMinutes: previous.escalationMinutes,
    configuration: {
      ...configuration,
      status: nextStatus,
    },
  });

  await writeExecutionAuditEvent({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: input.enabled
      ? systemAdminApprovalRuleAuditActionsByMode.update
      : systemAdminApprovalRuleAuditActionsByMode.disable,
    targetType: "approval_rule",
    targetId: input.approvalKey,
    metadata: {
      previous: {
        enabled: previous.enabled,
        status: configuredStatus,
      },
      next: {
        enabled: input.enabled,
        status: nextStatus,
      },
    },
  });

  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: session.id,
    eventType: systemAdminApprovalRuleWebhookEvents[0],
    payload: {
      approvalKey: input.approvalKey,
      enabled: input.enabled,
      status: nextStatus,
    },
  });

  revalidateApprovals();
  return systemAdminActionSuccess(undefined);
}
