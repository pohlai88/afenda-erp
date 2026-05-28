import "server-only"

import {
  buildGovernedListSurface,
  governedWorkbenchFocusPresentationPatch,
  GOVERNED_METADATA_SCHEMA_VERSION,
  listSurfaceRowTrailingActionHidden,
  resolveListSurfaceRowTrailingAction,
  type GovernedListSavedViewItem,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"

import type {
  LeaveBalanceRow,
  LeaveRequestRow,
  OrgLeaveRequestRow,
} from "./leave-request.queries.server"

import { hrmEmployeeListRowLinkFields } from "../../../_core/shared"

import {
  LEAVE_EXPORT_REPORT_TRIGGER_ID,
  LEAVE_LIST_SURFACE_IDS,
} from "./leave-surface-metadata.shared"

const LEAVE_READ_PERMISSION = {
  module: "hrm" as const,
  object: "leave" as const,
  function: "read" as const,
}

export function resolveLeaveRowTone(
  state: string
): "default" | "attention" | "critical" {
  if (state === "rejected" || state === "cancelled") return "critical"
  if (state === "submitted" || state === "returned") return "attention"
  return "default"
}

type LeavePendingListCopy = {
  columnsId?: string
  empty: string
  colEmployee: string
  colLeaveType: string
  colDates: string
  colDuration: string
  colRequested: string
}

type LeaveRecentListCopy = {
  columnsId?: string
  empty: string
  colEmployee: string
  colLeaveType: string
  colDates: string
  colState: string
  colUpdated: string
  stateLabelFor: (state: string) => string
  exportReportLabel?: string
}

function listSurfaceHeader(columnsId: string) {
  return { title: columnsId }
}

function formatEmployeeCell(row: OrgLeaveRequestRow): string {
  const name = row.employeeFullName ?? row.employeeId
  return row.employeeNumber ? `${name} · ${row.employeeNumber}` : name
}

function formatLeaveDateRange(row: OrgLeaveRequestRow): string {
  const { startDate, endDate, halfDay } = row
  const halfTag =
    halfDay === "morning" ? " · AM" : halfDay === "afternoon" ? " · PM" : ""
  if (startDate === endDate) {
    return `${startDate}${halfTag}`
  }
  return `${startDate} → ${endDate}`
}

function formatDurationDays(
  row: Pick<OrgLeaveRequestRow, "durationDays" | "halfDay">
): string {
  const days = Number(row.durationDays)
  if (Number.isNaN(days)) return "—"
  if (row.halfDay === "morning" || row.halfDay === "afternoon") {
    return "0.5"
  }
  if (Number.isInteger(days)) return String(days)
  return days.toFixed(2)
}

type LeavePendingListContext = {
  orgSlug: string
  canApproveAll: boolean
  currentUserId: string
  workbenchFocusSearch?: {
    label: string
    placeholder?: string
    value?: string | null
  }
  pendingType?: string | null
  pendingSort?: "requested-desc" | "employee-asc" | null
  savedViewItems?: readonly GovernedListSavedViewItem[]
}

export function buildLeavePendingListSurfaceConfiguration(
  rows: readonly OrgLeaveRequestRow[],
  copy: LeavePendingListCopy,
  context: LeavePendingListContext
): ListSurfaceRendererConfigurationInput {
  const columnsId = copy.columnsId ?? LEAVE_LIST_SURFACE_IDS.pendingInbox
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-exception-table",
    presentation: governedWorkbenchFocusPresentationPatch(
      context.workbenchFocusSearch ?? {
        label: "Search pending leave",
        placeholder: "Search employee, leave type, date, or approver",
      },
      {
        primaryColumnId: "employee",
        narrowMode: "auto",
        toolbar: {
          filters: [
            {
              id: "leave-pending-type",
              label: copy.colLeaveType,
              param: "leavePendingType",
              ...(context.pendingType ? { value: context.pendingType } : {}),
              options:
                rows.length > 0
                  ? Array.from(
                      new Set(rows.map((row) => row.leaveTypeCode ?? "—"))
                    )
                      .sort()
                      .map((value) => ({ label: value, value }))
                  : [{ label: "All leave types", value: "all" }],
            },
          ],
          sort: {
            label: "Sort",
            param: "leavePendingSort",
            ...(context.pendingSort ? { value: context.pendingSort } : {}),
            options: [
              {
                label: copy.colRequested,
                value: "requested-desc",
                columnId: "requested",
                direction: "desc",
              },
              {
                label: copy.colEmployee,
                value: "employee-asc",
                columnId: "employee",
                direction: "asc",
              },
            ],
          },
          savedView: {
            label: "Pending view",
            activeLabel: "Pending approvals",
            href: "?leavePendingSort=requested-desc",
            ...(context.savedViewItems
              ? { items: Array.from(context.savedViewItems) }
              : {}),
          },
          export: {
            actionId: "erp.hrm.leave.pending.export",
            label: "Export pending",
            formats: ["csv"],
          },
          bulkActions: [
            {
              actionId: "erp.hrm.leave.pending.review-selected",
              label: "Review selected",
              disabledReason:
                "Select pending leave rows before reviewing decisions.",
            },
          ],
        },
        selection: {
          mode: "multiple",
          label: "Select pending leave rows",
          bulkScopeLabel: "selected pending leave rows",
        },
        decisionLedger: { enabled: true, label: "Leave decision" },
      }
    ),
    requiresErpPermission: LEAVE_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "employee",
        header: copy.colEmployee,
        priority: "primary",
        pin: "start",
        wrap: true,
        minWidth: 220,
        cellKind: { kind: "link" },
      },
      {
        id: "leaveType",
        header: copy.colLeaveType,
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "dates", header: copy.colDates },
      { id: "duration", header: copy.colDuration },
      {
        id: "requested",
        header: copy.colRequested,
        cellKind: { kind: "datetime" },
      },
    ],
    rows: rows.map((row) => {
      const canDecide =
        context.canApproveAll ||
        row.currentApproverUserId === context.currentUserId
      return {
        id: row.id,
        rowTone: resolveLeaveRowTone(row.state),
        ...hrmEmployeeListRowLinkFields(
          context.orgSlug,
          row.employeeId,
          "employee"
        ),
        cells: {
          employee: formatEmployeeCell(row),
          leaveType: row.leaveTypeCode ?? "—",
          dates: formatLeaveDateRange(row),
          duration: formatDurationDays(row),
          requested: row.requestedAt.toISOString(),
        },
        decisionLedger: {
          reason: row.reason ?? `${row.leaveTypeCode ?? "Leave"} request`,
          policyLabel: row.policyVersion ?? "Leave entitlement policy",
          actorLabel:
            row.currentApproverUserId ?? row.employeeFullName ?? row.employeeId,
          occurredAt: row.requestedAt.toISOString(),
          riskTone:
            row.state === "rejected" || row.state === "cancelled"
              ? "critical"
              : "attention",
          nextActionLabel: canDecide ? "Decide" : "Await approver",
        },
        trailingAction: canDecide
          ? resolveListSurfaceRowTrailingAction({
              allowed: true,
              descriptor: {
                id: "erp.hrm.leave.decide",
                label: "Decide",
                intent: "default",
              },
            })
          : listSurfaceRowTrailingActionHidden(),
      }
    }),
  })
}

