import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import {
  buildSystemAdminListToolbar,
  buildSystemAdminStaticPagination,
} from "../../overview/surfaces/system-admin.list-surface.shared";
import type { SystemAdminRetentionPolicyListRow } from "../contracts";
import { systemAdminAuditUiCopy } from "./system-admin.audit-ui.copy.shared";

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
  policies: readonly SystemAdminRetentionPolicyListRow[];
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
      object: "audit",
      function: "read",
    },
    pagination: buildSystemAdminStaticPagination(input.policies.length),
    surface: {
      header: { title: systemAdminAuditUiCopy.retentionList.title },
      columnsId: "system-admin-retention",
      rowKey: "entityType",
      empty: {
        variant: "muted",
        title: systemAdminAuditUiCopy.retentionList.emptyTitle,
        description: systemAdminAuditUiCopy.retentionList.emptyDescription,
      },
    },
    columns: [...RETENTION_COLUMNS],
    rows: input.policies.map((policy) => ({
      id: policy.id,
      cells: {
        entityType: policy.entityType,
        retentionDays: policy.retentionDays,
        legalHold: policy.legalHold,
      },
      rowTone:
        policy.legalHold === "On hold"
          ? ("attention" as const)
          : ("default" as const),
      cellKinds: {
        legalHold: {
          kind: "badge",
          tone:
            policy.legalHold === "On hold"
              ? ("attention" as const)
              : ("default" as const),
        },
      },
    })),
  });
}
