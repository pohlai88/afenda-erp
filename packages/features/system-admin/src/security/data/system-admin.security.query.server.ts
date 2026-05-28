import {
  ensureTenantSecuritySettings,
  getTenantSecuritySettings,
} from "../../data/repositories/system-admin.tenant-security.repository.server";
import { mapTenantSecurityToOrganizationSettings } from "./system-admin.security.mapper";
import type { OrganizationSecuritySettings } from "../contracts/system-admin.security-settings.contract";

export async function getSystemAdminOrganizationSecuritySettings(input: {
  organizationId: string;
}): Promise<OrganizationSecuritySettings | null> {
  await ensureTenantSecuritySettings({ organizationId: input.organizationId });
  const snapshot = await getTenantSecuritySettings({
    organizationId: input.organizationId,
  });

  return snapshot
    ? mapTenantSecurityToOrganizationSettings(snapshot)
    : null;
}

export function mapParsedSecurityInputToOrganizationSettings(input: {
  organizationId: string;
  actorUserId: string;
  parsed: {
    requireMfaForAdmins: boolean;
    allowedEmailDomains: string[];
    sessionMaxAgeMinutes: number;
    idleTimeoutMinutes: number;
    requireSensitiveActionConfirmation: boolean;
    restrictInvitesToAllowedDomains: boolean;
    adminLockoutProtectionEnabled: boolean;
  };
}): OrganizationSecuritySettings {
  return {
    organizationId: input.organizationId,
    requireMfaForAdmins: input.parsed.requireMfaForAdmins,
    allowedEmailDomains: input.parsed.allowedEmailDomains,
    sessionMaxAgeMinutes: input.parsed.sessionMaxAgeMinutes,
    idleTimeoutMinutes: input.parsed.idleTimeoutMinutes,
    requireSensitiveActionConfirmation:
      input.parsed.requireSensitiveActionConfirmation,
    restrictInvitesToAllowedDomains: input.parsed.restrictInvitesToAllowedDomains,
    adminLockoutProtectionEnabled: input.parsed.adminLockoutProtectionEnabled,
    updatedByUserId: input.actorUserId,
    updatedAt: new Date(),
  };
}

export function diffSecurityDomainChanges(input: {
  previous: OrganizationSecuritySettings;
  next: OrganizationSecuritySettings;
}) {
  const previous = new Set(input.previous.allowedEmailDomains);
  const next = new Set(input.next.allowedEmailDomains);
  const added = [...next].filter((domain) => !previous.has(domain));
  const removed = [...previous].filter((domain) => !next.has(domain));

  return { added, removed };
}
