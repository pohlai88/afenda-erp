import { and, count, desc, eq, gte, isNull, lte, or, sql } from "drizzle-orm";
import { runWithOrganizationContext } from "./client";
import { createEntityId } from "./ids";
import {
  type HrAttendanceDayStatus,
  HrLamCommandError,
  isAttendanceDayReadyForPayroll,
} from "./hr-lam";
import type { HrLeaveType } from "./hr-leave-validation";
import {
  hrAttendanceCorrectionRequests,
  hrAttendanceDays,
  hrAttendancePolicies,
  hrAttendanceRecords,
  hrEmployees,
  hrLamNotifications,
  hrLeaveRequests,
} from "./hr";

export const MEDICAL_LEAVE_TYPES = new Set<HrLeaveType>([
  "sick",
  "medical",
  "hospitalization",
]);

export type AttendanceExceptionCode =
  | "late_arrival"
  | "early_out"
  | "absent"
  | "missing_clock_in"
  | "missing_clock_out"
  | "unapproved_absence";

export type AttendanceExceptionSnapshot = {
  code: AttendanceExceptionCode;
  severity: "info" | "warning" | "critical";
  payrollBlocking?: boolean;
  message: string;
};

export type HrAttendanceCorrectionRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  attendanceDayId: string;
  workDate: Date;
  exceptionCode: AttendanceExceptionCode;
  status: "pending" | "approved" | "rejected" | "cancelled";
  reason: string;
  decisionNote: string | null;
  submittedAt: Date;
};

export type HrLamPayrollReferenceRow = {
  referenceId: string;
  source: "leave" | "attendance";
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  kind: string;
  amountLabel: string;
  workDate: Date | null;
  readyForPayroll: boolean;
};

export type HrAttendanceSummaryRow = {
  groupKey: string;
  groupLabel: string;
  periodStart: Date;
  periodEnd: Date;
  daysWorked: number;
  leaveDays: number;
  absentDays: number;
  lateCount: number;
  earlyOutCount: number;
  missingPunchCount: number;
};

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

function clampPageSize(limit: number | undefined): number {
  if (limit === undefined || !Number.isFinite(limit)) {
    return DEFAULT_PAGE_SIZE;
  }
  const size = Math.floor(limit);
  if (size < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(size, MAX_PAGE_SIZE);
}

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function endOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
}

function minutesFromMidnightUtc(date: Date): number {
  return date.getUTCHours() * 60 + date.getUTCMinutes();
}

export function assertMedicalCertificateWhenRequired(input: {
  leaveType: HrLeaveType;
  requiresMedicalCertificate: boolean;
  medicalCertificateReference?: string | null;
}): void {
  if (!input.requiresMedicalCertificate) {
    return;
  }
  if (!MEDICAL_LEAVE_TYPES.has(input.leaveType) && input.leaveType !== "other") {
    return;
  }
  if (!input.medicalCertificateReference?.trim()) {
    throw new HrLamCommandError("medical_certificate_required");
  }
}

export async function getHrAttendancePolicy(input: {
  organizationId: string;
  policyGroupCode?: string;
}): Promise<{
  attendanceCorrectionsEnabled: boolean;
  graceMinutesLate: number;
  standardStartMinutes: number;
  standardEndMinutes: number;
}> {
  const policyGroupCode = input.policyGroupCode ?? "default";
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select()
      .from(hrAttendancePolicies)
      .where(
        and(
          eq(hrAttendancePolicies.organizationId, input.organizationId),
          eq(hrAttendancePolicies.policyGroupCode, policyGroupCode),
        ),
      )
      .limit(1);

    if (!row) {
      return {
        attendanceCorrectionsEnabled: true,
        graceMinutesLate: 15,
        standardStartMinutes: 540,
        standardEndMinutes: 1020,
      };
    }

    return {
      attendanceCorrectionsEnabled: row.attendanceCorrectionsEnabled,
      graceMinutesLate: row.graceMinutesLate,
      standardStartMinutes: row.standardStartMinutes,
      standardEndMinutes: row.standardEndMinutes,
    };
  });
}

