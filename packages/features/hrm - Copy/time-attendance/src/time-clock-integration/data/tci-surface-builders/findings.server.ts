import "server-only"

import {
  GOVERNED_METADATA_SCHEMA_VERSION,
  listSurfaceRowTrailingActionHidden,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"
import {
  TCI_LIST_SURFACE_IDS,
  type TciListSurfaceId,
} from "../tci-surface-metadata.shared"
import {
  formatTciEmployeeCell,
  TCI_AUDIT_PERMISSION,
  buildTciListSurface,
  TCI_READ_PERMISSION,
  type TciEmployeeRowFields,
  tciEmployeeRowLinkFields,
  tciListHeader,
} from "./_shared.server"
import type { TimeClockAbnormalPunchFindingRow } from "../tci-abnormal-punch-detection.server"
import type { TimeClockAttendanceHandoffRow } from "../tci-attendance-handoff.server"
import type { TimeClockRawVsApprovedRow } from "../tci-raw-vs-approved.server"
import type { TimeClockAuditTrailRow } from "../tci-audit-trail.server"
import type { TimeClockOvertimeReferenceRow } from "../tci-overtime-reference.server"
import type { TimeClockPayrollReferenceRow } from "../tci-payroll-reference.server"
import type { TimeClockShiftMatchRow } from "../tci-shift-matching.server"
import type { TimeClockDuplicatePunchFindingRow } from "../tci-duplicate-detection.server"
import type { TimeClockMissingPunchFindingRow } from "../tci-missing-punch-detection.server"

type AuditActionTone = "default" | "attention" | "critical"

function auditActionTone(action: string): AuditActionTone {
  const normalized = action.toLowerCase()
  if (
    normalized.includes("fail") ||
    normalized.includes("reject") ||
    normalized.includes("revoke") ||
    normalized.includes("error")
  ) {
    return "critical"
  }
  if (
    normalized.includes("exception") ||
    normalized.includes("correct") ||
    normalized.includes("sync") ||
    normalized.includes("override")
  ) {
    return "attention"
  }
  return "default"
}

export function buildTimeClockPayrollReferenceFindingsListSurfaceConfiguration(
  rows: readonly TimeClockPayrollReferenceRow[],
  copy: {
    empty: string
    colDate: string
    colEmployee: string
    colPunches: string
    colWorkedMinutes: string
    colExposure: string
    formatExposure: (status: string) => string
  },
  options?: { orgSlug?: string }
): ListSurfaceRendererConfigurationInput {
  const columnsId = TCI_LIST_SURFACE_IDS.payrollReferenceFindings
  return buildTciListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    requiresErpPermission: TCI_READ_PERMISSION,
    surface: {
      header: tciListHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "attendanceDate",
        header: copy.colDate,
        cellKind: { kind: "datetime" },
      },
      {
        id: "employee",
        header: copy.colEmployee,
        cellKind: options?.orgSlug ? { kind: "link" } : undefined,
      },
      { id: "punches", header: copy.colPunches },
      { id: "workedMinutes", header: copy.colWorkedMinutes },
      {
        id: "exposure",
        header: copy.colExposure,
        cellKind: { kind: "badge", tone: "attention" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        attendanceDate: row.attendanceDate,
        employee: formatTciEmployeeCell(row),
        punches: String(row.devicePunchCount),
        workedMinutes:
          row.workedMinutes != null ? String(row.workedMinutes) : "—",
        exposure: copy.formatExposure(row.exposureStatus),
      },
      ...tciEmployeeRowLinkFields(options?.orgSlug, row),
      trailingAction: listSurfaceRowTrailingActionHidden(),
    })),
  })
}

