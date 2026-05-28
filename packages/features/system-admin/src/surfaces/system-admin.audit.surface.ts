import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import { formatErpDateTime } from "@afenda/kernel";
import type { TenantAuditLog } from "@afenda/db";
import {
  buildSystemAdminListToolbar,
  buildSystemAdminStaticPagination,
} from "../surfaces/system-admin.list-surface.shared";

export const systemAdminAuditLogSurfaceKey = "system-admin.audit-log.list";
export const systemAdminRetentionSurfaceKey = "system-admin.retention.list";

const AUDIT_COLUMNS = [
  {
    id: "action",
    header: "Action",
    priority: "primary" as const,
    pin: "start" as const,
  },
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

export function buildAuditLogListSurface(input: {
  logs: readonly TenantAuditLog[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: buildSystemAdminListToolbar({
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
    pagination: buildSystemAdminStaticPagination(input.logs.length),
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
        createdAt: formatErpDateTime(log.createdAt),
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
      toolbar: buildSystemAdminListToolbar({
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
    pagination: buildSystemAdminStaticPagination(input.policies.length),
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