export async function ensureHrAttendancePolicy(input: {
  organizationId: string;
  policyGroupCode?: string;
  attendanceCorrectionsEnabled?: boolean;
}): Promise<{ policyId: string }> {
  const policyGroupCode = input.policyGroupCode ?? "default";
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [existing] = await db
      .select({ id: hrAttendancePolicies.id })
      .from(hrAttendancePolicies)
      .where(
        and(
          eq(hrAttendancePolicies.organizationId, input.organizationId),
          eq(hrAttendancePolicies.policyGroupCode, policyGroupCode),
        ),
      )
      .limit(1);

    if (existing) {
      if (input.attendanceCorrectionsEnabled !== undefined) {
        await db
          .update(hrAttendancePolicies)
          .set({
            attendanceCorrectionsEnabled: input.attendanceCorrectionsEnabled,
          })
          .where(eq(hrAttendancePolicies.id, existing.id));
      }
      return { policyId: existing.id };
    }

    const policyId = createEntityId("hr_att_pol");
    await db.insert(hrAttendancePolicies).values({
      id: policyId,
      organizationId: input.organizationId,
      policyGroupCode,
      attendanceCorrectionsEnabled: input.attendanceCorrectionsEnabled ?? true,
    });
    return { policyId };
  });
}

export function detectAttendanceExceptions(input: {
  punches: readonly { punchType: "clock_in" | "clock_out"; punchedAt: Date }[];
  policy: {
    graceMinutesLate: number;
    standardStartMinutes: number;
    standardEndMinutes: number;
  };
}): AttendanceExceptionSnapshot[] {
  const exceptions: AttendanceExceptionSnapshot[] = [];
  const clockIn = input.punches.find((p) => p.punchType === "clock_in");
  const clockOut = input.punches.find((p) => p.punchType === "clock_out");

  if (!clockIn && !clockOut) {
    exceptions.push({
      code: "absent",
      severity: "critical",
      payrollBlocking: true,
      message: "No attendance punches recorded",
    });
    return exceptions;
  }

  if (!clockIn && clockOut) {
    exceptions.push({
      code: "missing_clock_in",
      severity: "warning",
      payrollBlocking: true,
      message: "Missing clock-in punch",
    });
  }

  if (clockIn && !clockOut) {
    exceptions.push({
      code: "missing_clock_out",
      severity: "warning",
      payrollBlocking: true,
      message: "Missing clock-out punch",
    });
  }

  if (clockIn) {
    const arrival = minutesFromMidnightUtc(clockIn.punchedAt);
    if (arrival > input.policy.standardStartMinutes + input.policy.graceMinutesLate) {
      exceptions.push({
        code: "late_arrival",
        severity: "warning",
        message: "Late arrival detected",
      });
    }
  }

  if (clockOut) {
    const departure = minutesFromMidnightUtc(clockOut.punchedAt);
    if (departure < input.policy.standardEndMinutes) {
      exceptions.push({
        code: "early_out",
        severity: "warning",
        message: "Early departure detected",
      });
    }
  }

  return exceptions;
}

function deriveDayStatusFromExceptions(
  exceptions: readonly AttendanceExceptionSnapshot[],
): HrAttendanceDayStatus {
  if (exceptions.some((e) => e.code === "absent")) {
    return "absent";
  }
  if (
    exceptions.some(
      (e) => e.code === "missing_clock_in" || e.code === "missing_clock_out",
    )
  ) {
    return "missing_punch";
  }
  if (exceptions.some((e) => e.code === "late_arrival")) {
    return "late";
  }
  if (exceptions.some((e) => e.code === "early_out")) {
    return "early_out";
  }
  return "present";
}

function buildPayrollReferences(
  attendanceDayId: string,
  status: HrAttendanceDayStatus,
): {
  payrollDeductionReference: string | null;
  latenessDeductionReference: string | null;
  absenceDeductionReference: string | null;
} {
  const base = `lam.att.${attendanceDayId}`;
  if (status === "absent" || status === "missing_punch") {
    return {
      payrollDeductionReference: `${base}.absence`,
      latenessDeductionReference: null,
      absenceDeductionReference: `${base}.absence`,
    };
  }
  if (status === "late" || status === "early_out") {
    return {
      payrollDeductionReference: `${base}.lateness`,
      latenessDeductionReference: `${base}.lateness`,
      absenceDeductionReference: null,
    };
  }
  return {
    payrollDeductionReference: null,
    latenessDeductionReference: null,
    absenceDeductionReference: null,
  };
}

