import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import type {
  ListColumn,
  ListSurfaceRow,
} from "@afenda/governed-surface/schemas";
import type { TenantSettingsSnapshot } from "@afenda/db";
import { systemAdminControlLinks } from "../contracts/system-admin.control-links.contract";
import {
  buildSystemAdminListToolbar,
  buildSystemAdminStaticPagination,
} from "./system-admin.list-surface.shared";

type BasicRow = {
  id: string;
  [key: string]: string;
};

type LinkedControlRow = Pick<
  ListSurfaceRow,
  "id" | "cells" | "rowHref" | "linkColumnId" | "cellKinds"
>;

export function buildControlListSurface(input: {
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
  searchValue?: string;
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildLinkedControlListSurface({
    ...input,
    columns: [...input.columns],
    rows: input.rows.map((row) => {
      const { id, ...cells } = row;
      return { id, cells };
    }),
  });
}

export function buildLinkedControlListSurface(input: {
  key: string;
  title: string;
  object: string;
  columns: ReadonlyArray<ListColumn>;
  rows: readonly LinkedControlRow[];
  emptyTitle: string;
  searchValue?: string;
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
        searchValue: input.searchValue,
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
    rows: [...input.rows],
  });
}

export function linkCell(href: string): NonNullable<ListSurfaceRow["cellKinds"]>[string] {
  return { kind: "link", href };
}

export function catalogStatusBadge(
  status: string,
): NonNullable<ListSurfaceRow["cellKinds"]>[string] {
  if (status === "orphan" || status === "disabled" || status === "deprecated") {
    return { kind: "badge", tone: "critical" };
  }

  if (status === "unused" || status === "preview") {
    return { kind: "badge", tone: "attention" };
  }

  return { kind: "badge", tone: "positive" };
}

function riskLevelBadge(
  riskLevel: string,
): NonNullable<ListSurfaceRow["cellKinds"]>[string] {
  if (riskLevel === "elevated") {
    return { kind: "badge", tone: "critical" };
  }

  if (riskLevel === "standard") {
    return { kind: "badge", tone: "attention" };
  }

  return { kind: "badge", tone: "default" };
}

function coverageVerdictBadge(
  verdict: string,
): NonNullable<ListSurfaceRow["cellKinds"]>[string] {
  if (
    verdict === "missing_permission" ||
    verdict === "missing_route" ||
    verdict === "missing_audit" ||
    verdict === "disabled"
  ) {
    return { kind: "badge", tone: "critical" };
  }

  if (verdict === "missing_docs") {
    return { kind: "badge", tone: "attention" };
  }

  return { kind: "badge", tone: "positive" };
}

export const systemAdminPermissionsSurfaceKey =
  "system-admin.permissions.list";
export const systemAdminModulesSurfaceKey = "system-admin.modules.list";
export const systemAdminCapabilitiesSurfaceKey =
  "system-admin.capabilities.list";
export const systemAdminOrganizationSurfaceKey =
  "system-admin.organization.list";
export const systemAdminDiagnosticsSurfaceKey =
  "system-admin.diagnostics.list";

