import { z } from "zod";

import type { HrFwaSchedulePatternDetails } from "@afenda/db";

/** HRM-FWA-021 — policy breach kinds (mirrors hr_fwa_compliance_breach_kind). */
export const hrFwaComplianceBreachKindSchema = z.enum([
  "excessive_remote_days",
  "missed_office_days",
  "unapproved_remote_location",
  "incomplete_attendance",
  "working_hours_non_compliance",
]);

export type HrFwaComplianceBreachKind = z.infer<
  typeof hrFwaComplianceBreachKindSchema
>;

export const hrFwaCompliancePeriodQuerySchema = z.object({
  organizationId: z.string().trim().min(1),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  employeeId: z.string().trim().min(1).optional(),
  arrangementId: z.string().trim().min(1).optional(),
});

export type HrFwaCompliancePeriodQuery = z.infer<
  typeof hrFwaCompliancePeriodQuerySchema
>;

export const hrFwaDayExpectationSchema = z.enum([
  "office",
  "remote",
  "work",
  "rest",
  "off",
]);

export type HrFwaDayExpectation = z.infer<typeof hrFwaDayExpectationSchema>;

export const hrFwaSchedulePatternSnapshotSchema = z.object({
  workDays: z.array(z.number().int().min(0).max(6)).default([]),
  officeDays: z.array(z.number().int().min(0).max(6)).default([]),
  remoteDays: z.array(z.number().int().min(0).max(6)).default([]),
  restDays: z.array(z.number().int().min(0).max(6)).default([]),
  coreHoursStartMinutes: z.number().int().nonnegative().optional(),
  coreHoursEndMinutes: z.number().int().nonnegative().optional(),
  flexibleStartEarliestMinutes: z.number().int().nonnegative().optional(),
  flexibleStartLatestMinutes: z.number().int().nonnegative().optional(),
  flexibleEndEarliestMinutes: z.number().int().nonnegative().optional(),
  flexibleEndLatestMinutes: z.number().int().nonnegative().optional(),
  expectedWeeklyHours: z.number().nonnegative().optional(),
  extendedDailyHours: z.number().nonnegative().optional(),
  compressedWorkingDaysPerWeek: z.number().int().positive().optional(),
});

export type HrFwaSchedulePatternSnapshot = z.infer<
  typeof hrFwaSchedulePatternSnapshotSchema
>;

export const hrFwaComplianceBreachRowSchema = z.object({
  breachId: z.string().min(1),
  arrangementId: z.string().min(1),
  employeeId: z.string().min(1),
  breachKind: hrFwaComplianceBreachKindSchema,
  description: z.string(),
  expectedValue: z.string().nullable(),
  actualValue: z.string().nullable(),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  detectedAt: z.coerce.date(),
});

export type HrFwaComplianceBreachRow = z.infer<
  typeof hrFwaComplianceBreachRowSchema
>;

/** HRM-FWA-018 … FWA-021 — compliance monitoring result. */
export const hrFwaComplianceMonitoringResultSchema = z.object({
  requirementCodes: z.array(
    z.enum([
      "HRM-FWA-018",
      "HRM-FWA-019",
      "HRM-FWA-020",
      "HRM-FWA-021",
    ]),
  ),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  observedOfficeDays: z.number().int().nonnegative(),
  observedRemoteDays: z.number().int().nonnegative(),
  expectedOfficeDays: z.number().int().nonnegative().nullable(),
  expectedRemoteDays: z.number().int().nonnegative().nullable(),
  expectedWeeklyHours: z.number().nonnegative().nullable(),
  actualAttendedDays: z.number().int().nonnegative(),
  workingHoursCompliant: z.boolean(),
  breachKinds: z.array(hrFwaComplianceBreachKindSchema),
  breaches: z.array(hrFwaComplianceBreachRowSchema),
});

export type HrFwaComplianceMonitoringResult = z.infer<
  typeof hrFwaComplianceMonitoringResultSchema
>;

export const hrFwaAttendanceCompareRowSchema = z.object({
  workDate: z.coerce.date(),
  dayOfWeek: z.number().int().min(0).max(6),
  expected: hrFwaDayExpectationSchema,
  attendanceStatus: z.string().nullable(),
  attendanceDayId: z.string().nullable(),
  aligned: z.boolean(),
  mismatchReason: z.string().nullable(),
});

export type HrFwaAttendanceCompareRow = z.infer<
  typeof hrFwaAttendanceCompareRowSchema
>;

