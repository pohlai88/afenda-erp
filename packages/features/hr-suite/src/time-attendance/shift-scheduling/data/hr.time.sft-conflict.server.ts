import "@afenda/kernel/server";

import { and, eq, gte, inArray, lte, ne } from "drizzle-orm";
import {
  hrShiftAssignments,
  hrShiftAvailability,
  hrShiftTemplates,
  runWithOrganizationContext,
} from "@afenda/db";

import { loadHrSftApprovedLeaveForEmployeeDate } from "./hr.time.sft-lam-boundary.server";
import {
  analyzeHrSftAssignmentConflicts,
  endOfUtcWeek,
  startOfUtcWeek,
} from "./hr.time.sft-conflict.shared";
import { getHrSftSchedulingPolicy } from "./hr.time.sft-policy.server";
import type { HrSftAssignmentKind } from "../schemas/hr.time.sft-availability.schema";
import type {
  HrSftAvailabilitySlice,
  HrSftConflictValidationResult,
  HrSftShiftSlice,
} from "../schemas/hr.time.sft-conflict.schema";
import {
  hrSftConflictValidationInputSchema,
  validateHrSftAssignmentConflictsQuerySchema,
  type ValidateHrSftAssignmentConflictsQuery,
} from "../schemas/hr.time.sft-conflict.schema";

export class HrSftConflictValidationError extends Error {
  readonly code: "sft_assignment_conflicts";
  readonly conflicts: HrSftConflictValidationResult["conflicts"];

  constructor(conflicts: HrSftConflictValidationResult["conflicts"]) {
    super("Shift assignment conflicts detected");
    this.name = "HrSftConflictValidationError";
    this.code = "sft_assignment_conflicts";
    this.conflicts = conflicts;
  }
}

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

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

function combineDateAndTime(shiftDate: Date, timeHm: string): Date {
  if (!TIME_PATTERN.test(timeHm)) {
    throw new Error(`invalid_shift_time:${timeHm}`);
  }
  const [hoursPart, minutesPart] = timeHm.split(":");
  const combined = startOfUtcDay(shiftDate);
  combined.setUTCHours(Number(hoursPart), Number(minutesPart), 0, 0);
  return combined;
}

function resolveShiftBounds(input: {
  shiftDate: Date;
  startTime: string;
  endTime: string;
}): { shiftStart: Date; shiftEnd: Date } {
  const shiftStart = combineDateAndTime(input.shiftDate, input.startTime);
  let shiftEnd = combineDateAndTime(input.shiftDate, input.endTime);
  if (shiftEnd.getTime() <= shiftStart.getTime()) {
    shiftEnd = new Date(shiftEnd.getTime() + 86_400_000);
  }
  return { shiftStart, shiftEnd };
}

function resolveWorkingMinutes(input: {
  assignmentKind: HrSftAssignmentKind;
  workingHoursMinutes: number;
}): number {
  if (input.assignmentKind === "rest_day" || input.assignmentKind === "off_day") {
    return 0;
  }
  return input.workingHoursMinutes;
}

/** Load active assignments for conflict checks around the proposed shift week. */
export async function loadHrSftAssignmentsForConflictCheck(input: {
  organizationId: string;
  employeeId: string;
  shiftDate: Date;
  excludeAssignmentId?: string;
}): Promise<readonly HrSftShiftSlice[]> {
  const weekStart = startOfUtcWeek(input.shiftDate);
  const weekEnd = endOfUtcWeek(input.shiftDate);
  const bufferStart = new Date(weekStart);
  bufferStart.setUTCDate(bufferStart.getUTCDate() - 1);
  const bufferEnd = new Date(weekEnd);
  bufferEnd.setUTCDate(bufferEnd.getUTCDate() + 1);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrShiftAssignments.organizationId, input.organizationId),
      eq(hrShiftAssignments.employeeId, input.employeeId),
      inArray(hrShiftAssignments.status, ["scheduled", "published"]),
      gte(hrShiftAssignments.shiftDate, bufferStart),
      lte(hrShiftAssignments.shiftDate, bufferEnd),
    ];

    if (input.excludeAssignmentId) {
      conditions.push(ne(hrShiftAssignments.id, input.excludeAssignmentId));
    }

    const rows = await db
      .select({
        assignmentId: hrShiftAssignments.id,
        employeeId: hrShiftAssignments.employeeId,
        assignmentKind: hrShiftAssignments.assignmentKind,
        shiftDate: hrShiftAssignments.shiftDate,
        shiftStart: hrShiftAssignments.shiftStart,
        shiftEnd: hrShiftAssignments.shiftEnd,
        workingHoursMinutes: hrShiftTemplates.workingHoursMinutes,
      })
      .from(hrShiftAssignments)
      .innerJoin(
        hrShiftTemplates,
        eq(hrShiftAssignments.templateId, hrShiftTemplates.id),
      )
      .where(and(...conditions));

    return rows.map((row) => ({
      assignmentId: row.assignmentId,
      employeeId: row.employeeId,
      assignmentKind: row.assignmentKind,
      shiftDate: row.shiftDate,
      shiftStart: row.shiftStart,
      shiftEnd: row.shiftEnd,
      workingHoursMinutes: resolveWorkingMinutes({
        assignmentKind: row.assignmentKind,
        workingHoursMinutes: row.workingHoursMinutes,
      }),
    }));
  });
}

