import { z } from "zod";
import { SYSTEM_ADMIN_CAPABILITY_KEY_MAX_LENGTH } from "../contracts/system-admin.capabilities.limits.shared";

export const systemAdminCapabilityAvailabilitySchema = z.enum([
  "enabled",
  "disabled",
  "preview",
]);

export const systemAdminCapabilitySettingsActionSchema = z.object({
  capabilityKey: z
    .string()
    .trim()
    .min(1)
    .max(SYSTEM_ADMIN_CAPABILITY_KEY_MAX_LENGTH),
  availability: systemAdminCapabilityAvailabilitySchema,
});
