import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  listSurfaceRowTrailingActionHidden,
  resolveListSurfaceRowTrailingAction,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"

import { hrmEmployeeListRowLinkFields } from "@afenda/feature-hrm-core/shared"

import {
  ATTENDANCE_EXPORT_REPORT_TRIGGER_ID,
  ATTENDANCE_LIST_SURFACE_IDS,
} from "./attendance-surface-metadata.shared"

const ATTENDANCE_READ_PERMISSION = {
  module: "hrm" as const,
  object: "attendance" as const,
  function: "read" as const,
}

export type AttendanceEventDisplayRow = {
  id: string
  employeeId: string
  employee: string
  eventType: string
  occurredAt: string
  source: string
  correction: string
  canCorrect?: boolean
}

export type AttendanceDayDisplayRow = {
  id: string
  date: string
  workedMinutes: string
  state: string
}

export type AttendanceCorrectionPendingRow = {
  id: string
  subjectId: string
  requestedAt: string
}

function listSurfaceHeader(columnsId: string) {
  return { title: columnsId }
}

type AttendanceRecentListCopy = {
  columnsId?: string
  empty: string
  colEmployee: string
  colEvent: string
  colOccurredAt: string
  colSource: string
  colCorrectionOf: string
  exportReportLabel?: string
}

type AttendancePortalDaysListCopy = {
  columnsId?: string
  empty: string
  colDate: string
  colWorked: string
  colState: string
}

type AttendanceCorrectionPendingListCopy = {
  columnsId?: string
  empty: string
  colEvent: string
  colRequested: string
  approveLabel: string
}

export function buildAttendanceRecentListSurfaceConfiguration(
  rows: readonly AttendanceEventDisplayRow[],
  orgSlug: string,
  copy: AttendanceRecentListCopy
): ListSurfaceRendererConfigurationInput {
  const columnsId = copy.columnsId ?? ATTENDANCE_LIST_SURFACE_IDS.recentEvents
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: ATTENDANCE_READ_PERMISSION,
    presentation: {
      primaryColumnId: "employee",
      narrowMode: "auto",
      toolbar: {
        search: {
          param: "attendanceSearch",
          label: "Search attendance",
          placeholder: "Search employee, event, or source",
        },
        filters: [
          {
            id: "attendance-source",
            label: copy.colSource,
            param: "attendanceSource",
            options:
              rows.length > 0
                ? Array.from(new Set(rows.map((row) => row.source)))
                    .sort()
                    .map((value) => ({ label: value, value }))
                : [{ label: "All sources", value: "all" }],
          },
          {
            id: "attendance-event",
            label: copy.colEvent,
            param: "attendanceEvent",
            options:
              rows.length > 0
                ? Array.from(new Set(rows.map((row) => row.eventType)))
                    .sort()
                    .map((value) => ({ label: value, value }))
                : [{ label: "All events", value: "all" }],
          },
        ],
        sort: {
          label: "Sort",
          param: "attendanceSort",
          options: [
            {
              label: copy.colOccurredAt,
              value: "occurred-desc",
              columnId: "occurredAt",
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
          label: "Attendance view",
          activeLabel: "Recent events",
          href: "?attendanceSort=occurred-desc",
        },
        bulkActions: [
          {
            actionId: "erp.hrm.attendance.review-selected",
            label: "Review selected",
            disabledReason:
              "Select attendance rows before reviewing corrections.",
          },
        ],
        ...(copy.exportReportLabel
          ? {
              export: {
                actionId: "erp.hrm.attendance.export.summary",
                label: copy.exportReportLabel,
                formats: ["csv"],
                triggerElementId: ATTENDANCE_EXPORT_REPORT_TRIGGER_ID,
              },
            }
          : {}),
      },
      selection: {
        mode: "multiple",
        label: "Select attendance rows",
        bulkScopeLabel: "selected attendance rows",
      },
      decisionLedger: { enabled: true, label: "Attendance evidence" },
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
        id: "eventType",
        header: copy.colEvent,
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "occurredAt",
        header: copy.colOccurredAt,
        cellKind: { kind: "datetime" },
      },
      {
        id: "source",
        header: copy.colSource,
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "correction", header: copy.colCorrectionOf },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: row.employee,
        eventType: row.eventType,
        occurredAt: row.occurredAt,
        source: row.source,
        correction: row.correction,
      },
      decisionLedger: {
        reason: row.correction,
        policyLabel: "Attendance correction policy",
        actorLabel: row.source,
        occurredAt: row.occurredAt,
        riskTone: row.canCorrect ? "attention" : "default",
        nextActionLabel: row.canCorrect ? "Correct" : row.eventType,
      },
      trailingAction: row.canCorrect
        ? resolveListSurfaceRowTrailingAction({
            allowed: true,
            descriptor: {
              id: "erp.hrm.attendance.correct",
              label: "Correct",
              intent: "default",
            },
          })
        : listSurfaceRowTrailingActionHidden(),
    })),
  })
}