/** LAM-022 — materialize attendance day from punch ledger with exception snapshot. */
export async function regenerateAttendanceDayFromEvents(input: {
  organizationId: string;
  employeeId: string;
  workDate: Date;
  policyGroupCode?: string;
}): Promise<{ attendanceDayId: string; status: HrAttendanceDayStatus }> {
  const normalizedWorkDate = startOfUtcDay(input.workDate);
  const policy = await getHrAttendancePolicy({
    organizationId: input.organizationId,
    policyGroupCode: input.policyGroupCode,
  });

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const punches = await db
      .select({
        punchType: hrAttendanceRecords.punchType,
        punchedAt: hrAttendanceRecords.punchedAt,
      })
      .from(hrAttendanceRecords)
      .where(
        and(
          eq(hrAttendanceRecords.organizationId, input.organizationId),
          eq(hrAttendanceRecords.employeeId, input.employeeId),
          eq(hrAttendanceRecords.status, "active"),
          gte(hrAttendanceRecords.punchedAt, normalizedWorkDate),
          lte(hrAttendanceRecords.punchedAt, endOfUtcDay(normalizedWorkDate)),
        ),
      )
      .orderBy(hrAttendanceRecords.punchedAt);

    const exceptions = detectAttendanceExceptions({ punches, policy });
    const status = deriveDayStatusFromExceptions(exceptions);
    const payrollBlocking = exceptions.some((e) => e.payrollBlocking === true);

    const [existing] = await db
      .select({
        id: hrAttendanceDays.id,
        dayState: hrAttendanceDays.dayState,
      })
      .from(hrAttendanceDays)
      .where(
        and(
          eq(hrAttendanceDays.organizationId, input.organizationId),
          eq(hrAttendanceDays.employeeId, input.employeeId),
          eq(hrAttendanceDays.workDate, normalizedWorkDate),
        ),
      )
      .limit(1);

    if (existing?.dayState === "locked") {
      return { attendanceDayId: existing.id, status };
    }

    const calculationSnapshot = {
      exceptions,
      payrollBlocking,
      regeneratedAt: new Date().toISOString(),
    };

    if (existing) {
      const refs = buildPayrollReferences(existing.id, status);
      await db
        .update(hrAttendanceDays)
        .set({
          status,
          dayState: "computed",
          calculationSnapshot,
          ...refs,
        })
        .where(eq(hrAttendanceDays.id, existing.id));
      return { attendanceDayId: existing.id, status };
    }

    const attendanceDayId = createEntityId("hr_att_day");
    const refs = buildPayrollReferences(attendanceDayId, status);
    await db.insert(hrAttendanceDays).values({
      id: attendanceDayId,
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      workDate: normalizedWorkDate,
      status,
      dayState: "computed",
      calculationSnapshot,
      ...refs,
    });

    return { attendanceDayId, status };
  });
}

