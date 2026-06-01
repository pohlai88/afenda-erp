import type {
  ListColumn,
  ListSurfaceRendererConfigurationResolvedInput,
  ListSurfaceRow,
  ListSurfaceToolbar,
} from "@afenda/governed-surface/schemas";
import type { ModuleWorkspaceListQuery } from "@afenda/kernel";

import { linkCell } from "../../overview/surfaces/system-admin.control-list.shared";
import { systemAdminRoutePaths } from "../../overview/contracts/system-admin.route-paths.contract";
import type { SystemAdminApprovalQueueListRow } from "../contracts/system-admin.approvals-queue.contract";
import { resolveSystemAdminApprovalQueueRowTrailingAction } from "./system-admin.approvals-queue-list-trailing.shared";
import { systemAdminApprovalsUiCopy } from "./system-admin.approvals-ui.copy.shared";

export type SystemAdminApprovalQueueWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  nextCursor?: string;
};

function decodeQueueWindowOffset(cursor: string | undefined) {
  const match = cursor ? /^offset:(\d+)$/.exec(cursor) : null;
  return match ? Number(match[1]) : 0;
}

export function buildSystemAdminApprovalQueuePageHref(
  query: ModuleWorkspaceListQuery | undefined,
  cursor?: string,
) {
  const params = new URLSearchParams();

  if (query?.workItemsSort) {
    params.set("workItemsSort", query.workItemsSort);
  }
  if (query?.workItemsStatus) {
    params.set("workItemsStatus", query.workItemsStatus);
  }
  if (query?.workItemsPriority) {
    params.set("workItemsPriority", query.workItemsPriority);
  }
  if (cursor) {
    params.set("workItemsCursor", cursor);
  }

  const queryString = params.toString();
  return queryString
    ? `${systemAdminRoutePaths.approvals}?${queryString}`
    : systemAdminRoutePaths.approvals;
}

export function buildSystemAdminApprovalQueuePagination(input: {
  window?: SystemAdminApprovalQueueWindow;
  rowCount: number;
  query?: ModuleWorkspaceListQuery;
}): NonNullable<ListSurfaceRendererConfigurationResolvedInput["pagination"]> {
  const pagination = input.window
    ? {
        pageSize: Math.max(1, input.window.pageSize),
        totalCount: input.window.totalCount,
        hasNextPage: input.window.hasNextPage,
        ...(input.window.hasNextPage && input.window.nextCursor
          ? { nextCursor: input.window.nextCursor }
          : {}),
      }
    : {
        pageSize: Math.max(1, input.rowCount),
        totalCount: input.rowCount,
        hasNextPage: false,
      };

  if (!input.window || !input.query) {
    return pagination;
  }

  const currentOffset = decodeQueueWindowOffset(input.query.workItemsCursor);
  const pageSize = Math.max(1, input.window.pageSize);
  const previousOffset = Math.max(0, currentOffset - pageSize);

  return {
    ...pagination,
    ...(currentOffset > 0
      ? {
          prevCursor:
            previousOffset > 0 ? `offset:${previousOffset}` : undefined,
          prevHref: buildSystemAdminApprovalQueuePageHref(
            input.query,
            previousOffset > 0 ? `offset:${previousOffset}` : undefined,
          ),
        }
      : {}),
    ...(pagination.hasNextPage && input.window.nextCursor
      ? {
          nextHref: buildSystemAdminApprovalQueuePageHref(
            input.query,
            input.window.nextCursor,
          ),
        }
      : {}),
  };
}

