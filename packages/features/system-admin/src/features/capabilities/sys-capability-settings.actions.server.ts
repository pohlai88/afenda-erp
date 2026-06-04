"use server";

import {
  listTenantCapabilitySettings,
  upsertTenantCapabilitySettings,
} from "@afenda/db";
import {
  getExecutionCapability,
  writeExecutionAuditEvent,
} from "@afenda/kernel/execution";
import { revalidatePath, revalidateTag } from "next/cache";
import { workspaceNavigationSettingsCacheTag } from "../tenant-execution/sys-workspace-navigation-cache.shared";
import { z } from "zod";
import {
  systemAdminActionFailure,
  systemAdminActionSuccess,
  type SystemAdminActionResult,
  zodActionFailure,
} from "../tenant-execution/sys-action-result.contract";
import { systemAdminRoutePaths } from "../overview/sys-route-paths.contract";
import { dispatchSystemAdminWebhook } from "../integrations/sys-webhook-dispatch.event";
import type { SystemAdminCapabilityAvailability } from "./sys-capabilities.contract";
import { SYSTEM_ADMIN_CAPABILITY_KEY_MAX_LENGTH, SYSTEM_ADMIN_CAPABILITY_SETTINGS_QUERY_LIMIT } from "./sys-capabilities.limits.shared";
import { SYSTEM_ADMIN_PROTECTED_CAPABILITY_PERMISSION } from "./sys-capability-safety.contract";
import { isCriticalExecutionCapability } from "./sys-capability-safety.contract";
import { requireSystemAdminCapabilitiesManage } from "./sys-capabilities.policy.server";
import { parseSystemAdminCapabilitySettingsFormData } from "./sys-capability-settings-form.shared";
import {
  resolveSystemAdminCapabilityAuditAction,
  SYSTEM_ADMIN_CAPABILITY_SETTINGS_WEBHOOK_EVENT,
} from "./sys-capabilities.event";
import { systemAdminCapabilitySettingsActionSchema } from "./sys-capability-settings.schema";

function resolvePreviousCapabilityAvailability(input: {
  capabilityKey: string;
  existingSettings: Awaited<ReturnType<typeof listTenantCapabilitySettings>>;
}): SystemAdminCapabilityAvailability | null | "truncated" {
  const previousSetting = input.existingSettings.find(
    (setting) => setting.capabilityKey === input.capabilityKey,
  );

  if (previousSetting) {
    return previousSetting.availability;
  }

  if (
    input.existingSettings.length >= SYSTEM_ADMIN_CAPABILITY_SETTINGS_QUERY_LIMIT
  ) {
    return "truncated";
  }

  return null;
}

const setCapabilityAvailabilityInputSchema = z.object({
  capabilityKey: z.string().trim().min(1).max(SYSTEM_ADMIN_CAPABILITY_KEY_MAX_LENGTH),
  availability: systemAdminCapabilitySettingsActionSchema.shape.availability,
});

function revalidateSystemAdminPaths(
  organizationId: string,
  ...paths: readonly string[]
) {
  revalidatePath(systemAdminRoutePaths.hub);
  revalidateTag(workspaceNavigationSettingsCacheTag(organizationId), "max");
  for (const path of paths) {
    revalidatePath(path);
  }
}

async function persistSystemAdminCapabilitySetting(input: {
  organizationId: string;
  actorAuthUserId: string;
  actorId: string;
  actorType: "user" | "system" | "agent";
  capabilityKey: string;
  availability: SystemAdminCapabilityAvailability;
  existingSettings: Awaited<ReturnType<typeof listTenantCapabilitySettings>>;
}): Promise<SystemAdminActionResult> {
  const capability = getExecutionCapability(input.capabilityKey);

  if (!capability) {
    return systemAdminActionFailure(
      "Capability is not registered in the execution kernel.",
    );
  }

  if (
    input.availability === "disabled" &&
    capability.requiredPermission === SYSTEM_ADMIN_PROTECTED_CAPABILITY_PERMISSION
  ) {
    return systemAdminActionFailure(
      "System Admin settings read cannot be disabled for this organization.",
    );
  }

  if (
    input.availability === "enabled" &&
    capability.status === "deprecated"
  ) {
    return systemAdminActionFailure(
      "Deprecated capabilities require explicit confirmation via the settings form.",
    );
  }

  const previousAvailability = resolvePreviousCapabilityAvailability({
    capabilityKey: input.capabilityKey,
    existingSettings: input.existingSettings,
  });

  if (previousAvailability === "truncated") {
    return systemAdminActionFailure(
      "Cannot verify the current capability setting because the organization settings list was truncated. Retry or contact an operator.",
    );
  }

  if (previousAvailability === input.availability) {
    return systemAdminActionSuccess(undefined);
  }

  await upsertTenantCapabilitySettings({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    capabilityKey: input.capabilityKey,
    availability: input.availability,
  });
  await writeExecutionAuditEvent({
    organizationId: input.organizationId,
    actorId: input.actorId,
    actorType: input.actorType,
    action: resolveSystemAdminCapabilityAuditAction({
      previous: previousAvailability,
      next: input.availability,
    }),
    targetType: "capability",
    targetId: input.capabilityKey,
    metadata: {
      previous: previousAvailability,
      next: input.availability,
      moduleKey: capability.moduleKey,
      critical: isCriticalExecutionCapability(capability),
    },
  });
  await dispatchSystemAdminWebhook({
    organizationId: input.organizationId,
    userId: input.actorAuthUserId,
    eventType: SYSTEM_ADMIN_CAPABILITY_SETTINGS_WEBHOOK_EVENT,
    payload: {
      capabilityKey: input.capabilityKey,
      availability: input.availability,
    },
  });

  revalidateSystemAdminPaths(
    input.organizationId,
    systemAdminRoutePaths.capabilities,
  );
  revalidatePath("/");
  return systemAdminActionSuccess(undefined);
}

export async function setSystemAdminCapabilityAvailabilityAction(input: {
  capabilityKey: string;
  availability: SystemAdminCapabilityAvailability;
}): Promise<SystemAdminActionResult> {
  const parsed = setCapabilityAvailabilityInputSchema.safeParse(input);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const { context, organization, session } =
    await requireSystemAdminCapabilitiesManage();
  const existingSettings = await listTenantCapabilitySettings({
    organizationId: organization.id,
    limit: SYSTEM_ADMIN_CAPABILITY_SETTINGS_QUERY_LIMIT,
  });

  return persistSystemAdminCapabilitySetting({
    organizationId: organization.id,
    actorAuthUserId: session.id,
    actorId: context.userId,
    actorType: context.actorType,
    capabilityKey: parsed.data.capabilityKey,
    availability: parsed.data.availability,
    existingSettings,
  });
}

export async function updateSystemAdminCapabilitySettingsAction(
  _previous: SystemAdminActionResult | undefined,
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { context, organization, session } =
    await requireSystemAdminCapabilitiesManage();
  const parsed = parseSystemAdminCapabilitySettingsFormData(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const existingSettings = await listTenantCapabilitySettings({
    organizationId: organization.id,
    limit: SYSTEM_ADMIN_CAPABILITY_SETTINGS_QUERY_LIMIT,
  });

  return persistSystemAdminCapabilitySetting({
    organizationId: organization.id,
    actorAuthUserId: session.id,
    actorId: context.userId,
    actorType: context.actorType,
    capabilityKey: parsed.data.capabilityKey,
    availability: parsed.data.availability,
    existingSettings,
  });
}