export function buildTimeClockOvertimeReferenceFindingsListSurfaceConfiguration(
  rows: readonly TimeClockOvertimeReferenceRow[],
  copy: {
    empty: string
    colDate: string
    colEmployee: string
    colWorkedMinutes: string
    colOvertimeMinutes: string
    colExposure: string
    formatExposure: (status: string) => string
  },
  options?: { orgSlug?: string }
): ListSurfaceRendererConfigurationInput {
  const columnsId = TCI_LIST_SURFACE_IDS.overtimeReferenceFindings
  return buildTciListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    requiresErpPermission: TCI_READ_PERMISSION,
    surface: {
      header: tciListHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "attendanceDate",
        header: copy.colDate,
        cellKind: { kind: "datetime" },
      },
      {
        id: "employee",
        header: copy.colEmployee,
        cellKind: options?.orgSlug ? { kind: "link" } : undefined,
      },
      { id: "workedMinutes", header: copy.colWorkedMinutes },
      { id: "overtimeMinutes", header: copy.colOvertimeMinutes },
      {
        id: "exposure",
        header: copy.colExposure,
        cellKind: { kind: "badge", tone: "attention" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        attendanceDate: row.attendanceDate,
        employee: formatTciEmployeeCell(row),
        workedMinutes:
          row.workedMinutes != null ? String(row.workedMinutes) : "—",
        overtimeMinutes:
          row.overtimeMinutes != null ? String(row.overtimeMinutes) : "—",
        exposure: copy.formatExposure(row.exposureStatus),
      },
      ...tciEmployeeRowLinkFields(options?.orgSlug, row),
      trailingAction: listSurfaceRowTrailingActionHidden(),
    })),
  })
}

export function buildTimeClockAttendanceHandoffFindingsListSurfaceConfiguration(
  rows: readonly TimeClockAttendanceHandoffRow[],
  copy: {
    empty: string
    colDate: string
    colEmployee: string
    colPunches: string
    colWorkedMinutes: string
    colExposure: string
    formatExposure: (status: string) => string
  },
  options?: { orgSlug?: string }
): ListSurfaceRendererConfigurationInput {
  const columnsId = TCI_LIST_SURFACE_IDS.attendanceHandoffFindings
  return buildTciListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    requiresErpPermission: TCI_READ_PERMISSION,
    surface: {
      header: tciListHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "attendanceDate",
        header: copy.colDate,
        cellKind: { kind: "datetime" },
      },
      {
        id: "employee",
        header: copy.colEmployee,
        cellKind: options?.orgSlug ? { kind: "link" } : undefined,
      },
      { id: "punchCount", header: copy.colPunches },
      { id: "workedMinutes", header: copy.colWorkedMinutes },
      {
        id: "exposure",
        header: copy.colExposure,
        cellKind: { kind: "badge", tone: "attention" },
      },
    ],
    rows: rows.map((row) => {
      const worked = row.workedMinutes != null ? String(row.workedMinutes) : "—"
      return {
        id: row.id,
        cells: {
          attendanceDate: row.attendanceDate,
          employee: formatTciEmployeeCell(row),
          punchCount: String(row.devicePunchCount),
          workedMinutes: worked,
          exposure: copy.formatExposure(row.exposureStatus),
        },
        ...tciEmployeeRowLinkFields(options?.orgSlug, row),
        trailingAction: listSurfaceRowTrailingActionHidden(),
      }
    }),
  })
}

export function buildTimeClockRawVsApprovedFindingsListSurfaceConfiguration(
  rows: readonly TimeClockRawVsApprovedRow[],
  copy: {
    empty: string
    colDate: string
    colEmployee: string
    colRawPunches: string
    colLamState: string
    colWorkedMinutes: string
    colRelationship: string
    formatRelationship: (relationship: string) => string
    formatLamState: (state: string | null) => string
  },
  options?: { orgSlug?: string }
): ListSurfaceRendererConfigurationInput {
  const columnsId = TCI_LIST_SURFACE_IDS.rawVsApprovedFindings
  return buildTciListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    requiresErpPermission: TCI_READ_PERMISSION,
    surface: {
      header: tciListHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "attendanceDate",
        header: copy.colDate,
        cellKind: { kind: "datetime" },
      },
      {
        id: "employee",
        header: copy.colEmployee,
        cellKind: options?.orgSlug ? { kind: "link" } : undefined,
      },
      { id: "rawPunches", header: copy.colRawPunches },
      { id: "lamState", header: copy.colLamState },
      { id: "workedMinutes", header: copy.colWorkedMinutes },
      {
        id: "relationship",
        header: copy.colRelationship,
        cellKind: { kind: "badge", tone: "attention" },
      },
    ],
    rows: rows.map((row) => {
      const worked = row.workedMinutes != null ? String(row.workedMinutes) : "—"
      return {
        id: row.id,
        cells: {
          attendanceDate: row.attendanceDate,
          employee: formatTciEmployeeCell(row),
          rawPunches: String(row.devicePunchCount),
          lamState: copy.formatLamState(row.lamDayState),
          workedMinutes: worked,
          relationship: copy.formatRelationship(row.relationship),
        },
        ...tciEmployeeRowLinkFields(options?.orgSlug, row),
        trailingAction: listSurfaceRowTrailingActionHidden(),
      }
    }),
  })
}

