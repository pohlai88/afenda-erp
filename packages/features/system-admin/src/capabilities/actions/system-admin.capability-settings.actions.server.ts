"use server";

import {
  listTenantCapabilitySettings,
  upsertTenantCapabilitySettings,
} from "@afenda/db";
import {
  getExecutionCapability,
  writeExecutionAuditEvent,
} from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  systemAdminActionFailure,
  systemAdminActionSuccess,
  type SystemAdminActionResult,
  zodActionFailure,
} from "../../tenant-execution/contracts/system-admin.action-result.contract";
import { systemAdminRoutePaths } from "../../overview/contracts/system-admin.route-paths.contract";
import { dispatchSystemAdminWebhook } from "../../integrations/events/system-admin.webhook-dispatch.event";
import type { SystemAdminCapabilityAvailability } from "../contracts";
import { isCriticalExecutionCapability } from "../contracts/system-admin.capability-safety.contract";
import { requireSystemAdminCapabilitiesManage } from "../policies/system-admin.capabilities.policy.server";
import {
  resolveSystemAdminCapabilityAuditAction,
  systemAdminCapabilityWebhookEvents,
} from "../events/system-admin.capabilities.event";
import { systemAdminCapabilitySettingsActionSchema } from "../schemas/system-admin.capability-settings.schema";

const setCapabilityAvailabilityInputSchema = z.object({
  capabilityKey: z.string().trim().min(1).max(160),
  availability: systemAdminCapabilitySettingsActionSchema.shape.availability,
});

function revalidateSystemAdminPaths(...paths: readonly string[]) {
  revalidatePath(systemAdminRoutePaths.hub);
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
    capability.requiredPermission === "system-admin.settings.read"
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

  const previous = input.existingSettings.find(
    (setting) => setting.capabilityKey === input.capabilityKey,
  );
  const previousAvailability = previous?.availability ?? null;

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
    eventType: systemAdminCapabilityWebhookEvents[0],
    payload: {
      capabilityKey: input.capabilityKey,
      availability: input.availability,
    },
  });

  revalidateSystemAdminPaths(systemAdminRoutePaths.capabilities);
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
    limit: 500,
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
  const parsed = systemAdminCapabilitySettingsActionSchema.safeParse({
    capabilityKey: formData.get("capabilityKey"),
    availability: formData.get("availability"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const existingSettings = await listTenantCapabilitySettings({
    organizationId: organization.id,
    limit: 500,
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
