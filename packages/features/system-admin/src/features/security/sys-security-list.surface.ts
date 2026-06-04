import { formatErpDateTime } from "@afenda/kernel";
import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface/schemas";
import {
  buildLinkedControlListSurface,
  moduleReadinessVerdictBadge,
} from "../overview/sys-control-list.shared";
import type { OrganizationSecuritySettings } from "./sys-security-settings.contract";
import type { SecurityReadinessReport } from "./sys-security-readiness.contract";
import { systemAdminSecurityUiCopy } from "./sys-security-ui.copy.shared";
import { resolveEffectiveObjectStorageProviderLabel } from "../tenant-execution/sys-object-storage-provider.shared";
import {
  formatEncryptionModeLabel,
  formatKmsAdapterLabel,
} from "./sys-object-storage-encryption.schema";

export const systemAdminSecuritySurfaceKey = "system-admin.security.list";

function formatBoolean(enabled: boolean) {
  return enabled ? "Enabled" : "Disabled";
}

function formatDomains(security: OrganizationSecuritySettings) {
  return security.allowedEmailDomains.length > 0
    ? security.allowedEmailDomains.join(", ")
    : "Not restricted";
}

function buildReadinessRows(readiness: SecurityReadinessReport) {
  const copy = systemAdminSecurityUiCopy;

  return [
    {
      id: "readiness",
      cells: {
        category: copy.readiness.title,
        setting: "Verdict",
        value: readiness.verdict,
      },
      cellKinds: {
        value: moduleReadinessVerdictBadge(readiness.verdict),
      },
    },
    ...readiness.issues.map((issue) => ({
      id: `readiness-${issue.id}`,
      cells: {
        category: copy.readiness.title,
        setting: issue.title,
        value: issue.description,
      },
      cellKinds: {
        value: issue.id.startsWith("blocked:")
          ? moduleReadinessVerdictBadge("blocked")
          : moduleReadinessVerdictBadge("warning"),
      },
    })),
  ];
}

function buildSettingsRows(security: OrganizationSecuritySettings | null) {
  const copy = systemAdminSecurityUiCopy;

  if (!security) {
    return [];
  }

  return [
    {
      id: "mfa",
      cells: {
        category: copy.categories.authentication,
        setting: "Require MFA for admins",
        value: formatBoolean(security.requireMfaForAdmins),
      },
    },
    {
      id: "session-max-age",
      cells: {
        category: copy.categories.session,
        setting: "Session max age",
        value: `${security.sessionMaxAgeMinutes} minutes`,
      },
    },
    {
      id: "idle-timeout",
      cells: {
        category: copy.categories.session,
        setting: "Idle timeout",
        value: `${security.idleTimeoutMinutes} minutes`,
      },
    },
    {
      id: "domains",
      cells: {
        category: copy.categories.domain,
        setting: "Allowed email domains",
        value: formatDomains(security),
      },
    },
    {
      id: "invite-domains",
      cells: {
        category: copy.categories.domain,
        setting: "Restrict invites to allowed domains",
        value: formatBoolean(security.restrictInvitesToAllowedDomains),
      },
    },
    {
      id: "lockout",
      cells: {
        category: copy.categories.administrative,
        setting: "Admin lockout protection",
        value: formatBoolean(security.adminLockoutProtectionEnabled),
      },
    },
    {
      id: "sensitive-confirmation",
      cells: {
        category: copy.categories.sensitive,
        setting: "Sensitive action confirmation",
        value: formatBoolean(security.requireSensitiveActionConfirmation),
      },
    },
    {
      id: "updated-at",
      cells: {
        category: copy.categories.metadata,
        setting: "Last updated",
        value: security.updatedAt
          ? formatErpDateTime(security.updatedAt)
          : "Not recorded",
      },
    },
    {
      id: "updated-by",
      cells: {
        category: copy.categories.metadata,
        setting: "Updated by",
        value: security.updatedByUserId ?? "Unknown",
      },
    },
  ];
}

export function buildSystemAdminSecuritySettingsListSurface(input: {
  security: OrganizationSecuritySettings | null;
  readiness: SecurityReadinessReport;
  objectStorageProvider: "vercel-blob" | "r2" | "s3" | null;
  deploymentProvider: "vercel-blob" | "r2" | "s3";
  encryptionSettings: {
    mode: "platform" | "customer-managed";
    kmsAdapter: "vault-transit" | "aws-kms" | null;
    kmsKeyRef: string | null;
  };
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = [
    ...buildReadinessRows(input.readiness),
    ...buildSettingsRows(input.security),
    {
      id: "object-storage-provider",
      cells: {
        category: systemAdminSecurityUiCopy.objectStorageProvider.postureCategory,
        setting: systemAdminSecurityUiCopy.objectStorageProvider.postureSetting,
        value: resolveEffectiveObjectStorageProviderLabel({
          organizationProvider: input.objectStorageProvider,
          deploymentProvider: input.deploymentProvider,
        }),
      },
    },
    {
      id: "object-storage-encryption-mode",
      cells: {
        category: systemAdminSecurityUiCopy.objectStorageEncryption.postureCategory,
        setting: systemAdminSecurityUiCopy.objectStorageEncryption.postureSetting,
        value: formatEncryptionModeLabel(input.encryptionSettings.mode),
      },
    },
    {
      id: "object-storage-kms-adapter",
      cells: {
        category: systemAdminSecurityUiCopy.objectStorageEncryption.postureCategory,
        setting: systemAdminSecurityUiCopy.objectStorageEncryption.kmsAdapterPostureSetting,
        value: formatKmsAdapterLabel(input.encryptionSettings.kmsAdapter),
      },
    },
  ];

  return buildLinkedControlListSurface({
    key: systemAdminSecuritySurfaceKey,
    title: systemAdminSecurityUiCopy.posture.title,
    object: "security",
    columns: [
      { id: "category", header: "Category", priority: "primary", pin: "start" },
      { id: "setting", header: "Setting" },
      { id: "value", header: "Value", cellKind: { kind: "badge" } },
    ],
    rows,
    emptyTitle: systemAdminSecurityUiCopy.posture.emptyTitle,
    emptyDescription: systemAdminSecurityUiCopy.posture.emptyDescription,
    searchPlaceholder: systemAdminSecurityUiCopy.posture.searchPlaceholder,
  });
}