export function buildTimeClockAuditTrailListSurfaceConfiguration(
  rows: readonly TimeClockAuditTrailRow[],
  copy: {
    empty: string
    colWhen: string
    colAction: string
    colActor: string
    colResource: string
    colMetadata: string
    formatAction: (action: string) => string
    formatActor: (row: TimeClockAuditTrailRow) => string
    formatResource: (row: TimeClockAuditTrailRow) => string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = TCI_LIST_SURFACE_IDS.auditTrail
  return buildTciListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "document-lines",
    presentationProfile: "erp-audit-ledger",
    requiresErpPermission: TCI_AUDIT_PERMISSION,
    presentation: {
      primaryColumnId: "action",
      narrowMode: "auto",
      toolbar: {
        search: {
          param: "tciAuditSearch",
          label: "Search audit trail",
          placeholder: "Search action, actor, resource, or metadata",
        },
        filters: [
          {
            id: "tci-audit-action",
            label: copy.colAction,
            param: "tciAuditAction",
            options:
              rows.length > 0
                ? Array.from(new Set(rows.map((row) => row.action)))
                    .sort()
                    .map((value) => ({
                      label: copy.formatAction(value),
                      value,
                    }))
                : [{ label: "All actions", value: "all" }],
          },
        ],
        sort: {
          label: "Sort",
          param: "tciAuditSort",
          options: [
            {
              label: copy.colWhen,
              value: "created-desc",
              columnId: "createdAt",
              direction: "desc",
            },
          ],
        },
        savedView: {
          label: "Audit view",
          activeLabel: "TCI audit",
          href: "?tciAuditSort=created-desc",
        },
      },
      decisionLedger: { enabled: true, label: "Audit evidence" },
    },
    surface: {
      header: tciListHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "createdAt", header: copy.colWhen, cellKind: { kind: "datetime" } },
      {
        id: "action",
        header: copy.colAction,
        priority: "primary",
        pin: "start",
        wrap: true,
        minWidth: 220,
      },
      { id: "actor", header: copy.colActor },
      { id: "resource", header: copy.colResource },
      { id: "metadata", header: copy.colMetadata, wrap: true },
    ],
    rows: rows.map((row) => {
      const tone = auditActionTone(row.action)
      return {
        id: row.id,
        rowTone: tone === "critical" ? "critical" : tone,
        cells: {
          createdAt: row.createdAt.toISOString(),
          action: copy.formatAction(row.action),
          actor: copy.formatActor(row),
          resource: copy.formatResource(row),
          metadata: row.metadataSummary ?? "—",
        },
        decisionLedger: {
          reason: copy.formatAction(row.action),
          policyLabel: "TCI audit ledger",
          actorLabel: copy.formatActor(row),
          occurredAt: row.createdAt.toISOString(),
          riskTone: tone,
          nextActionLabel: copy.formatResource(row),
        },
        trailingAction: listSurfaceRowTrailingActionHidden(),
      }
    }),
  })
}

