import { computeOtmDurationMinutesFromTimeRange } from "./hr-otm.shared";
import type { HrOvertimeType } from "./hr-otm.shared";

/** Standard workday minutes for compensatory leave conversion (HRM-OTM-022). */
export const HRM_OTM_MINUTES_PER_LEAVE_DAY = 480;

export const HRM_OTM_DEFAULT_HOURLY_RATE_CENTS = 0;

export type OtmCalculationSnapshot = {
  payableMinutes: number;
  amountCents: number;
  earningCode: string;
  payMultiplier: number;
  hourlyRateCents: number;
};

export type HrOvertimeRoundingMode = "none" | "down" | "up" | "nearest";

export type HrOvertimeDayCategory =
  | "weekday"
  | "rest_day"
  | "off_day"
  | "public_holiday";

export type HrOvertimeExceptionKind =
  | "shift_variance"
  | "daily_cap"
  | "weekly_cap"
  | "monthly_cap"
  | "statutory_cap"
  | "budget_cap"
  | "min_duration"
  | "attendance_mismatch"
  | "late_submission"
  | "unplanned";

export type HrOvertimeRateRuleRow = {
  id: string;
  policyGroupCode: string;
  name: string;
  overtimeType: string | null;
  dayCategory: HrOvertimeDayCategory | null;
  shiftCategory: string | null;
  employeeCategory: string | null;
  countryCode: string | null;
  multiplier: string;
  earningCode: string;
  priority: number;
  effectiveFrom: Date;
  effectiveTo: Date | null;
};

export type HrOvertimePolicyConfig = {
  compareAttendanceEnabled: boolean;
  minOvertimeMinutes: number;
  roundingMode: HrOvertimeRoundingMode;
  roundingIntervalMinutes: number;
  graceMinutesBeforeRounding: number;
  dailyCapMinutes: number | null;
  weeklyCapMinutes: number | null;
  monthlyCapMinutes: number | null;
  statutoryCapMinutes: number | null;
  budgetCapMinutes: number | null;
  attendanceVarianceToleranceMinutes: number;
  shiftVarianceToleranceMinutes: number;
};

export type HrOvertimeRateMatchContext = {
  overtimeType: string;
  dayCategory: HrOvertimeDayCategory | null;
  shiftCategory: string | null;
  employeeCategory: string | null;
  countryCode: string | null;
  asOf: Date;
};

export type HrOvertimePeriodUsage = {
  dailyMinutes: number;
  weeklyMinutes: number;
  monthlyMinutes: number;
};

export type HrOvertimeScheduledShift = {
  shiftStartTime: string;
  shiftEndTime: string;
  workingMinutes: number;
};

export type HrOvertimeExceptionDraft = {
  kind: HrOvertimeExceptionKind;
  message: string;
  metadata?: Record<string, unknown>;
};

export type HrOvertimeCalculationResult = {
  requestedMinutes: number;
  attendanceMinutes: number | null;
  sourceMinutes: number;
  roundedMinutes: number;
  cappedMinutes: number;
  payableMinutes: number;
  rateMultiplier: number;
  earningCode: string;
  rateRuleId: string | null;
  amountCents: number | null;
  exceptions: readonly HrOvertimeExceptionDraft[];
  calculationDetail: Record<string, unknown>;
};

export const DEFAULT_HR_OVERTIME_POLICY: HrOvertimePolicyConfig = {
  compareAttendanceEnabled: false,
  minOvertimeMinutes: 0,
  roundingMode: "nearest",
  roundingIntervalMinutes: 15,
  graceMinutesBeforeRounding: 0,
  dailyCapMinutes: null,
  weeklyCapMinutes: null,
  monthlyCapMinutes: null,
  statutoryCapMinutes: null,
  budgetCapMinutes: null,
  attendanceVarianceToleranceMinutes: 15,
  shiftVarianceToleranceMinutes: 15,
};

const DEFAULT_MULTIPLIERS: Record<string, number> = {
  regular: 1.5,
  weekend: 2,
  holiday: 2,
  public_holiday: 3,
  rest_day: 2,
  off_day: 2,
  night: 1.5,
  emergency: 2,
};

/** HRM-OTM-011 — nearest-interval rounding for legacy snapshot path. */
export function roundOtmPayableMinutes(
  minutes: number,
  intervalMinutes = 15,
): number {
  if (minutes <= 0) return 0;
  const interval = Math.max(1, intervalMinutes);
  return Math.round(minutes / interval) * interval;
}

