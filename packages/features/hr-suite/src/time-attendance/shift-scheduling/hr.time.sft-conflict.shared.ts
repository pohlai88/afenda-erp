import type {
  HrSftApprovedLeaveSlice,
  HrSftAssignmentConflict,
  HrSftAvailabilitySlice,
  HrSftConflictValidationInput,
  HrSftConflictValidationResult,
  HrSftShiftSlice,
} from "./hr.time.sft-conflict.schema";
import type { HrSftAssignmentKind } from "./hr.time.sft-availability.schema";
import type { HrSftSchedulingPolicy } from "./hr.time.sft-policy.schema";

/** Working assignment kinds counted toward overlap, rest, and weekly-hour rules. */
export const HR_SFT_WORKING_ASSIGNMENT_KINDS = new Set<HrSftAssignmentKind>([
  "shift",
  "holiday",
]);

/** Availability kinds that block shift assignment (HRM-SFT-011). */
export const HR_SFT_BLOCKING_AVAILABILITY_KINDS = new Set([
  "unavailable",
  "blocked",
]);

export class HrSftConflictInvariantError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "HrSftConflictInvariantError";
    this.code = code;
  }
}

function utcDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

/** ISO week start (Monday) in UTC. */
export function startOfUtcWeek(date: Date): Date {
  const day = startOfUtcDay(date);
  const weekday = day.getUTCDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  day.setUTCDate(day.getUTCDate() + diff);
  return day;
}

export function endOfUtcWeek(date: Date): Date {
  const start = startOfUtcWeek(date);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);
  return end;
}

export function isHrSftWorkingAssignment(
  assignmentKind: HrSftAssignmentKind,
): boolean {
  return HR_SFT_WORKING_ASSIGNMENT_KINDS.has(assignmentKind);
}

export function intervalsOverlap(
  leftStart: Date,
  leftEnd: Date,
  rightStart: Date,
  rightEnd: Date,
): boolean {
  return (
    leftStart.getTime() < rightEnd.getTime() &&
    rightStart.getTime() < leftEnd.getTime()
  );
}

function restGapHours(previousEnd: Date, nextStart: Date): number {
  return (nextStart.getTime() - previousEnd.getTime()) / 3_600_000;
}

function dateWithinInclusiveRange(
  target: Date,
  rangeStart: Date,
  rangeEnd: Date,
): boolean {
  const day = startOfUtcDay(target).getTime();
  return (
    day >= startOfUtcDay(rangeStart).getTime() &&
    day <= startOfUtcDay(rangeEnd).getTime()
  );
}

function filterActiveAssignments(
  assignments: readonly HrSftShiftSlice[],
  excludeAssignmentId?: string,
): HrSftShiftSlice[] {
  return assignments.filter(
    (assignment) =>
      assignment.assignmentId !== excludeAssignmentId &&
      isHrSftWorkingAssignment(assignment.assignmentKind),
  );
}

/** HRM-SFT-011 — flag unavailable or blocked availability windows. */
export function detectHrSftAvailabilityConflicts(input: {
  proposed: HrSftShiftSlice;
  availabilityWindows: readonly HrSftAvailabilitySlice[];
  validateAvailabilityOnAssign: boolean;
}): HrSftAssignmentConflict[] {
  if (!input.validateAvailabilityOnAssign) {
    return [];
  }
  if (!isHrSftWorkingAssignment(input.proposed.assignmentKind)) {
    return [];
  }

  const conflicts: HrSftAssignmentConflict[] = [];
  for (const window of input.availabilityWindows) {
    if (window.employeeId !== input.proposed.employeeId) {
      continue;
    }
    if (!HR_SFT_BLOCKING_AVAILABILITY_KINDS.has(window.availabilityKind)) {
      continue;
    }
    if (
      !dateWithinInclusiveRange(
        input.proposed.shiftDate,
        window.startDate,
        window.endDate,
      )
    ) {
      continue;
    }

    conflicts.push({
      code: "availability_unavailable",
      requirementCode: "HRM-SFT-011",
      message: `Employee marked ${window.availabilityKind} on ${utcDayKey(input.proposed.shiftDate)}`,
      relatedAvailabilityId: window.availabilityId,
    });
  }

  return conflicts;
}

