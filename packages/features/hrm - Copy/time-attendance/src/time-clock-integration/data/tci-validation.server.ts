import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmAttendanceEvent,
  hrmEmployee,
  hrmTimeClockDevice,
} from "@afenda/platform/db/schema"

import type { TimeClockIngestPunchInput } from "../schemas/tci.schema"
import {
  isTciBreakPunchEventType,
  type TciDetectionOutcome,
} from "../schemas/tci-workflow-state.shared"

import { resolveTciBreakPunchCaptureEnabled } from "./tci-break-punch-enablement.server"

import {
  findActiveTimeClockMapping,
  findTimeClockDeviceByExternalId,
} from "./tci.queries.server"
import { findShiftAssignmentForTimeClockPunch } from "./tci-shift-matching.server"
import { isTimeClockPunchWithinShiftWindow } from "./tci-punch-validation.shared"
import { resolveTimeClockEmployeeStatusValidation } from "../tci-active-employee-validation.shared"
import { resolveTimeClockDeviceMappingValidation } from "../tci-device-mapping-validation.shared"
import { resolveTimeClockPunchPayloadHash } from "../tci-punch-deduplication.shared"

export type TimeClockValidationInput = {
  readonly organizationId: string
  readonly deviceId: string
  readonly employeeId: string
  readonly punch: TimeClockIngestPunchInput
}

export type TimeClockValidationResult =
  | { readonly ok: true }
  | {
      readonly ok: false
      readonly outcome: TciDetectionOutcome
      readonly message: string
    }

export async function evaluateTimeClockPunch(
  input: TimeClockValidationInput
): Promise<TimeClockValidationResult> {
  const employee = await db.query.hrmEmployee.findFirst({
    where: and(
      eq(hrmEmployee.organizationId, input.organizationId),
      eq(hrmEmployee.id, input.employeeId)
    ),
    columns: { id: true, employmentStatus: true },
  })

  const employeeStatus = resolveTimeClockEmployeeStatusValidation(employee)
  if (!employeeStatus.ok) {
    return {
      ok: false,
      outcome: employeeStatus.outcome,
      message: employeeStatus.message,
    }
  }

  const device = await db.query.hrmTimeClockDevice.findFirst({
    where: and(
      eq(hrmTimeClockDevice.organizationId, input.organizationId),
      eq(hrmTimeClockDevice.id, input.deviceId)
    ),
    columns: { id: true, state: true },
  })

  if (!device || device.state !== "active") {
    return {
      ok: false,
      outcome: "inactive_device",
      message: "Time clock device is not active.",
    }
  }

  if (isTciBreakPunchEventType(input.punch.eventType)) {
    const breakCaptureEnabled = await resolveTciBreakPunchCaptureEnabled(
      input.organizationId
    )
    if (!breakCaptureEnabled) {
      return {
        ok: false,
        outcome: "break_capture_disabled",
        message: "Break punch capture is not enabled for this organization.",
      }
    }
  }

  const mapping = await findActiveTimeClockMapping({
    organizationId: input.organizationId,
    deviceId: input.deviceId,
    clockUserId: input.punch.clockUserId,
  })

  const deviceMapping = resolveTimeClockDeviceMappingValidation({
    mapping,
    expectedEmployeeId: input.employeeId,
  })
  if (!deviceMapping.ok) {
    return {
      ok: false,
      outcome: deviceMapping.outcome,
      message: deviceMapping.message,
    }
  }

  const payloadHash = resolveTimeClockPunchPayloadHash({
    organizationId: input.organizationId,
    deviceId: input.deviceId,
    employeeId: input.employeeId,
    punch: input.punch,
  })
  const duplicate = await db.query.hrmAttendanceEvent.findFirst({
    where: and(
      eq(hrmAttendanceEvent.organizationId, input.organizationId),
      eq(hrmAttendanceEvent.rawPayloadHash, payloadHash)
    ),
    columns: { id: true },
  })
  if (duplicate) {
    return {
      ok: false,
      outcome: "duplicate_punch",
      message: "Duplicate punch payload.",
    }
  }

  const occurredAt = new Date(input.punch.occurredAtIso)
  const attendanceDate = occurredAt.toISOString().slice(0, 10)
  const shift = await findShiftAssignmentForTimeClockPunch({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    attendanceDate,
  })

  if (
    shift &&
    !isTimeClockPunchWithinShiftWindow({
      occurredAt,
      scheduledStartAt: shift.scheduledStartAt,
      scheduledEndAt: shift.scheduledEndAt,
    })
  ) {
    return {
      ok: false,
      outcome: "outside_shift_window",
      message: "Punch is outside the assigned shift window.",
    }
  }

  return { ok: true }
}

export async function resolveTimeClockIngestContext(input: {
  organizationId: string
  punch: TimeClockIngestPunchInput
}) {
  const device = await findTimeClockDeviceByExternalId({
    organizationId: input.organizationId,
    externalDeviceId: input.punch.externalDeviceId,
  })
  if (!device) return null

  const mapping = await findActiveTimeClockMapping({
    organizationId: input.organizationId,
    deviceId: device.id,
    clockUserId: input.punch.clockUserId,
  })
  if (!mapping)
    return { device, mapping: null, employeeId: null as string | null }

  return {
    device,
    mapping,
    employeeId: mapping.employeeId,
  }
}