export async function listAttendanceExceptionsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  employeeId?: string;
  departmentId?: string;
  managerEmployeeId?: string;
  workDateFrom?: Date;
  workDateTo?: Date;
}): Promise<{
  rows: readonly {
    attendanceDayId: string;
    employeeId: string;
    employeeNumber: string;
    employeeDisplayName: string;
    workDate: Date;
    status: HrAttendanceDayStatus;
    exceptions: readonly AttendanceExceptionSnapshot[];
  }[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
}> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrAttendanceDays.organizationId, input.organizationId),
      sql`${hrAttendanceDays.calculationSnapshot} -> 'exceptions' IS NOT NULL`,
      sql`jsonb_array_length(${hrAttendanceDays.calculationSnapshot} -> 'exceptions') > 0`,
    ];

    if (input.employeeId) {
      conditions.push(eq(hrAttendanceDays.employeeId, input.employeeId));
    }
    if (input.workDateFrom) {
      conditions.push(gte(hrAttendanceDays.workDate, input.workDateFrom));
    }
    if (input.workDateTo) {
      conditions.push(lte(hrAttendanceDays.workDate, input.workDateTo));
    }
    if (input.departmentId) {
      conditions.push(eq(hrEmployees.currentDepartmentId, input.departmentId));
    }
    if (input.managerEmployeeId) {
      conditions.push(eq(hrEmployees.managerEmployeeId, input.managerEmployeeId));
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrAttendanceDays)
      .innerJoin(hrEmployees, eq(hrAttendanceDays.employeeId, hrEmployees.id))
      .where(whereClause);

    const rows = await db
      .select({
        attendanceDayId: hrAttendanceDays.id,
        employeeId: hrAttendanceDays.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        workDate: hrAttendanceDays.workDate,
        status: hrAttendanceDays.status,
        calculationSnapshot: hrAttendanceDays.calculationSnapshot,
      })
      .from(hrAttendanceDays)
      .innerJoin(hrEmployees, eq(hrAttendanceDays.employeeId, hrEmployees.id))
      .where(whereClause)
      .orderBy(desc(hrAttendanceDays.workDate))
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => {
        const snapshot = (row.calculationSnapshot ?? {}) as {
          exceptions?: AttendanceExceptionSnapshot[];
        };
        return {
          attendanceDayId: row.attendanceDayId,
          employeeId: row.employeeId,
          employeeNumber: row.employeeNumber,
          employeeDisplayName: row.preferredName?.trim() || row.legalName,
          workDate: row.workDate,
          status: row.status,
          exceptions: snapshot.exceptions ?? [],
        };
      }),
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + rows.length < actualTotal,
    };
  });
}

export async function submitAttendanceCorrectionForApproval(input: {
  organizationId: string;
  employeeId: string;
  attendanceDayId: string;
  exceptionCode: AttendanceExceptionCode;
  proposedStatus?: HrAttendanceDayStatus;
  reason: string;
  currentApproverAuthUserId?: string | null;
  policyGroupCode?: string;
}): Promise<{ correctionRequestId: string }> {
  const policy = await getHrAttendancePolicy({
    organizationId: input.organizationId,
    policyGroupCode: input.policyGroupCode,
  });
  if (!policy.attendanceCorrectionsEnabled) {
    throw new HrLamCommandError("attendance_corrections_disabled");
  }

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [day] = await db
      .select({
        id: hrAttendanceDays.id,
        employeeId: hrAttendanceDays.employeeId,
        dayState: hrAttendanceDays.dayState,
      })
      .from(hrAttendanceDays)
      .where(
        and(
          eq(hrAttendanceDays.organizationId, input.organizationId),
          eq(hrAttendanceDays.id, input.attendanceDayId),
          eq(hrAttendanceDays.employeeId, input.employeeId),
        ),
      )
      .limit(1);

    if (!day) {
      throw new HrLamCommandError("attendance_day_not_found");
    }
    if (day.dayState === "locked") {
      throw new HrLamCommandError("attendance_day_locked");
    }

    const correctionRequestId = createEntityId("hr_att_corr");
    await db.insert(hrAttendanceCorrectionRequests).values({
      id: correctionRequestId,
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      attendanceDayId: input.attendanceDayId,
      exceptionCode: input.exceptionCode,
      proposedStatus: input.proposedStatus ?? null,
      reason: input.reason.trim(),
      currentApproverAuthUserId: input.currentApproverAuthUserId ?? null,
    });

    return { correctionRequestId };
  });
}

