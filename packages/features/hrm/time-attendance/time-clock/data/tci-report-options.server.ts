import "server-only"

import { and, asc, eq, isNotNull, isNull } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import { hrmDepartment, hrmEmployee, hrmTimeClockDevice } from "@afenda/platform/db/schema"

import {
  TCI_DETECTION_OUTCOMES,
  TCI_DEVICE_SYNC_STATUSES,
} from "../schemas/tci-workflow-state.shared"
import { TCI_REPORT_ROW_KINDS } from "../tci-operational-reports.shared"
import type { TimeClockReportFilterOptions } from "../tci-report-filter-options.shared"

export type { TimeClockReportFilterOptions } from "../tci-report-filter-options.shared"

export async function listTimeClockReportFilterOptions(
  organizationId: string
): Promise<TimeClockReportFilterOptions> {
  const [employeeRows, deviceRows, departmentRows, locationRows] =
    await Promise.all([
      db
        .select({
          id: hrmEmployee.id,
          employeeNumber: hrmEmployee.employeeNumber,
          legalName: hrmEmployee.legalName,
        })
        .from(hrmEmployee)
        .where(
          and(
            eq(hrmEmployee.organizationId, organizationId),
            eq(hrmEmployee.employmentStatus, "active")
          )
        )
        .orderBy(asc(hrmEmployee.employeeNumber))
        .limit(300),
      db
        .select({
          id: hrmTimeClockDevice.id,
          externalDeviceId: hrmTimeClockDevice.externalDeviceId,
          name: hrmTimeClockDevice.name,
        })
        .from(hrmTimeClockDevice)
        .where(
          and(
            eq(hrmTimeClockDevice.organizationId, organizationId),
            eq(hrmTimeClockDevice.state, "active")
          )
        )
        .orderBy(asc(hrmTimeClockDevice.externalDeviceId))
        .limit(200),
      db
        .select({
          id: hrmDepartment.id,
          code: hrmDepartment.code,
          name: hrmDepartment.name,
        })
        .from(hrmDepartment)
        .where(
          and(
            eq(hrmDepartment.organizationId, organizationId),
            isNull(hrmDepartment.archivedAt)
          )
        )
        .orderBy(asc(hrmDepartment.code))
        .limit(200),
      db
        .selectDistinct({
          locationRef: hrmTimeClockDevice.locationRef,
        })
        .from(hrmTimeClockDevice)
        .where(
          and(
            eq(hrmTimeClockDevice.organizationId, organizationId),
            isNotNull(hrmTimeClockDevice.locationRef)
          )
        )
        .orderBy(asc(hrmTimeClockDevice.locationRef))
        .limit(100),
    ])

  const departments = departmentRows.map((row) => ({
    value: row.id,
    label: `${row.code} — ${row.name}`,
  }))

  return {
    employees: employeeRows.map((row) => ({
      value: row.id,
      label: `${row.employeeNumber} — ${row.legalName}`,
    })),
    devices: deviceRows.map((row) => ({
      value: row.id,
      label: `${row.externalDeviceId} — ${row.name}`,
    })),
    departments,
    locations: locationRows
      .map((row) => row.locationRef)
      .filter((ref): ref is string => Boolean(ref?.trim()))
      .map((ref) => ({ value: ref, label: ref })),
    detectionOutcomes: TCI_DETECTION_OUTCOMES.map((value) => ({
      value,
      label: value,
    })),
    syncStatuses: TCI_DEVICE_SYNC_STATUSES.map((value) => ({
      value,
      label: value,
    })),
    rowKinds: TCI_REPORT_ROW_KINDS.map((value) => ({
      value,
      label: value,
    })),
  }
}
