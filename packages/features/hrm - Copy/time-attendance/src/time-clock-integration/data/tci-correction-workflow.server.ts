import "server-only"

import {
  resolveCorrectionCategoryFromDetectionOutcome,
  resolveCorrectionCategoryFromLamCodes,
  type TciCorrectionCategory,
  type TciCorrectionWorkflowStep,
} from "../tci-correction-workflow.shared"

import { listAbnormalPunchDayFindingsForOrg } from "./tci-abnormal-punch-detection.server"
import { listDuplicatePunchDayFindingsForOrg } from "./tci-duplicate-detection.server"
import { listDevicePunchesForEmployeeDate } from "./tci-integration.server"
import { listMissingPunchDayFindingsForOrg } from "./tci-missing-punch-detection.server"
import {
  listTimeClockExceptionsForOrg,
  type TimeClockExceptionRow,
} from "./tci.queries.server"

export const TCI_CORRECTION_WORKFLOW_LIST_LIMIT = 50 as const

export type TimeClockCorrectionWorkflowRow = {
  readonly id: string
  readonly employeeId: string
  readonly employeeLegalName: string | null
  readonly employeeNumber: string | null
  readonly attendanceDate: string
  readonly category: TciCorrectionCategory
  readonly workflowStep: TciCorrectionWorkflowStep
  readonly summary: string
  readonly exceptionId: string | null
  readonly resolvedEventId: string | null
  readonly anchorEventId: string | null
  readonly anchorEventType: string | null
  readonly anchorOccurredAt: Date | null
}

function exceptionRowId(exceptionId: string): string {
  return `exception:${exceptionId}`
}

function lamRowId(employeeId: string, attendanceDate: string): string {
  return `lam:${employeeId}:${attendanceDate}`
}

function attendanceDateFromOccurredAt(occurredAt: Date): string {
  return occurredAt.toISOString().slice(0, 10)
}

function exceptionToWorkflowRow(
  row: TimeClockExceptionRow
): TimeClockCorrectionWorkflowRow {
  const attendanceDate = attendanceDateFromOccurredAt(row.occurredAt)
  const category = resolveCorrectionCategoryFromDetectionOutcome(
    row.detectionOutcome
  )
  const workflowStep: TciCorrectionWorkflowStep =
    row.state === "submitted"
      ? "needs_decision"
      : row.state === "approved" && row.resolvedEventId != null
        ? "needs_lam_correction"
        : "needs_decision"

  return {
    id: exceptionRowId(row.id),
    employeeId: row.employeeId,
    employeeLegalName: row.employeeLegalName,
    employeeNumber: row.employeeNumber,
    attendanceDate,
    category,
    workflowStep,
    summary: row.detectionOutcome,
    exceptionId: row.id,
    resolvedEventId: row.resolvedEventId,
    anchorEventId: row.resolvedEventId,
    anchorEventType: row.eventType,
    anchorOccurredAt: row.occurredAt,
  }
}

async function latestDevicePunchAnchor(input: {
  organizationId: string
  employeeId: string
  attendanceDate: string
}): Promise<{
  readonly id: string
  readonly eventType: string
  readonly occurredAt: Date
} | null> {
  const punches = await listDevicePunchesForEmployeeDate(input)
  const latest = punches.at(-1)
  if (!latest) return null
  return {
    id: latest.id,
    eventType: latest.eventType,
    occurredAt: latest.occurredAt,
  }
}

async function listLamSnapshotCorrectionRows(
  organizationId: string,
  exceptionKeys: ReadonlySet<string>
): Promise<TimeClockCorrectionWorkflowRow[]> {
  const [missing, duplicate, abnormal] = await Promise.all([
    listMissingPunchDayFindingsForOrg(organizationId),
    listDuplicatePunchDayFindingsForOrg(organizationId),
    listAbnormalPunchDayFindingsForOrg(organizationId),
  ])

  const candidates = [
    ...missing.map((row) => ({ row, codes: row.codes as readonly string[] })),
    ...duplicate.map((row) => ({ row, codes: row.codes as readonly string[] })),
    ...abnormal.map((row) => ({ row, codes: row.codes as readonly string[] })),
  ]

  const rows: TimeClockCorrectionWorkflowRow[] = []

  for (const { row, codes } of candidates) {
    const key = `${row.employeeId}:${row.attendanceDate}`
    if (exceptionKeys.has(key)) continue

    const anchor = await latestDevicePunchAnchor({
      organizationId,
      employeeId: row.employeeId,
      attendanceDate: row.attendanceDate,
    })
    if (!anchor) continue

    rows.push({
      id: lamRowId(row.employeeId, row.attendanceDate),
      employeeId: row.employeeId,
      employeeLegalName: row.employeeLegalName,
      employeeNumber: row.employeeNumber,
      attendanceDate: row.attendanceDate,
      category: resolveCorrectionCategoryFromLamCodes(codes),
      workflowStep: "lam_snapshot_correct",
      summary: row.summary,
      exceptionId: null,
      resolvedEventId: null,
      anchorEventId: anchor.id,
      anchorEventType: anchor.eventType,
      anchorOccurredAt: anchor.occurredAt,
    })
  }

  return rows
}

export async function listCorrectionWorkflowRowsForOrg(
  organizationId: string,
  options?: { limit?: number }
): Promise<TimeClockCorrectionWorkflowRow[]> {
  const limit = options?.limit ?? TCI_CORRECTION_WORKFLOW_LIST_LIMIT

  const [submitted, approved] = await Promise.all([
    listTimeClockExceptionsForOrg(organizationId, { state: "submitted" }),
    listTimeClockExceptionsForOrg(organizationId, { state: "approved" }),
  ])

  const exceptionRows = [
    ...submitted.map(exceptionToWorkflowRow),
    ...approved
      .filter((row) => row.resolvedEventId != null)
      .map(exceptionToWorkflowRow),
  ]

  const exceptionKeys = new Set(
    exceptionRows.map((row) => `${row.employeeId}:${row.attendanceDate}`)
  )

  const lamRows = await listLamSnapshotCorrectionRows(
    organizationId,
    exceptionKeys
  )

  return [...exceptionRows, ...lamRows]
    .sort((a, b) => {
      const stepOrder: Record<TciCorrectionWorkflowStep, number> = {
        needs_decision: 0,
        needs_lam_correction: 1,
        lam_snapshot_correct: 2,
      }
      const stepDiff = stepOrder[a.workflowStep] - stepOrder[b.workflowStep]
      if (stepDiff !== 0) return stepDiff
      return b.attendanceDate.localeCompare(a.attendanceDate)
    })
    .slice(0, limit)
}

export async function countCorrectionQueueOpenForOrg(
  organizationId: string
): Promise<number> {
  const rows = await listCorrectionWorkflowRowsForOrg(organizationId, {
    limit: 200,
  })
  return rows.length
}

export async function listCorrectionWorkflowRowsForOrgInRange(
  organizationId: string,
  input: {
    readonly startDate: string
    readonly endDate: string
    readonly employeeId?: string
  }
): Promise<TimeClockCorrectionWorkflowRow[]> {
  const rows = await listCorrectionWorkflowRowsForOrg(organizationId, {
    limit: 500,
  })
  return rows.filter((row) => {
    if (
      row.attendanceDate < input.startDate ||
      row.attendanceDate > input.endDate
    ) {
      return false
    }
    if (input.employeeId && row.employeeId !== input.employeeId) return false
    return true
  })
}