async function decideAttendanceCorrection(input: {
  organizationId: string;
  correctionRequestId: string;
  status: "approved" | "rejected";
  decisionNote?: string | null;
}): Promise<{ correctionRequestId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [request] = await db
      .select()
      .from(hrAttendanceCorrectionRequests)
      .where(
        and(
          eq(hrAttendanceCorrectionRequests.organizationId, input.organizationId),
          eq(hrAttendanceCorrectionRequests.id, input.correctionRequestId),
        ),
      )
      .limit(1);

    if (!request) {
      throw new HrLamCommandError("correction_request_not_found");
    }
    if (request.status !== "pending") {
      throw new HrLamCommandError("correction_request_not_pending");
    }

    await db.transaction(async (tx) => {
      await tx
        .update(hrAttendanceCorrectionRequests)
        .set({
          status: input.status,
          decisionNote: input.decisionNote?.trim() || null,
          decidedAt: new Date(),
        })
        .where(eq(hrAttendanceCorrectionRequests.id, input.correctionRequestId));

      if (input.status === "approved" && request.proposedStatus) {
        await tx
          .update(hrAttendanceDays)
          .set({
            status: request.proposedStatus,
            dayState: "computed",
            calculationSnapshot: sql`jsonb_set(
              COALESCE(${hrAttendanceDays.calculationSnapshot}, '{}'::jsonb),
              '{corrected}',
              'true'::jsonb
            )`,
          })
          .where(eq(hrAttendanceDays.id, request.attendanceDayId));
      }
    });

    return { correctionRequestId: input.correctionRequestId };
  });
}

export async function approveAttendanceCorrectionRequest(input: {
  organizationId: string;
  correctionRequestId: string;
  decisionNote?: string | null;
}): Promise<{ correctionRequestId: string }> {
  return decideAttendanceCorrection({ ...input, status: "approved" });
}

export async function rejectAttendanceCorrectionRequest(input: {
  organizationId: string;
  correctionRequestId: string;
  decisionNote?: string | null;
}): Promise<{ correctionRequestId: string }> {
  return decideAttendanceCorrection({ ...input, status: "rejected" });
}

export async function listAttendanceCorrectionRequestsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  status?: "pending" | "approved" | "rejected" | "cancelled";
  employeeId?: string;
}): Promise<{
  rows: readonly HrAttendanceCorrectionRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
}> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrAttendanceCorrectionRequests.organizationId, input.organizationId),
    ];
    if (input.status) {
      conditions.push(eq(hrAttendanceCorrectionRequests.status, input.status));
    }
    if (input.employeeId) {
      conditions.push(
        eq(hrAttendanceCorrectionRequests.employeeId, input.employeeId),
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrAttendanceCorrectionRequests)
      .innerJoin(
        hrEmployees,
        eq(hrAttendanceCorrectionRequests.employeeId, hrEmployees.id),
      )
      .where(whereClause);

    const rows = await db
      .select({
        id: hrAttendanceCorrectionRequests.id,
        employeeId: hrAttendanceCorrectionRequests.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        attendanceDayId: hrAttendanceCorrectionRequests.attendanceDayId,
        workDate: hrAttendanceDays.workDate,
        exceptionCode: hrAttendanceCorrectionRequests.exceptionCode,
        status: hrAttendanceCorrectionRequests.status,
        reason: hrAttendanceCorrectionRequests.reason,
        decisionNote: hrAttendanceCorrectionRequests.decisionNote,
        submittedAt: hrAttendanceCorrectionRequests.submittedAt,
      })
      .from(hrAttendanceCorrectionRequests)
      .innerJoin(
        hrEmployees,
        eq(hrAttendanceCorrectionRequests.employeeId, hrEmployees.id),
      )
      .innerJoin(
        hrAttendanceDays,
        eq(hrAttendanceCorrectionRequests.attendanceDayId, hrAttendanceDays.id),
      )
      .where(whereClause)
      .orderBy(desc(hrAttendanceCorrectionRequests.submittedAt))
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName?.trim() || row.legalName,
        attendanceDayId: row.attendanceDayId,
        workDate: row.workDate,
        exceptionCode: row.exceptionCode as AttendanceExceptionCode,
        status: row.status,
        reason: row.reason,
        decisionNote: row.decisionNote,
        submittedAt: row.submittedAt,
      })),
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + rows.length < actualTotal,
    };
  });
}