export function buildLeaveRecentListSurfaceConfiguration(
  rows: readonly OrgLeaveRequestRow[],
  orgSlug: string,
  copy: LeaveRecentListCopy
): ListSurfaceRendererConfigurationInput {
  const columnsId = copy.columnsId ?? LEAVE_LIST_SURFACE_IDS.recent
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: LEAVE_READ_PERMISSION,
    presentation: {
      primaryColumnId: "employee",
      narrowMode: "auto",
      toolbar: {
        search: {
          param: "leaveSearch",
          label: "Search leave",
          placeholder: "Search employee, type, or state",
        },
        filters: [
          {
            id: "leave-state",
            label: copy.colState,
            param: "leaveState",
            options:
              rows.length > 0
                ? Array.from(new Set(rows.map((row) => row.state)))
                    .sort()
                    .map((value) => ({
                      label: copy.stateLabelFor(value),
                      value,
                    }))
                : [{ label: "All states", value: "all" }],
          },
        ],
        sort: {
          label: "Sort",
          param: "leaveSort",
          options: [
            {
              label: copy.colUpdated,
              value: "updated-desc",
              columnId: "updated",
              direction: "desc",
            },
            {
              label: copy.colEmployee,
              value: "employee-asc",
              columnId: "employee",
              direction: "asc",
            },
          ],
        },
        savedView: {
          label: "Leave view",
          activeLabel: "Recent leave",
          href: "?leaveSort=updated-desc",
        },
        bulkActions: [
          {
            actionId: "erp.hrm.leave.review-selected",
            label: "Review selected",
            disabledReason: "Select leave rows before reviewing policy status.",
          },
        ],
        ...(copy.exportReportLabel
          ? {
              export: {
                actionId: "erp.hrm.leave.export.requests",
                label: copy.exportReportLabel,
                formats: ["csv"],
                triggerElementId: LEAVE_EXPORT_REPORT_TRIGGER_ID,
              },
            }
          : {}),
      },
      selection: {
        mode: "multiple",
        label: "Select leave rows",
        bulkScopeLabel: "selected leave rows",
      },
      decisionLedger: { enabled: true, label: "Leave decision" },
    },
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "employee",
        header: copy.colEmployee,
        priority: "primary",
        pin: "start",
        wrap: true,
        minWidth: 220,
        cellKind: { kind: "link" },
      },
      {
        id: "leaveType",
        header: copy.colLeaveType,
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "dates", header: copy.colDates },
      {
        id: "state",
        header: copy.colState,
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "updated",
        header: copy.colUpdated,
        cellKind: { kind: "datetime" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      rowTone: resolveLeaveRowTone(row.state),
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: formatEmployeeCell(row),
        leaveType: row.leaveTypeCode ?? "—",
        dates:
          row.startDate === row.endDate
            ? row.startDate
            : `${row.startDate} → ${row.endDate}`,
        state: copy.stateLabelFor(row.state),
        updated: (row.approvedAt ?? row.updatedAt).toISOString(),
      },
      decisionLedger: {
        reason: `${row.leaveTypeCode ?? "Leave"} ${formatLeaveDateRange(row)}`,
        policyLabel: "Leave entitlement policy",
        actorLabel:
          row.currentApproverUserId ?? row.employeeFullName ?? row.employeeId,
        occurredAt: (row.approvedAt ?? row.updatedAt).toISOString(),
        riskTone:
          row.state === "rejected" || row.state === "cancelled"
            ? "critical"
            : row.state === "submitted" || row.state === "returned"
              ? "attention"
              : "default",
        nextActionLabel: copy.stateLabelFor(row.state),
      },
      trailingAction:
        row.state === "approved" || row.state === "submitted"
          ? resolveListSurfaceRowTrailingAction({
              allowed: true,
              descriptor: {
                id: "erp.hrm.leave.cancel",
                label: "Cancel",
                intent: "destructive",
              },
            })
          : listSurfaceRowTrailingActionHidden(),
    })),
  })
}

