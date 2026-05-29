import "server-only"

import { unstable_cache } from "next/cache"
import { cache } from "react"
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmAttendanceEvent,
  hrmEmployee,
  hrmTimeClockDevice,
  hrmTimeClockEmployeeMapping,
  hrmTimeClockPunchException,
  hrmTimeClockSyncBatch,
} from "@afenda/platform/db/schema"

import {
  TCI_ATTENDANCE_EVENT_DEVICE_SOURCE,
  TCI_RECENT_CLOCK_PUNCH_LIST_LIMIT,
} from "../tci-clock-punch-capture.shared"
import { TCI_RECENT_BREAK_PUNCH_LIST_LIMIT } from "../tci-break-punch-capture.shared"
import {
  countAbnormalPunchDaysForOrgKpi,
  countSubmittedAbnormalPunchExceptionsForOrg,
} from "./tci-abnormal-punch-detection.server"
import { countLamExposedHandoffsTodayForOrg } from "./tci-attendance-handoff.server"
import { countWorkHourDaysExposedTodayForOrg } from "./tci-overtime-reference.server"
import { countPayrollReadyDaysTodayForOrg } from "./tci-payroll-reference.server"
import { countCorrectionQueueOpenForOrg } from "./tci-correction-workflow.server"
import { hrmTimeClockOrgCacheTag } from "../tci-cache-tags.shared"
import { TCI_SYNC_MONITORING_STALE_MS } from "../tci-sync-monitoring.shared"
import { countShiftEvaluatedPunchesTodayForOrg } from "./tci-shift-matching.server"
import { countMissingPunchDaysForOrgKpi } from "./tci-missing-punch-detection.server"
import { countSubmittedDuplicatePunchExceptionsForOrg } from "./tci-duplicate-detection.server"
import {
  TCI_BREAK_PUNCH_EVENT_TYPES,
  TCI_CLOCK_IN_OUT_PUNCH_EVENT_TYPES,
  type TciBreakPunchEventType,
  type TciClockInOutPunchEventType,
  type TciDeviceState,
  type TciDeviceSyncStatus,
  type TciDeviceType,
  type TciMappingState,
} from "../schemas/tci-workflow-state.shared"

export type TimeClockDeviceRow = {
  readonly id: string
  readonly organizationId: string
  readonly externalDeviceId: string
  readonly name: string
  readonly deviceType: TciDeviceType
  readonly locationRef: string | null
  readonly state: TciDeviceState
  readonly syncStatus: TciDeviceSyncStatus
  readonly integrationCredentialRef: string | null
  readonly lastSyncAt: Date | null
  readonly createdAt: Date
}

type TimeClockDeviceSelectRow = {
  readonly id: string
  readonly organizationId: string
  readonly externalDeviceId: string
  readonly name: string
  readonly deviceType: string
  readonly locationRef: string | null
  readonly state: string
  readonly syncStatus: string
  readonly integrationCredentialRef: string | null
  readonly lastSyncAt: Date | null
  readonly createdAt: Date
}

function mapTimeClockDeviceRow(
  row: TimeClockDeviceSelectRow
): TimeClockDeviceRow {
  return {
    id: row.id,
    organizationId: row.organizationId,
    externalDeviceId: row.externalDeviceId,
    name: row.name,
    deviceType: row.deviceType as TciDeviceType,
    locationRef: row.locationRef,
    state: row.state as TciDeviceState,
    syncStatus: row.syncStatus as TciDeviceSyncStatus,
    integrationCredentialRef: row.integrationCredentialRef,
    lastSyncAt: row.lastSyncAt,
    createdAt: row.createdAt,
  }
}

export type TimeClockMappingRow = {
  readonly id: string
  readonly deviceId: string
  readonly deviceName: string
  readonly employeeId: string
  readonly employeeNumber: string | null
  readonly employeeLegalName: string | null
  readonly clockUserId: string | null
  readonly badgeId: string | null
  readonly biometricRef: string | null
  readonly state: TciMappingState
  readonly createdAt: Date
}

