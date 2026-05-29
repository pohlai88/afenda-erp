import "server-only"

import { and, asc, eq, gte, lte } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmAttendanceDay,
  hrmAttendanceEvent,
  hrmDepartment,
  hrmEmployee,
  hrmTimeClockDevice,
  hrmTimeClockPunchException,
  hrmTimeClockSyncBatch,
} from "@afenda/platform/db/schema"

import {
  shouldIncludeTciReportRowKind,
  TCI_REPORT_CSV_COLUMNS,
  type TciReportRowKind,
} from "../tci-operational-reports.shared"
import { extractAbnormalPunchCodesFromAttendanceSnapshot } from "../tci-abnormal-punch-detection.shared"
import { listAttendanceHandoffRowsForOrgInRange } from "./tci-attendance-handoff.server"
import { listRawVsApprovedFindingsForOrgInRange } from "./tci-raw-vs-approved.server"
import { listTimeClockAuditTrailForOrgInRange } from "./tci-audit-trail.server"
import { listOvertimeReferenceRowsForOrgInRange } from "./tci-overtime-reference.server"
import { listPayrollReferenceRowsForOrgInRange } from "./tci-payroll-reference.server"
import { listCorrectionWorkflowRowsForOrgInRange } from "./tci-correction-workflow.server"
import { listSyncMonitoringRowsForOrg } from "./tci-sync-monitoring.server"
import { listShiftMatchRowsForOrgInRange } from "./tci-shift-matching.server"
import { extractDuplicatePunchCodesFromAttendanceSnapshot } from "../tci-duplicate-detection.shared"
import { extractMissingPunchCodesFromAttendanceSnapshot } from "../tci-missing-punch-detection.shared"

import type { ExportTimeClockReportFormInput } from "../schemas/tci.schema"
import type { TciDetectionOutcome } from "../schemas/tci-workflow-state.shared"

type ReportCsvRow = {
  readonly rowKind: string
  readonly attendanceDate?: string
  readonly employeeNumber?: string
  readonly employeeLegalName?: string
  readonly externalDeviceId?: string
  readonly deviceName?: string
  readonly locationRef?: string
  readonly departmentCode?: string
  readonly deviceSyncStatus?: string
  readonly eventType?: string
  readonly occurredAt?: string
  readonly sourceRef?: string
  readonly syncBatchId?: string
  readonly detectionOutcome?: string
  readonly exceptionState?: string
  readonly exceptionReason?: string
}

