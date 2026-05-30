import type { hrLeaveTypeEnum } from "./schema/hr";

export type HrLeaveType = (typeof hrLeaveTypeEnum.enumValues)[number];

export type HrLeavePolicyRules = {
  minNoticeDays: number;
  maxConsecutiveDays: number | null;
};

export type HrLeaveApplicationCandidate = {
  employeeId: string;
  leaveType: HrLeaveType;
  startAt: Date;
  endAt: Date;
  durationDays: number;
  submittedAt?: Date;
};

export type HrLeaveOverlapRow = {
  id: string;
  status: string;
  startAt: Date;
  endAt: Date;
};

export type HrLeaveBlackoutRow = {
  id: string;
  label: string;
  startAt: Date;
  endAt: Date;
  leaveTypes: readonly string[] | null;
};

export type HrLeaveValidationFailureCode =
  | "invalid_date_range"
  | "insufficient_notice"
  | "exceeds_max_consecutive_days"
  | "blackout_period"
  | "overlapping_leave";

export class HrLeaveValidationError extends Error {
  readonly code: HrLeaveValidationFailureCode;

  constructor(code: HrLeaveValidationFailureCode, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

const MS_PER_DAY = 86_400_000;

const ACTIVE_OVERLAP_STATUSES = new Set([
  "pending",
  "returned",
  "clarification_requested",
  "approved",
]);

export function computeLeaveDurationDays(startAt: Date, endAt: Date): number {
  if (endAt.getTime() < startAt.getTime()) {
    throw new HrLeaveValidationError("invalid_date_range");
  }
  return (endAt.getTime() - startAt.getTime()) / MS_PER_DAY + 1;
}

export function assertMinimumNoticePeriod(input: {
  startAt: Date;
  submittedAt: Date;
  minNoticeDays: number;
}): void {
  const noticeMs = input.minNoticeDays * MS_PER_DAY;
  if (input.startAt.getTime() - input.submittedAt.getTime() < noticeMs) {
    throw new HrLeaveValidationError("insufficient_notice");
  }
}

export function assertMaxConsecutiveDays(input: {
  durationDays: number;
  maxConsecutiveDays: number | null;
}): void {
  if (
    input.maxConsecutiveDays !== null &&
    input.durationDays > input.maxConsecutiveDays
  ) {
    throw new HrLeaveValidationError("exceeds_max_consecutive_days");
  }
}

export function findBlackoutViolation(input: {
  leaveType: HrLeaveType;
  startAt: Date;
  endAt: Date;
  blackoutPeriods: readonly HrLeaveBlackoutRow[];
}): HrLeaveBlackoutRow | undefined {
  return input.blackoutPeriods.find((period) => {
    if (period.endAt.getTime() < input.startAt.getTime()) {
      return false;
    }
    if (period.startAt.getTime() > input.endAt.getTime()) {
      return false;
    }
    if (period.leaveTypes && period.leaveTypes.length > 0) {
      return period.leaveTypes.includes(input.leaveType);
    }
    return true;
  });
}

export function assertNoBlackoutConflict(input: {
  leaveType: HrLeaveType;
  startAt: Date;
  endAt: Date;
  blackoutPeriods: readonly HrLeaveBlackoutRow[];
}): void {
  const violation = findBlackoutViolation(input);
  if (violation) {
    throw new HrLeaveValidationError("blackout_period");
  }
}

export function dateRangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart.getTime() <= bEnd.getTime() && bStart.getTime() <= aEnd.getTime();
}

export function findOverlappingLeaveRequest(input: {
  candidate: HrLeaveApplicationCandidate;
  existing: readonly HrLeaveOverlapRow[];
  excludeRequestId?: string;
}): HrLeaveOverlapRow | undefined {
  return input.existing.find((row) => {
    if (input.excludeRequestId && row.id === input.excludeRequestId) {
      return false;
    }
    if (!ACTIVE_OVERLAP_STATUSES.has(row.status)) {
      return false;
    }
    return dateRangesOverlap(
      input.candidate.startAt,
      input.candidate.endAt,
      row.startAt,
      row.endAt,
    );
  });
}

export function assertNoOverlappingLeave(input: {
  candidate: HrLeaveApplicationCandidate;
  existing: readonly HrLeaveOverlapRow[];
  excludeRequestId?: string;
}): void {
  const overlap = findOverlappingLeaveRequest(input);
  if (overlap) {
    throw new HrLeaveValidationError("overlapping_leave");
  }
}

export function validateLeaveApplicationRules(input: {
  candidate: HrLeaveApplicationCandidate;
  policy: HrLeavePolicyRules;
  submittedAt: Date;
  blackoutPeriods: readonly HrLeaveBlackoutRow[];
  overlappingRequests: readonly HrLeaveOverlapRow[];
  excludeRequestId?: string;
}): void {
  if (input.candidate.endAt.getTime() < input.candidate.startAt.getTime()) {
    throw new HrLeaveValidationError("invalid_date_range");
  }
  assertMinimumNoticePeriod({
    startAt: input.candidate.startAt,
    submittedAt: input.submittedAt,
    minNoticeDays: input.policy.minNoticeDays,
  });
  assertMaxConsecutiveDays({
    durationDays: input.candidate.durationDays,
    maxConsecutiveDays: input.policy.maxConsecutiveDays,
  });
  assertNoBlackoutConflict({
    leaveType: input.candidate.leaveType,
    startAt: input.candidate.startAt,
    endAt: input.candidate.endAt,
    blackoutPeriods: input.blackoutPeriods,
  });
  assertNoOverlappingLeave({
    candidate: input.candidate,
    existing: input.overlappingRequests,
    excludeRequestId: input.excludeRequestId,
  });
}