/** HRM-SFT-011 — load employee availability windows overlapping a shift date. */
export async function loadHrSftAvailabilityForEmployeeDate(input: {
  organizationId: string;
  employeeId: string;
  shiftDate: Date;
}): Promise<readonly HrSftAvailabilitySlice[]> {
  const dayStart = startOfUtcDay(input.shiftDate);
  const dayEnd = endOfUtcDay(input.shiftDate);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        availabilityId: hrShiftAvailability.id,
        employeeId: hrShiftAvailability.employeeId,
        availabilityKind: hrShiftAvailability.availabilityKind,
        startDate: hrShiftAvailability.startDate,
        endDate: hrShiftAvailability.endDate,
      })
      .from(hrShiftAvailability)
      .where(
        and(
          eq(hrShiftAvailability.organizationId, input.organizationId),
          eq(hrShiftAvailability.employeeId, input.employeeId),
          lte(hrShiftAvailability.startDate, dayEnd),
          gte(hrShiftAvailability.endDate, dayStart),
        ),
      );

    return rows;
  });
}

/** Build proposed shift slice from template metadata. */
export async function buildHrSftProposedShiftSlice(input: {
  organizationId: string;
  employeeId: string;
  templateId: string;
  shiftDate: Date;
  assignmentKind?: HrSftAssignmentKind;
}): Promise<HrSftShiftSlice> {
  const assignmentKind = input.assignmentKind ?? "shift";

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [template] = await db
      .select({
        startTime: hrShiftTemplates.startTime,
        endTime: hrShiftTemplates.endTime,
        workingHoursMinutes: hrShiftTemplates.workingHoursMinutes,
      })
      .from(hrShiftTemplates)
      .where(
        and(
          eq(hrShiftTemplates.organizationId, input.organizationId),
          eq(hrShiftTemplates.id, input.templateId),
        ),
      )
      .limit(1);

    if (!template) {
      throw new Error("sft_template_not_found");
    }

    const shiftDay = startOfUtcDay(input.shiftDate);
    const { shiftStart, shiftEnd } = resolveShiftBounds({
      shiftDate: shiftDay,
      startTime: template.startTime,
      endTime: template.endTime,
    });

    return {
      employeeId: input.employeeId,
      assignmentKind,
      shiftDate: shiftDay,
      shiftStart,
      shiftEnd,
      workingHoursMinutes: resolveWorkingMinutes({
        assignmentKind,
        workingHoursMinutes: template.workingHoursMinutes,
      }),
    };
  });
}

/**
 * HRM-SFT-011 … HRM-SFT-015 — validate shift assignment conflicts before persist.
 * Exported for assignment module integration.
 */
export async function validateShiftAssignmentConflicts(
  input: ValidateHrSftAssignmentConflictsQuery & { organizationId: string },
): Promise<HrSftConflictValidationResult> {
  const query = validateHrSftAssignmentConflictsQuerySchema.parse(input);

  const [policy, proposed, existingAssignments, approvedLeaves, availability] =
    await Promise.all([
      getHrSftSchedulingPolicy({ organizationId: input.organizationId }),
      buildHrSftProposedShiftSlice({
        organizationId: input.organizationId,
        employeeId: query.employeeId,
        templateId: query.templateId,
        shiftDate: query.shiftDate,
        assignmentKind: query.assignmentKind,
      }),
      loadHrSftAssignmentsForConflictCheck({
        organizationId: input.organizationId,
        employeeId: query.employeeId,
        shiftDate: query.shiftDate,
        excludeAssignmentId: query.excludeAssignmentId,
      }),
      loadHrSftApprovedLeaveForEmployeeDate({
        organizationId: input.organizationId,
        employeeId: query.employeeId,
        shiftDate: query.shiftDate,
      }),
      loadHrSftAvailabilityForEmployeeDate({
        organizationId: input.organizationId,
        employeeId: query.employeeId,
        shiftDate: query.shiftDate,
      }),
    ]);

  return analyzeHrSftAssignmentConflicts(
    hrSftConflictValidationInputSchema.parse({
      proposed,
      existingAssignments,
      approvedLeaves,
      availabilityWindows: availability,
      policy,
      excludeAssignmentId: query.excludeAssignmentId,
    }),
  );
}

/** Assert no conflicts; throws HrSftConflictValidationError when blocked. */
export async function assertShiftAssignmentConflictsClear(
  input: ValidateHrSftAssignmentConflictsQuery & { organizationId: string },
): Promise<HrSftConflictValidationResult> {
  const result = await validateShiftAssignmentConflicts(input);
  if (result.hasConflicts) {
    throw new HrSftConflictValidationError(result.conflicts);
  }
  return result;
}
