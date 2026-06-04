import {
  hrAttendanceDays,
  hrDepartments,
  hrEmployees,
  hrLeaveRequests,
  runWithOrganizationContext,
} from "@afenda/db";
import { alias } from "drizzle-orm/pg-core";
import { and, eq, gte, inArray, isNull, lte } from "drizzle-orm";

import { maskHrAatAbsenceReason } from "./hrs-hr-time-aat-reason-masking-server";
import {
  HRM_AAT_REPORT_EXPORT_ROW_CAP,
  type HrAatReportGroupBy,
  type HrAatReportPeriodGranularity,
  type HrAatTrendReportCsvResult,
  type HrAatTrendReportFilter,
  type HrAatTrendReportResult,
  type HrAatTrendReportRow,
} from "./hr.time.aat-report.schema";

type AbsenceEvent = {
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  departmentId: string | null;
  departmentName: string | null;
  managerEmployeeId: string | null;
  managerDisplayName: string | null;
  locationCode: string | null;
  legalEntityCode: string | null;
  leaveType: string | null;
  eventDate: Date;
  lostWorkdays: number;
  reason: string | null;
};

type BuildHrAatTrendReportInput = HrAatTrendReportFilter & {
  organizationId: string;
  visibleEmployeeIds: readonly string[] | null;
  canViewSensitiveReasons: boolean;
  actorEmployeeIds: readonly string[];
};

function escapeCsvCell(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildCsv(headers: readonly string[], rows: readonly string[][]) {
  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => row.map(escapeCsvCell).join(",")),
  ];
  return lines.join("\n");
}

function parsePeriodBounds(filter: Pick<
  HrAatTrendReportFilter,
  "periodStartIso" | "periodEndIso"
>) {
  const periodStart = new Date(filter.periodStartIso);
  const periodEnd = new Date(filter.periodEndIso);
  if (
    Number.isNaN(periodStart.getTime()) ||
    Number.isNaN(periodEnd.getTime()) ||
    periodStart > periodEnd
  ) {
    throw new Error("invalid_period_range");
  }
  return { periodStart, periodEnd };
}

function formatPeriodLabel(
  date: Date,
  granularity: HrAatReportPeriodGranularity,
): string {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  switch (granularity) {
    case "daily":
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    case "weekly": {
      const weekStart = new Date(Date.UTC(year, date.getUTCMonth(), day));
      weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());
      return `week-${weekStart.toISOString().slice(0, 10)}`;
    }
    case "monthly":
      return `${year}-${String(month).padStart(2, "0")}`;
    case "quarterly": {
      const quarter = Math.floor((month - 1) / 3) + 1;
      return `${year}-Q${quarter}`;
    }
    case "yearly":
      return String(year);
    default:
      return `${year}-${String(month).padStart(2, "0")}`;
  }
}

function periodBucketKey(
  date: Date,
  granularity: HrAatReportPeriodGranularity,
): string {
  return formatPeriodLabel(date, granularity);
}

function aggregateKey(
  event: AbsenceEvent,
  groupBy: HrAatReportGroupBy,
  periodGranularity: HrAatReportPeriodGranularity,
): { key: string; label: string; periodLabel: string | null } {
  const periodLabel = periodBucketKey(event.eventDate, periodGranularity);

  switch (groupBy) {
    case "employee":
      return {
        key: event.employeeId,
        label: `${event.employeeNumber} · ${event.employeeDisplayName}`,
        periodLabel,
      };
    case "department":
      return {
        key: event.departmentId ?? "unassigned",
        label: event.departmentName ?? "Unassigned",
        periodLabel,
      };
    case "manager":
      return {
        key: event.managerEmployeeId ?? "unassigned",
        label: event.managerDisplayName ?? "Unassigned",
        periodLabel,
      };
    case "location":
      return {
        key: event.locationCode ?? "unassigned",
        label: event.locationCode ?? "Unassigned",
        periodLabel,
      };
    case "legal_entity":
      return {
        key: event.legalEntityCode ?? "unassigned",
        label: event.legalEntityCode ?? "Unassigned",
        periodLabel,
      };
    case "leave_type":
      return {
        key: event.leaveType ?? "attendance_absence",
        label: event.leaveType ?? "Attendance absence",
        periodLabel,
      };
    case "period":
      return {
        key: periodLabel,
        label: periodLabel,
        periodLabel,
      };
    default:
      return { key: event.employeeId, label: event.employeeDisplayName, periodLabel };
  }
}

