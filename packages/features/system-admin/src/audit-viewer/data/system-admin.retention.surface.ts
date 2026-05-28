import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import {
  buildSystemAdminListToolbar,
  buildSystemAdminStaticPagination,
} from "../../surfaces/system-admin.list-surface.shared";

export const systemAdminRetentionSurfaceKey = "system-admin.retention.list";

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
] as const;

export function buildSystemAdminRetentionPoliciesListSurface(input: {
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
    columns: [...RETENTION_COLUMNS],
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