/** LAM-025 — attendance summary grouped by org slice. */
export async function summarizeHrAttendanceForPeriod(input: {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  groupBy: "employee" | "department" | "manager" | "legal_entity" | "work_location";
  departmentId?: string;
  managerEmployeeId?: string;
  legalEntityCode?: string;
  workLocationCode?: string;
}): Promise<readonly HrAttendanceSummaryRow[]> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrAttendanceDays.organizationId, input.organizationId),
      gte(hrAttendanceDays.workDate, startOfUtcDay(input.periodStart)),
      lte(hrAttendanceDays.workDate, endOfUtcDay(input.periodEnd)),
    ];

    if (input.departmentId) {
      conditions.push(eq(hrEmployees.currentDepartmentId, input.departmentId));
    }
    if (input.managerEmployeeId) {
      conditions.push(eq(hrEmployees.managerEmployeeId, input.managerEmployeeId));
    }
    if (input.legalEntityCode) {
      conditions.push(eq(hrEmployees.legalEntityCode, input.legalEntityCode));
    }
    if (input.workLocationCode) {
      conditions.push(eq(hrEmployees.workLocationCode, input.workLocationCode));
    }

    const rows = await db
      .select({
        employeeId: hrAttendanceDays.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        departmentId: hrEmployees.currentDepartmentId,
        managerEmployeeId: hrEmployees.managerEmployeeId,
        legalEntityCode: hrEmployees.legalEntityCode,
        workLocationCode: hrEmployees.workLocationCode,
        status: hrAttendanceDays.status,
      })
      .from(hrAttendanceDays)
      .innerJoin(hrEmployees, eq(hrAttendanceDays.employeeId, hrEmployees.id))
      .where(and(...conditions));

    const buckets = new Map<
      string,
      {
        label: string;
        daysWorked: number;
        leaveDays: number;
        absentDays: number;
        lateCount: number;
        earlyOutCount: number;
        missingPunchCount: number;
      }
    >();

    for (const row of rows) {
      let key: string;
      let label: string;
      switch (input.groupBy) {
        case "employee":
          key = row.employeeId;
          label = row.preferredName?.trim() || row.legalName;
          break;
        case "department":
          key = row.departmentId ?? "unassigned";
          label = row.departmentId ?? "Unassigned";
          break;
        case "manager":
          key = row.managerEmployeeId ?? "unassigned";
          label = row.managerEmployeeId ?? "No manager";
          break;
        case "legal_entity":
          key = row.legalEntityCode ?? "default";
          label = row.legalEntityCode ?? "Default entity";
          break;
        case "work_location":
          key = row.workLocationCode ?? "default";
          label = row.workLocationCode ?? "Default location";
          break;
      }

      const bucket = buckets.get(key) ?? {
        label,
        daysWorked: 0,
        leaveDays: 0,
        absentDays: 0,
        lateCount: 0,
        earlyOutCount: 0,
        missingPunchCount: 0,
      };

      if (row.status === "present" || row.status === "half_day") {
        bucket.daysWorked += 1;
      } else if (row.status === "absent") {
        bucket.absentDays += 1;
      } else if (row.status === "late") {
        bucket.lateCount += 1;
        bucket.daysWorked += 1;
      } else if (row.status === "early_out") {
        bucket.earlyOutCount += 1;
        bucket.daysWorked += 1;
      } else if (row.status === "missing_punch") {
        bucket.missingPunchCount += 1;
      }

      buckets.set(key, bucket);
    }

    const leaveRows = await db
      .select({
        employeeId: hrLeaveRequests.employeeId,
        durationDays: hrLeaveRequests.durationDays,
        departmentId: hrEmployees.currentDepartmentId,
        managerEmployeeId: hrEmployees.managerEmployeeId,
        legalEntityCode: hrEmployees.legalEntityCode,
        workLocationCode: hrEmployees.workLocationCode,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
      })
      .from(hrLeaveRequests)
      .innerJoin(hrEmployees, eq(hrLeaveRequests.employeeId, hrEmployees.id))
      .where(
        and(
          eq(hrLeaveRequests.organizationId, input.organizationId),
          eq(hrLeaveRequests.status, "approved"),
          gte(hrLeaveRequests.startAt, input.periodStart),
          lte(hrLeaveRequests.endAt, input.periodEnd),
        ),
      );

    for (const leave of leaveRows) {
      let key: string;
      switch (input.groupBy) {
        case "employee":
          key = leave.employeeId;
          break;
        case "department":
          key = leave.departmentId ?? "unassigned";
          break;
        case "manager":
          key = leave.managerEmployeeId ?? "unassigned";
          break;
        case "legal_entity":
          key = leave.legalEntityCode ?? "default";
          break;
        case "work_location":
          key = leave.workLocationCode ?? "default";
          break;
      }
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.leaveDays += Number(leave.durationDays);
      }
    }

    return [...buckets.entries()].map(([groupKey, bucket]) => ({
      groupKey,
      groupLabel: bucket.label,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      daysWorked: bucket.daysWorked,
      leaveDays: bucket.leaveDays,
      absentDays: bucket.absentDays,
      lateCount: bucket.lateCount,
      earlyOutCount: bucket.earlyOutCount,
      missingPunchCount: bucket.missingPunchCount,
    }));
  });
}