/** HRM-OTM-007 — default statutory multiplier by overtime type when no rate rule matches. */
export function resolveOtmPayMultiplier(overtimeType: HrOvertimeType | string): number {
  return DEFAULT_MULTIPLIERS[overtimeType] ?? 1.5;
}

export function resolveOtmEarningCode(overtimeType: HrOvertimeType | string): string {
  switch (overtimeType) {
    case "public_holiday":
      return "OT_PH";
    case "rest_day":
      return "OT_RD";
    case "off_day":
      return "OT_OD";
    case "night":
      return "OT_NIGHT";
    case "emergency":
      return "OT_EMG";
    default:
      return "OT";
  }
}

/** HRM-OTM-021 — monetary amount from payable minutes. */
export function computeOtmAmountCents(input: {
  payableMinutes: number;
  hourlyRateCents: number;
  multiplier: number;
}): number {
  const minutes = Math.max(0, Math.floor(input.payableMinutes));
  const hourly = Math.max(0, Math.floor(input.hourlyRateCents));
  const multiplier = input.multiplier > 0 ? input.multiplier : 1;
  return Math.round((minutes / 60) * hourly * multiplier);
}

/** Legacy approval snapshot builder (HRM-OTM-020/021). */
export function buildOtmCalculationSnapshot(input: {
  rawMinutes: number;
  overtimeType: HrOvertimeType | string;
  hourlyRateCents?: number;
  payMultiplier?: number;
  earningCode?: string | null;
  roundingIntervalMinutes?: number;
}): OtmCalculationSnapshot {
  const payableMinutes = roundOtmPayableMinutes(
    input.rawMinutes,
    input.roundingIntervalMinutes ?? 15,
  );
  const payMultiplier =
    input.payMultiplier ?? resolveOtmPayMultiplier(input.overtimeType);
  const hourlyRateCents =
    input.hourlyRateCents ?? HRM_OTM_DEFAULT_HOURLY_RATE_CENTS;
  const earningCode =
    input.earningCode?.trim() ||
    resolveOtmEarningCode(input.overtimeType);

  return {
    payableMinutes,
    payMultiplier,
    hourlyRateCents,
    earningCode,
    amountCents: computeOtmAmountCents({
      payableMinutes,
      hourlyRateCents,
      multiplier: payMultiplier,
    }),
  };
}

/** HRM-OTM-008 — minutes from explicit hours or HH:mm range. */
export function resolveOtmRequestedMinutes(input: {
  hours?: number | string | null;
  startTime?: string | null;
  endTime?: string | null;
}): number {
  if (input.hours != null && input.hours !== "") {
    const parsed = Number(input.hours);
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.round(parsed * 60);
    }
  }
  if (input.startTime && input.endTime) {
    const minutes = computeOtmDurationMinutesFromTimeRange({
      startTime: input.startTime,
      endTime: input.endTime,
    });
    if (minutes != null && minutes > 0) {
      return minutes;
    }
  }
  return 0;
}

/** HRM-OTM-008 — attendance path when policy enables compare. */
export function resolveOtmMinutesFromAttendance(input: {
  compareAttendanceEnabled: boolean;
  requestedMinutes: number;
  attendanceOvertimeMinutes?: number | null;
}): { sourceMinutes: number; attendanceMinutes: number | null } {
  if (!input.compareAttendanceEnabled) {
    return {
      sourceMinutes: input.requestedMinutes,
      attendanceMinutes: null,
    };
  }
  const attendance =
    input.attendanceOvertimeMinutes != null &&
    Number.isFinite(input.attendanceOvertimeMinutes)
      ? Math.max(0, Math.round(input.attendanceOvertimeMinutes))
      : null;

  if (attendance == null) {
    return {
      sourceMinutes: input.requestedMinutes,
      attendanceMinutes: null,
    };
  }

  return {
    sourceMinutes: Math.min(input.requestedMinutes, attendance),
    attendanceMinutes: attendance,
  };
}