export function buildPermissionsListSurface(input: {
  permissions: ReadonlyArray<{
    id: string;
    permission: string;
    module: string;
    label: string;
    capabilityCount: string;
    roleCount: string;
    status: string;
    riskLevel: string;
  }>;
  searchValue?: string;
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildLinkedControlListSurface({
    key: systemAdminPermissionsSurfaceKey,
    title: "Permission catalog",
    object: "permissions",
    columns: [
      {
        id: "permission",
        header: "Permission",
        priority: "primary",
        pin: "start",
        cellKind: { kind: "link" },
      },
      { id: "module", header: "Module", cellKind: { kind: "link" } },
      { id: "capabilityCount", header: "Capabilities", cellKind: { kind: "link" } },
      { id: "roleCount", header: "Roles", cellKind: { kind: "link" } },
      { id: "status", header: "Status", cellKind: { kind: "badge" } },
      { id: "riskLevel", header: "Risk", cellKind: { kind: "badge" } },
      { id: "label", header: "Label" },
    ],
    rows: input.permissions.map((permission) => ({
      id: permission.id,
      cells: {
        permission: permission.permission,
        module: permission.module,
        capabilityCount: permission.capabilityCount,
        roleCount: permission.roleCount,
        status: permission.status,
        riskLevel: permission.riskLevel,
        label: permission.label,
      },
      rowHref: systemAdminControlLinks.capabilities(permission.permission),
      linkColumnId: "permission",
      cellKinds: {
        permission: linkCell(
          systemAdminControlLinks.capabilities(permission.permission),
        ),
        module: linkCell(systemAdminControlLinks.modules(permission.module)),
        capabilityCount: linkCell(
          systemAdminControlLinks.capabilities(permission.permission),
        ),
        roleCount: linkCell(systemAdminControlLinks.roles()),
        status: catalogStatusBadge(permission.status),
        riskLevel: riskLevelBadge(permission.riskLevel),
      },
    })),
    emptyTitle: "No permissions are registered.",
    searchValue: input.searchValue,
  });
}

export function buildModulesListSurface(input: {
  modules: ReadonlyArray<{
    id: string;
    module: string;
    status: string;
    capabilities: string;
    enabledRoles: string;
    readiness: string;
    permission: string;
    lastChanged: string;
    href?: string;
  }>;
  searchValue?: string;
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildLinkedControlListSurface({
    key: systemAdminModulesSurfaceKey,
    title: "Module readiness",
    object: "modules",
    columns: [
      {
        id: "module",
        header: "Module",
        priority: "primary",
        pin: "start",
        cellKind: { kind: "link" },
      },
      { id: "status", header: "Status", cellKind: { kind: "badge" } },
      { id: "capabilities", header: "Capabilities", cellKind: { kind: "link" } },
      { id: "enabledRoles", header: "Enabled roles", cellKind: { kind: "link" } },
      { id: "readiness", header: "Readiness" },
      { id: "permission", header: "Permission", cellKind: { kind: "link" } },
      { id: "lastChanged", header: "Last changed" },
    ],
    rows: input.modules.map((module) => ({
      id: module.id,
      cells: {
        module: module.module,
        status: module.status,
        capabilities: module.capabilities,
        enabledRoles: module.enabledRoles,
        readiness: module.readiness,
        permission: module.permission,
        lastChanged: module.lastChanged,
      },
      rowHref: systemAdminControlLinks.capabilities(module.id),
      linkColumnId: "module",
      cellKinds: {
        module: linkCell(
          module.href ?? systemAdminControlLinks.capabilities(module.id),
        ),
        capabilities: linkCell(systemAdminControlLinks.capabilities(module.id)),
        enabledRoles: linkCell(systemAdminControlLinks.roles()),
        permission: linkCell(
          systemAdminControlLinks.permissions(module.permission),
        ),
        status: catalogStatusBadge(module.status),
      },
    })),
    emptyTitle: "No modules are registered.",
    searchValue: input.searchValue,
  });
}

export function buildCapabilitiesListSurface(input: {
  capabilities: ReadonlyArray<{
    id: string;
    capability: string;
    module: string;
    route: string;
    requiredPermission: string;
    status: string;
    accessCoverage: string;
    auditCoverage: string;
    docsCoverage: string;
    verdict: string;
    issues: string;
    routeHref?: string;
  }>;
  searchValue?: string;
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildLinkedControlListSurface({
    key: systemAdminCapabilitiesSurfaceKey,
    title: "Execution capabilities",
    object: "capabilities",
    columns: [
      {
        id: "capability",
        header: "Capability",
        priority: "primary",
        pin: "start",
        cellKind: { kind: "link" },
      },
      { id: "module", header: "Module", cellKind: { kind: "link" } },
      { id: "route", header: "Route", cellKind: { kind: "link" } },
      { id: "requiredPermission", header: "Permission", cellKind: { kind: "link" } },
      { id: "status", header: "Status", cellKind: { kind: "badge" } },
      { id: "verdict", header: "Coverage", cellKind: { kind: "badge" } },
      { id: "accessCoverage", header: "Access" },
      { id: "auditCoverage", header: "Audit" },
      { id: "docsCoverage", header: "Docs" },
      { id: "issues", header: "Issues" },
    ],
    rows: input.capabilities.map((capability) => {
      const routeHref =
        capability.routeHref ??
        (capability.route.startsWith("/") ? capability.route : undefined);

      return {
        id: capability.id,
        cells: {
          capability: capability.capability,
          module: capability.module,
          route: capability.route,
          requiredPermission: capability.requiredPermission,
          status: capability.status,
          accessCoverage: capability.accessCoverage,
          auditCoverage: capability.auditCoverage,
          docsCoverage: capability.docsCoverage,
          verdict: capability.verdict,
          issues: capability.issues,
        },
        rowHref: routeHref,
        linkColumnId: "capability",
        cellKinds: {
          capability: linkCell(
            routeHref ?? systemAdminControlLinks.capabilities(capability.capability),
          ),
          module: linkCell(systemAdminControlLinks.modules(capability.module)),
          route: routeHref
            ? linkCell(routeHref)
            : { kind: "text" as const },
          requiredPermission: linkCell(
            systemAdminControlLinks.permissions(capability.requiredPermission),
          ),
          status: catalogStatusBadge(capability.status),
          verdict: coverageVerdictBadge(capability.verdict),
        },
      };
    }),
    emptyTitle: "No execution capabilities are registered.",
    searchValue: input.searchValue,
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