/** LAM-026 — payroll-ready leave and attendance deduction references. */
export async function listHrLamPayrollReferencesForPeriod(input: {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  employeeId?: string;
}): Promise<readonly HrLamPayrollReferenceRow[]> {
  const refs: HrLamPayrollReferenceRow[] = [];

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const leaveConditions = [
      eq(hrLeaveRequests.organizationId, input.organizationId),
      eq(hrLeaveRequests.status, "approved"),
      gte(hrLeaveRequests.startAt, input.periodStart),
      lte(hrLeaveRequests.endAt, input.periodEnd),
    ];
    if (input.employeeId) {
      leaveConditions.push(eq(hrLeaveRequests.employeeId, input.employeeId));
    }

    const leaveRows = await db
      .select({
        id: hrLeaveRequests.id,
        employeeId: hrLeaveRequests.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        leaveType: hrLeaveRequests.leaveType,
        durationDays: hrLeaveRequests.durationDays,
        payrollDeductionReference: hrLeaveRequests.payrollDeductionReference,
        startAt: hrLeaveRequests.startAt,
      })
      .from(hrLeaveRequests)
      .innerJoin(hrEmployees, eq(hrLeaveRequests.employeeId, hrEmployees.id))
      .where(and(...leaveConditions));

    for (const row of leaveRows) {
      if (row.leaveType !== "unpaid" && !row.payrollDeductionReference) {
        continue;
      }
      const referenceId =
        row.payrollDeductionReference ?? `lam.leave.${row.id}.unpaid`;
      refs.push({
        referenceId,
        source: "leave",
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName?.trim() || row.legalName,
        kind: row.leaveType,
        amountLabel: `${row.durationDays} days`,
        workDate: row.startAt,
        readyForPayroll: true,
      });
    }

    const attendanceConditions = [
      eq(hrAttendanceDays.organizationId, input.organizationId),
      gte(hrAttendanceDays.workDate, startOfUtcDay(input.periodStart)),
      lte(hrAttendanceDays.workDate, endOfUtcDay(input.periodEnd)),
      or(
        sql`${hrAttendanceDays.payrollDeductionReference} IS NOT NULL`,
        sql`${hrAttendanceDays.latenessDeductionReference} IS NOT NULL`,
        sql`${hrAttendanceDays.absenceDeductionReference} IS NOT NULL`,
      ),
    ];
    if (input.employeeId) {
      attendanceConditions.push(eq(hrAttendanceDays.employeeId, input.employeeId));
    }

    const attendanceRows = await db
      .select({
        id: hrAttendanceDays.id,
        employeeId: hrAttendanceDays.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        status: hrAttendanceDays.status,
        workDate: hrAttendanceDays.workDate,
        dayState: hrAttendanceDays.dayState,
        calculationSnapshot: hrAttendanceDays.calculationSnapshot,
        payrollDeductionReference: hrAttendanceDays.payrollDeductionReference,
        latenessDeductionReference: hrAttendanceDays.latenessDeductionReference,
        absenceDeductionReference: hrAttendanceDays.absenceDeductionReference,
      })
      .from(hrAttendanceDays)
      .innerJoin(hrEmployees, eq(hrAttendanceDays.employeeId, hrEmployees.id))
      .where(and(...attendanceConditions));

    for (const row of attendanceRows) {
      const referenceId =
        row.payrollDeductionReference ??
        row.latenessDeductionReference ??
        row.absenceDeductionReference;
      if (!referenceId) continue;

      refs.push({
        referenceId,
        source: "attendance",
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName?.trim() || row.legalName,
        kind: row.status,
        amountLabel: row.status,
        workDate: row.workDate,
        readyForPayroll: isAttendanceDayReadyForPayroll({
          dayState: row.dayState,
          status: row.status,
          calculationSnapshot: row.calculationSnapshot,
        }),
      });
    }

    return refs;
  });
}

