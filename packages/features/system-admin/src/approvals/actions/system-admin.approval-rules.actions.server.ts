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
import { readExecutionSettingConfiguration } from "../../tenant-execution/contracts/system-admin.execution-settings.shared";
import { systemAdminRoutePaths } from "../../overview/contracts/system-admin.route-paths.contract";
import { dispatchSystemAdminWebhook } from "../../integrations/events/system-admin.webhook-dispatch.event";
import {
  assertApprovalRuleChangeAllowed,
  requireSystemAdminApprovalsManage,
  requireSystemAdminApprovalsReview,
} from "../policies/system-admin.approval-rules.policy.server";
import { assertApprovalRuleRolesAllowed } from "../policies/system-admin.approval-rules.roles.server";
import {
  mapTenantApprovalSettingToRule,
  serializeApprovalRuleConfiguration,
} from "../data/system-admin.approval-rules.mapper";
import { findTenantApprovalSetting } from "../data/system-admin.approval-rules.query.server";
import {
  buildApprovalRuleAuditMetadata,
  parseApprovalRuleActionFormData,
  readConfiguredApprovalRuleStatus,
  resolveApprovalRuleKey,
  toEscalationMinutes,
} from "../data/system-admin.approval-rules.shared";
import {
  systemAdminApprovalRuleAuditActionsByMode,
  systemAdminApprovalRuleWebhookEvents,
  type SystemAdminApprovalRuleAuditAction,
} from "../events/system-admin.approval-rules.event";
import type { SystemAdminApprovalRuleActionInput } from "../schemas/system-admin.approval-rule.schema";
import { reactivateDeprecatedApprovalRuleInputSchema } from "../schemas/system-admin.approval-rule.schema";

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

async function emitApprovalRuleMutationSideEffects(input: {
  organizationId: string;
  actorId: string;
  actorType: "user" | "system" | "agent";
  sessionUserId: string;
  approvalKey: string;
  auditAction: SystemAdminApprovalRuleAuditAction;
  auditMetadata: Record<string, unknown>;
  webhookPayload: Record<string, unknown>;
}) {
  await writeExecutionAuditEvent({
    organizationId: input.organizationId,
    actorId: input.actorId,
    actorType: input.actorType,
    action: input.auditAction,
    targetType: "approval_rule",
    targetId: input.approvalKey,
    metadata: input.auditMetadata,
  });

  await dispatchSystemAdminWebhook({
    organizationId: input.organizationId,
    userId: input.sessionUserId,
    eventType: systemAdminApprovalRuleWebhookEvents[0],
    payload: input.webhookPayload,
  });

  revalidateApprovals();
}

function buildConfigurationFromActionInput(
  input: Omit<SystemAdminApprovalRuleActionInput, "mode">,
) {
  return serializeApprovalRuleConfiguration({
    moduleKey: input.moduleKey,
    action: input.action,
    targetType: input.targetType,
    approvalMode: input.approvalMode,
    approverRoleKeys: input.approverRoleKeys,
    delegateToRoleKeys: input.delegateToRoleKeys,
    delegationValidDays: input.delegationValidDays,
    minApprovals: input.minApprovals,
    escalationAfterHours: input.escalationAfterHours,
    escalationBehavior: input.escalationBehavior,
    escalationRoleKeys: input.escalationRoleKeys,
    status: input.status,
  });
}

