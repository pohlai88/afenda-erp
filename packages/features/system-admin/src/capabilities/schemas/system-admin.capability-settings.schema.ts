import { z } from "zod";

export const systemAdminCapabilityAvailabilitySchema = z.enum([
  "enabled",
  "disabled",
  "preview",
]);

export const systemAdminCapabilitySettingsActionSchema = z.object({
  capabilityKey: z.string().trim().min(1).max(160),
  availability: systemAdminCapabilityAvailabilitySchema,
});
