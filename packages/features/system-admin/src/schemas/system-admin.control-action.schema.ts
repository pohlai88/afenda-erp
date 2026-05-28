import { z } from "zod";

export const systemAdminReadinessSchema = z.enum([
  "preview",
  "active",
  "blocked",
  "deprecated",
]);

const booleanFormSchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const systemAdminModuleSettingsActionSchema = z.object({
  moduleKey: z.string().trim().min(1).max(80),
  enabled: booleanFormSchema,
  visible: booleanFormSchema,
  readiness: systemAdminReadinessSchema,
});

export const systemAdminCapabilityAvailabilitySchema = z.enum([
  "enabled",
  "disabled",
  "preview",
]);

export const systemAdminCapabilitySettingsActionSchema = z.object({
  capabilityKey: z.string().trim().min(1).max(160),
  availability: systemAdminCapabilityAvailabilitySchema,
});

export const systemAdminSecuritySettingsActionSchema = z.object({
  mfaRequired: booleanFormSchema,
  trustedDomains: z
    .string()
    .max(2000)
    .transform((value) =>
      value
        .split(",")
        .map((domain) => domain.trim().toLowerCase())
        .filter(Boolean),
    ),
  sensitiveActionConfirmation: booleanFormSchema,
  sessionTimeoutMinutes: z.coerce.number().int().min(15).max(1440),
});

export const systemAdminOrganizationDefaultsActionSchema = z.object({
  timezone: z.string().min(1).max(64),
  locale: z.string().min(2).max(16),
  currency: z.string().length(3),
  fiscalYearStartMonth: z.coerce.number().int().min(1).max(12),
  documentPrefix: z.string().trim().min(1).max(16),
  numberingPrefix: z.string().trim().min(1).max(16),
});
