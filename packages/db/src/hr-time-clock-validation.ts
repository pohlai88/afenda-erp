import { and, asc, desc, eq, gte, lte } from "drizzle-orm";

import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { appendHrTimeClockAuditEvent } from "./hr-time-clock-devices";
import { resolveHrTimeClockEmployeeMapping } from "./hr-time-clock-mappings";
import { HrTimeClockCommandError } from "./hr-time-clock.types";
import { hrAttendancePolicies, hrEmployees } from "./hr";
import { hrShiftAssignments } from "./hr-shift-scheduling";
import type { HrTimeClockPunchType } from "./hr-time-clock.types";
import {
  hrTimeClockDevices,
  hrTimeClockEmployeeMappings,
  hrTimeClockPunchExceptions,
  hrTimeClockRawPunches,
  type hrTimeClockPunchExceptionCodeEnum,
  type hrTimeClockPunchValidationStatusEnum,
} from "./hr-time-clock";

export type HrTimeClockPunchExceptionCode =
  (typeof hrTimeClockPunchExceptionCodeEnum.enumValues)[number];

export type HrTimeClockPunchValidationStatus =
  (typeof hrTimeClockPunchValidationStatusEnum.enumValues)[number];

/** HRM-TCI-014 — employment statuses that may clock. */
export const HR_TIME_CLOCK_ACTIVE_EMPLOYMENT_STATUSES = [
  "active",
  "probation",
  "confirmed",
  "notice_period",
] as const;

export type HrTimeClockShiftMatchSource = "shift_assignment" | "attendance_policy";

export type HrTimeClockShiftMatch = {
  matched: boolean;
  shiftAssignmentId: string | null;
  referenceStartMinutes: number;
  referenceEndMinutes: number;
  source: HrTimeClockShiftMatchSource;
};

export type HrTimeClockValidationPipelineResult = {
  rawPunchId: string;
  validationStatus: HrTimeClockPunchValidationStatus;
  classifiedPunchType: HrTimeClockPunchType;
  exceptionCodes: readonly HrTimeClockPunchExceptionCode[];
  shiftMatch: HrTimeClockShiftMatch;
  employeeId: string | null;
  mappingId: string | null;
};

const DUPLICATE_WINDOW_MS = 2 * 60 * 1000;

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function endOfUtcDay(date: Date): Date {
  const start = startOfUtcDay(date);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
}

function minutesFromUtcMidnight(date: Date): number {
  return date.getUTCHours() * 60 + date.getUTCMinutes();
}

function resolveValidationStatus(
  codes: readonly HrTimeClockPunchExceptionCode[],
): HrTimeClockPunchValidationStatus {
  if (codes.includes("invalid_employee") || codes.includes("unmapped_device")) {
    return "invalid";
  }
  if (codes.includes("duplicate")) {
    return "duplicate";
  }
  if (codes.includes("unmatched") || codes.includes("missing_punch")) {
    return "unmatched";
  }
  return "valid";
}

/** HRM-TCI-016 — infer punch type from prior same-day punch when device type is ambiguous. */
export function classifyHrTimeClockPunchSequence(input: {
  reportedType: HrTimeClockPunchType;
  previousPunchType: HrTimeClockPunchType | null;
  breaksEnabled: boolean;
}): HrTimeClockPunchType {
  const { reportedType, previousPunchType, breaksEnabled } = input;

  if (reportedType === "correction" || reportedType === "transfer") {
    return reportedType;
  }

  const expectedAfter: Partial<Record<HrTimeClockPunchType, HrTimeClockPunchType>> =
    {
      clock_in: breaksEnabled ? "break_in" : "clock_out",
      break_in: "break_out",
      break_out: "clock_out",
      clock_out: "clock_in",
    };

  if (
    previousPunchType &&
    expectedAfter[previousPunchType] === reportedType
  ) {
    return reportedType;
  }

  if (!previousPunchType || previousPunchType === "clock_out") {
    return reportedType === "clock_out" || reportedType === "break_out"
      ? reportedType
      : "clock_in";
  }

  if (previousPunchType === "clock_in") {
    if (reportedType === "break_in" && breaksEnabled) return "break_in";
    return "clock_out";
  }

  if (previousPunchType === "break_in" && reportedType === "break_out") {
    return "break_out";
  }

  if (previousPunchType === "break_out") {
    return reportedType === "clock_in" ? "clock_in" : "clock_out";
  }

  return reportedType;
}