/** HRM-FWA-022 — schedule vs attendance comparison. */
export const hrFwaAttendanceCompareResultSchema = z.object({
  requirementCode: z.literal("HRM-FWA-022"),
  arrangementId: z.string().min(1),
  employeeId: z.string().min(1),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  rows: z.array(hrFwaAttendanceCompareRowSchema),
  misalignedDayCount: z.number().int().nonnegative(),
});

export type HrFwaAttendanceCompareResult = z.infer<
  typeof hrFwaAttendanceCompareResultSchema
>;

export const hrFwaRemoteCheckinCompareRowSchema = z.object({
  workDate: z.coerce.date(),
  expectedRemote: z.boolean(),
  verifiedCheckin: z.boolean(),
  checkinCount: z.number().int().nonnegative(),
  aligned: z.boolean(),
  mismatchReason: z.string().nullable(),
});

export type HrFwaRemoteCheckinCompareRow = z.infer<
  typeof hrFwaRemoteCheckinCompareRowSchema
>;

/** HRM-FWA-023 — schedule vs remote check-in comparison. */
export const hrFwaRemoteCheckinCompareResultSchema = z.object({
  requirementCode: z.literal("HRM-FWA-023"),
  arrangementId: z.string().min(1),
  employeeId: z.string().min(1),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  remoteCheckinIntegrationEnabled: z.boolean(),
  rows: z.array(hrFwaRemoteCheckinCompareRowSchema),
  misalignedDayCount: z.number().int().nonnegative(),
});

export type HrFwaRemoteCheckinCompareResult = z.infer<
  typeof hrFwaRemoteCheckinCompareResultSchema
>;

export const hrFwaLeaveValidationViolationSchema = z.object({
  code: z.enum([
    "leave_on_office_day_conflict",
    "leave_spans_required_office_day",
    "leave_outside_work_pattern",
    "no_active_arrangement",
  ]),
  message: z.string(),
  workDate: z.coerce.date().optional(),
});

export type HrFwaLeaveValidationViolation = z.infer<
  typeof hrFwaLeaveValidationViolationSchema
>;

/** HRM-FWA-024 — leave vs flexible pattern validation. */
export const hrFwaLeaveValidationResultSchema = z.object({
  requirementCode: z.literal("HRM-FWA-024"),
  valid: z.boolean(),
  employeeId: z.string().min(1),
  arrangementId: z.string().nullable(),
  leaveStart: z.coerce.date(),
  leaveEnd: z.coerce.date(),
  violations: z.array(hrFwaLeaveValidationViolationSchema),
});

export type HrFwaLeaveValidationResult = z.infer<
  typeof hrFwaLeaveValidationResultSchema
>;

/** HRM-FWA-025 — LAM schedule reference row. */
export const hrFwaLamScheduleRefRowSchema = z.object({
  referenceId: z.string().min(1),
  boundary: z.literal("flexible_work_arrangement"),
  arrangementId: z.string().min(1),
  employeeId: z.string().min(1),
  employeeNumber: z.string(),
  employeeDisplayName: z.string(),
  arrangementKind: z.string(),
  policyGroupCode: z.string(),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().nullable(),
  schedulePattern: hrFwaSchedulePatternSnapshotSchema,
});

export type HrFwaLamScheduleRefRow = z.infer<
  typeof hrFwaLamScheduleRefRowSchema
>;

export const hrFwaLamScheduleRefsResultSchema = z.object({
  requirementCode: z.literal("HRM-FWA-025"),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  references: z.array(hrFwaLamScheduleRefRowSchema),
});

export type HrFwaLamScheduleRefsResult = z.infer<
  typeof hrFwaLamScheduleRefsResultSchema
>;

/** HRM-FWA-026 — OTM work-hour reference row. */
export const hrFwaOvertimeWorkHourRefRowSchema = z.object({
  referenceId: z.string().min(1),
  boundary: z.literal("flexible_work_arrangement"),
  arrangementId: z.string().min(1),
  employeeId: z.string().min(1),
  employeeNumber: z.string(),
  employeeDisplayName: z.string(),
  expectedWeeklyHours: z.number().nonnegative().nullable(),
  coreHoursStartMinutes: z.number().int().nonnegative().nullable(),
  coreHoursEndMinutes: z.number().int().nonnegative().nullable(),
  extendedDailyHours: z.number().nonnegative().nullable(),
  compressedWorkingDaysPerWeek: z.number().int().positive().nullable(),
  workDays: z.array(z.number().int().min(0).max(6)),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().nullable(),
});

export type HrFwaOvertimeWorkHourRefRow = z.infer<
  typeof hrFwaOvertimeWorkHourRefRowSchema
>;

