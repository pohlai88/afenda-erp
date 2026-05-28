"use server";

import {
  listTenantPolicySettings,
  upsertTenantPolicySettings,
} from "@afenda/db";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";
import {
  systemAdminActionSuccess,
  type SystemAdminActionResult,
  zodActionFailure,
} from "../../contracts";
import { systemAdminRoutePaths } from "../../contracts/system-admin.route-paths.contract";
import { requireSystemAdminPoliciesManage } from "../policies/system-admin.policy-rules.policy.server";
import { dispatchSystemAdminWebhook } from "../../events";
import {
  systemAdminPolicyRuleAuditActionsByMode,
  systemAdminPolicyRuleWebhookEvents,
  type SystemAdminPolicyRuleAuditAction,
} from "../events/system-admin.policy-rules.event";
import { serializePolicyRuleConfiguration } from "../data/system-admin.policy-rules.mapper";
import { systemAdminPolicyRuleActionSchema } from "../schemas/system-admin.policy-rule.schema";

function resolvePolicyRuleAuditAction(input: {
  mode: "create" | "update";
  status: string;
}): SystemAdminPolicyRuleAuditAction {
  if (input.mode === "create") {
    return systemAdminPolicyRuleAuditActionsByMode.create;
  }
  if (input.status === "disabled") {
    return systemAdminPolicyRuleAuditActionsByMode.disable;
  }
  if (input.status === "deprecated") {
    return systemAdminPolicyRuleAuditActionsByMode.deprecate;
  }
  return systemAdminPolicyRuleAuditActionsByMode.update;
}

function revalidatePolicies() {
  revalidatePath(systemAdminRoutePaths.policies);
  revalidatePath(systemAdminRoutePaths.hub);
}

export async function updateSystemAdminPolicyRuleAction(
  _previous: SystemAdminActionResult | undefined,
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { context, organization, session } =
    await requireSystemAdminPoliciesManage();

  const mode = formData.get("mode") === "create" ? "create" : "update";
  const parsed = systemAdminPolicyRuleActionSchema.safeParse({
    mode,
    policyKey:
      mode === "create" ? formData.get("policyKey") : formData.get("policyRuleId"),
    policyRuleId: formData.get("policyRuleId"),
    name: formData.get("name"),
    moduleKey: formData.get("moduleKey"),
    action: formData.get("action"),
    targetType: formData.get("targetType"),
    effect: formData.get("effect"),
    conditionJson: formData.get("conditionJson"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    enabled: formData.get("enabled"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const policyKey =
    parsed.data.mode === "create"
      ? parsed.data.policyKey
      : parsed.data.policyRuleId;

  const existingSettings = await listTenantPolicySettings({
    organizationId: organization.id,
    limit: 200,
  });
  const previous = existingSettings.find((row) => row.policyKey === policyKey);

  const configuration = serializePolicyRuleConfiguration({
    moduleKey: parsed.data.moduleKey,
    action: parsed.data.action,
    targetType: parsed.data.targetType,
    effect: parsed.data.effect,
    condition: parsed.data.conditionJson,
    status: parsed.data.status,
    priority: parsed.data.priority,
  });

  await upsertTenantPolicySettings({
    organizationId: organization.id,
    actorAuthUserId: session.id,
    policyKey,
    label: parsed.data.name,
    enabled: parsed.data.enabled,
    readiness:
      parsed.data.status === "deprecated"
        ? "deprecated"
        : parsed.data.enabled
          ? "active"
          : "blocked",
    configuration,
  });

  const auditAction = resolvePolicyRuleAuditAction({
    mode: parsed.data.mode,
    status: parsed.data.status,
  });

  await writeExecutionAuditEvent({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: auditAction,
    targetType: "policy_rule",
    targetId: policyKey,
    metadata: {
      previous: previous
        ? {
            label: previous.label,
            enabled: previous.enabled,
            readiness: previous.readiness,
            configuration: previous.configuration,
          }
        : null,
      next: {
        label: parsed.data.name,
        enabled: parsed.data.enabled,
        status: parsed.data.status,
        effect: parsed.data.effect,
        priority: parsed.data.priority,
        configuration,
      },
    },
  });

  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: session.id,
    eventType: systemAdminPolicyRuleWebhookEvents[0],
    payload: {
      policyKey,
      effect: parsed.data.effect,
      status: parsed.data.status,
    },
  });

  revalidatePolicies();
  return systemAdminActionSuccess(undefined);
}

export async function updateSystemAdminPolicyAction(
  previous: SystemAdminActionResult | undefined,
  formData: FormData,
): Promise<SystemAdminActionResult> {
  return updateSystemAdminPolicyRuleAction(previous, formData);
}