function sequenceIsUnmatched(
  previousType: HrTimeClockPunchType | null,
  nextType: HrTimeClockPunchType,
  breaksEnabled: boolean,
): boolean {
  if (nextType === "correction" || nextType === "transfer") {
    return false;
  }
  if (!previousType) {
    return nextType === "clock_out" || nextType === "break_out";
  }
  if (previousType === "clock_in") {
    return !(
      nextType === "clock_out" ||
      (breaksEnabled && nextType === "break_in")
    );
  }
  if (previousType === "break_in") {
    return nextType !== "break_out";
  }
  if (previousType === "break_out") {
    return nextType !== "clock_out";
  }
  if (previousType === "clock_out") {
    return nextType !== "clock_in";
  }
  return false;
}

async function loadAttendancePolicy(
  db: AfendaTransaction,
  organizationId: string,
  policyGroupCode = "default",
) {
  const [policy] = await db
    .select({
      graceMinutesLate: hrAttendancePolicies.graceMinutesLate,
      standardStartMinutes: hrAttendancePolicies.standardStartMinutes,
      standardEndMinutes: hrAttendancePolicies.standardEndMinutes,
    })
    .from(hrAttendancePolicies)
    .where(
      and(
        eq(hrAttendancePolicies.organizationId, organizationId),
        eq(hrAttendancePolicies.policyGroupCode, policyGroupCode),
      ),
    )
    .limit(1);

  return (
    policy ?? {
      graceMinutesLate: 15,
      standardStartMinutes: 540,
      standardEndMinutes: 1020,
    }
  );
}

/** HRM-TCI-020 — shift assignment when published; otherwise policy reference times. */
export async function matchHrTimeClockPunchToShift(input: {
  organizationId: string;
  employeeId: string;
  punchedAt: Date;
  policyGroupCode?: string;
}): Promise<HrTimeClockShiftMatch> {
  const policy = await runWithOrganizationContext(
    input.organizationId,
    (db) => loadAttendancePolicy(db, input.organizationId, input.policyGroupCode),
  );

  const dayStart = startOfUtcDay(input.punchedAt);
  const dayEnd = endOfUtcDay(input.punchedAt);

  const assignment = await runWithOrganizationContext(
    input.organizationId,
    async (db) => {
      const [row] = await db
        .select({
          id: hrShiftAssignments.id,
          shiftStart: hrShiftAssignments.shiftStart,
          shiftEnd: hrShiftAssignments.shiftEnd,
        })
        .from(hrShiftAssignments)
        .where(
          and(
            eq(hrShiftAssignments.organizationId, input.organizationId),
            eq(hrShiftAssignments.employeeId, input.employeeId),
            gte(hrShiftAssignments.shiftDate, dayStart),
            lte(hrShiftAssignments.shiftDate, dayEnd),
            eq(hrShiftAssignments.status, "scheduled"),
          ),
        )
        .orderBy(asc(hrShiftAssignments.shiftStart))
        .limit(1);

      return row ?? null;
    },
  );

  if (assignment) {
    return {
      matched: true,
      shiftAssignmentId: assignment.id,
      referenceStartMinutes: minutesFromUtcMidnight(assignment.shiftStart),
      referenceEndMinutes: minutesFromUtcMidnight(assignment.shiftEnd),
      source: "shift_assignment",
    };
  }

  return {
    matched: false,
    shiftAssignmentId: null,
    referenceStartMinutes: policy.standardStartMinutes,
    referenceEndMinutes: policy.standardEndMinutes,
    source: "attendance_policy",
  };
}