type TimeClockMappingSelectRow = {
  readonly id: string
  readonly deviceId: string
  readonly deviceName: string
  readonly employeeId: string
  readonly employeeNumber: string | null
  readonly employeeLegalName: string | null
  readonly clockUserId: string | null
  readonly badgeId: string | null
  readonly biometricRef: string | null
  readonly state: string
  readonly createdAt: Date
}

function mapTimeClockMappingRow(
  row: TimeClockMappingSelectRow
): TimeClockMappingRow {
  return {
    id: row.id,
    deviceId: row.deviceId,
    deviceName: row.deviceName,
    employeeId: row.employeeId,
    employeeNumber: row.employeeNumber,
    employeeLegalName: row.employeeLegalName,
    clockUserId: row.clockUserId,
    badgeId: row.badgeId,
    biometricRef: row.biometricRef,
    state: row.state as TciMappingState,
    createdAt: row.createdAt,
  }
}

export type TimeClockKpiSummary = {
  readonly activeDevices: number
  readonly activeMappings: number
  readonly pendingExceptions: number
  readonly failedSyncDevices: number
  readonly punchesToday: number
  readonly missingPunchDays: number
  readonly duplicatePunchInbox: number
  readonly abnormalPunchDays: number
  readonly abnormalPunchInbox: number
  readonly shiftEvaluatedToday: number
  readonly lamExposedToday: number
  readonly workHourDaysToday: number
  readonly payrollReadyDaysToday: number
  readonly correctionQueueOpen: number
}

export type TimeClockSyncBatchRow = {
  readonly id: string
  readonly deviceId: string | null
  readonly deviceName: string | null
  readonly sourceKind: string
  readonly state: string
  readonly receivedCount: number
  readonly acceptedCount: number
  readonly duplicateCount: number
  readonly rejectedCount: number
  readonly errorSummary: string | null
  readonly startedAt: Date
  readonly finishedAt: Date | null
}

export type TimeClockPunchRecordRow = {
  readonly id: string
  readonly employeeId: string
  readonly employeeLegalName: string | null
  readonly employeeNumber: string | null
  readonly deviceId: string | null
  readonly deviceName: string | null
  readonly externalDeviceId: string | null
  readonly eventType: TciClockInOutPunchEventType | TciBreakPunchEventType
  readonly occurredAt: Date
  readonly sourceRef: string | null
}

type TimeClockPunchRecordSelectRow = {
  readonly id: string
  readonly employeeId: string
  readonly employeeLegalName: string | null
  readonly employeeNumber: string | null
  readonly deviceId: string | null
  readonly deviceName: string | null
  readonly externalDeviceId: string | null
  readonly eventType: string
  readonly occurredAt: Date
  readonly sourceRef: string | null
}

function mapTimeClockPunchRecordRow(
  row: TimeClockPunchRecordSelectRow
): TimeClockPunchRecordRow {
  return {
    id: row.id,
    employeeId: row.employeeId,
    employeeLegalName: row.employeeLegalName,
    employeeNumber: row.employeeNumber,
    deviceId: row.deviceId,
    deviceName: row.deviceName,
    externalDeviceId: row.externalDeviceId,
    eventType: row.eventType as
      | TciClockInOutPunchEventType
      | TciBreakPunchEventType,
    occurredAt: row.occurredAt,
    sourceRef: row.sourceRef,
  }
}

export type TimeClockExceptionRow = {
  readonly id: string
  readonly employeeId: string
  readonly employeeLegalName: string | null
  readonly employeeNumber: string | null
  readonly deviceName: string | null
  readonly eventType: string
  readonly occurredAt: Date
  readonly detectionOutcome: string
  readonly reason: string
  readonly state: string
  readonly resolvedEventId: string | null
  readonly createdAt: Date
}