function aggregateAbsenceEvents(input: {
  events: readonly AbsenceEvent[];
  groupBy: HrAatReportGroupBy;
  periodGranularity: HrAatReportPeriodGranularity;
  canViewSensitiveReasons: boolean;
  actorEmployeeIds: readonly string[];
}): HrAatTrendReportRow[] {
  const buckets = new Map<
    string,
    {
      sample: AbsenceEvent;
      absenceCount: number;
      lostWorkdays: number;
      reasonSample: string | null;
    }
  >();

  for (const event of input.events) {
    const { key } = aggregateKey(event, input.groupBy, input.periodGranularity);
    const bucket = buckets.get(key);
    const maskedReason = maskHrAatAbsenceReason({
      reason: event.reason,
      leaveType: event.leaveType,
      canViewSensitiveReasons: input.canViewSensitiveReasons,
      actorEmployeeIds: input.actorEmployeeIds,
      subjectEmployeeId: event.employeeId,
    });

    if (!bucket) {
      buckets.set(key, {
        sample: event,
        absenceCount: 1,
        lostWorkdays: event.lostWorkdays,
        reasonSample: maskedReason,
      });
      continue;
    }

    bucket.absenceCount += 1;
    bucket.lostWorkdays += event.lostWorkdays;
    if (!bucket.reasonSample && maskedReason) {
      bucket.reasonSample = maskedReason;
    }
  }

  const workingDaysInPeriod = Math.max(
    1,
    new Set(input.events.map((event) => event.eventDate.toISOString().slice(0, 10)))
      .size,
  );

  return [...buckets.entries()]
    .map(([groupKey, bucket]) => {
      const { label, periodLabel } = aggregateKey(
        bucket.sample,
        input.groupBy,
        input.periodGranularity,
      );
      const absenceRatePercent =
        workingDaysInPeriod > 0
          ? Number(((bucket.lostWorkdays / workingDaysInPeriod) * 100).toFixed(2))
          : null;

      return {
        groupKey,
        groupLabel: label,
        employeeId:
          input.groupBy === "employee" ? bucket.sample.employeeId : null,
        employeeNumber:
          input.groupBy === "employee" ? bucket.sample.employeeNumber : null,
        employeeDisplayName:
          input.groupBy === "employee" ? bucket.sample.employeeDisplayName : null,
        departmentId:
          input.groupBy === "department" ? bucket.sample.departmentId : null,
        departmentName:
          input.groupBy === "department" ? bucket.sample.departmentName : null,
        managerEmployeeId:
          input.groupBy === "manager" ? bucket.sample.managerEmployeeId : null,
        managerDisplayName:
          input.groupBy === "manager" ? bucket.sample.managerDisplayName : null,
        locationCode:
          input.groupBy === "location" ? bucket.sample.locationCode : null,
        legalEntityCode:
          input.groupBy === "legal_entity" ? bucket.sample.legalEntityCode : null,
        leaveType: input.groupBy === "leave_type" ? bucket.sample.leaveType : null,
        periodLabel: input.groupBy === "period" ? periodLabel : periodLabel,
        absenceCount: bucket.absenceCount,
        lostWorkdays: Number(bucket.lostWorkdays.toFixed(2)),
        absenceFrequency: bucket.absenceCount,
        absenceRatePercent,
        reasonSample: bucket.reasonSample,
      };
    })
    .sort((left, right) => right.lostWorkdays - left.lostWorkdays);
}