export const hrFwaOvertimeWorkHourRefsResultSchema = z.object({
  requirementCode: z.literal("HRM-FWA-026"),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  references: z.array(hrFwaOvertimeWorkHourRefRowSchema),
});

export type HrFwaOvertimeWorkHourRefsResult = z.infer<
  typeof hrFwaOvertimeWorkHourRefsResultSchema
>;

/** HRM-FWA-027 — payroll schedule reference row. */
export const hrFwaPayrollScheduleRefRowSchema = z.object({
  referenceId: z.string().min(1),
  boundary: z.literal("flexible_work_arrangement"),
  arrangementId: z.string().min(1),
  employeeId: z.string().min(1),
  employeeNumber: z.string(),
  employeeDisplayName: z.string(),
  arrangementKind: z.string(),
  expectedWeeklyHours: z.number().nonnegative().nullable(),
  unpaidScheduleReference: z.string().nullable(),
  allowanceEligibilityReference: z.string().nullable(),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().nullable(),
  readyForPayroll: z.boolean(),
});

export type HrFwaPayrollScheduleRefRow = z.infer<
  typeof hrFwaPayrollScheduleRefRowSchema
>;

export const hrFwaPayrollScheduleRefsResultSchema = z.object({
  requirementCode: z.literal("HRM-FWA-027"),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  references: z.array(hrFwaPayrollScheduleRefRowSchema),
});

export type HrFwaPayrollScheduleRefsResult = z.infer<
  typeof hrFwaPayrollScheduleRefsResultSchema
>;

export function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function endOfUtcDay(date: Date): Date {
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

export function eachUtcDayInRange(
  periodStart: Date,
  periodEnd: Date,
): readonly Date[] {
  const days: Date[] = [];
  const cursor = startOfUtcDay(periodStart);
  const end = startOfUtcDay(periodEnd);
  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

export function normalizeHrFwaSchedulePattern(
  pattern:
    | HrFwaSchedulePatternDetails
    | Partial<HrFwaSchedulePatternSnapshot>
    | null
    | undefined,
): HrFwaSchedulePatternSnapshot {
  return hrFwaSchedulePatternSnapshotSchema.parse({
    workDays: pattern?.workDays ? [...pattern.workDays] : [],
    officeDays: pattern?.officeDays ? [...pattern.officeDays] : [],
    remoteDays: pattern?.remoteDays ? [...pattern.remoteDays] : [],
    restDays: pattern?.restDays ? [...pattern.restDays] : [],
    coreHoursStartMinutes: pattern?.coreHoursStartMinutes,
    coreHoursEndMinutes: pattern?.coreHoursEndMinutes,
    flexibleStartEarliestMinutes: pattern?.flexibleStartEarliestMinutes,
    flexibleStartLatestMinutes: pattern?.flexibleStartLatestMinutes,
    flexibleEndEarliestMinutes: pattern?.flexibleEndEarliestMinutes,
    flexibleEndLatestMinutes: pattern?.flexibleEndLatestMinutes,
    expectedWeeklyHours: pattern?.expectedWeeklyHours,
    extendedDailyHours: pattern?.extendedDailyHours,
    compressedWorkingDaysPerWeek: pattern?.compressedWorkingDaysPerWeek,
  });
}

export function resolveHrFwaDayExpectation(
  pattern: HrFwaSchedulePatternSnapshot,
  dayOfWeek: number,
): HrFwaDayExpectation {
  if (pattern.officeDays.includes(dayOfWeek)) return "office";
  if (pattern.remoteDays.includes(dayOfWeek)) return "remote";
  if (pattern.restDays.includes(dayOfWeek)) return "rest";
  if (pattern.workDays.includes(dayOfWeek)) return "work";
  return "off";
}

const ATTENDED_STATUSES = new Set([
  "present",
  "late",
  "early_out",
  "half_day",
]);

export function isHrFwaAttendedStatus(status: string | null | undefined): boolean {
  return status !== null && status !== undefined && ATTENDED_STATUSES.has(status);
}

export function isHrFwaIncompleteAttendanceStatus(
  status: string | null | undefined,
): boolean {
  return status === "missing_punch" || status === "absent";
}

export function estimateHrFwaDailyHours(
  pattern: HrFwaSchedulePatternSnapshot,
): number {
  if (pattern.extendedDailyHours && pattern.extendedDailyHours > 0) {
    return pattern.extendedDailyHours;
  }
  if (
    pattern.expectedWeeklyHours &&
    pattern.workDays.length > 0
  ) {
    return pattern.expectedWeeklyHours / pattern.workDays.length;
  }
  return 8;
}