/** HRM-OTM-010 — flag when requested minutes diverge from attendance. */
export function detectOtmAttendanceMismatch(input: {
  compareAttendanceEnabled: boolean;
  requestedMinutes: number;
  attendanceMinutes: number | null;
  toleranceMinutes: number;
}): HrOvertimeExceptionDraft | null {
  if (!input.compareAttendanceEnabled || input.attendanceMinutes == null) {
    return null;
  }
  const variance = Math.abs(input.requestedMinutes - input.attendanceMinutes);
  if (variance <= input.toleranceMinutes) {
    return null;
  }
  return {
    kind: "attendance_mismatch",
    message: `Requested overtime (${input.requestedMinutes}m) differs from attendance (${input.attendanceMinutes}m)`,
    metadata: {
      requestedMinutes: input.requestedMinutes,
      attendanceMinutes: input.attendanceMinutes,
      varianceMinutes: variance,
    },
  };
}

/** HRM-OTM-009 — compare request window against scheduled shift. */
export function detectOtmShiftVariance(input: {
  requestStartTime?: string | null;
  requestEndTime?: string | null;
  scheduledShift?: HrOvertimeScheduledShift | null;
  toleranceMinutes: number;
}): HrOvertimeExceptionDraft | null {
  if (
    !input.scheduledShift ||
    !input.requestStartTime ||
    !input.requestEndTime
  ) {
    return null;
  }

  const requestStart = parseTimeToMinutes(input.requestStartTime);
  const requestEnd = parseTimeToMinutes(input.requestEndTime);
  const shiftStart = parseTimeToMinutes(input.scheduledShift.shiftStartTime);
  const shiftEnd = parseTimeToMinutes(input.scheduledShift.shiftEndTime);

  if (
    requestStart == null ||
    requestEnd == null ||
    shiftStart == null ||
    shiftEnd == null
  ) {
    return null;
  }

  const requestMinutes = durationMinutes(requestStart, requestEnd);
  const scheduledOtMinutes = Math.max(
    0,
    requestMinutes - input.scheduledShift.workingMinutes,
  );
  const variance = Math.abs(requestMinutes - scheduledOtMinutes);

  const startsEarly = requestStart < shiftStart - input.toleranceMinutes;
  const endsLate = requestEnd > shiftEnd + input.toleranceMinutes;

  if (!startsEarly && !endsLate && variance <= input.toleranceMinutes) {
    return null;
  }

  return {
    kind: "shift_variance",
    message: "Requested overtime extends beyond scheduled shift hours",
    metadata: {
      requestStartTime: input.requestStartTime,
      requestEndTime: input.requestEndTime,
      shiftStartTime: input.scheduledShift.shiftStartTime,
      shiftEndTime: input.scheduledShift.shiftEndTime,
      requestMinutes,
      scheduledWorkingMinutes: input.scheduledShift.workingMinutes,
      varianceMinutes: variance,
    },
  };
}

/** HRM-OTM-011 — apply policy rounding mode and interval. */
export function applyOtmRounding(
  minutes: number,
  policy: Pick<
    HrOvertimePolicyConfig,
    "roundingMode" | "roundingIntervalMinutes" | "graceMinutesBeforeRounding"
  >,
): number {
  if (minutes <= 0) {
    return 0;
  }

  const afterGrace = Math.max(
    0,
    minutes - Math.max(0, policy.graceMinutesBeforeRounding),
  );

  const interval = Math.max(1, policy.roundingIntervalMinutes);
  if (policy.roundingMode === "none") {
    return afterGrace;
  }

  const quotient = afterGrace / interval;
  switch (policy.roundingMode) {
    case "down":
      return Math.floor(quotient) * interval;
    case "up":
      return Math.ceil(quotient) * interval;
    case "nearest":
      return Math.round(quotient) * interval;
    default:
      return afterGrace;
  }
}

/** HRM-OTM-012 — minimum duration gate. */
export function enforceOtmMinDuration(input: {
  minutes: number;
  minOvertimeMinutes: number;
}): HrOvertimeExceptionDraft | null {
  if (
    input.minOvertimeMinutes <= 0 ||
    input.minutes >= input.minOvertimeMinutes
  ) {
    return null;
  }
  return {
    kind: "min_duration",
    message: `Overtime duration (${input.minutes}m) is below minimum (${input.minOvertimeMinutes}m)`,
    metadata: {
      minutes: input.minutes,
      minOvertimeMinutes: input.minOvertimeMinutes,
    },
  };
}

