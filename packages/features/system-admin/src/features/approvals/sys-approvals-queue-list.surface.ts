import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import type { ModuleWorkspaceListQuery } from "@afenda/kernel";

import type { SystemAdminApprovalQueueListRow } from "../contracts/system-admin.approvals-queue.contract";
import {
  applySystemAdminApprovalQueueToolbarState,
  buildSystemAdminApprovalQueuePagination,
  buildSystemAdminApprovalsQueueListColumns,
  mapApprovalQueueRowToListSurfaceRow,
  type SystemAdminApprovalQueueWindow,
} from "./system-admin.approvals-queue-list.shared";
import { systemAdminApprovalsUiCopy } from "./system-admin.approvals-ui.copy.shared";

export const systemAdminApprovalsQueueSurfaceKey =
  "system-admin.approvals.queue.list";

export type { SystemAdminApprovalQueueWindow };

export function buildSystemAdminApprovalQueueListSurface(input: {
  rows: readonly SystemAdminApprovalQueueListRow[];
  window?: SystemAdminApprovalQueueWindow;
  query?: ModuleWorkspaceListQuery;
  canDecide?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const canDecide = input.canDecide ?? false;
  const copy = systemAdminApprovalsUiCopy.queue;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-exception-table",
    requiresErpPermission: {
      module: "approvals",
      object: "work-items",
      function: "read",
    },
    presentation: {
      toolbar: applySystemAdminApprovalQueueToolbarState(input.query),
    },
    pagination: buildSystemAdminApprovalQueuePagination({
      window: input.window,
      rowCount: input.rows.length,
      query: input.query,
    }),
    surface: {
      header: { title: copy.title },
      columnsId: systemAdminApprovalsQueueSurfaceKey,
      rowKey: "id",
      empty: {
        variant: "muted",
        title: copy.emptyTitle,
        description: canDecide
          ? copy.emptyDescription
          : copy.emptyDescriptionReadOnly,
      },
    },
    columns: buildSystemAdminApprovalsQueueListColumns(copy.columns),
    rows: input.rows.map((row) =>
      mapApprovalQueueRowToListSurfaceRow({ row, canDecide }),
    ),
  });
}