async function detectDuplicatePunch(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    rawPunchId: string;
    employeeId: string;
    punchType: HrTimeClockPunchType;
    punchedAt: Date;
  },
): Promise<boolean> {
  const windowStart = new Date(input.punchedAt.getTime() - DUPLICATE_WINDOW_MS);
  const windowEnd = new Date(input.punchedAt.getTime() + DUPLICATE_WINDOW_MS);

  const [existing] = await db
    .select({ id: hrTimeClockRawPunches.id })
    .from(hrTimeClockRawPunches)
    .where(
      and(
        eq(hrTimeClockRawPunches.organizationId, input.organizationId),
        eq(hrTimeClockRawPunches.employeeId, input.employeeId),
        eq(hrTimeClockRawPunches.punchType, input.punchType),
        gte(hrTimeClockRawPunches.punchedAt, windowStart),
        lte(hrTimeClockRawPunches.punchedAt, windowEnd),
      ),
    )
    .orderBy(desc(hrTimeClockRawPunches.punchedAt))
    .limit(1);

  return Boolean(existing && existing.id !== input.rawPunchId);
}

async function detectMissingPunchForDay(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
    workDate: Date;
    excludeRawPunchId: string;
  },
): Promise<HrTimeClockPunchExceptionCode | null> {
  const dayStart = startOfUtcDay(input.workDate);
  const dayEnd = endOfUtcDay(input.workDate);

  const punches = await db
    .select({
      id: hrTimeClockRawPunches.id,
      punchType: hrTimeClockRawPunches.punchType,
    })
    .from(hrTimeClockRawPunches)
    .where(
      and(
        eq(hrTimeClockRawPunches.organizationId, input.organizationId),
        eq(hrTimeClockRawPunches.employeeId, input.employeeId),
        gte(hrTimeClockRawPunches.punchedAt, dayStart),
        lte(hrTimeClockRawPunches.punchedAt, dayEnd),
      ),
    )
    .orderBy(asc(hrTimeClockRawPunches.punchedAt));

  const types = punches
    .filter((p) => p.id !== input.excludeRawPunchId)
    .map((p) => p.punchType);

  const hasIn = types.includes("clock_in");
  const hasOut = types.includes("clock_out");

  if (!hasIn && hasOut) {
    return "missing_punch";
  }

  return null;
}

function detectAbnormalPunch(input: {
  punchType: HrTimeClockPunchType;
  punchedAt: Date;
  shiftMatch: HrTimeClockShiftMatch;
  graceMinutesLate: number;
}): HrTimeClockPunchExceptionCode[] {
  const codes: HrTimeClockPunchExceptionCode[] = [];
  const punchMinutes = minutesFromUtcMidnight(input.punchedAt);
  const { referenceStartMinutes, referenceEndMinutes, graceMinutesLate } = {
    referenceStartMinutes: input.shiftMatch.referenceStartMinutes,
    referenceEndMinutes: input.shiftMatch.referenceEndMinutes,
    graceMinutesLate: input.graceMinutesLate,
  };

  if (input.punchType === "clock_in") {
    if (punchMinutes < referenceStartMinutes) {
      codes.push("early_in");
    }
    if (punchMinutes > referenceStartMinutes + graceMinutesLate) {
      codes.push("late_in");
    }
  }

  if (input.punchType === "clock_out") {
    if (punchMinutes < referenceEndMinutes) {
      codes.push("early_out");
    }
  }

  return codes;
}