/** HRM-SFT-012 — flag approved leave overlapping the proposed shift date. */
export function detectHrSftLeaveConflicts(input: {
  proposed: HrSftShiftSlice;
  approvedLeaves: readonly HrSftApprovedLeaveSlice[];
  validateLeaveConflictOnAssign: boolean;
}): HrSftAssignmentConflict[] {
  if (!input.validateLeaveConflictOnAssign) {
    return [];
  }
  if (!isHrSftWorkingAssignment(input.proposed.assignmentKind)) {
    return [];
  }

  const conflicts: HrSftAssignmentConflict[] = [];
  for (const leave of input.approvedLeaves) {
    if (leave.employeeId !== input.proposed.employeeId) {
      continue;
    }
    if (
      !dateWithinInclusiveRange(
        input.proposed.shiftDate,
        leave.startAt,
        leave.endAt,
      )
    ) {
      continue;
    }

    conflicts.push({
      code: "leave_approved",
      requirementCode: "HRM-SFT-012",
      message: `Approved ${leave.leaveType} leave overlaps ${utcDayKey(input.proposed.shiftDate)}`,
      relatedLeaveRequestId: leave.leaveRequestId,
    });
  }

  return conflicts;
}

/** HRM-SFT-013 — flag overlapping working shift assignments. */
export function detectHrSftOverlapConflicts(input: {
  proposed: HrSftShiftSlice;
  existingAssignments: readonly HrSftShiftSlice[];
  excludeAssignmentId?: string;
}): HrSftAssignmentConflict[] {
  if (!isHrSftWorkingAssignment(input.proposed.assignmentKind)) {
    return [];
  }

  const conflicts: HrSftAssignmentConflict[] = [];
  for (const existing of filterActiveAssignments(
    input.existingAssignments,
    input.excludeAssignmentId,
  )) {
    if (existing.employeeId !== input.proposed.employeeId) {
      continue;
    }
    if (
      !intervalsOverlap(
        input.proposed.shiftStart,
        input.proposed.shiftEnd,
        existing.shiftStart,
        existing.shiftEnd,
      )
    ) {
      continue;
    }

    conflicts.push({
      code: "shift_overlap",
      requirementCode: "HRM-SFT-013",
      message: `Shift overlaps existing assignment on ${utcDayKey(existing.shiftDate)}`,
      relatedAssignmentId: existing.assignmentId,
    });
  }

  return conflicts;
}

/** HRM-SFT-014 — flag insufficient rest between consecutive working shifts. */
export function detectHrSftRestPeriodConflicts(input: {
  proposed: HrSftShiftSlice;
  existingAssignments: readonly HrSftShiftSlice[];
  minRestHoursBetweenShifts: number;
  excludeAssignmentId?: string;
}): HrSftAssignmentConflict[] {
  if (!isHrSftWorkingAssignment(input.proposed.assignmentKind)) {
    return [];
  }
  if (input.minRestHoursBetweenShifts <= 0) {
    return [];
  }

  const conflicts: HrSftAssignmentConflict[] = [];
  for (const existing of filterActiveAssignments(
    input.existingAssignments,
    input.excludeAssignmentId,
  )) {
    if (existing.employeeId !== input.proposed.employeeId) {
      continue;
    }

    const gapAfterExisting = restGapHours(
      existing.shiftEnd,
      input.proposed.shiftStart,
    );
    if (
      gapAfterExisting >= 0 &&
      gapAfterExisting < input.minRestHoursBetweenShifts
    ) {
      conflicts.push({
        code: "insufficient_rest",
        requirementCode: "HRM-SFT-014",
        message: `Only ${gapAfterExisting.toFixed(1)}h rest after prior shift; policy requires ${input.minRestHoursBetweenShifts}h`,
        relatedAssignmentId: existing.assignmentId,
      });
      continue;
    }

    const gapBeforeExisting = restGapHours(
      input.proposed.shiftEnd,
      existing.shiftStart,
    );
    if (
      gapBeforeExisting >= 0 &&
      gapBeforeExisting < input.minRestHoursBetweenShifts
    ) {
      conflicts.push({
        code: "insufficient_rest",
        requirementCode: "HRM-SFT-014",
        message: `Only ${gapBeforeExisting.toFixed(1)}h rest before next shift; policy requires ${input.minRestHoursBetweenShifts}h`,
        relatedAssignmentId: existing.assignmentId,
      });
    }
  }

  return conflicts;
}

