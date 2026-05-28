import { organizationRoles } from "@afenda/auth";
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

export const systemAdminPolicySettingsActionSchema = z.object({
  policyKey: z.string().trim().min(1).max(120),
  label: z.string().trim().min(1).max(160),
  enabled: booleanFormSchema,
  readiness: systemAdminReadinessSchema,
});

export const systemAdminApprovalSettingsActionSchema = z.object({
  approvalKey: z.string().trim().min(1).max(120),
  label: z.string().trim().min(1).max(160),
  enabled: booleanFormSchema,
  approverRole: z.enum(organizationRoles).optional(),
  escalationMinutes: z.coerce.number().int().min(0).max(10080).optional(),
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
