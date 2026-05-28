"use server";

import {
  ensureTenantSecuritySettings,
  ensureTenantSettings,
  updateTenantSecuritySettings,
  updateTenantSettings,
  upsertTenantApprovalSettings,
  upsertTenantModuleSettings,
  upsertTenantPolicySettings,
} from "@afenda/db";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { logServerEvent } from "@afenda/observability";
import { revalidatePath } from "next/cache";
import {
  systemAdminActionSuccess,
  type SystemAdminActionResult,
  zodActionFailure,
} from "../contracts";
import { systemAdminRoutePaths } from "../contracts/system-admin.route-paths.contract";
import {
  requireSystemAdminApprovalsManage,
  requireSystemAdminModulesManage,
  requireSystemAdminOrganizationManage,
  requireSystemAdminPoliciesManage,
  requireSystemAdminSecurityManage,
} from "../policies";
import {
  systemAdminApprovalSettingsActionSchema,
  systemAdminModuleSettingsActionSchema,
  systemAdminOrganizationDefaultsActionSchema,
  systemAdminPolicySettingsActionSchema,
  systemAdminSecuritySettingsActionSchema,
} from "../schemas";
import { dispatchSystemAdminWebhook } from "../events";

function revalidateSystemAdminPaths(...paths: readonly string[]) {
  revalidatePath(systemAdminRoutePaths.hub);
  for (const path of paths) {
    revalidatePath(path);
  }
}

async function writeControlAudit(input: {
  organizationId: string;
  actorId: string;
  actorType: "user" | "system" | "agent";
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  await writeExecutionAuditEvent({
    organizationId: input.organizationId,
    actorId: input.actorId,
    actorType: input.actorType,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    metadata: input.metadata,
  });
}

export async function updateSystemAdminModuleSettingsAction(
  _previous: SystemAdminActionResult | undefined,
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { context, organization, session } =
    await requireSystemAdminModulesManage();
  const parsed = systemAdminModuleSettingsActionSchema.safeParse({
    moduleKey: formData.get("moduleKey"),
    enabled: formData.get("enabled"),
    visible: formData.get("visible"),
    readiness: formData.get("readiness"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  await upsertTenantModuleSettings({
    organizationId: organization.id,
    actorAuthUserId: session.id,
    ...parsed.data,
  });
  await writeControlAudit({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: "system-admin.module-settings.update",
    targetType: "organization",
    metadata: parsed.data,
  });
  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: session.id,
    eventType: "system-admin.module-settings.updated",
    payload: parsed.data,
  });
  logServerEvent("info", "System admin module settings updated.", {
    organizationId: organization.id,
    userId: session.id,
    module: "system-admin",
    operation: "modules.update",
  });

  revalidateSystemAdminPaths(systemAdminRoutePaths.modules);
  return systemAdminActionSuccess(undefined);
}

export async function updateSystemAdminPolicyAction(
  _previous: SystemAdminActionResult | undefined,
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { context, organization, session } =
    await requireSystemAdminPoliciesManage();
  const parsed = systemAdminPolicySettingsActionSchema.safeParse({
    policyKey: formData.get("policyKey"),
    label: formData.get("label"),
    enabled: formData.get("enabled"),
    readiness: formData.get("readiness"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  await upsertTenantPolicySettings({
    organizationId: organization.id,
    actorAuthUserId: session.id,
    ...parsed.data,
  });
  await writeControlAudit({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: "system-admin.policy.update",
    targetType: "organization",
    metadata: parsed.data,
  });
  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: session.id,
    eventType: "system-admin.policy.updated",
    payload: parsed.data,
  });

  revalidateSystemAdminPaths(systemAdminRoutePaths.policies);
  return systemAdminActionSuccess(undefined);
}

export async function updateSystemAdminApprovalAction(
  _previous: SystemAdminActionResult | undefined,
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { context, organization, session } =
    await requireSystemAdminApprovalsManage();
  const parsed = systemAdminApprovalSettingsActionSchema.safeParse({
    approvalKey: formData.get("approvalKey"),
    label: formData.get("label"),
    enabled: formData.get("enabled"),
    approverRole: formData.get("approverRole") || undefined,
    escalationMinutes: formData.get("escalationMinutes") || undefined,
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  await upsertTenantApprovalSettings({
    organizationId: organization.id,
    actorAuthUserId: session.id,
    ...parsed.data,
  });
  await writeControlAudit({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: "system-admin.approval.update",
    targetType: "organization",
    metadata: parsed.data,
  });
  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: session.id,
    eventType: "system-admin.approval.updated",
    payload: parsed.data,
  });

  revalidateSystemAdminPaths(systemAdminRoutePaths.approvals);
  return systemAdminActionSuccess(undefined);
}

export async function updateSystemAdminSecurityAction(
  _previous: SystemAdminActionResult | undefined,
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { context, organization, session } =
    await requireSystemAdminSecurityManage();
  const parsed = systemAdminSecuritySettingsActionSchema.safeParse({
    mfaRequired: formData.get("mfaRequired"),
    trustedDomains: formData.get("trustedDomains"),
    sensitiveActionConfirmation: formData.get("sensitiveActionConfirmation"),
    sessionTimeoutMinutes: formData.get("sessionTimeoutMinutes"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  await ensureTenantSecuritySettings({ organizationId: organization.id });
  await updateTenantSecuritySettings({
    organizationId: organization.id,
    actorAuthUserId: session.id,
    patch: {
      mfaRequired: parsed.data.mfaRequired,
      trustedDomains: parsed.data.trustedDomains,
      sensitiveActionConfirmation: parsed.data.sensitiveActionConfirmation,
      sessionPolicy: {
        sessionTimeoutMinutes: parsed.data.sessionTimeoutMinutes,
      },
    },
  });
  await writeControlAudit({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: "system-admin.security.update",
    targetType: "organization",
    metadata: parsed.data,
  });
  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: session.id,
    eventType: "system-admin.security.updated",
    payload: parsed.data,
  });

  revalidateSystemAdminPaths(systemAdminRoutePaths.security);
  return systemAdminActionSuccess(undefined);
}

export async function updateSystemAdminOrganizationDefaultsAction(
  _previous: SystemAdminActionResult | undefined,
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { context, organization, session } =
    await requireSystemAdminOrganizationManage();
  const parsed = systemAdminOrganizationDefaultsActionSchema.safeParse({
    timezone: formData.get("timezone"),
    locale: formData.get("locale"),
    currency: formData.get("currency"),
    fiscalYearStartMonth: formData.get("fiscalYearStartMonth"),
    documentPrefix: formData.get("documentPrefix"),
    numberingPrefix: formData.get("numberingPrefix"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  await ensureTenantSettings({ organizationId: organization.id });
  await updateTenantSettings({
    organizationId: organization.id,
    actorAuthUserId: session.id,
    patch: {
      timezone: parsed.data.timezone,
      locale: parsed.data.locale,
      currency: parsed.data.currency,
      fiscalYearStartMonth: parsed.data.fiscalYearStartMonth,
      documentPrefixes: { default: parsed.data.documentPrefix },
      numbering: { defaultPrefix: parsed.data.numberingPrefix },
    },
  });
  await writeControlAudit({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: "system-admin.organization.update",
    targetType: "organization",
    metadata: parsed.data,
  });
  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: session.id,
    eventType: "system-admin.organization.updated",
    payload: parsed.data,
  });

  revalidateSystemAdminPaths(
    systemAdminRoutePaths.organization,
    systemAdminRoutePaths.settings,
  );
  return systemAdminActionSuccess(undefined);
}
