import { z } from "zod";
import type { OrganizationSecuritySettings } from "./sys-security-settings.contract";

const emailDomainSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(253)
  .regex(
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/,
    "Enter a valid domain such as example.com",
  );

const booleanFormSchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const updateSecuritySettingsInputSchema = z
  .object({
    requireMfaForAdmins: booleanFormSchema,
    allowedEmailDomains: z
      .string()
      .max(2000)
      .transform((value) =>
        value
          .split(",")
          .map((domain) => domain.trim().toLowerCase())
          .filter(Boolean),
      )
      .pipe(z.array(emailDomainSchema).max(25)),
    sessionMaxAgeMinutes: z.coerce.number().int().min(15).max(43_200),
    idleTimeoutMinutes: z.coerce.number().int().min(5).max(1440),
    requireSensitiveActionConfirmation: booleanFormSchema,
    restrictInvitesToAllowedDomains: booleanFormSchema,
    adminLockoutProtectionEnabled: booleanFormSchema,
    confirmDisableLockoutProtection: booleanFormSchema.optional(),
  })
  .superRefine((value, context) => {
    if (value.idleTimeoutMinutes > value.sessionMaxAgeMinutes) {
      context.addIssue({
        code: "custom",
        path: ["idleTimeoutMinutes"],
        message: "Idle timeout cannot exceed session max age.",
      });
    }
  });

export type UpdateSecuritySettingsInput = z.infer<
  typeof updateSecuritySettingsInputSchema
>;

export function assertSecuritySettingsDowngradeGuard(input: {
  parsed: UpdateSecuritySettingsInput;
  previous: OrganizationSecuritySettings;
}): string | null {
  const disablingLockout =
    input.previous.adminLockoutProtectionEnabled &&
    !input.parsed.adminLockoutProtectionEnabled;

  if (
    disablingLockout &&
    input.parsed.confirmDisableLockoutProtection !== true
  ) {
    return "Confirm admin lockout protection downgrade before saving.";
  }

  const allProtectionsDisabled =
    !input.parsed.requireMfaForAdmins &&
    !input.parsed.requireSensitiveActionConfirmation &&
    !input.parsed.adminLockoutProtectionEnabled;

  if (allProtectionsDisabled) {
    return "At least one admin protection must remain enabled.";
  }

  return null;
}