/** HRM-OTM-013 — daily/weekly/monthly/statutory/budget caps. */
export function applyOtmCaps(input: {
  minutes: number;
  policy: Pick<
    HrOvertimePolicyConfig,
    | "dailyCapMinutes"
    | "weeklyCapMinutes"
    | "monthlyCapMinutes"
    | "statutoryCapMinutes"
    | "budgetCapMinutes"
  >;
  periodUsage: HrOvertimePeriodUsage;
}): {
  cappedMinutes: number;
  exceptions: HrOvertimeExceptionDraft[];
} {
  const exceptions: HrOvertimeExceptionDraft[] = [];
  let remaining = input.minutes;

  const capChecks: Array<{
    kind: HrOvertimeExceptionKind;
    cap: number | null;
    used: number;
    label: string;
  }> = [
    {
      kind: "daily_cap",
      cap: input.policy.dailyCapMinutes,
      used: input.periodUsage.dailyMinutes,
      label: "Daily",
    },
    {
      kind: "weekly_cap",
      cap: input.policy.weeklyCapMinutes,
      used: input.periodUsage.weeklyMinutes,
      label: "Weekly",
    },
    {
      kind: "monthly_cap",
      cap: input.policy.monthlyCapMinutes,
      used: input.periodUsage.monthlyMinutes,
      label: "Monthly",
    },
    {
      kind: "statutory_cap",
      cap: input.policy.statutoryCapMinutes,
      used: input.periodUsage.monthlyMinutes,
      label: "Statutory",
    },
    {
      kind: "budget_cap",
      cap: input.policy.budgetCapMinutes,
      used: input.periodUsage.monthlyMinutes,
      label: "Budget",
    },
  ];

  for (const check of capChecks) {
    if (check.cap == null || check.cap <= 0) {
      continue;
    }
    const allowance = Math.max(0, check.cap - check.used);
    if (remaining > allowance) {
      exceptions.push({
        kind: check.kind,
        message: `${check.label} overtime cap exceeded (${check.used + remaining}m vs ${check.cap}m limit)`,
        metadata: {
          capMinutes: check.cap,
          usedMinutes: check.used,
          requestedMinutes: remaining,
          allowedMinutes: allowance,
        },
      });
      remaining = allowance;
    }
  }

  return {
    cappedMinutes: Math.max(0, remaining),
    exceptions,
  };
}

export function otmRateRuleSpecificityScore(rule: HrOvertimeRateRuleRow): number {
  let score = rule.priority;
  if (rule.overtimeType) score += 256;
  if (rule.dayCategory) score += 128;
  if (rule.shiftCategory) score += 64;
  if (rule.employeeCategory) score += 32;
  if (rule.countryCode) score += 16;
  return score;
}

export function otmMatchesRateRule(
  rule: HrOvertimeRateRuleRow,
  context: HrOvertimeRateMatchContext,
): boolean {
  if (rule.effectiveFrom.getTime() > context.asOf.getTime()) {
    return false;
  }
  if (rule.effectiveTo && rule.effectiveTo.getTime() < context.asOf.getTime()) {
    return false;
  }
  if (rule.overtimeType && rule.overtimeType !== context.overtimeType) {
    return false;
  }
  if (rule.dayCategory && rule.dayCategory !== context.dayCategory) {
    return false;
  }
  if (rule.shiftCategory && rule.shiftCategory !== context.shiftCategory) {
    return false;
  }
  if (
    rule.employeeCategory &&
    rule.employeeCategory !== context.employeeCategory
  ) {
    return false;
  }
  if (rule.countryCode && rule.countryCode !== context.countryCode) {
    return false;
  }
  return true;
}

/** HRM-OTM-007 — resolve best matching configured rate rule. */
export function resolveOtmRateMultiplier(input: {
  rules: readonly HrOvertimeRateRuleRow[];
  context: HrOvertimeRateMatchContext;
}): {
  multiplier: number;
  earningCode: string;
  rateRuleId: string | null;
} {
  const matching = input.rules
    .filter((rule) => otmMatchesRateRule(rule, input.context))
    .sort(
      (a, b) => otmRateRuleSpecificityScore(b) - otmRateRuleSpecificityScore(a),
    );

  const best = matching[0];
  if (!best) {
    return {
      multiplier: resolveOtmPayMultiplier(input.context.overtimeType),
      earningCode: resolveOtmEarningCode(input.context.overtimeType),
      rateRuleId: null,
    };
  }

  const multiplier = Number(best.multiplier);
  return {
    multiplier: Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1,
    earningCode: best.earningCode,
    rateRuleId: best.id,
  };
}