export function buildAttendanceCorrectionPendingListSurfaceConfiguration(
  rows: readonly AttendanceCorrectionPendingRow[],
  copy: AttendanceCorrectionPendingListCopy
): ListSurfaceRendererConfigurationInput {
  const columnsId =
    copy.columnsId ?? ATTENDANCE_LIST_SURFACE_IDS.correctionPending
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: "hrm",
      object: "attendance",
      function: "update",
    },
    presentation: {
      primaryColumnId: "event",
      narrowMode: "auto",
      toolbar: {
        search: {
          param: "attendanceCorrectionSearch",
          label: "Search correction queue",
          placeholder: "Search event or request date",
        },
        sort: {
          label: "Sort",
          param: "attendanceCorrectionSort",
          options: [
            {
              label: copy.colRequested,
              value: "requested-desc",
              columnId: "requested",
              direction: "desc",
            },
          ],
        },
        savedView: {
          label: "Correction view",
          activeLabel: "Pending corrections",
          href: "?attendanceCorrectionSort=requested-desc",
        },
        bulkActions: [
          {
            actionId: "erp.hrm.attendance.correction.approve-selected",
            label: "Approve selected",
            disabledReason: "Select correction rows before approving in bulk.",
          },
        ],
      },
      selection: {
        mode: "multiple",
        label: "Select correction rows",
        bulkScopeLabel: "selected correction rows",
      },
      decisionLedger: { enabled: true, label: "Correction decision" },
    },
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "event", header: copy.colEvent },
      {
        id: "requested",
        header: copy.colRequested,
        cellKind: { kind: "date" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        event: row.subjectId,
        requested: row.requestedAt,
      },
      decisionLedger: {
        reason: row.subjectId,
        policyLabel: "Attendance correction approval",
        actorLabel: "Attendance reviewer",
        occurredAt: row.requestedAt,
        riskTone: "attention",
        nextActionLabel: copy.approveLabel,
      },
      trailingAction: resolveListSurfaceRowTrailingAction({
        allowed: true,
        descriptor: {
          id: "erp.hrm.attendance.correction.approve",
          label: copy.approveLabel,
          intent: "default",
        },
      }),
    })),
  })
}

export function buildAttendancePortalDaysListSurfaceConfiguration(
  rows: readonly AttendanceDayDisplayRow[],
  copy: AttendancePortalDaysListCopy
): ListSurfaceRendererConfigurationInput {
  const columnsId = copy.columnsId ?? ATTENDANCE_LIST_SURFACE_IDS.portalDays
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "date", header: copy.colDate, cellKind: { kind: "date" } },
      { id: "worked", header: copy.colWorked, align: "end" },
      {
        id: "state",
        header: copy.colState,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        date: row.date,
        worked: row.workedMinutes,
        state: row.state,
      },
    })),
  })
}
