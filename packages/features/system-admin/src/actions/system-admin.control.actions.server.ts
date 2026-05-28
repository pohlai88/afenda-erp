"use server";

import {
  ensureTenantSettings,
  listTenantCapabilitySettings,
  listTenantModuleSettings,
  upsertTenantCapabilitySettings,
  updateTenantSettings,
  upsertTenantModuleSettings,
} from "@afenda/db";
import {
  getExecutionCapability,
  writeExecutionAuditEvent,
} from "@afenda/kernel/execution";
import { logServerEvent } from "@afenda/observability";
import { revalidatePath } from "next/cache";
import {
  systemAdminActionFailure,
  systemAdminActionSuccess,
  type SystemAdminActionResult,
  zodActionFailure,
} from "../contracts";
import { systemAdminRoutePaths } from "../contracts/system-admin.route-paths.contract";
import {
  requireSystemAdminCapabilitiesManage,
  requireSystemAdminModulesManage,
  requireSystemAdminOrganizationManage,
} from "../policies";
import { SYSTEM_ADMIN_PROTECTED_MODULE_KEY } from "../modules/contracts";
import {
  systemAdminCapabilitySettingsActionSchema,
  systemAdminModuleSettingsActionSchema,
  systemAdminOrganizationDefaultsActionSchema,
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

  if (
    parsed.data.moduleKey === SYSTEM_ADMIN_PROTECTED_MODULE_KEY &&
    (!parsed.data.enabled ||
      parsed.data.readiness === "blocked" ||
      parsed.data.readiness === "deprecated")
  ) {
    return systemAdminActionFailure(
      "System Admin cannot be disabled or blocked for this organization.",
    );
  }

  const existingSettings = await listTenantModuleSettings({
    organizationId: organization.id,
    limit: 100,
  });
  const previous = existingSettings.find(
    (setting) => setting.moduleKey === parsed.data.moduleKey,
  );

  await upsertTenantModuleSettings({
    organizationId: organization.id,
    actorAuthUserId: session.id,
    ...parsed.data,
    configuration: previous?.configuration ?? {},
  });
  await writeControlAudit({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: "system-admin.module_setting.update",
    targetType: "module",
    targetId: parsed.data.moduleKey,
    metadata: {
      previous: previous
        ? {
            enabled: previous.enabled,
            visible: previous.visible,
            readiness: previous.readiness,
          }
        : null,
      next: parsed.data,
    },
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
  revalidatePath("/");
  return systemAdminActionSuccess(undefined);
}

export async function updateSystemAdminCapabilitySettingsAction(
  _previous: SystemAdminActionResult | undefined,
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { context, organization, session } =
    await requireSystemAdminCapabilitiesManage();
  const parsed = systemAdminCapabilitySettingsActionSchema.safeParse({
    capabilityKey: formData.get("capabilityKey"),
    availability: formData.get("availability"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const capability = getExecutionCapability(parsed.data.capabilityKey);

  if (!capability) {
    return systemAdminActionFailure(
      "Capability is not registered in the execution kernel.",
    );
  }

  const existingSettings = await listTenantCapabilitySettings({
    organizationId: organization.id,
    limit: 500,
  });
  const previous = existingSettings.find(
    (setting) => setting.capabilityKey === parsed.data.capabilityKey,
  );

  await upsertTenantCapabilitySettings({
    organizationId: organization.id,
    actorAuthUserId: session.id,
    capabilityKey: parsed.data.capabilityKey,
    availability: parsed.data.availability,
  });
  await writeControlAudit({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: "system-admin.capability_setting.update",
    targetType: "capability",
    targetId: parsed.data.capabilityKey,
    metadata: {
      previous: previous?.availability ?? null,
      next: parsed.data.availability,
      moduleKey: capability.moduleKey,
    },
  });
  await dispatchSystemAdminWebhook({
    organizationId: organization.id,
    userId: session.id,
    eventType: "system-admin.capability-settings.updated",
    payload: parsed.data,
  });

  revalidateSystemAdminPaths(systemAdminRoutePaths.capabilities);
  revalidatePath("/");
  return systemAdminActionSuccess(undefined);
}

export async function updateSystemAdminSecurityAction(
  previous: SystemAdminActionResult | undefined,
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { updateSystemAdminSecuritySettingsAction } = await import(
    "../security/actions/system-admin.security.actions.server"
  );

  return updateSystemAdminSecuritySettingsAction(previous, formData);
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
