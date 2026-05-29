import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import { buildControlListSurface } from "../../overview/surfaces/system-admin.control-list.shared";
import type { OrganizationSecuritySettings } from "../contracts/system-admin.security-settings.contract";

export const systemAdminSecuritySurfaceKey = "system-admin.security.list";

export function buildSystemAdminSecuritySettingsListSurface(input: {
  security: OrganizationSecuritySettings | null;
}): ListSurfaceRendererConfigurationResolvedInput {
  const security = input.security;

  return buildControlListSurface({
    key: systemAdminSecuritySurfaceKey,
    title: "Security posture",
    object: "security",
    columns: [
      { id: "setting", header: "Setting", priority: "primary", pin: "start" },
      { id: "value", header: "Value" },
    ],
    rows: [
      {
        id: "mfa",
        setting: "Require MFA for admins",
        value: security?.requireMfaForAdmins ? "Enabled" : "Disabled",
      },
      {
        id: "domains",
        setting: "Allowed email domains",
        value:
          security && security.allowedEmailDomains.length > 0
            ? security.allowedEmailDomains.join(", ")
            : "Not restricted",
      },
      {
        id: "session-max-age",
        setting: "Session max age",
        value: security
          ? `${security.sessionMaxAgeMinutes} minutes`
          : "Default",
      },
      {
        id: "idle-timeout",
        setting: "Idle timeout",
        value: security ? `${security.idleTimeoutMinutes} minutes` : "Default",
      },
      {
        id: "sensitive-confirmation",
        setting: "Sensitive action confirmation",
        value: security?.requireSensitiveActionConfirmation
          ? "Enabled"
          : "Disabled",
      },
      {
        id: "invite-domains",
        setting: "Restrict invites to allowed domains",
        value: security?.restrictInvitesToAllowedDomains ? "Enabled" : "Disabled",
      },
      {
        id: "lockout",
        setting: "Admin lockout protection",
        value: security?.adminLockoutProtectionEnabled ? "Enabled" : "Disabled",
      },
    ],
    emptyTitle: "Security settings are not initialized.",
  });
}
