import type { TenantSecuritySettingsSnapshot } from "@afenda/db";
import type { OrganizationSecuritySettings } from "./sys-security-settings.contract";

function readSessionPolicyNumber(
  sessionPolicy: Record<string, unknown>,
  key: string,
  fallback: number,
) {
  const value = sessionPolicy[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readSessionPolicyBoolean(
  sessionPolicy: Record<string, unknown>,
  key: string,
  fallback: boolean,
) {
  const value = sessionPolicy[key];
  return typeof value === "boolean" ? value : fallback;
}

export function mapTenantSecurityToOrganizationSettings(
  security: TenantSecuritySettingsSnapshot,
): OrganizationSecuritySettings {
  const sessionPolicy = security.sessionPolicy;

  return {
    organizationId: security.organizationId,
    requireMfaForAdmins: security.mfaRequired,
    allowedEmailDomains: [...security.trustedDomains],
    sessionMaxAgeMinutes: readSessionPolicyNumber(
      sessionPolicy,
      "sessionMaxAgeMinutes",
      readSessionPolicyNumber(sessionPolicy, "sessionTimeoutMinutes", 720),
    ),
    idleTimeoutMinutes: readSessionPolicyNumber(
      sessionPolicy,
      "idleTimeoutMinutes",
      30,
    ),
    requireSensitiveActionConfirmation: security.sensitiveActionConfirmation,
    restrictInvitesToAllowedDomains: readSessionPolicyBoolean(
      sessionPolicy,
      "restrictInvitesToAllowedDomains",
      false,
    ),
    adminLockoutProtectionEnabled: readSessionPolicyBoolean(
      sessionPolicy,
      "adminLockoutProtectionEnabled",
      true,
    ),
    updatedByUserId:
      typeof sessionPolicy.updatedByUserId === "string"
        ? sessionPolicy.updatedByUserId
        : null,
    updatedAt:
      typeof sessionPolicy.updatedAt === "string"
        ? new Date(sessionPolicy.updatedAt)
        : null,
  };
}

export function mapOrganizationSecurityToTenantPatch(
  input: OrganizationSecuritySettings,
) {
  return {
    mfaRequired: input.requireMfaForAdmins,
    trustedDomains: [...input.allowedEmailDomains],
    sensitiveActionConfirmation: input.requireSensitiveActionConfirmation,
    sessionPolicy: {
      sessionMaxAgeMinutes: input.sessionMaxAgeMinutes,
      sessionTimeoutMinutes: input.sessionMaxAgeMinutes,
      idleTimeoutMinutes: input.idleTimeoutMinutes,
      restrictInvitesToAllowedDomains: input.restrictInvitesToAllowedDomains,
      adminLockoutProtectionEnabled: input.adminLockoutProtectionEnabled,
      updatedByUserId: input.updatedByUserId,
      updatedAt: input.updatedAt?.toISOString() ?? new Date().toISOString(),
    },
  };
}