async function listTimeClockDevicesForOrgUncached(
  organizationId: string
): Promise<TimeClockDeviceRow[]> {
  const rows = await db
    .select({
      id: hrmTimeClockDevice.id,
      organizationId: hrmTimeClockDevice.organizationId,
      externalDeviceId: hrmTimeClockDevice.externalDeviceId,
      name: hrmTimeClockDevice.name,
      deviceType: hrmTimeClockDevice.deviceType,
      locationRef: hrmTimeClockDevice.locationRef,
      state: hrmTimeClockDevice.state,
      syncStatus: hrmTimeClockDevice.syncStatus,
      integrationCredentialRef: hrmTimeClockDevice.integrationCredentialRef,
      lastSyncAt: hrmTimeClockDevice.lastSyncAt,
      createdAt: hrmTimeClockDevice.createdAt,
    })
    .from(hrmTimeClockDevice)
    .where(eq(hrmTimeClockDevice.organizationId, organizationId))
    .orderBy(desc(hrmTimeClockDevice.updatedAt))

  return rows.map(mapTimeClockDeviceRow)
}

export const listTimeClockDevicesForOrg = cache(
  async function listTimeClockDevicesForOrg(
    organizationId: string
  ): Promise<TimeClockDeviceRow[]> {
    return unstable_cache(
      () => listTimeClockDevicesForOrgUncached(organizationId),
      [`hrm-tci-devices:${organizationId}`],
      { tags: [hrmTimeClockOrgCacheTag(organizationId)] }
    )()
  }
)

export async function getTimeClockDeviceForOrg(
  organizationId: string,
  deviceId: string
) {
  return db.query.hrmTimeClockDevice.findFirst({
    where: and(
      eq(hrmTimeClockDevice.organizationId, organizationId),
      eq(hrmTimeClockDevice.id, deviceId)
    ),
  })
}

export async function findTimeClockDeviceByExternalId(input: {
  organizationId: string
  externalDeviceId: string
}) {
  return db.query.hrmTimeClockDevice.findFirst({
    where: and(
      eq(hrmTimeClockDevice.organizationId, input.organizationId),
      eq(hrmTimeClockDevice.externalDeviceId, input.externalDeviceId)
    ),
  })
}

async function listTimeClockMappingsForOrgUncached(
  organizationId: string
): Promise<TimeClockMappingRow[]> {
  const rows = await db
    .select({
      id: hrmTimeClockEmployeeMapping.id,
      deviceId: hrmTimeClockEmployeeMapping.deviceId,
      deviceName: hrmTimeClockDevice.name,
      employeeId: hrmTimeClockEmployeeMapping.employeeId,
      employeeNumber: hrmEmployee.employeeNumber,
      employeeLegalName: hrmEmployee.legalName,
      clockUserId: hrmTimeClockEmployeeMapping.clockUserId,
      badgeId: hrmTimeClockEmployeeMapping.badgeId,
      biometricRef: hrmTimeClockEmployeeMapping.biometricRef,
      state: hrmTimeClockEmployeeMapping.state,
      createdAt: hrmTimeClockEmployeeMapping.createdAt,
    })
    .from(hrmTimeClockEmployeeMapping)
    .innerJoin(
      hrmTimeClockDevice,
      eq(hrmTimeClockEmployeeMapping.deviceId, hrmTimeClockDevice.id)
    )
    .innerJoin(
      hrmEmployee,
      eq(hrmTimeClockEmployeeMapping.employeeId, hrmEmployee.id)
    )
    .where(eq(hrmTimeClockEmployeeMapping.organizationId, organizationId))
    .orderBy(desc(hrmTimeClockEmployeeMapping.updatedAt))

  return rows.map(mapTimeClockMappingRow)
}