export async function updateSystemAdminApprovalRuleAction(
  _previous: SystemAdminActionResult | undefined,
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { context, organization, session } =
    await requireSystemAdminApprovalsManage();

  const parsed = parseApprovalRuleActionFormData(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const approvalKey = resolveApprovalRuleKey(parsed.data);

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
    await assertApprovalRuleRolesAllowed({
      organizationId: organization.id,
      approverRoleKeys: parsed.data.approverRoleKeys,
      delegateToRoleKeys: parsed.data.delegateToRoleKeys,
      escalationRoleKeys: parsed.data.escalationRoleKeys,
    });
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

  const configuration = buildConfigurationFromActionInput(parsed.data);

  await upsertTenantApprovalSettings({
    organizationId: organization.id,
    actorAuthUserId: session.id,
    approvalKey,
    label: parsed.data.name,
    enabled: parsed.data.enabled,
    approverRole: parsed.data.approverRoleKeys[0] ?? null,
    escalationMinutes: toEscalationMinutes(parsed.data.escalationAfterHours),
    configuration,
  });

  await emitApprovalRuleMutationSideEffects({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    sessionUserId: session.id,
    approvalKey,
    auditAction: resolveApprovalRuleAuditAction({
      mode: parsed.data.mode,
      status: parsed.data.status,
    }),
    auditMetadata: buildApprovalRuleAuditMetadata({
      previous: previous
        ? {
            label: previous.label,
            enabled: previous.enabled,
            approverRole: previous.approverRole,
            configuration: readExecutionSettingConfiguration(
              previous.configuration,
            ),
          }
        : null,
      next: {
        name: parsed.data.name,
        enabled: parsed.data.enabled,
        status: parsed.data.status,
        approvalMode: parsed.data.approvalMode,
        approverRoleKeys: parsed.data.approverRoleKeys,
        delegateToRoleKeys: parsed.data.delegateToRoleKeys,
        delegationValidDays: parsed.data.delegationValidDays,
        minApprovals: parsed.data.minApprovals,
        escalationAfterHours: parsed.data.escalationAfterHours,
        escalationBehavior: parsed.data.escalationBehavior,
        escalationRoleKeys: parsed.data.escalationRoleKeys,
        configuration,
      },
    }),
    webhookPayload: {
      approvalKey,
      status: parsed.data.status,
      approvalMode: parsed.data.approvalMode,
      minApprovals: parsed.data.minApprovals,
    },
  });

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

  const configuration = readExecutionSettingConfiguration(previous.configuration);
  const configuredStatus = readConfiguredApprovalRuleStatus(configuration);
  const nextStatus = input.enabled ? configuredStatus : "disabled";

  if (input.enabled && configuredStatus === "deprecated") {
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

  await emitApprovalRuleMutationSideEffects({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    sessionUserId: session.id,
    approvalKey: input.approvalKey,
    auditAction: input.enabled
      ? systemAdminApprovalRuleAuditActionsByMode.update
      : systemAdminApprovalRuleAuditActionsByMode.disable,
    auditMetadata: {
      previous: {
        enabled: previous.enabled,
        status: configuredStatus,
      },
      next: {
        enabled: input.enabled,
        status: nextStatus,
      },
    },
    webhookPayload: {
      approvalKey: input.approvalKey,
      enabled: input.enabled,
      status: nextStatus,
    },
  });

  return systemAdminActionSuccess(undefined);
}

export async function reactivateDeprecatedSystemAdminApprovalRuleAction(input: {
  approvalKey: string;
}): Promise<SystemAdminActionResult> {
  const { context, organization, session } =
    await requireSystemAdminApprovalsReview();

  const parsed = reactivateDeprecatedApprovalRuleInputSchema.safeParse(input);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const previous = await findTenantApprovalSetting({
    organizationId: organization.id,
    approvalKey: parsed.data.approvalKey,
  });

  if (!previous) {
    return systemAdminActionFailure(
      "Approval rule was not found for this organization.",
    );
  }

  const configuration = readExecutionSettingConfiguration(previous.configuration);
  const configuredStatus = readConfiguredApprovalRuleStatus(configuration);

  if (configuredStatus !== "deprecated") {
    return systemAdminActionFailure(
      "Only deprecated approval rules can be reactivated through review.",
    );
  }

  const previousRule = mapTenantApprovalSettingToRule(previous);

  try {
    await assertApprovalRuleRolesAllowed({
      organizationId: organization.id,
      approverRoleKeys: previousRule.approverRoleKeys,
      delegateToRoleKeys: previousRule.delegateToRoleKeys,
      escalationRoleKeys: previousRule.escalationRoleKeys,
    });
    if (previousRule.minApprovals > previousRule.approverRoleKeys.length) {
      throw new Error(
        "Minimum approvals cannot exceed the number of configured approver roles.",
      );
    }
  } catch (error) {
    return systemAdminActionFailure(
      error instanceof Error
        ? error.message
        : "Approval rule reactivation rejected.",
    );
  }

  await upsertTenantApprovalSettings({
    organizationId: organization.id,
    actorAuthUserId: session.id,
    approvalKey: parsed.data.approvalKey,
    label: previous.label,
    enabled: true,
    approverRole: previous.approverRole,
    escalationMinutes: previous.escalationMinutes,
    configuration: {
      ...configuration,
      status: "active",
    },
  });

  await emitApprovalRuleMutationSideEffects({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    sessionUserId: session.id,
    approvalKey: parsed.data.approvalKey,
    auditAction: systemAdminApprovalRuleAuditActionsByMode.reactivate,
    auditMetadata: {
      previous: {
        enabled: previous.enabled,
        status: configuredStatus,
      },
      next: {
        enabled: true,
        status: "active",
      },
      reactivationPath: "review",
    },
    webhookPayload: {
      approvalKey: parsed.data.approvalKey,
      enabled: true,
      status: "active",
      reactivationPath: "review",
    },
  });

  return systemAdminActionSuccess(undefined);
}
