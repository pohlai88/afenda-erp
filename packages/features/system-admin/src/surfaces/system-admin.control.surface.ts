import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import type {
  TenantApprovalSettingRow,
  TenantModuleSettingRow,
  TenantPolicySettingRow,
  TenantSecuritySettingsSnapshot,
  TenantSettingsSnapshot,
} from "@afenda/db";
import type { AppCapability } from "@afenda/auth";
import type { ExecutionCapability } from "@afenda/kernel/execution";
import {
  buildSystemAdminListToolbar,
  buildSystemAdminStaticPagination,
} from "./system-admin.list-surface.shared";

type BasicRow = {
  id: string;
  [key: string]: string;
};

function buildControlListSurface(input: {
  key: string;
  title: string;
  object: string;
  columns: ReadonlyArray<{
    id: string;
    header: string;
    priority?: "primary";
    pin?: "start";
  }>;
  rows: readonly BasicRow[];
  emptyTitle: string;
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: buildSystemAdminListToolbar({
        scope: input.object,
        searchPlaceholder: `Search ${input.object}`,
        sortColumn: input.columns[0]?.id ?? "id",
      }),
    },
    requiresErpPermission: {
      module: "system-admin",
      object: input.object,
      function: "read",
    },
    pagination: buildSystemAdminStaticPagination(input.rows.length),
    surface: {
      header: { title: input.title },
      columnsId: input.key,
      rowKey: "id",
      empty: { variant: "muted", title: input.emptyTitle },
    },
    columns: [...input.columns],
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: row,
    })),
  });
}

export const systemAdminPermissionsSurfaceKey =
  "system-admin.permissions.list";
export const systemAdminModulesSurfaceKey = "system-admin.modules.list";
export const systemAdminCapabilitiesSurfaceKey =
  "system-admin.capabilities.list";
export const systemAdminPoliciesSurfaceKey = "system-admin.policies.list";
export const systemAdminApprovalsSurfaceKey = "system-admin.approvals.list";
export const systemAdminSecuritySurfaceKey = "system-admin.security.list";
export const systemAdminOrganizationSurfaceKey =
  "system-admin.organization.list";
export const systemAdminDiagnosticsSurfaceKey =
  "system-admin.diagnostics.list";