async function loadAbsenceEvents(
  input: BuildHrAatTrendReportInput,
): Promise<AbsenceEvent[]> {
  const { periodStart, periodEnd } = parsePeriodBounds(input);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const managerEmployee = alias(hrEmployees, "manager_employee");
    const leaveConditions = [
      eq(hrLeaveRequests.organizationId, input.organizationId),
      eq(hrLeaveRequests.status, "approved"),
      gte(hrLeaveRequests.startAt, periodStart),
      lte(hrLeaveRequests.endAt, periodEnd),
      isNull(hrEmployees.archivedAt),
    ];
    const attendanceConditions = [
      eq(hrAttendanceDays.organizationId, input.organizationId),
      inArray(hrAttendanceDays.status, ["absent", "missing_punch"]),
      gte(hrAttendanceDays.workDate, periodStart),
      lte(hrAttendanceDays.workDate, periodEnd),
      isNull(hrEmployees.archivedAt),
    ];

    if (input.visibleEmployeeIds) {
      if (input.visibleEmployeeIds.length === 0) {
        return [];
      }
      leaveConditions.push(
        inArray(hrLeaveRequests.employeeId, [...input.visibleEmployeeIds]),
      );
      attendanceConditions.push(
        inArray(hrAttendanceDays.employeeId, [...input.visibleEmployeeIds]),
      );
    }

    if (input.employeeId) {
      leaveConditions.push(eq(hrLeaveRequests.employeeId, input.employeeId));
      attendanceConditions.push(eq(hrAttendanceDays.employeeId, input.employeeId));
    }

    if (input.leaveType) {
      leaveConditions.push(
        eq(
          hrLeaveRequests.leaveType,
          input.leaveType as (typeof hrLeaveRequests.$inferSelect)["leaveType"],
        ),
      );
    }
    if (input.departmentId) {
      leaveConditions.push(eq(hrEmployees.currentDepartmentId, input.departmentId));
      attendanceConditions.push(
        eq(hrEmployees.currentDepartmentId, input.departmentId),
      );
    }
    if (input.managerEmployeeId) {
      leaveConditions.push(
        eq(hrEmployees.managerEmployeeId, input.managerEmployeeId),
      );
      attendanceConditions.push(
        eq(hrEmployees.managerEmployeeId, input.managerEmployeeId),
      );
    }
    if (input.locationCode) {
      leaveConditions.push(eq(hrEmployees.workLocationCode, input.locationCode));
      attendanceConditions.push(
        eq(hrEmployees.workLocationCode, input.locationCode),
      );
    }
    if (input.legalEntityCode) {
      leaveConditions.push(eq(hrEmployees.legalEntityCode, input.legalEntityCode));
      attendanceConditions.push(
        eq(hrEmployees.legalEntityCode, input.legalEntityCode),
      );
    }

    const leaveRows = await db
      .select({
        employeeId: hrLeaveRequests.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        departmentId: hrEmployees.currentDepartmentId,
        departmentName: hrDepartments.name,
        managerEmployeeId: hrEmployees.managerEmployeeId,
        managerLegalName: managerEmployee.legalName,
        managerPreferredName: managerEmployee.preferredName,
        locationCode: hrEmployees.workLocationCode,
        legalEntityCode: hrEmployees.legalEntityCode,
        leaveType: hrLeaveRequests.leaveType,
        startAt: hrLeaveRequests.startAt,
        durationDays: hrLeaveRequests.durationDays,
        reason: hrLeaveRequests.reason,
      })
      .from(hrLeaveRequests)
      .innerJoin(hrEmployees, eq(hrLeaveRequests.employeeId, hrEmployees.id))
      .leftJoin(
        hrDepartments,
        eq(hrEmployees.currentDepartmentId, hrDepartments.id),
      )
      .leftJoin(
        managerEmployee,
        eq(hrEmployees.managerEmployeeId, managerEmployee.id),
      )
      .where(and(...leaveConditions))
      .limit(HRM_AAT_REPORT_EXPORT_ROW_CAP);

    const attendanceRows = input.leaveType
      ? []
      : await db
          .select({
            employeeId: hrAttendanceDays.employeeId,
            employeeNumber: hrEmployees.employeeNumber,
            legalName: hrEmployees.legalName,
            preferredName: hrEmployees.preferredName,
            departmentId: hrEmployees.currentDepartmentId,
            departmentName: hrDepartments.name,
            managerEmployeeId: hrEmployees.managerEmployeeId,
            managerLegalName: managerEmployee.legalName,
            managerPreferredName: managerEmployee.preferredName,
            locationCode: hrEmployees.workLocationCode,
            legalEntityCode: hrEmployees.legalEntityCode,
            workDate: hrAttendanceDays.workDate,
            notes: hrAttendanceDays.notes,
          })
          .from(hrAttendanceDays)
          .innerJoin(hrEmployees, eq(hrAttendanceDays.employeeId, hrEmployees.id))
          .leftJoin(
            hrDepartments,
            eq(hrEmployees.currentDepartmentId, hrDepartments.id),
          )
          .leftJoin(
            managerEmployee,
            eq(hrEmployees.managerEmployeeId, managerEmployee.id),
          )
          .where(and(...attendanceConditions))
          .limit(HRM_AAT_REPORT_EXPORT_ROW_CAP);

    const filteredLeaveRows = leaveRows.filter((row) => {
      if (input.departmentId && row.departmentId !== input.departmentId) {
        return false;
      }
      if (
        input.managerEmployeeId &&
        row.managerEmployeeId !== input.managerEmployeeId
      ) {
        return false;
      }
      if (input.locationCode && row.locationCode !== input.locationCode) {
        return false;
      }
      if (
        input.legalEntityCode &&
        row.legalEntityCode !== input.legalEntityCode
      ) {
        return false;
      }
      return true;
    });

    const filteredAttendanceRows = attendanceRows.filter((row) => {
      if (input.departmentId && row.departmentId !== input.departmentId) {
        return false;
      }
      if (
        input.managerEmployeeId &&
        row.managerEmployeeId !== input.managerEmployeeId
      ) {
        return false;
      }
      if (input.locationCode && row.locationCode !== input.locationCode) {
        return false;
      }
      if (
        input.legalEntityCode &&
        row.legalEntityCode !== input.legalEntityCode
      ) {
        return false;
      }
      return true;
    });

    const leaveEvents: AbsenceEvent[] = filteredLeaveRows.map((row) => ({
      employeeId: row.employeeId,
      employeeNumber: row.employeeNumber,
      employeeDisplayName: row.preferredName?.trim() || row.legalName,
      departmentId: row.departmentId,
      departmentName: row.departmentName,
      managerEmployeeId: row.managerEmployeeId,
      managerDisplayName:
        row.managerPreferredName?.trim() || row.managerLegalName || null,
      locationCode: row.locationCode,
      legalEntityCode: row.legalEntityCode,
      leaveType: row.leaveType,
      eventDate: row.startAt,
      lostWorkdays: Number(row.durationDays ?? 0),
      reason: row.reason,
    }));

    const attendanceEvents: AbsenceEvent[] = filteredAttendanceRows.map((row) => ({
      employeeId: row.employeeId,
      employeeNumber: row.employeeNumber,
      employeeDisplayName: row.preferredName?.trim() || row.legalName,
      departmentId: row.departmentId,
      departmentName: row.departmentName,
      managerEmployeeId: row.managerEmployeeId,
      managerDisplayName:
        row.managerPreferredName?.trim() || row.managerLegalName || null,
      locationCode: row.locationCode,
      legalEntityCode: row.legalEntityCode,
      leaveType: null,
      eventDate: row.workDate,
      lostWorkdays: 1,
      reason: row.notes,
    }));

    return [...leaveEvents, ...attendanceEvents].slice(
      0,
      HRM_AAT_REPORT_EXPORT_ROW_CAP,
    );
  });
}