type LeaveBalanceListCopy = {
  columnsId?: string
  empty: string
  colLeaveType: string
  colEntitled: string
  colTaken: string
  colPending: string
  colAvailable: string
}

type LeaveMyHistoryListCopy = {
  columnsId?: string
  empty: string
  colLeaveType: string
  colDates: string
  colDuration: string
  colState: string
  stateLabelFor: (state: string) => string
}

export type LeaveAbsenceCalendarDisplayRow = {
  id: string
  employeeId: string
  employee: string
  employeeNumber: string | null
  leaveType: string
  dates: string
  duration: string
  state: string
}

type LeaveAbsenceCalendarCopy = {
  columnsId?: string
  empty: string
  colEmployee: string
  colLeaveType: string
  colDates: string
  colDuration: string
  colState: string
}

function formatDaysValue(value: number | string): string {
  const days = Number(value)
  if (Number.isNaN(days)) return "—"
  return Number.isInteger(days) ? String(days) : days.toFixed(2)
}

function computeAvailableBalanceDays(balance: LeaveBalanceRow): number {
  return (
    Number(balance.openingDays) +
    Number(balance.daysEntitled) +
    Number(balance.adjustedDays) +
    Number(balance.carriedForwardDays) -
    Number(balance.daysTaken) -
    Number(balance.daysPending)
  )
}

