import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import type { ModuleWorkspaceListQuery } from "@afenda/kernel";

import type { ApprovalQueueListRow } from "../contracts/approvals.queue.contract";
import { resolveApprovalQueueRowTrailingAction } from "./approvals-queue-list-trailing.shared";
import { approvalsUiCopy } from "./approvals-ui.copy.shared";

export const approvalsQueueSurfaceKey = "approvals.queue.list";

type ApprovalQueueWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  nextCursor?: string;
};

function resolveQueueRowTone(item: ApprovalQueueListRow) {
  if (item.escalated || item.priority === "high") {
    return "critical" as const;
  }

  if (item.status === "in-review" || item.priority === "medium") {
    return "attention" as const;
  }

  return "default" as const;
}

function buildQueuePagination(
  window: ApprovalQueueWindow | undefined,
  rowCount: number,
) {
  if (!window) {
    return {
      pageSize: Math.max(1, rowCount),
      totalCount: rowCount,
      hasNextPage: false,
    };
  }

  return {
    pageSize: Math.max(1, window.pageSize),
    totalCount: window.totalCount,
    hasNextPage: window.hasNextPage,
    ...(window.hasNextPage && window.nextCursor
      ? { nextCursor: window.nextCursor }
      : {}),
  };
}

export function buildApprovalQueueListSurface(input: {
  rows: readonly ApprovalQueueListRow[];
  window?: ApprovalQueueWindow;
  query?: ModuleWorkspaceListQuery;
  canDecide?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const canDecide = input.canDecide ?? false;
  const copy = approvalsUiCopy.queue;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-exception-table",
    requiresErpPermission: {
      module: "approvals",
      object: "work-items",
      function: "read",
    },
    pagination: buildQueuePagination(input.window, input.rows.length),
    surface: {
      header: { title: copy.title },
      columnsId: "approvals-queue",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: copy.emptyTitle,
        description: canDecide
          ? copy.emptyDescription
          : copy.emptyDescriptionReadOnly,
      },
    },
    columns: [
      {
        id: "subject",
        header: copy.columns.subject,
        priority: "primary",
        pin: "start",
        wrap: true,
        minWidth: 220,
      },
      { id: "owner", header: copy.columns.owner },
      { id: "route", header: copy.columns.route },
      {
        id: "status",
        header: copy.columns.status,
        cellKind: { kind: "badge" },
      },
      {
        id: "priority",
        header: copy.columns.priority,
        cellKind: { kind: "badge", tone: "attention" },
      },
      { id: "due", header: copy.columns.due },
      { id: "escalation", header: copy.columns.escalation },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      rowHref: `/approvals/work-items/${encodeURIComponent(row.id)}`,
      linkColumnId: "subject",
      rowTone: resolveQueueRowTone(row),
      trailingAction: resolveApprovalQueueRowTrailingAction({
        decisionComplete: row.decisionComplete,
        canDecide,
      }),
      cells: {
        subject: row.subject,
        owner: row.owner,
        route: row.route,
        status: row.status,
        priority: row.priority,
        due: row.dueAt,
        escalation: row.escalated ? "Escalated" : "—",
      },
    })),
  });
}