const SYSTEM_ADMIN_APPROVAL_QUEUE_TOOLBAR = {
  filters: [
    {
      id: "approval-queue-status",
      label: systemAdminApprovalsUiCopy.queue.columns.status,
      param: "workItemsStatus",
      options: [
        { label: systemAdminApprovalsUiCopy.queue.statusLabels.pending, value: "pending" },
        {
          label: systemAdminApprovalsUiCopy.queue.statusLabels["in-review"],
          value: "in-review",
        },
        {
          label: systemAdminApprovalsUiCopy.queue.statusLabels.escalated,
          value: "escalated",
        },
        {
          label: systemAdminApprovalsUiCopy.queue.statusLabels.scheduled,
          value: "scheduled",
        },
        {
          label: systemAdminApprovalsUiCopy.queue.statusLabels.completed,
          value: "completed",
        },
      ],
    },
    {
      id: "approval-queue-priority",
      label: systemAdminApprovalsUiCopy.queue.columns.priority,
      param: "workItemsPriority",
      options: [
        { label: systemAdminApprovalsUiCopy.queue.priorityLabels.high, value: "high" },
        {
          label: systemAdminApprovalsUiCopy.queue.priorityLabels.medium,
          value: "medium",
        },
        { label: systemAdminApprovalsUiCopy.queue.priorityLabels.low, value: "low" },
      ],
    },
  ],
  sort: {
    label: systemAdminApprovalsUiCopy.queue.toolbar.sortLabel,
    param: "workItemsSort",
    options: [
      {
        label: systemAdminApprovalsUiCopy.queue.toolbar.sortOptions.dueAsc,
        value: "due-asc",
        columnId: "due",
        direction: "asc" as const,
      },
      {
        label: systemAdminApprovalsUiCopy.queue.toolbar.sortOptions.priorityDesc,
        value: "priority-desc",
        columnId: "priority",
        direction: "desc" as const,
      },
    ],
  },
  resetParams: ["workItemsCursor"],
  columnPicker: true,
} as const satisfies ListSurfaceToolbar;

export function applySystemAdminApprovalQueueToolbarState(
  query?: ModuleWorkspaceListQuery,
): ListSurfaceToolbar {
  return {
    ...SYSTEM_ADMIN_APPROVAL_QUEUE_TOOLBAR,
    filters: SYSTEM_ADMIN_APPROVAL_QUEUE_TOOLBAR.filters.map((filter) => ({
      ...filter,
      value:
        filter.param === "workItemsStatus"
          ? query?.workItemsStatus
          : query?.workItemsPriority,
    })),
    sort: {
      ...SYSTEM_ADMIN_APPROVAL_QUEUE_TOOLBAR.sort,
      value: query?.workItemsSort,
    },
  };
}

type QueueCellKind = NonNullable<ListSurfaceRow["cellKinds"]>[string];
type QueueListCellTone = "default" | "positive" | "attention" | "critical";

export type SystemAdminApprovalQueueWorkItemStatus =
  keyof typeof systemAdminApprovalsUiCopy.queue.statusLabels;

export type SystemAdminApprovalQueueWorkItemPriority =
  keyof typeof systemAdminApprovalsUiCopy.queue.priorityLabels;

export const systemAdminApprovalQueueStatusLabels =
  systemAdminApprovalsUiCopy.queue.statusLabels;

export const systemAdminApprovalQueuePriorityLabels =
  systemAdminApprovalsUiCopy.queue.priorityLabels;

export const systemAdminApprovalQueueEscalationLabels =
  systemAdminApprovalsUiCopy.queue.escalationLabels;

const APPROVAL_QUEUE_STATUS_BADGE_TONES = {
  pending: "default",
  "in-review": "attention",
  escalated: "critical",
  scheduled: "default",
  completed: "positive",
} as const satisfies Record<
  SystemAdminApprovalQueueWorkItemStatus,
  QueueListCellTone
>;

const APPROVAL_QUEUE_PRIORITY_BADGE_TONES = {
  low: "default",
  medium: "attention",
  high: "critical",
} as const satisfies Record<
  SystemAdminApprovalQueueWorkItemPriority,
  QueueListCellTone
>;

function isKnownQueueStatus(
  status: string,
): status is SystemAdminApprovalQueueWorkItemStatus {
  return status in systemAdminApprovalQueueStatusLabels;
}

function isKnownQueuePriority(
  priority: string,
): priority is SystemAdminApprovalQueueWorkItemPriority {
  return priority in systemAdminApprovalQueuePriorityLabels;
}