/** HRM-SFT-015 — flag weekly scheduled hours above org policy cap. */
export function detectHrSftWeeklyHoursConflicts(input: {
  proposed: HrSftShiftSlice;
  existingAssignments: readonly HrSftShiftSlice[];
  maxWeeklyScheduledHours: number;
  excludeAssignmentId?: string;
}): HrSftAssignmentConflict[] {
  if (!isHrSftWorkingAssignment(input.proposed.assignmentKind)) {
    return [];
  }

  const weekStart = startOfUtcWeek(input.proposed.shiftDate);
  const weekEnd = endOfUtcWeek(input.proposed.shiftDate);

  let totalMinutes = input.proposed.workingHoursMinutes;
  for (const existing of filterActiveAssignments(
    input.existingAssignments,
    input.excludeAssignmentId,
  )) {
    if (existing.employeeId !== input.proposed.employeeId) {
      continue;
    }
    if (
      existing.shiftDate.getTime() < weekStart.getTime() ||
      existing.shiftDate.getTime() > weekEnd.getTime()
    ) {
      continue;
    }
    totalMinutes += existing.workingHoursMinutes;
  }

  const totalHours = totalMinutes / 60;
  if (totalHours <= input.maxWeeklyScheduledHours) {
    return [];
  }

  return [
    {
      code: "weekly_hours_exceeded",
      requirementCode: "HRM-SFT-015",
      message: `Scheduled ${totalHours.toFixed(1)}h in week starting ${utcDayKey(weekStart)}; policy cap is ${input.maxWeeklyScheduledHours}h`,
    },
  ];
}

/** Pure aggregator for assignment conflict checks (HRM-SFT-011 … HRM-SFT-015). */
export function analyzeHrSftAssignmentConflicts(
  input: HrSftConflictValidationInput,
): HrSftConflictValidationResult {
  const conflicts: HrSftAssignmentConflict[] = [
    ...detectHrSftAvailabilityConflicts({
      proposed: input.proposed,
      availabilityWindows: input.availabilityWindows,
      validateAvailabilityOnAssign: input.policy.validateAvailabilityOnAssign,
    }),
    ...detectHrSftLeaveConflicts({
      proposed: input.proposed,
      approvedLeaves: input.approvedLeaves,
      validateLeaveConflictOnAssign: input.policy.validateLeaveConflictOnAssign,
    }),
    ...detectHrSftOverlapConflicts({
      proposed: input.proposed,
      existingAssignments: input.existingAssignments,
      excludeAssignmentId: input.excludeAssignmentId,
    }),
    ...detectHrSftRestPeriodConflicts({
      proposed: input.proposed,
      existingAssignments: input.existingAssignments,
      minRestHoursBetweenShifts: input.policy.minRestHoursBetweenShifts,
      excludeAssignmentId: input.excludeAssignmentId,
    }),
    ...detectHrSftWeeklyHoursConflicts({
      proposed: input.proposed,
      existingAssignments: input.existingAssignments,
      maxWeeklyScheduledHours: input.policy.maxWeeklyScheduledHours,
      excludeAssignmentId: input.excludeAssignmentId,
    }),
  ];

  return {
    requirementCodes: [
      "HRM-SFT-011",
      "HRM-SFT-012",
      "HRM-SFT-013",
      "HRM-SFT-014",
      "HRM-SFT-015",
    ],
    hasConflicts: conflicts.length > 0,
    conflicts,
  };
}

export function assertHrSftSchedulingPolicyValid(
  policy: HrSftSchedulingPolicy,
): void {
  if (policy.minRestHoursBetweenShifts < 0) {
    throw new HrSftConflictInvariantError(
      "sft_invalid_rest_hours",
      "minRestHoursBetweenShifts cannot be negative",
    );
  }
  if (policy.maxWeeklyScheduledHours <= 0) {
    throw new HrSftConflictInvariantError(
      "sft_invalid_weekly_cap",
      "maxWeeklyScheduledHours must be positive",
    );
  }
}