export function deriveOtmDayCategoryFromType(
  overtimeType: string,
): HrOvertimeDayCategory {
  switch (overtimeType) {
    case "rest_day":
      return "rest_day";
    case "off_day":
      return "off_day";
    case "public_holiday":
    case "holiday":
      return "public_holiday";
    default:
      return "weekday";
  }
}

/** HRM-OTM-007–014 — full policy-aware payable calculation. */
export function calculateOtmPayableForApproval(input: {
  policy: HrOvertimePolicyConfig;
  rateRules: readonly HrOvertimeRateRuleRow[];
  rateContext: HrOvertimeRateMatchContext;
  periodUsage: HrOvertimePeriodUsage;
  hours?: number | string | null;
  startTime?: string | null;
  endTime?: string | null;
  attendanceOvertimeMinutes?: number | null;
  scheduledShift?: HrOvertimeScheduledShift | null;
  hourlyRateCents?: number | null;
}): HrOvertimeCalculationResult {
  const requestedMinutes = resolveOtmRequestedMinutes({
    hours: input.hours,
    startTime: input.startTime,
    endTime: input.endTime,
  });

  const { sourceMinutes, attendanceMinutes } = resolveOtmMinutesFromAttendance({
    compareAttendanceEnabled: input.policy.compareAttendanceEnabled,
    requestedMinutes,
    attendanceOvertimeMinutes: input.attendanceOvertimeMinutes,
  });

  const exceptions: HrOvertimeExceptionDraft[] = [];

  const shiftVariance = detectOtmShiftVariance({
    requestStartTime: input.startTime,
    requestEndTime: input.endTime,
    scheduledShift: input.scheduledShift,
    toleranceMinutes: input.policy.shiftVarianceToleranceMinutes,
  });
  if (shiftVariance) {
    exceptions.push(shiftVariance);
  }

  const attendanceMismatch = detectOtmAttendanceMismatch({
    compareAttendanceEnabled: input.policy.compareAttendanceEnabled,
    requestedMinutes,
    attendanceMinutes,
    toleranceMinutes: input.policy.attendanceVarianceToleranceMinutes,
  });
  if (attendanceMismatch) {
    exceptions.push(attendanceMismatch);
  }

  const roundedMinutes = applyOtmRounding(sourceMinutes, input.policy);

  const minDuration = enforceOtmMinDuration({
    minutes: roundedMinutes,
    minOvertimeMinutes: input.policy.minOvertimeMinutes,
  });
  if (minDuration) {
    exceptions.push(minDuration);
  }

  const { cappedMinutes, exceptions: capExceptions } = applyOtmCaps({
    minutes: roundedMinutes,
    policy: input.policy,
    periodUsage: input.periodUsage,
  });
  exceptions.push(...capExceptions);

  const payableMinutes =
    minDuration && input.policy.minOvertimeMinutes > 0 ? 0 : cappedMinutes;

  const rate = resolveOtmRateMultiplier({
    rules: input.rateRules,
    context: input.rateContext,
  });

  const amountCents =
    input.hourlyRateCents != null && Number.isFinite(input.hourlyRateCents)
      ? computeOtmAmountCents({
          payableMinutes,
          hourlyRateCents: input.hourlyRateCents,
          multiplier: rate.multiplier,
        })
      : null;

  return {
    requestedMinutes,
    attendanceMinutes,
    sourceMinutes,
    roundedMinutes,
    cappedMinutes,
    payableMinutes,
    rateMultiplier: rate.multiplier,
    earningCode: rate.earningCode,
    rateRuleId: rate.rateRuleId,
    amountCents,
    exceptions,
    calculationDetail: {
      compareAttendanceEnabled: input.policy.compareAttendanceEnabled,
      roundingMode: input.policy.roundingMode,
      roundingIntervalMinutes: input.policy.roundingIntervalMinutes,
      minOvertimeMinutes: input.policy.minOvertimeMinutes,
      periodUsage: input.periodUsage,
    },
  };
}

function parseTimeToMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }
  return hours * 60 + minutes;
}

function durationMinutes(start: number, end: number): number {
  if (end <= start) {
    return end + 24 * 60 - start;
  }
  return end - start;
}