export const listTimeClockMappingsForOrg = cache(
  async function listTimeClockMappingsForOrg(
    organizationId: string
  ): Promise<TimeClockMappingRow[]> {
    return unstable_cache(
      () => listTimeClockMappingsForOrgUncached(organizationId),
      [`hrm-tci-mappings:${organizationId}`],
      { tags: [hrmTimeClockOrgCacheTag(organizationId)] }
    )()
  }
)

export async function findActiveTimeClockMapping(input: {
  organizationId: string
  deviceId: string
  clockUserId: string
}) {
  return db.query.hrmTimeClockEmployeeMapping.findFirst({
    where: and(
      eq(hrmTimeClockEmployeeMapping.organizationId, input.organizationId),
      eq(hrmTimeClockEmployeeMapping.deviceId, input.deviceId),
      eq(hrmTimeClockEmployeeMapping.clockUserId, input.clockUserId),
      eq(hrmTimeClockEmployeeMapping.state, "active")
    ),
  })
}

export async function findActiveTimeClockMappingForEmployee(input: {
  organizationId: string
  deviceId: string
  employeeId: string
}) {
  return db.query.hrmTimeClockEmployeeMapping.findFirst({
    where: and(
      eq(hrmTimeClockEmployeeMapping.organizationId, input.organizationId),
      eq(hrmTimeClockEmployeeMapping.deviceId, input.deviceId),
      eq(hrmTimeClockEmployeeMapping.employeeId, input.employeeId),
      eq(hrmTimeClockEmployeeMapping.state, "active")
    ),
  })
}

export async function getTimeClockExceptionForOrg(
  organizationId: string,
  exceptionId: string
) {
  const rows = await db
    .select({
      id: hrmTimeClockPunchException.id,
      organizationId: hrmTimeClockPunchException.organizationId,
      employeeId: hrmTimeClockPunchException.employeeId,
      deviceId: hrmTimeClockPunchException.deviceId,
      state: hrmTimeClockPunchException.state,
      eventType: hrmTimeClockPunchException.eventType,
      occurredAt: hrmTimeClockPunchException.occurredAt,
      detectionOutcome: hrmTimeClockPunchException.detectionOutcome,
      reason: hrmTimeClockPunchException.reason,
      rawPayloadHash: hrmTimeClockPunchException.rawPayloadHash,
      sourceRef: hrmTimeClockPunchException.sourceRef,
      externalDeviceId: hrmTimeClockDevice.externalDeviceId,
    })
    .from(hrmTimeClockPunchException)
    .leftJoin(
      hrmTimeClockDevice,
      eq(hrmTimeClockPunchException.deviceId, hrmTimeClockDevice.id)
    )
    .where(
      and(
        eq(hrmTimeClockPunchException.organizationId, organizationId),
        eq(hrmTimeClockPunchException.id, exceptionId)
      )
    )
    .limit(1)

  return rows[0] ?? null
}