function queueBadgeCellKind(tone: QueueListCellTone): QueueCellKind {
  return { kind: "badge", tone };
}

export function approvalQueueWorkItemStatusBadgeCellKind(
  status: string,
): QueueCellKind {
  const tone = isKnownQueueStatus(status)
    ? APPROVAL_QUEUE_STATUS_BADGE_TONES[status]
    : "default";

  return queueBadgeCellKind(tone);
}

export function approvalQueueWorkItemPriorityBadgeCellKind(
  priority: string,
): QueueCellKind {
  const tone = isKnownQueuePriority(priority)
    ? APPROVAL_QUEUE_PRIORITY_BADGE_TONES[priority]
    : "default";

  return queueBadgeCellKind(tone);
}

export function resolveApprovalQueueStatusLabel(status: string): string {
  if (isKnownQueueStatus(status)) {
    return systemAdminApprovalQueueStatusLabels[status];
  }

  return status;
}

export function resolveApprovalQueuePriorityLabel(priority: string): string {
  if (isKnownQueuePriority(priority)) {
    return systemAdminApprovalQueuePriorityLabels[priority];
  }

  return priority;
}

export function resolveApprovalQueueEscalationLabel(escalated: boolean): string {
  return escalated
    ? systemAdminApprovalQueueEscalationLabels.escalated
    : systemAdminApprovalQueueEscalationLabels.none;
}

export function resolveApprovalQueueWorkItemHref(workItemId: string): string {
  return `/approvals/work-items/${encodeURIComponent(workItemId)}`;
}

export function resolveApprovalQueueListRowTone(
  row: Pick<
    SystemAdminApprovalQueueListRow,
    "status" | "priority" | "escalated"
  >,
): NonNullable<ListSurfaceRow["rowTone"]> {
  if (row.escalated || row.priority === "high") {
    return "critical";
  }

  if (row.status === "in-review" || row.priority === "medium") {
    return "attention";
  }

  return "default";
}

export function buildSystemAdminApprovalsQueueListColumns(
  columns = systemAdminApprovalsUiCopy.queue.columns,
): ListColumn[] {
  return [
    {
      id: "subject",
      header: columns.subject,
      priority: "primary",
      pin: "start",
      wrap: true,
      minWidth: 220,
      cellKind: { kind: "link" },
    },
    { id: "owner", header: columns.owner },
    { id: "route", header: columns.route, wrap: true, minWidth: 120 },
    {
      id: "status",
      header: columns.status,
      cellKind: { kind: "badge" },
    },
    {
      id: "priority",
      header: columns.priority,
      cellKind: { kind: "badge" },
    },
    { id: "due", header: columns.due },
    { id: "escalation", header: columns.escalation },
  ];
}

export function mapApprovalQueueRowToListSurfaceRow(input: {
  row: SystemAdminApprovalQueueListRow;
  canDecide: boolean;
}): Pick<
  ListSurfaceRow,
  | "id"
  | "cells"
  | "rowHref"
  | "linkColumnId"
  | "cellKinds"
  | "trailingAction"
  | "rowTone"
> {
  const { row } = input;
  const workItemHref = resolveApprovalQueueWorkItemHref(row.id);

  return {
    id: row.id,
    rowHref: workItemHref,
    linkColumnId: "subject",
    rowTone: resolveApprovalQueueListRowTone(row),
    trailingAction: resolveSystemAdminApprovalQueueRowTrailingAction({
      decisionComplete: row.decisionComplete,
      canDecide: input.canDecide,
    }),
    cells: {
      subject: row.subject,
      owner: row.owner,
      route: row.route,
      status: resolveApprovalQueueStatusLabel(row.status),
      priority: resolveApprovalQueuePriorityLabel(row.priority),
      due: row.due,
      escalation: resolveApprovalQueueEscalationLabel(row.escalated),
    },
    cellKinds: {
      subject: linkCell(workItemHref),
      status: approvalQueueWorkItemStatusBadgeCellKind(row.status),
      priority: approvalQueueWorkItemPriorityBadgeCellKind(row.priority),
    },
  };
}
