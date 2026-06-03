import type { SystemAdminCapabilityAvailability } from "../contracts";

export const systemAdminCapabilityWebhookEvents = [
  "system-admin.capability-settings.updated",
] as const;

export const SYSTEM_ADMIN_CAPABILITY_SETTINGS_WEBHOOK_EVENT =
  systemAdminCapabilityWebhookEvents[0];

export const systemAdminCapabilityAuditActions = [
  "system-admin.capability.enable",
  "system-admin.capability.disable",
  "system-admin.capability.preview",
  "system-admin.capability_setting.update",
] as const;

export type SystemAdminCapabilityWebhookEvent =
  (typeof systemAdminCapabilityWebhookEvents)[number];

export type SystemAdminCapabilityAuditAction =
  (typeof systemAdminCapabilityAuditActions)[number];

export function resolveSystemAdminCapabilityAuditAction(input: {
  previous: SystemAdminCapabilityAvailability | null | undefined;
  next: SystemAdminCapabilityAvailability;
}): SystemAdminCapabilityAuditAction {
  if (input.previous === input.next) {
    return "system-admin.capability_setting.update";
  }

  if (input.next === "enabled") {
    return "system-admin.capability.enable";
  }

  if (input.next === "disabled") {
    return "system-admin.capability.disable";
  }

  if (input.next === "preview") {
    return "system-admin.capability.preview";
  }

  return "system-admin.capability_setting.update";
}