function formatLeaveRequestDateRange(
  row: Pick<LeaveRequestRow, "startDate" | "endDate" | "halfDay">
): string {
  const { startDate, endDate, halfDay } = row
  const halfTag =
    halfDay === "morning" ? " · AM" : halfDay === "afternoon" ? " · PM" : ""
  if (startDate === endDate) {
    return `${startDate}${halfTag}`
  }
  return `${startDate} → ${endDate}`
}

export function buildLeaveBalanceListSurfaceConfiguration(
  rows: readonly LeaveBalanceRow[],
  copy: LeaveBalanceListCopy
): ListSurfaceRendererConfigurationInput {
  const columnsId = copy.columnsId ?? LEAVE_LIST_SURFACE_IDS.myBalances
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: LEAVE_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "leaveType",
        header: copy.colLeaveType,
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "entitled", header: copy.colEntitled, align: "end" },
      { id: "taken", header: copy.colTaken, align: "end" },
      { id: "pending", header: copy.colPending, align: "end" },
      { id: "available", header: copy.colAvailable, align: "end" },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        leaveType: row.leaveTypeCode ?? row.leaveTypeId,
        entitled: formatDaysValue(row.daysEntitled),
        taken: formatDaysValue(row.daysTaken),
        pending: formatDaysValue(row.daysPending),
        available: formatDaysValue(computeAvailableBalanceDays(row)),
      },
    })),
  })
}

export function buildLeaveMyHistoryListSurfaceConfiguration(
  rows: readonly LeaveRequestRow[],
  copy: LeaveMyHistoryListCopy
): ListSurfaceRendererConfigurationInput {
  const columnsId = copy.columnsId ?? LEAVE_LIST_SURFACE_IDS.myHistory
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: LEAVE_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "leaveType",
        header: copy.colLeaveType,
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "dates", header: copy.colDates },
      { id: "duration", header: copy.colDuration, align: "end" },
      {
        id: "state",
        header: copy.colState,
        cellKind: { kind: "badge", tone: "attention" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        leaveType: row.leaveTypeCode ?? row.leaveTypeId,
        dates: formatLeaveRequestDateRange(row),
        duration: formatDurationDays(row),
        state: copy.stateLabelFor(row.state),
      },
      trailingAction:
        row.state === "submitted"
          ? resolveListSurfaceRowTrailingAction({
              visible: true,
              allowed: true,
              descriptor: {
                id: "erp.hrm.leave.cancel",
                label: "Cancel",
                intent: "destructive",
              },
            })
          : listSurfaceRowTrailingActionHidden(),
    })),
  })
}

export function buildLeaveAbsenceCalendarListSurfaceConfiguration(
  rows: readonly LeaveAbsenceCalendarDisplayRow[],
  orgSlug: string,
  copy: LeaveAbsenceCalendarCopy
): ListSurfaceRendererConfigurationInput {
  const columnsId = copy.columnsId ?? LEAVE_LIST_SURFACE_IDS.absenceCalendar
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: LEAVE_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "employee", header: copy.colEmployee },
      {
        id: "leaveType",
        header: copy.colLeaveType,
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "dates", header: copy.colDates },
      { id: "duration", header: copy.colDuration },
      {
        id: "state",
        header: copy.colState,
        cellKind: { kind: "badge", tone: "attention" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: row.employeeNumber
          ? `${row.employee} · ${row.employeeNumber}`
          : row.employee,
        leaveType: row.leaveType,
        dates: row.dates,
        duration: row.duration,
        state: row.state,
      },
    })),
  })
}
