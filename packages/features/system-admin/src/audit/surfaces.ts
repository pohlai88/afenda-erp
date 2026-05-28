import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import type { TenantAuditLog } from "@afenda/db";

export const systemAdminAuditLogSurfaceKey = "system-admin.audit-log.list";
export const systemAdminRetentionSurfaceKey = "system-admin.retention.list";

const AUDIT_COLUMNS = [
  { id: "action", header: "Action", priority: "primary" as const, pin: "start" as const },
  { id: "entityType", header: "Entity" },
  { id: "entityId", header: "Entity ID" },
  { id: "summary", header: "Summary" },
  { id: "createdAt", header: "When" },
];

const RETENTION_COLUMNS = [
  {
    id: "entityType",
    header: "Entity type",
    priority: "primary" as const,
    pin: "start" as const,
  },
  { id: "retentionDays", header: "Retention (days)" },
  {
    id: "legalHold",
    header: "Legal hold",
    cellKind: { kind: "badge" as const },
  },
];

function pagination(total: number) {
  return {
    pageSize: Math.max(1, total),
    totalCount: total,
    hasNextPage: false,

  };
}

function toolbar(input: {
  scope: string;
  searchPlaceholder: string;
  sortColumn: string;
  filters?: Array<{
    id: string;
    label: string;
    param: string;
    options: Array<{ label: string; value: string }>;
  }>;
}) {
  return {
    search: {
      param: `${input.scope}Q`,
      label: "Search",
      placeholder: input.searchPlaceholder,
    },
    filters: input.filters,
    sort: {
      label: "Sort",
      param: `${input.scope}Sort`,
      options: [
        {
          label: "Ascending",
          value: "asc",
          columnId: input.sortColumn,
          direction: "asc" as const,
        },
        {
          label: "Descending",
          value: "desc",
          columnId: input.sortColumn,
          direction: "desc" as const,
        },
      ],
    },
    densityToggle: true,
    columnPicker: true,
    resetParams: [
      `${input.scope}Q`,
      `${input.scope}Sort`,
      ...(input.filters ?? []).map((filter) => filter.param),
    ],
  };
}

export function buildAuditLogListSurface(input: {
  logs: readonly TenantAuditLog[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: toolbar({
        scope: "auditLog",
        searchPlaceholder: "Search audit events",
        sortColumn: "createdAt",
        filters: [
          {
            id: "entityType",
            label: "Entity",
            param: "auditEntityType",
            options: [
              { label: "Organization", value: "organization" },
              { label: "Membership", value: "membership" },
              { label: "System", value: "system" },
              { label: "Document", value: "document" },
            ],
          },
        ],
      }),
    },
    requiresErpPermission: {
      module: "system-admin",
      object: "audit-log",
      function: "read",
    },
    pagination: pagination(input.logs.length),
    surface: {
      header: { title: "Tenant audit log" },
      columnsId: "system-admin-audit-log",
      rowKey: "id",
      empty: { variant: "muted", title: "No audit events recorded yet." },
    },
    columns: AUDIT_COLUMNS,
    rows: input.logs.map((log) => ({
      id: log.id,
      cells: {
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        summary: log.summary,
        createdAt: log.createdAt.toLocaleString(),
      },
    })),
  });
}

export function buildRetentionPoliciesListSurface(input: {
  policies: ReadonlyArray<{
    entityType: string;
    retentionDays: number;
    legalHold: boolean;
  }>;
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: toolbar({
        scope: "retention",
        searchPlaceholder: "Search retention policies",
        sortColumn: "entityType",
        filters: [
          {
            id: "legalHold",
            label: "Legal hold",
            param: "retentionLegalHold",
            options: [
              { label: "On hold", value: "on-hold" },
              { label: "Standard", value: "standard" },
            ],
          },
        ],
      }),
    },
    requiresErpPermission: {
      module: "system-admin",
      object: "retention",
      function: "read",
    },
    pagination: pagination(input.policies.length),
    surface: {
      header: { title: "Retention policies" },
      columnsId: "system-admin-retention",
      rowKey: "entityType",
      empty: { variant: "muted", title: "No retention policies configured." },
    },
    columns: RETENTION_COLUMNS,
    rows: input.policies.map((policy) => ({
      id: policy.entityType,
      cells: {
        entityType: policy.entityType,
        retentionDays: String(policy.retentionDays),
        legalHold: policy.legalHold ? "On hold" : "Standard",
      },
      rowTone: policy.legalHold ? ("attention" as const) : ("default" as const),
    })),
  });
}
