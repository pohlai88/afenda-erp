import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import { buildSystemAdminListToolbar } from "../../overview/surfaces/system-admin.list-surface.shared";
import type { SystemAdminAuditEventRow } from "../contracts/system-admin.audit-event.contract";
import type { SystemAdminAuditSearchParams } from "../schemas/system-admin.audit-filter.schema";
import { systemAdminAuditUiCopy } from "./system-admin.audit-ui.copy.shared";
import {
  buildSystemAdminAuditEventDetailHref,
  buildSystemAdminAuditPageHref,
} from "./system-admin.audit-pagination.shared";

export const systemAdminAuditViewerSurfaceKey = "system-admin.audit-viewer.list";

const AUDIT_MODULE_FILTER_OPTIONS = [
  { label: "System admin", value: "system-admin" },
  { label: "Tenant", value: "tenant" },
  { label: "Finance", value: "finance" },
  { label: "Purchasing", value: "purchasing" },
  { label: "Inventory", value: "inventory" },
] as const;

const AUDIT_VIEWER_COLUMNS = [
  {
    id: "occurredAt",
    header: "Time",
    priority: "primary" as const,
    pin: "start" as const,
  },
  { id: "actorId", header: "Actor" },
  { id: "action", header: "Action" },
  { id: "target", header: "Target" },
  { id: "moduleKey", header: "Module" },
  { id: "result", header: "Result", cellKind: { kind: "badge" as const } },
  {
    id: "summary",
    header: "Evidence",
    cellKind: { kind: "link" as const },
  },
] as const;

export function buildSystemAdminAuditViewerListSurface(input: {
  rows: readonly SystemAdminAuditEventRow[];
  params: SystemAdminAuditSearchParams;
  searchValue?: string;
  totalCount: number;
  pageSize: number;
  page: number;
  hasNextPage: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const toolbar = buildSystemAdminListToolbar({
    scope: "audit",
    searchPlaceholder: systemAdminAuditUiCopy.auditList.searchPlaceholder,
    sortColumn: "occurredAt",
    searchValue: input.searchValue,
    filters: [
      {
        id: "targetType",
        label: "Target type",
        param: "auditTargetType",
        options: [
          { label: "Organization", value: "organization" },
          { label: "Membership", value: "membership" },
          { label: "User profile", value: "user-profile" },
          { label: "ERP record", value: "erp-record" },
          { label: "Workflow", value: "workflow-item" },
          { label: "Document", value: "document" },
          { label: "System", value: "system" },
        ],
      },
      {
        id: "module",
        label: "Module",
        param: "auditModule",
        options: [...AUDIT_MODULE_FILTER_OPTIONS],
      },
    ],
  });

  const currentPage = input.page;
  const previousPage = Math.max(1, currentPage - 1);
  const nextPage = currentPage + 1;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: {
        ...toolbar,
        resetParams: [
          ...(toolbar.resetParams ?? []),
          "auditFrom",
          "auditTo",
          "auditTargetId",
          "auditPage",
          "auditPageSize",
          "auditId",
        ],
      },
    },
    requiresErpPermission: {
      module: "system-admin",
      object: "audit",
      function: "read",
    },
    pagination: {
      pageSize: Math.max(1, input.pageSize),
      totalCount: input.totalCount,
      hasNextPage: input.hasNextPage,
      ...(currentPage > 1
        ? {
            prevHref: buildSystemAdminAuditPageHref(input.params, previousPage),
          }
        : {}),
      ...(input.hasNextPage
        ? {
            nextHref: buildSystemAdminAuditPageHref(input.params, nextPage),
          }
        : {}),
    },
    surface: {
      header: { title: systemAdminAuditUiCopy.auditList.surfaceHeaderTitle },
      columnsId: "system-admin-audit-viewer",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: systemAdminAuditUiCopy.auditList.emptyTitle,
        description: systemAdminAuditUiCopy.auditList.emptyDescription,
      },
    },
    columns: [...AUDIT_VIEWER_COLUMNS],
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: {
        occurredAt: row.occurredAt,
        actorId: row.actorId,
        action: row.action,
        target: row.target,
        moduleKey: row.moduleKey,
        result: row.result,
        summary: row.summary,
      },
      rowHref: buildSystemAdminAuditEventDetailHref(input.params, row.id),
      linkColumnId: "summary",
      cellKinds: {
        result: { kind: "badge", tone: "default" },
        summary: {
          kind: "link",
          href: buildSystemAdminAuditEventDetailHref(input.params, row.id),
        },
      },
    })),
  });
}