async function countTimeClockKpiSummaryUncached(
  organizationId: string
): Promise<TimeClockKpiSummary> {
  const startOfDay = new Date()
  startOfDay.setUTCHours(0, 0, 0, 0)
  const syncStaleBefore = new Date(Date.now() - TCI_SYNC_MONITORING_STALE_MS)

  const [
    deviceCounts,
    mappingCount,
    exceptionCount,
    punchCount,
    missingPunchDays,
    duplicatePunchInbox,
    abnormalPunchDays,
    abnormalPunchInbox,
    shiftEvaluatedToday,
    lamExposedToday,
    workHourDaysToday,
    payrollReadyDaysToday,
    correctionQueueOpen,
  ] = await Promise.all([
    db
      .select({
        active: sql<number>`count(*) filter (where ${hrmTimeClockDevice.state} = 'active')`,
        failed: sql<number>`count(*) filter (where ${hrmTimeClockDevice.syncStatus} = 'failed'
            OR (${hrmTimeClockDevice.syncStatus} = 'syncing'
              AND ${hrmTimeClockDevice.lastSyncAt} < ${syncStaleBefore}))`,
      })
      .from(hrmTimeClockDevice)
      .where(eq(hrmTimeClockDevice.organizationId, organizationId)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(hrmTimeClockEmployeeMapping)
      .where(
        and(
          eq(hrmTimeClockEmployeeMapping.organizationId, organizationId),
          eq(hrmTimeClockEmployeeMapping.state, "active")
        )
      ),
    db
      .select({ count: sql<number>`count(*)` })
      .from(hrmTimeClockPunchException)
      .where(
        and(
          eq(hrmTimeClockPunchException.organizationId, organizationId),
          eq(hrmTimeClockPunchException.state, "submitted")
        )
      ),
    db
      .select({ count: sql<number>`count(*)` })
      .from(hrmAttendanceEvent)
      .where(
        and(
          eq(hrmAttendanceEvent.organizationId, organizationId),
          eq(hrmAttendanceEvent.source, TCI_ATTENDANCE_EVENT_DEVICE_SOURCE),
          inArray(hrmAttendanceEvent.eventType, [
            ...TCI_CLOCK_IN_OUT_PUNCH_EVENT_TYPES,
          ]),
          gte(hrmAttendanceEvent.occurredAt, startOfDay)
        )
      ),
    countMissingPunchDaysForOrgKpi(organizationId),
    countSubmittedDuplicatePunchExceptionsForOrg(organizationId),
    countAbnormalPunchDaysForOrgKpi(organizationId),
    countSubmittedAbnormalPunchExceptionsForOrg(organizationId),
    countShiftEvaluatedPunchesTodayForOrg(organizationId),
    countLamExposedHandoffsTodayForOrg(organizationId),
    countWorkHourDaysExposedTodayForOrg(organizationId),
    countPayrollReadyDaysTodayForOrg(organizationId),
    countCorrectionQueueOpenForOrg(organizationId),
  ])

  const devices = deviceCounts[0]

  return {
    activeDevices: Number(devices?.active ?? 0),
    activeMappings: Number(mappingCount[0]?.count ?? 0),
    pendingExceptions: Number(exceptionCount[0]?.count ?? 0),
    failedSyncDevices: Number(devices?.failed ?? 0),
    punchesToday: Number(punchCount[0]?.count ?? 0),
    missingPunchDays,
    duplicatePunchInbox,
    abnormalPunchDays,
    abnormalPunchInbox,
    shiftEvaluatedToday,
    lamExposedToday,
    workHourDaysToday,
    payrollReadyDaysToday,
    correctionQueueOpen,
  }
}

export const countTimeClockKpiSummary = cache(
  async function countTimeClockKpiSummary(
    organizationId: string
  ): Promise<TimeClockKpiSummary> {
    const dayKey = new Date().toISOString().slice(0, 10)
    return unstable_cache(
      () => countTimeClockKpiSummaryUncached(organizationId),
      [`hrm-tci-kpi:${organizationId}:${dayKey}`],
      { tags: [hrmTimeClockOrgCacheTag(organizationId)] }
    )()
  }
)

async function listRecentClockInOutPunchesForOrgUncached(
  organizationId: string,
  limit: number
): Promise<TimeClockPunchRecordRow[]> {
  const rows = await db
    .select({
      id: hrmAttendanceEvent.id,
      employeeId: hrmAttendanceEvent.employeeId,
      employeeLegalName: hrmEmployee.legalName,
      employeeNumber: hrmEmployee.employeeNumber,
      deviceId: hrmAttendanceEvent.deviceId,
      deviceName: hrmTimeClockDevice.name,
      externalDeviceId: hrmTimeClockDevice.externalDeviceId,
      eventType: hrmAttendanceEvent.eventType,
      occurredAt: hrmAttendanceEvent.occurredAt,
      sourceRef: hrmAttendanceEvent.sourceRef,
    })
    .from(hrmAttendanceEvent)
    .innerJoin(hrmEmployee, eq(hrmAttendanceEvent.employeeId, hrmEmployee.id))
    .leftJoin(
      hrmTimeClockDevice,
      eq(hrmAttendanceEvent.deviceId, hrmTimeClockDevice.id)
    )
    .where(
      and(
        eq(hrmAttendanceEvent.organizationId, organizationId),
        eq(hrmAttendanceEvent.source, TCI_ATTENDANCE_EVENT_DEVICE_SOURCE),
        inArray(hrmAttendanceEvent.eventType, [
          ...TCI_CLOCK_IN_OUT_PUNCH_EVENT_TYPES,
        ])
      )
    )
    .orderBy(desc(hrmAttendanceEvent.occurredAt))
    .limit(limit)

  return rows.map(mapTimeClockPunchRecordRow)
}

export const listRecentClockInOutPunchesForOrg = cache(
  async function listRecentClockInOutPunchesForOrg(
    organizationId: string,
    options?: { limit?: number }
  ): Promise<TimeClockPunchRecordRow[]> {
    const limit = options?.limit ?? TCI_RECENT_CLOCK_PUNCH_LIST_LIMIT
    return unstable_cache(
      () => listRecentClockInOutPunchesForOrgUncached(organizationId, limit),
      [`hrm-tci-punch-records:${organizationId}:${limit}`],
      { tags: [hrmTimeClockOrgCacheTag(organizationId)] }
    )()
  }
)

/** HRM-TCI-007 — recent break_start / break_end device punches (org-scoped). */
async function listRecentBreakPunchesForOrgUncached(
  organizationId: string,
  limit: number
): Promise<TimeClockPunchRecordRow[]> {
  const rows = await db
    .select({
      id: hrmAttendanceEvent.id,
      employeeId: hrmAttendanceEvent.employeeId,
      employeeLegalName: hrmEmployee.legalName,
      employeeNumber: hrmEmployee.employeeNumber,
      deviceId: hrmAttendanceEvent.deviceId,
      deviceName: hrmTimeClockDevice.name,
      externalDeviceId: hrmTimeClockDevice.externalDeviceId,
      eventType: hrmAttendanceEvent.eventType,
      occurredAt: hrmAttendanceEvent.occurredAt,
      sourceRef: hrmAttendanceEvent.sourceRef,
    })
    .from(hrmAttendanceEvent)
    .innerJoin(hrmEmployee, eq(hrmAttendanceEvent.employeeId, hrmEmployee.id))
    .leftJoin(
      hrmTimeClockDevice,
      eq(hrmAttendanceEvent.deviceId, hrmTimeClockDevice.id)
    )
    .where(
      and(
        eq(hrmAttendanceEvent.organizationId, organizationId),
        eq(hrmAttendanceEvent.source, TCI_ATTENDANCE_EVENT_DEVICE_SOURCE),
        inArray(hrmAttendanceEvent.eventType, [...TCI_BREAK_PUNCH_EVENT_TYPES])
      )
    )
    .orderBy(desc(hrmAttendanceEvent.occurredAt))
    .limit(limit)

  return rows.map(mapTimeClockPunchRecordRow)
}

export const listRecentBreakPunchesForOrg = cache(
  async function listRecentBreakPunchesForOrg(
    organizationId: string,
    options?: { limit?: number }
  ): Promise<TimeClockPunchRecordRow[]> {
    const limit = options?.limit ?? TCI_RECENT_BREAK_PUNCH_LIST_LIMIT
    return unstable_cache(
      () => listRecentBreakPunchesForOrgUncached(organizationId, limit),
      [`hrm-tci-break-punches:${organizationId}:${limit}`],
      { tags: [hrmTimeClockOrgCacheTag(organizationId)] }
    )()
  }
)

async function listTimeClockExceptionsForOrgUncached(
  organizationId: string,
  stateFilter: string | undefined
): Promise<TimeClockExceptionRow[]> {
  const conditions = [
    eq(hrmTimeClockPunchException.organizationId, organizationId),
  ]
  if (stateFilter) {
    conditions.push(eq(hrmTimeClockPunchException.state, stateFilter))
  }

  return db
    .select({
      id: hrmTimeClockPunchException.id,
      employeeId: hrmTimeClockPunchException.employeeId,
      employeeLegalName: hrmEmployee.legalName,
      employeeNumber: hrmEmployee.employeeNumber,
      deviceName: hrmTimeClockDevice.name,
      eventType: hrmTimeClockPunchException.eventType,
      occurredAt: hrmTimeClockPunchException.occurredAt,
      detectionOutcome: hrmTimeClockPunchException.detectionOutcome,
      reason: hrmTimeClockPunchException.reason,
      state: hrmTimeClockPunchException.state,
      resolvedEventId: hrmTimeClockPunchException.resolvedEventId,
      createdAt: hrmTimeClockPunchException.createdAt,
    })
    .from(hrmTimeClockPunchException)
    .leftJoin(
      hrmEmployee,
      eq(hrmTimeClockPunchException.employeeId, hrmEmployee.id)
    )
    .leftJoin(
      hrmTimeClockDevice,
      eq(hrmTimeClockPunchException.deviceId, hrmTimeClockDevice.id)
    )
    .where(and(...conditions))
    .orderBy(desc(hrmTimeClockPunchException.createdAt))
    .limit(100)
}

export const listTimeClockExceptionsForOrg = cache(
  async function listTimeClockExceptionsForOrg(
    organizationId: string,
    options?: { state?: string }
  ): Promise<TimeClockExceptionRow[]> {
    const stateFilter = options?.state
    return unstable_cache(
      () => listTimeClockExceptionsForOrgUncached(organizationId, stateFilter),
      [`hrm-tci-exceptions:${organizationId}:${stateFilter ?? "all"}`],
      { tags: [hrmTimeClockOrgCacheTag(organizationId)] }
    )()
  }
)

async function listTimeClockSyncBatchesForOrgUncached(
  organizationId: string
): Promise<TimeClockSyncBatchRow[]> {
  return db
    .select({
      id: hrmTimeClockSyncBatch.id,
      deviceId: hrmTimeClockSyncBatch.deviceId,
      deviceName: hrmTimeClockDevice.name,
      sourceKind: hrmTimeClockSyncBatch.sourceKind,
      state: hrmTimeClockSyncBatch.state,
      receivedCount: hrmTimeClockSyncBatch.receivedCount,
      acceptedCount: hrmTimeClockSyncBatch.acceptedCount,
      duplicateCount: hrmTimeClockSyncBatch.duplicateCount,
      rejectedCount: hrmTimeClockSyncBatch.rejectedCount,
      errorSummary: hrmTimeClockSyncBatch.errorSummary,
      startedAt: hrmTimeClockSyncBatch.startedAt,
      finishedAt: hrmTimeClockSyncBatch.finishedAt,
    })
    .from(hrmTimeClockSyncBatch)
    .leftJoin(
      hrmTimeClockDevice,
      eq(hrmTimeClockSyncBatch.deviceId, hrmTimeClockDevice.id)
    )
    .where(eq(hrmTimeClockSyncBatch.organizationId, organizationId))
    .orderBy(desc(hrmTimeClockSyncBatch.startedAt))
    .limit(50)
}

export const listTimeClockSyncBatchesForOrg = cache(
  async function listTimeClockSyncBatchesForOrg(
    organizationId: string
  ): Promise<TimeClockSyncBatchRow[]> {
    return unstable_cache(
      () => listTimeClockSyncBatchesForOrgUncached(organizationId),
      [`hrm-tci-sync-batches:${organizationId}`],
      { tags: [hrmTimeClockOrgCacheTag(organizationId)] }
    )()
  }
)