export async function enqueueHrLamNotification(input: {
  organizationId: string;
  recipientAuthUserId: string;
  kind: (typeof hrLamNotifications.$inferInsert)["kind"];
  subjectType: string;
  subjectId: string;
  title: string;
  body: string;
}): Promise<{ notificationId: string }> {
  const notificationId = createEntityId("hr_lam_ntf");
  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(hrLamNotifications).values({
      id: notificationId,
      organizationId: input.organizationId,
      recipientAuthUserId: input.recipientAuthUserId,
      kind: input.kind,
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      title: input.title.trim(),
      body: input.body.trim(),
    });
  });
  return { notificationId };
}

export async function listHrLamNotificationsWindow(input: {
  organizationId: string;
  recipientAuthUserId: string;
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}): Promise<{
  rows: readonly {
    id: string;
    kind: string;
    title: string;
    body: string;
    subjectType: string;
    subjectId: string;
    readAt: Date | null;
    createdAt: Date;
  }[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
}> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrLamNotifications.organizationId, input.organizationId),
      eq(hrLamNotifications.recipientAuthUserId, input.recipientAuthUserId),
    ];
    if (input.unreadOnly) {
      conditions.push(sql`${hrLamNotifications.readAt} IS NULL`);
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrLamNotifications)
      .where(whereClause);

    const rows = await db
      .select()
      .from(hrLamNotifications)
      .where(whereClause)
      .orderBy(desc(hrLamNotifications.createdAt))
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        kind: row.kind,
        title: row.title,
        body: row.body,
        subjectType: row.subjectType,
        subjectId: row.subjectId,
        readAt: row.readAt,
        createdAt: row.createdAt,
      })),
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + rows.length < actualTotal,
    };
  });
}

export async function resolveEmployeeIdsVisibleToActor(input: {
  organizationId: string;
  actorAuthUserId: string;
  scope: "self" | "team" | "org";
  selfEmployeeId?: string | null;
}): Promise<readonly string[] | null> {
  if (input.scope === "org") {
    return null;
  }

  return runWithOrganizationContext(input.organizationId, async (db) => {
    if (input.scope === "self") {
      if (!input.selfEmployeeId) {
        return [];
      }
      return [input.selfEmployeeId];
    }

    if (!input.selfEmployeeId) {
      return [];
    }

    const teamRows = await db
      .select({ id: hrEmployees.id })
      .from(hrEmployees)
      .where(
        and(
          eq(hrEmployees.organizationId, input.organizationId),
          eq(hrEmployees.managerEmployeeId, input.selfEmployeeId),
          isNull(hrEmployees.archivedAt),
        ),
      );

    return [input.selfEmployeeId, ...teamRows.map((row) => row.id)];
  });
}

/** Maps an auth user to linked HR employee row(s) via normalized work email. */
export async function resolveHrEmployeeIdsForAuthUser(input: {
  organizationId: string;
  authUserId: string;
  authUserEmail?: string | null;
}): Promise<readonly string[]> {
  const normalizedEmail = input.authUserEmail?.trim().toLowerCase();
  if (!normalizedEmail) {
    return [];
  }

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({ id: hrEmployees.id })
      .from(hrEmployees)
      .where(
        and(
          eq(hrEmployees.organizationId, input.organizationId),
          isNull(hrEmployees.archivedAt),
          sql`lower(${hrEmployees.email}) = ${normalizedEmail}`,
        ),
      );

    return rows.map((row) => row.id);
  });
}