export function buildTimeClockShiftMatchFindingsListSurfaceConfiguration(
  rows: readonly TimeClockShiftMatchRow[],
  copy: {
    empty: string
    colOccurredAt: string
    colEmployee: string
    colEventType: string
    colShiftWindow: string
    colMatchStatus: string
    formatMatchStatus: (status: string) => string
    formatEventType: (eventType: string) => string
  },
  options?: { orgSlug?: string }
): ListSurfaceRendererConfigurationInput {
  const columnsId = TCI_LIST_SURFACE_IDS.shiftMatchFindings
  return buildTciListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    requiresErpPermission: TCI_READ_PERMISSION,
    surface: {
      header: tciListHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "occurredAt",
        header: copy.colOccurredAt,
        cellKind: { kind: "datetime" },
      },
      {
        id: "employee",
        header: copy.colEmployee,
        cellKind: options?.orgSlug ? { kind: "link" } : undefined,
      },
      { id: "eventType", header: copy.colEventType },
      { id: "shiftWindow", header: copy.colShiftWindow },
      {
        id: "matchStatus",
        header: copy.colMatchStatus,
        cellKind: { kind: "badge", tone: "attention" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        occurredAt: row.occurredAt.toISOString(),
        employee: formatTciEmployeeCell(row),
        eventType: copy.formatEventType(row.eventType),
        shiftWindow: row.shiftWindowLabel,
        matchStatus: copy.formatMatchStatus(row.matchStatus),
      },
      ...tciEmployeeRowLinkFields(options?.orgSlug, row),
      trailingAction: listSurfaceRowTrailingActionHidden(),
    })),
  })
}

type LamDayFindingRow = TciEmployeeRowFields & {
  readonly id: string
  readonly attendanceDate: string
  readonly codes: readonly string[]
}

function buildTimeClockLamDayFindingsListSurfaceConfiguration(
  columnsId: TciListSurfaceId,
  rows: readonly LamDayFindingRow[],
  copy: {
    empty: string
    colDate: string
    colEmployee: string
    colCodes: string
    formatCode: (code: string) => string
  },
  options?: { orgSlug?: string }
): ListSurfaceRendererConfigurationInput {
  return buildTciListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    requiresErpPermission: TCI_READ_PERMISSION,
    surface: {
      header: tciListHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "attendanceDate",
        header: copy.colDate,
        cellKind: { kind: "datetime" },
      },
      {
        id: "employee",
        header: copy.colEmployee,
        cellKind: options?.orgSlug ? { kind: "link" } : undefined,
      },
      {
        id: "codes",
        header: copy.colCodes,
        cellKind: { kind: "badge", tone: "attention" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        attendanceDate: row.attendanceDate,
        employee: formatTciEmployeeCell(row),
        codes: row.codes.map((code) => copy.formatCode(code)).join(" · "),
      },
      ...tciEmployeeRowLinkFields(options?.orgSlug, row),
      trailingAction: listSurfaceRowTrailingActionHidden(),
    })),
  })
}

export function buildTimeClockAbnormalPunchFindingsListSurfaceConfiguration(
  rows: readonly TimeClockAbnormalPunchFindingRow[],
  copy: {
    empty: string
    colDate: string
    colEmployee: string
    colCodes: string
    formatCode: (code: string) => string
  },
  options?: { orgSlug?: string }
): ListSurfaceRendererConfigurationInput {
  return buildTimeClockLamDayFindingsListSurfaceConfiguration(
    TCI_LIST_SURFACE_IDS.abnormalPunchFindings,
    rows,
    copy,
    options
  )
}

export function buildTimeClockDuplicatePunchFindingsListSurfaceConfiguration(
  rows: readonly TimeClockDuplicatePunchFindingRow[],
  copy: {
    empty: string
    colDate: string
    colEmployee: string
    colCodes: string
    formatCode: (code: string) => string
  },
  options?: { orgSlug?: string }
): ListSurfaceRendererConfigurationInput {
  return buildTimeClockLamDayFindingsListSurfaceConfiguration(
    TCI_LIST_SURFACE_IDS.duplicatePunchFindings,
    rows,
    copy,
    options
  )
}

export function buildTimeClockMissingPunchFindingsListSurfaceConfiguration(
  rows: readonly TimeClockMissingPunchFindingRow[],
  copy: {
    empty: string
    colDate: string
    colEmployee: string
    colCodes: string
    formatCode: (code: string) => string
  },
  options?: { orgSlug?: string }
): ListSurfaceRendererConfigurationInput {
  return buildTimeClockLamDayFindingsListSurfaceConfiguration(
    TCI_LIST_SURFACE_IDS.missingPunchFindings,
    rows,
    copy,
    options
  )
}