/** HRM-AAT-023 — build absence trend report for authorized scope. */
export async function buildHrAatTrendReport(
  input: BuildHrAatTrendReportInput,
): Promise<HrAatTrendReportResult> {
  const events = await loadAbsenceEvents(input);
  const rows = aggregateAbsenceEvents({
    events,
    groupBy: input.groupBy,
    periodGranularity: input.periodGranularity,
    canViewSensitiveReasons: input.canViewSensitiveReasons,
    actorEmployeeIds: input.actorEmployeeIds,
  }).slice(0, HRM_AAT_REPORT_EXPORT_ROW_CAP);

  return {
    groupBy: input.groupBy,
    periodGranularity: input.periodGranularity,
    periodStartIso: input.periodStartIso,
    periodEndIso: input.periodEndIso,
    rowCount: rows.length,
    rows,
  };
}

/** HRM-AAT-024 — CSV export of absence trend report. */
export async function buildHrAatTrendReportCsv(
  input: BuildHrAatTrendReportInput,
): Promise<HrAatTrendReportCsvResult> {
  const report = await buildHrAatTrendReport(input);
  const content = buildCsv(
    [
      "group_key",
      "group_label",
      "employee_number",
      "employee_name",
      "department",
      "manager",
      "location",
      "legal_entity",
      "leave_type",
      "period",
      "absence_count",
      "lost_workdays",
      "absence_frequency",
      "absence_rate_percent",
      "reason_sample",
    ],
    report.rows.map((row) => [
      row.groupKey,
      row.groupLabel,
      row.employeeNumber ?? "",
      row.employeeDisplayName ?? "",
      row.departmentName ?? "",
      row.managerDisplayName ?? "",
      row.locationCode ?? "",
      row.legalEntityCode ?? "",
      row.leaveType ?? "",
      row.periodLabel ?? "",
      String(row.absenceCount),
      String(row.lostWorkdays),
      String(row.absenceFrequency),
      row.absenceRatePercent === null ? "" : String(row.absenceRatePercent),
      row.reasonSample ?? "",
    ]),
  );

  return {
    filename: `absence-trend-${report.groupBy}-${report.periodStartIso.slice(0, 10)}.csv`,
    contentType: "text/csv",
    content,
    rowCount: report.rowCount,
  };
}

export class HrAatReportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HrAatReportError";
  }
}

export function toHrAatReportActionFailure(error: unknown) {
  if (error instanceof HrAatReportError) {
    return { ok: false as const, error: error.message };
  }
  if (error instanceof Error && error.message === "invalid_period_range") {
    return { ok: false as const, error: "invalid_period_range" };
  }
  return { ok: false as const, error: "aat_report_failed" };
}