export function buildPermissionsListSurface(input: {
  permissions: ReadonlyArray<{
    value: AppCapability;
    label: string;
    description: string;
  }>;
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildControlListSurface({
    key: systemAdminPermissionsSurfaceKey,
    title: "Permission catalog",
    object: "permissions",
    columns: [
      { id: "permission", header: "Permission", priority: "primary", pin: "start" },
      { id: "label", header: "Label" },
      { id: "description", header: "Description" },
    ],
    rows: input.permissions.map((permission) => ({
      id: permission.value,
      permission: permission.value,
      label: permission.label,
      description: permission.description,
    })),
    emptyTitle: "No permissions are registered.",
  });
}

export function buildModulesListSurface(input: {
  modules: ReadonlyArray<{
    id: string;
    label: string;
    href: string;
    requiredCapability: string;
  }>;
  settings: readonly TenantModuleSettingRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  const settingsByModule = new Map(
    input.settings.map((setting) => [setting.moduleKey, setting]),
  );

  return buildControlListSurface({
    key: systemAdminModulesSurfaceKey,
    title: "Module readiness",
    object: "modules",
    columns: [
      { id: "module", header: "Module", priority: "primary", pin: "start" },
      { id: "enabled", header: "Enabled" },
      { id: "visible", header: "Visible" },
      { id: "readiness", header: "Readiness" },
      { id: "permission", header: "Permission" },
    ],
    rows: input.modules.map((module) => {
      const setting = settingsByModule.get(module.id);

      return {
        id: module.id,
        module: module.label,
        enabled: setting?.enabled === false ? "No" : "Yes",
        visible: setting?.visible === false ? "No" : "Yes",
        readiness: setting?.readiness ?? "active",
        permission: module.requiredCapability,
      };
    }),
    emptyTitle: "No modules are registered.",
  });
}

export function buildCapabilitiesListSurface(input: {
  capabilities: readonly ExecutionCapability[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildControlListSurface({
    key: systemAdminCapabilitiesSurfaceKey,
    title: "Execution capabilities",
    object: "capabilities",
    columns: [
      { id: "capability", header: "Capability", priority: "primary", pin: "start" },
      { id: "module", header: "Module" },
      { id: "route", header: "Route" },
      { id: "status", header: "Status" },
    ],
    rows: input.capabilities.map((capability) => ({
      id: capability.key,
      capability: capability.key,
      module: capability.moduleKey,
      route: capability.route ?? "Not routed",
      status: capability.status,
    })),
    emptyTitle: "No execution capabilities are registered.",
  });
}

export function buildPoliciesListSurface(input: {
  policies: readonly TenantPolicySettingRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildControlListSurface({
    key: systemAdminPoliciesSurfaceKey,
    title: "Policy settings",
    object: "policies",
    columns: [
      { id: "policy", header: "Policy", priority: "primary", pin: "start" },
      { id: "enabled", header: "Enabled" },
      { id: "readiness", header: "Readiness" },
    ],
    rows: input.policies.map((policy) => ({
      id: policy.id,
      policy: policy.label,
      enabled: policy.enabled ? "Yes" : "No",
      readiness: policy.readiness,
    })),
    emptyTitle: "No tenant policies have been configured.",
  });
}

export function buildApprovalsListSurface(input: {
  approvals: readonly TenantApprovalSettingRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildControlListSurface({
    key: systemAdminApprovalsSurfaceKey,
    title: "Approval settings",
    object: "approvals",
    columns: [
      { id: "approval", header: "Approval", priority: "primary", pin: "start" },
      { id: "enabled", header: "Enabled" },
      { id: "approverRole", header: "Approver role" },
      { id: "escalation", header: "Escalation" },
    ],
    rows: input.approvals.map((approval) => ({
      id: approval.id,
      approval: approval.label,
      enabled: approval.enabled ? "Yes" : "No",
      approverRole: approval.approverRole ?? "Not assigned",
      escalation: approval.escalationMinutes
        ? `${approval.escalationMinutes} minutes`
        : "Not configured",
    })),
    emptyTitle: "No tenant approvals have been configured.",
  });
}

export function buildSecuritySettingsListSurface(input: {
  security: TenantSecuritySettingsSnapshot | null;
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
        setting: "MFA required",
        value: security?.mfaRequired ? "Enabled" : "Disabled",
      },
      {
        id: "trusted-domains",
        setting: "Trusted domains",
        value: security?.trustedDomains.join(", ") || "Not restricted",
      },
      {
        id: "sensitive-confirmation",
        setting: "Sensitive action confirmation",
        value: security?.sensitiveActionConfirmation === false ? "Disabled" : "Enabled",
      },
      {
        id: "session-timeout",
        setting: "Session timeout",
        value:
          typeof security?.sessionPolicy.sessionTimeoutMinutes === "number"
            ? `${security.sessionPolicy.sessionTimeoutMinutes} minutes`
            : "Default",
      },
    ],
    emptyTitle: "Security settings are not initialized.",
  });
}

export function buildOrganizationDefaultsListSurface(input: {
  settings: TenantSettingsSnapshot | null;
  organizationName: string;
}): ListSurfaceRendererConfigurationResolvedInput {
  const settings = input.settings;

  return buildControlListSurface({
    key: systemAdminOrganizationSurfaceKey,
    title: "Organization defaults",
    object: "organization",
    columns: [
      { id: "setting", header: "Setting", priority: "primary", pin: "start" },
      { id: "value", header: "Value" },
    ],
    rows: [
      { id: "name", setting: "Organization", value: input.organizationName },
      { id: "timezone", setting: "Timezone", value: settings?.timezone ?? "UTC" },
      { id: "locale", setting: "Locale", value: settings?.locale ?? "en-US" },
      { id: "currency", setting: "Currency", value: settings?.currency ?? "USD" },
      {
        id: "fiscal",
        setting: "Fiscal year start month",
        value: String(settings?.fiscalYearStartMonth ?? 1),
      },
      {
        id: "document-prefix",
        setting: "Document prefix",
        value: String(settings?.documentPrefixes.default ?? "AFD"),
      },
      {
        id: "numbering-prefix",
        setting: "Numbering prefix",
        value: String(settings?.numbering.defaultPrefix ?? "AFD"),
      },
    ],
    emptyTitle: "Organization defaults are not initialized.",
  });
}

export function buildDiagnosticsListSurface(input: {
  rows: ReadonlyArray<{ id: string; check: string; status: string; detail: string }>;
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildControlListSurface({
    key: systemAdminDiagnosticsSurfaceKey,
    title: "Diagnostics checklist",
    object: "diagnostics",
    columns: [
      { id: "check", header: "Check", priority: "primary", pin: "start" },
      { id: "status", header: "Status" },
      { id: "detail", header: "Detail" },
    ],
    rows: input.rows,
    emptyTitle: "No diagnostics are available.",
  });
}