async function replacePunchExceptions(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    rawPunchId: string;
    exceptionCodes: readonly HrTimeClockPunchExceptionCode[];
  },
): Promise<void> {
  await db
    .delete(hrTimeClockPunchExceptions)
    .where(
      and(
        eq(hrTimeClockPunchExceptions.organizationId, input.organizationId),
        eq(hrTimeClockPunchExceptions.rawPunchId, input.rawPunchId),
      ),
    );

  if (input.exceptionCodes.length === 0) {
    return;
  }

  await db.insert(hrTimeClockPunchExceptions).values(
    input.exceptionCodes.map((exceptionCode) => ({
      id: createEntityId("hr_tclk_exc"),
      organizationId: input.organizationId,
      rawPunchId: input.rawPunchId,
      exceptionCode,
    })),
  );
}

/** HRM-TCI-014..020 — post-ingest validation, classification, and exception persistence. */
export async function runHrTimeClockPunchValidationPipeline(input: {
  organizationId: string;
  rawPunchId: string;
  policyGroupCode?: string;
  actorAuthUserId?: string | null;
}): Promise<HrTimeClockValidationPipelineResult> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [raw] = await db
      .select()
      .from(hrTimeClockRawPunches)
      .where(
        and(
          eq(hrTimeClockRawPunches.organizationId, input.organizationId),
          eq(hrTimeClockRawPunches.id, input.rawPunchId),
        ),
      )
      .limit(1);

    if (!raw) {
      throw new HrTimeClockCommandError("raw_punch_not_found");
    }

    const [device] = await db
      .select({
        id: hrTimeClockDevices.id,
        breaksEnabled: hrTimeClockDevices.breaksEnabled,
      })
      .from(hrTimeClockDevices)
      .where(
        and(
          eq(hrTimeClockDevices.organizationId, input.organizationId),
          eq(hrTimeClockDevices.id, raw.deviceId),
        ),
      )
      .limit(1);

    if (!device) {
      throw new HrTimeClockCommandError("device_not_found");
    }

    const exceptionCodes: HrTimeClockPunchExceptionCode[] = [];
    let employeeId = raw.employeeId;
    let mappingId = raw.mappingId;

    const payload = raw.rawPayload ?? {};
    const identity = {
      deviceUserId:
        typeof payload.deviceUserId === "string" ? payload.deviceUserId : null,
      badgeId: typeof payload.badgeId === "string" ? payload.badgeId : null,
      biometricId:
        typeof payload.biometricId === "string" ? payload.biometricId : null,
      clockId: typeof payload.clockId === "string" ? payload.clockId : null,
    };

    if (!mappingId && Object.values(identity).some(Boolean)) {
      const resolved = await resolveHrTimeClockEmployeeMapping({
        organizationId: input.organizationId,
        deviceId: raw.deviceId,
        ...identity,
      });
      if (resolved) {
        mappingId = resolved.id;
        employeeId = resolved.employeeId;
      }
    }

    if (!employeeId && mappingId) {
      const [mapping] = await db
        .select({ employeeId: hrTimeClockEmployeeMappings.employeeId })
        .from(hrTimeClockEmployeeMappings)
        .where(eq(hrTimeClockEmployeeMappings.id, mappingId))
        .limit(1);
      employeeId = mapping?.employeeId ?? null;
    }

    if (!mappingId || !employeeId) {
      exceptionCodes.push("unmapped_device");
    } else {
      const [employee] = await db
        .select({ employmentStatus: hrEmployees.employmentStatus })
        .from(hrEmployees)
        .where(
          and(
            eq(hrEmployees.organizationId, input.organizationId),
            eq(hrEmployees.id, employeeId),
          ),
        )
        .limit(1);

      if (
        !employee ||
        !HR_TIME_CLOCK_ACTIVE_EMPLOYMENT_STATUSES.includes(
          employee.employmentStatus as (typeof HR_TIME_CLOCK_ACTIVE_EMPLOYMENT_STATUSES)[number],
        )
      ) {
        exceptionCodes.push("invalid_employee");
      }
    }

    const dayStart = startOfUtcDay(raw.punchedAt);
    const dayEnd = endOfUtcDay(raw.punchedAt);

    const priorPunches = employeeId
      ? await db
          .select({
            id: hrTimeClockRawPunches.id,
            punchType: hrTimeClockRawPunches.punchType,
          })
          .from(hrTimeClockRawPunches)
          .where(
            and(
              eq(hrTimeClockRawPunches.organizationId, input.organizationId),
              eq(hrTimeClockRawPunches.employeeId, employeeId),
              gte(hrTimeClockRawPunches.punchedAt, dayStart),
              lte(hrTimeClockRawPunches.punchedAt, dayEnd),
            ),
          )
          .orderBy(asc(hrTimeClockRawPunches.punchedAt))
      : [];

    const previousPunch = priorPunches
      .filter((p) => p.id !== raw.id)
      .at(-1);

    const classifiedPunchType = classifyHrTimeClockPunchSequence({
      reportedType: raw.punchType,
      previousPunchType: previousPunch?.punchType ?? null,
      breaksEnabled: device.breaksEnabled,
    });

    if (
      employeeId &&
      sequenceIsUnmatched(
        previousPunch?.punchType ?? null,
        classifiedPunchType,
        device.breaksEnabled,
      )
    ) {
      exceptionCodes.push("unmatched");
    }

    const policy = await loadAttendancePolicy(
      db,
      input.organizationId,
      input.policyGroupCode,
    );

    const shiftMatch =
      employeeId != null
        ? await matchHrTimeClockPunchToShift({
            organizationId: input.organizationId,
            employeeId,
            punchedAt: raw.punchedAt,
            policyGroupCode: input.policyGroupCode,
          })
        : {
            matched: false,
            shiftAssignmentId: null,
            referenceStartMinutes: policy.standardStartMinutes,
            referenceEndMinutes: policy.standardEndMinutes,
            source: "attendance_policy" as const,
          };

    if (employeeId) {
      const isDuplicate = await detectDuplicatePunch(db, {
        organizationId: input.organizationId,
        rawPunchId: raw.id,
        employeeId,
        punchType: classifiedPunchType,
        punchedAt: raw.punchedAt,
      });
      if (isDuplicate) {
        exceptionCodes.push("duplicate");
      }

      const missingCode = await detectMissingPunchForDay(db, {
        organizationId: input.organizationId,
        employeeId,
        workDate: raw.punchedAt,
        excludeRawPunchId: raw.id,
      });
      if (missingCode) {
        exceptionCodes.push(missingCode);
      }

      exceptionCodes.push(
        ...detectAbnormalPunch({
          punchType: classifiedPunchType,
          punchedAt: raw.punchedAt,
          shiftMatch,
          graceMinutesLate: policy.graceMinutesLate,
        }),
      );
    }

    const uniqueCodes = [...new Set(exceptionCodes)];
    const validationStatus = resolveValidationStatus(uniqueCodes);

    await db
      .update(hrTimeClockRawPunches)
      .set({
        employeeId,
        mappingId,
        punchType: classifiedPunchType,
        validationStatus,
        rawPayload: {
          ...payload,
          shiftMatch,
          classifiedAt: new Date().toISOString(),
        },
      })
      .where(eq(hrTimeClockRawPunches.id, raw.id));

    await replacePunchExceptions(db, {
      organizationId: input.organizationId,
      rawPunchId: raw.id,
      exceptionCodes: uniqueCodes,
    });

    if (uniqueCodes.length > 0) {
      await appendHrTimeClockAuditEvent({
        organizationId: input.organizationId,
        action: "punch_exception_recorded",
        summary: `Recorded ${uniqueCodes.length} punch exception(s)`,
        actorAuthUserId: input.actorAuthUserId,
        rawPunchId: raw.id,
        employeeId,
        deviceId: raw.deviceId,
        metadata: { exceptionCodes: uniqueCodes, validationStatus },
      });
    }

    return {
      rawPunchId: raw.id,
      validationStatus,
      classifiedPunchType,
      exceptionCodes: uniqueCodes,
      shiftMatch,
      employeeId,
      mappingId,
    };
  });
}