function escapeCsv(value: string | number | null | undefined): string {
  if (value == null) return ""
  const text = String(value)
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function formatReportCsvRow(row: ReportCsvRow): string {
  return [
    row.rowKind,
    row.attendanceDate ?? "",
    row.employeeNumber ?? "",
    row.employeeLegalName ?? "",
    row.externalDeviceId ?? "",
    row.deviceName ?? "",
    row.locationRef ?? "",
    row.departmentCode ?? "",
    row.deviceSyncStatus ?? "",
    row.eventType ?? "",
    row.occurredAt ?? "",
    row.sourceRef ?? "",
    row.syncBatchId ?? "",
    row.detectionOutcome ?? "",
    row.exceptionState ?? "",
    row.exceptionReason ?? "",
  ]
    .map(escapeCsv)
    .join(",")
}

function appendReportRow(lines: string[], row: ReportCsvRow): void {
  lines.push(formatReportCsvRow(row))
}

function includesReportRowKind(
  filters: ExportTimeClockReportFormInput,
  rowKind: TciReportRowKind
): boolean {
  return shouldIncludeTciReportRowKind(rowKind, filters.rowKinds)
}

function matchesExceptionTypeFilter(
  filter: TciDetectionOutcome | null | undefined,
  cellValue: string
): boolean {
  if (!filter) return true
  if (!cellValue) return false
  if (cellValue === filter) return true
  return cellValue.split(";").some((part) => part.trim() === filter)
}

export type TimeClockReportCsv = {
  readonly csv: string
  readonly rowCount: number
  readonly filename: string
}

export async function buildTimeClockReportCsv(input: {
  organizationId: string
  filters: ExportTimeClockReportFormInput
}): Promise<TimeClockReportCsv> {
  const { organizationId } = input
  const start = new Date(`${input.filters.startDate}T00:00:00.000Z`)
  const end = new Date(`${input.filters.endDate}T23:59:59.999Z`)

  const lines: string[] = [TCI_REPORT_CSV_COLUMNS.join(",")]
  let rowCount = 0
  const { filters } = input

  if (!filters.onlyExceptions) {
    if (includesReportRowKind(filters, "punch") && !filters.detectionOutcome) {
      const eventConditions = [
        eq(hrmAttendanceEvent.organizationId, organizationId),
        eq(hrmAttendanceEvent.source, "device"),
        gte(hrmAttendanceEvent.occurredAt, start),
        lte(hrmAttendanceEvent.occurredAt, end),
      ]
      if (filters.employeeId) {
        eventConditions.push(
          eq(hrmAttendanceEvent.employeeId, filters.employeeId)
        )
      }
      if (filters.deviceId) {
        eventConditions.push(eq(hrmAttendanceEvent.deviceId, filters.deviceId))
      }
      if (filters.departmentId) {
        eventConditions.push(
          eq(hrmEmployee.currentDepartmentId, filters.departmentId)
        )
      }
      if (filters.locationRef) {
        eventConditions.push(
          eq(hrmTimeClockDevice.locationRef, filters.locationRef)
        )
      }
      if (filters.syncStatus) {
        eventConditions.push(
          eq(hrmTimeClockDevice.syncStatus, filters.syncStatus)
        )
      }

      const punchRows = await db
        .select({
          employeeNumber: hrmEmployee.employeeNumber,
          legalName: hrmEmployee.legalName,
          departmentCode: hrmDepartment.code,
          externalDeviceId: hrmTimeClockDevice.externalDeviceId,
          deviceName: hrmTimeClockDevice.name,
          locationRef: hrmTimeClockDevice.locationRef,
          deviceSyncStatus: hrmTimeClockDevice.syncStatus,
          eventType: hrmAttendanceEvent.eventType,
          occurredAt: hrmAttendanceEvent.occurredAt,
          sourceRef: hrmAttendanceEvent.sourceRef,
          metadata: hrmAttendanceEvent.metadata,
        })
        .from(hrmAttendanceEvent)
        .innerJoin(
          hrmEmployee,
          eq(hrmAttendanceEvent.employeeId, hrmEmployee.id)
        )
        .leftJoin(
          hrmDepartment,
          eq(hrmEmployee.currentDepartmentId, hrmDepartment.id)
        )
        .leftJoin(
          hrmTimeClockDevice,
          eq(hrmAttendanceEvent.deviceId, hrmTimeClockDevice.id)
        )
        .where(and(...eventConditions))
        .orderBy(asc(hrmAttendanceEvent.occurredAt))

      for (const row of punchRows) {
        const metadata =
          row.metadata && typeof row.metadata === "object"
            ? (row.metadata as { syncBatchId?: string | null })
            : null
        appendReportRow(lines, {
          rowKind: "punch",
          attendanceDate: row.occurredAt.toISOString().slice(0, 10),
          employeeNumber: row.employeeNumber,
          employeeLegalName: row.legalName,
          externalDeviceId: row.externalDeviceId ?? "",
          deviceName: row.deviceName ?? "",
          locationRef: row.locationRef ?? "",
          departmentCode: row.departmentCode ?? "",
          deviceSyncStatus: row.deviceSyncStatus ?? "",
          eventType: row.eventType,
          occurredAt: row.occurredAt.toISOString(),
          sourceRef: row.sourceRef ?? "",
          syncBatchId: metadata?.syncBatchId ?? "",
        })
        rowCount += 1
      }
    }

    if (includesReportRowKind(filters, "sync_monitoring")) {
      const syncMonitoringRows = await listSyncMonitoringRowsForOrg(
        organizationId,
        {
          limit: 500,
        }
      )
      for (const row of syncMonitoringRows) {
        if (filters.deviceId && row.id !== filters.deviceId) continue
        if (filters.locationRef && row.locationRef !== filters.locationRef)
          continue
        if (filters.syncStatus && row.syncStatus !== filters.syncStatus)
          continue
        if (
          filters.detectionOutcome &&
          !matchesExceptionTypeFilter(
            filters.detectionOutcome,
            row.attentionKind
          )
        ) {
          continue
        }
        appendReportRow(lines, {
          rowKind: "sync_monitoring",
          externalDeviceId: row.externalDeviceId,
          deviceName: row.name,
          locationRef: row.locationRef ?? "",
          deviceSyncStatus: row.syncStatus,
          eventType: row.deviceType,
          occurredAt: row.lastSyncAt?.toISOString() ?? "",
          detectionOutcome: row.attentionKind,
          exceptionState: row.syncStatus,
          exceptionReason: row.locationRef ?? "",
        })
        rowCount += 1
      }
    }

    if (includesReportRowKind(filters, "correction_workflow")) {
      const correctionRows = await listCorrectionWorkflowRowsForOrgInRange(
        organizationId,
        {
          startDate: filters.startDate,
          endDate: filters.endDate,
          employeeId: filters.employeeId ?? undefined,
        }
      )
      for (const row of correctionRows) {
        if (
          filters.detectionOutcome &&
          !matchesExceptionTypeFilter(filters.detectionOutcome, row.category)
        ) {
          continue
        }
        appendReportRow(lines, {
          rowKind: "correction_workflow",
          attendanceDate: row.attendanceDate,
          employeeNumber: row.employeeNumber ?? "",
          employeeLegalName: row.employeeLegalName ?? "",
          occurredAt: row.anchorOccurredAt?.toISOString() ?? "",
          detectionOutcome: row.category,
          exceptionState: row.workflowStep,
          exceptionReason: row.summary ?? "",
        })
        rowCount += 1
      }
    }

    if (includesReportRowKind(filters, "payroll_reference")) {
      const payrollRefRows = await listPayrollReferenceRowsForOrgInRange(
        organizationId,
        {
          startDate: filters.startDate,
          endDate: filters.endDate,
          employeeId: filters.employeeId ?? undefined,
        }
      )
      for (const row of payrollRefRows) {
        if (row.exposureStatus === "not_materialized") continue
        appendReportRow(lines, {
          rowKind: "payroll_reference",
          attendanceDate: row.attendanceDate,
          employeeNumber: row.employeeNumber ?? "",
          employeeLegalName: row.employeeLegalName ?? "",
          occurredAt: row.latestOccurredAt.toISOString(),
          detectionOutcome: row.exposureStatus,
          exceptionState: String(row.workedMinutes ?? ""),
          exceptionReason: String(row.devicePunchCount),
        })
        rowCount += 1
      }
    }

    if (includesReportRowKind(filters, "overtime_reference")) {
      const overtimeRefRows = await listOvertimeReferenceRowsForOrgInRange(
        organizationId,
        {
          startDate: filters.startDate,
          endDate: filters.endDate,
          employeeId: filters.employeeId ?? undefined,
        }
      )
      for (const row of overtimeRefRows) {
        if (row.exposureStatus === "not_exposed") continue
        appendReportRow(lines, {
          rowKind: "overtime_reference",
          attendanceDate: row.attendanceDate,
          employeeNumber: row.employeeNumber ?? "",
          employeeLegalName: row.employeeLegalName ?? "",
          occurredAt: row.latestOccurredAt.toISOString(),
          detectionOutcome: row.exposureStatus,
          exceptionState: String(row.workedMinutes ?? ""),
          exceptionReason: String(row.overtimeMinutes ?? ""),
        })
        rowCount += 1
      }
    }

    if (includesReportRowKind(filters, "attendance_handoff")) {
      const handoffRows = await listAttendanceHandoffRowsForOrgInRange(
        organizationId,
        {
          startDate: filters.startDate,
          endDate: filters.endDate,
          employeeId: filters.employeeId ?? undefined,
        }
      )
      for (const row of handoffRows) {
        appendReportRow(lines, {
          rowKind: "attendance_handoff",
          attendanceDate: row.attendanceDate,
          employeeNumber: row.employeeNumber ?? "",
          employeeLegalName: row.employeeLegalName ?? "",
          occurredAt: row.latestOccurredAt.toISOString(),
          detectionOutcome: row.exposureStatus,
          exceptionState: String(row.workedMinutes ?? ""),
          exceptionReason: String(row.devicePunchCount),
        })
        rowCount += 1
      }
    }

    if (includesReportRowKind(filters, "raw_vs_approved")) {
      const separationRows = await listRawVsApprovedFindingsForOrgInRange(
        organizationId,
        {
          startDate: filters.startDate,
          endDate: filters.endDate,
          employeeId: filters.employeeId ?? undefined,
        }
      )
      for (const row of separationRows) {
        appendReportRow(lines, {
          rowKind: "raw_vs_approved",
          attendanceDate: row.attendanceDate,
          employeeNumber: row.employeeNumber ?? "",
          employeeLegalName: row.employeeLegalName ?? "",
          occurredAt: row.latestOccurredAt.toISOString(),
          detectionOutcome: row.relationship,
          exceptionState: row.lamDayState ?? "",
          exceptionReason: String(row.devicePunchCount),
        })
        rowCount += 1
      }
    }

    if (includesReportRowKind(filters, "audit_trail")) {
      const auditRows = await listTimeClockAuditTrailForOrgInRange(
        organizationId,
        {
          startDate: filters.startDate,
          endDate: filters.endDate,
        }
      )
      for (const row of auditRows) {
        appendReportRow(lines, {
          rowKind: "audit_trail",
          attendanceDate: row.createdAt.toISOString().slice(0, 10),
          employeeLegalName: row.actorEmail ?? row.actorUserId ?? "",
          occurredAt: row.createdAt.toISOString(),
          detectionOutcome: row.action,
          exceptionState: row.resourceType ?? "",
          exceptionReason: row.resourceId ?? "",
          sourceRef: row.metadataSummary ?? "",
        })
        rowCount += 1
      }
    }

    if (includesReportRowKind(filters, "shift_match")) {
      const shiftMatchRows = await listShiftMatchRowsForOrgInRange(
        organizationId,
        {
          startDate: filters.startDate,
          endDate: filters.endDate,
          employeeId: filters.employeeId ?? undefined,
        }
      )
      for (const row of shiftMatchRows) {
        if (row.matchStatus === "no_assignment") continue
        if (
          filters.detectionOutcome &&
          !matchesExceptionTypeFilter(filters.detectionOutcome, row.matchStatus)
        ) {
          continue
        }
        appendReportRow(lines, {
          rowKind: "shift_match",
          attendanceDate: row.attendanceDate,
          employeeNumber: row.employeeNumber ?? "",
          employeeLegalName: row.employeeLegalName ?? "",
          eventType: row.eventType,
          occurredAt: row.occurredAt.toISOString(),
          detectionOutcome: row.matchStatus,
        })
        rowCount += 1
      }
    }

    const dayKindsEnabled =
      includesReportRowKind(filters, "missing_punch") ||
      includesReportRowKind(filters, "duplicate_punch") ||
      includesReportRowKind(filters, "abnormal_punch")

    if (dayKindsEnabled) {
      const dayConditions = [
        eq(hrmAttendanceDay.organizationId, organizationId),
        gte(hrmAttendanceDay.attendanceDate, filters.startDate),
        lte(hrmAttendanceDay.attendanceDate, filters.endDate),
      ]
      if (filters.employeeId) {
        dayConditions.push(eq(hrmAttendanceDay.employeeId, filters.employeeId))
      }
      if (filters.departmentId) {
        dayConditions.push(
          eq(hrmEmployee.currentDepartmentId, filters.departmentId)
        )
      }

      const dayRows = await db
        .select({
          attendanceDate: hrmAttendanceDay.attendanceDate,
          employeeNumber: hrmEmployee.employeeNumber,
          legalName: hrmEmployee.legalName,
          departmentCode: hrmDepartment.code,
          calculationSnapshot: hrmAttendanceDay.calculationSnapshot,
        })
        .from(hrmAttendanceDay)
        .innerJoin(hrmEmployee, eq(hrmAttendanceDay.employeeId, hrmEmployee.id))
        .leftJoin(
          hrmDepartment,
          eq(hrmEmployee.currentDepartmentId, hrmDepartment.id)
        )
        .where(and(...dayConditions))
        .orderBy(asc(hrmAttendanceDay.attendanceDate))

      for (const row of dayRows) {
        const missingCodes = extractMissingPunchCodesFromAttendanceSnapshot(
          row.calculationSnapshot
        )
        if (
          missingCodes.length > 0 &&
          includesReportRowKind(filters, "missing_punch")
        ) {
          const joined = missingCodes.join(";")
          if (matchesExceptionTypeFilter(filters.detectionOutcome, joined)) {
            appendReportRow(lines, {
              rowKind: "missing_punch",
              attendanceDate: row.attendanceDate,
              employeeNumber: row.employeeNumber,
              employeeLegalName: row.legalName,
              departmentCode: row.departmentCode ?? "",
              detectionOutcome: joined,
            })
            rowCount += 1
          }
        }

        const duplicateCodes = extractDuplicatePunchCodesFromAttendanceSnapshot(
          row.calculationSnapshot
        )
        if (
          duplicateCodes.length > 0 &&
          includesReportRowKind(filters, "duplicate_punch")
        ) {
          const joined = duplicateCodes.join(";")
          if (matchesExceptionTypeFilter(filters.detectionOutcome, joined)) {
            appendReportRow(lines, {
              rowKind: "duplicate_punch",
              attendanceDate: row.attendanceDate,
              employeeNumber: row.employeeNumber,
              employeeLegalName: row.legalName,
              departmentCode: row.departmentCode ?? "",
              detectionOutcome: joined,
            })
            rowCount += 1
          }
        }

        const abnormalCodes = extractAbnormalPunchCodesFromAttendanceSnapshot(
          row.calculationSnapshot
        )
        if (
          abnormalCodes.length > 0 &&
          includesReportRowKind(filters, "abnormal_punch")
        ) {
          const joined = abnormalCodes.join(";")
          if (matchesExceptionTypeFilter(filters.detectionOutcome, joined)) {
            appendReportRow(lines, {
              rowKind: "abnormal_punch",
              attendanceDate: row.attendanceDate,
              employeeNumber: row.employeeNumber,
              employeeLegalName: row.legalName,
              departmentCode: row.departmentCode ?? "",
              detectionOutcome: joined,
            })
            rowCount += 1
          }
        }
      }
    }
  }

  if (filters.onlyExceptions || includesReportRowKind(filters, "exception")) {
    const exceptionConditions = [
      eq(hrmTimeClockPunchException.organizationId, organizationId),
      gte(hrmTimeClockPunchException.occurredAt, start),
      lte(hrmTimeClockPunchException.occurredAt, end),
    ]
    if (filters.employeeId) {
      exceptionConditions.push(
        eq(hrmTimeClockPunchException.employeeId, filters.employeeId)
      )
    }
    if (filters.deviceId) {
      exceptionConditions.push(
        eq(hrmTimeClockPunchException.deviceId, filters.deviceId)
      )
    }
    if (filters.departmentId) {
      exceptionConditions.push(
        eq(hrmEmployee.currentDepartmentId, filters.departmentId)
      )
    }
    if (filters.locationRef) {
      exceptionConditions.push(
        eq(hrmTimeClockDevice.locationRef, filters.locationRef)
      )
    }
    if (filters.syncStatus) {
      exceptionConditions.push(
        eq(hrmTimeClockDevice.syncStatus, filters.syncStatus)
      )
    }
    if (filters.detectionOutcome) {
      exceptionConditions.push(
        eq(
          hrmTimeClockPunchException.detectionOutcome,
          filters.detectionOutcome
        )
      )
    }

    const exceptionRows = await db
      .select({
        employeeNumber: hrmEmployee.employeeNumber,
        legalName: hrmEmployee.legalName,
        departmentCode: hrmDepartment.code,
        externalDeviceId: hrmTimeClockDevice.externalDeviceId,
        deviceName: hrmTimeClockDevice.name,
        locationRef: hrmTimeClockDevice.locationRef,
        deviceSyncStatus: hrmTimeClockDevice.syncStatus,
        eventType: hrmTimeClockPunchException.eventType,
        occurredAt: hrmTimeClockPunchException.occurredAt,
        sourceRef: hrmTimeClockPunchException.sourceRef,
        syncBatchId: hrmTimeClockPunchException.syncBatchId,
        detectionOutcome: hrmTimeClockPunchException.detectionOutcome,
        state: hrmTimeClockPunchException.state,
        reason: hrmTimeClockPunchException.reason,
      })
      .from(hrmTimeClockPunchException)
      .innerJoin(
        hrmEmployee,
        eq(hrmTimeClockPunchException.employeeId, hrmEmployee.id)
      )
      .leftJoin(
        hrmDepartment,
        eq(hrmEmployee.currentDepartmentId, hrmDepartment.id)
      )
      .leftJoin(
        hrmTimeClockDevice,
        eq(hrmTimeClockPunchException.deviceId, hrmTimeClockDevice.id)
      )
      .where(and(...exceptionConditions))
      .orderBy(asc(hrmTimeClockPunchException.occurredAt))

    for (const row of exceptionRows) {
      appendReportRow(lines, {
        rowKind: "exception",
        attendanceDate: row.occurredAt.toISOString().slice(0, 10),
        employeeNumber: row.employeeNumber,
        employeeLegalName: row.legalName,
        externalDeviceId: row.externalDeviceId ?? "",
        deviceName: row.deviceName ?? "",
        locationRef: row.locationRef ?? "",
        departmentCode: row.departmentCode ?? "",
        deviceSyncStatus: row.deviceSyncStatus ?? "",
        eventType: row.eventType,
        occurredAt: row.occurredAt.toISOString(),
        sourceRef: row.sourceRef ?? "",
        syncBatchId: row.syncBatchId ?? "",
        detectionOutcome: row.detectionOutcome,
        exceptionState: row.state,
        exceptionReason: row.reason ?? "",
      })
      rowCount += 1
    }
  }

  if (!filters.onlyExceptions && includesReportRowKind(filters, "sync_batch")) {
    const batchConditions = [
      eq(hrmTimeClockSyncBatch.organizationId, organizationId),
      gte(hrmTimeClockSyncBatch.startedAt, start),
      lte(hrmTimeClockSyncBatch.startedAt, end),
    ]
    if (filters.deviceId) {
      batchConditions.push(eq(hrmTimeClockSyncBatch.deviceId, filters.deviceId))
    }
    if (filters.locationRef) {
      batchConditions.push(
        eq(hrmTimeClockDevice.locationRef, filters.locationRef)
      )
    }
    if (filters.syncStatus) {
      batchConditions.push(
        eq(hrmTimeClockDevice.syncStatus, filters.syncStatus)
      )
    }

    const batchRows = await db
      .select({
        id: hrmTimeClockSyncBatch.id,
        sourceKind: hrmTimeClockSyncBatch.sourceKind,
        state: hrmTimeClockSyncBatch.state,
        receivedCount: hrmTimeClockSyncBatch.receivedCount,
        acceptedCount: hrmTimeClockSyncBatch.acceptedCount,
        duplicateCount: hrmTimeClockSyncBatch.duplicateCount,
        rejectedCount: hrmTimeClockSyncBatch.rejectedCount,
        startedAt: hrmTimeClockSyncBatch.startedAt,
        finishedAt: hrmTimeClockSyncBatch.finishedAt,
        externalDeviceId: hrmTimeClockDevice.externalDeviceId,
        deviceName: hrmTimeClockDevice.name,
        locationRef: hrmTimeClockDevice.locationRef,
        deviceSyncStatus: hrmTimeClockDevice.syncStatus,
      })
      .from(hrmTimeClockSyncBatch)
      .leftJoin(
        hrmTimeClockDevice,
        eq(hrmTimeClockSyncBatch.deviceId, hrmTimeClockDevice.id)
      )
      .where(and(...batchConditions))
      .orderBy(asc(hrmTimeClockSyncBatch.startedAt))

    for (const row of batchRows) {
      appendReportRow(lines, {
        rowKind: "sync_batch",
        attendanceDate: row.startedAt.toISOString().slice(0, 10),
        externalDeviceId: row.externalDeviceId ?? "",
        deviceName: row.deviceName ?? "",
        locationRef: row.locationRef ?? "",
        deviceSyncStatus: row.deviceSyncStatus ?? "",
        eventType: row.sourceKind,
        occurredAt: row.startedAt.toISOString(),
        sourceRef: row.id,
        detectionOutcome: row.state,
        exceptionState: `received=${row.receivedCount};accepted=${row.acceptedCount};duplicate=${row.duplicateCount};rejected=${row.rejectedCount}`,
        exceptionReason: row.finishedAt?.toISOString() ?? "",
      })
      rowCount += 1
    }
  }

  const filename = `time-clock-report-${filters.startDate}_${filters.endDate}.csv`
  return { csv: `${lines.join("\n")}\n`, rowCount, filename }
}
