import { z } from "zod";

/** Leave types treated as unplanned for HRM-AAT-006. */
export const AAT_UNPLANNED_LEAVE_TYPES = [
  "emergency",
  "sick",
  "unpaid",
] as const;

export const aatUnplannedLeaveTypeSchema = z.enum(AAT_UNPLANNED_LEAVE_TYPES);

export const aatCalendarPatternKindSchema = z.enum([
  "monday",
  "friday",
  "pre_holiday",
  "post_holiday",
]);

export const aatTrendDirectionSchema = z.enum([
  "improving",
  "worsening",
  "stable",
]);

export const aatGroupScopeSchema = z.enum(["department", "team"]);

export const aatPeriodQuerySchema = z
  .object({
    organizationId: z.string().min(1),
    periodStart: z.coerce.date(),
    periodEnd: z.coerce.date(),
    departmentId: z.string().min(1).optional(),
    managerEmployeeId: z.string().min(1).optional(),
    employeeId: z.string().min(1).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.periodEnd < value.periodStart) {
      ctx.addIssue({
        code: "custom",
        message: "periodEnd must be on or after periodStart",
        path: ["periodEnd"],
      });
    }
  });

export const aatAbsenceThresholdsSchema = z.object({
  /** HRM-AAT-009 — max lost workdays before flagging excessive absence. */
  maxLostWorkdays: z.number().nonnegative().default(10),
  /** HRM-AAT-009 — max distinct absence events in period. */
  maxAbsenceFrequency: z.number().int().nonnegative().default(8),
  /** HRM-AAT-009 — max absence rate percentage (0–100). */
  maxAbsenceRatePercent: z.number().min(0).max(100).default(15),
  /** HRM-AAT-010 — department/team absence rate threshold (0–100). */
  highGroupAbsenceRatePercent: z.number().min(0).max(100).default(12),
});

export const aatPatternDetectionConfigSchema = aatAbsenceThresholdsSchema.extend({
  /** HRM-AAT-007 — max duration (days) for a short absence. */
  maxShortAbsenceDays: z.number().positive().default(1),
  /** HRM-AAT-007 — min short absences to flag a repeated pattern. */
  minShortAbsenceOccurrences: z.number().int().positive().default(3),
  /** HRM-AAT-008 — min absences on same calendar pattern to flag. */
  minCalendarPatternOccurrences: z.number().int().positive().default(3),
  /** HRM-AAT-006 — days before startAt that counts as last-minute submission. */
  lastMinuteNoticeDays: z.number().int().nonnegative().default(2),
  /** HRM-AAT-011 — percent change to classify trend as improving/worsening. */
  trendChangeThresholdPercent: z.number().min(0).max(100).default(10),
});

export const aatAbsenceEventSchema = z.object({
  employeeId: z.string().min(1),
  absenceDate: z.coerce.date(),
  durationDays: z.number().nonnegative(),
  source: z.enum(["leave", "attendance"]),
  leaveType: z.string().optional(),
  leaveRequestId: z.string().optional(),
  submittedAt: z.coerce.date().optional(),
  leaveStatus: z.string().optional(),
});

export const aatEmployeeAbsenceMetricsSchema = z.object({
  employeeId: z.string().min(1),
  employeeDisplayName: z.string().optional(),
  departmentId: z.string().nullable().optional(),
  lostWorkdays: z.number().nonnegative(),
  absenceFrequency: z.number().int().nonnegative(),
  scheduledWorkdays: z.number().int().nonnegative(),
  absenceRatePercent: z.number().min(0).max(100),
});

export const aatGroupAbsenceMetricsSchema = z.object({
  groupKey: z.string().min(1),
  groupLabel: z.string().min(1),
  groupScope: aatGroupScopeSchema,
  headcount: z.number().int().nonnegative(),
  lostWorkdays: z.number().nonnegative(),
  scheduledWorkdays: z.number().int().nonnegative(),
  absenceRatePercent: z.number().min(0).max(100),
});

export const aatUnplannedLeaveTrendBucketSchema = z.object({
  periodKey: z.string().min(1),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  unplannedLeaveCount: z.number().int().nonnegative(),
  unplannedLostWorkdays: z.number().nonnegative(),
  lastMinuteCount: z.number().int().nonnegative(),
});

export const aatUnplannedLeaveTrendResultSchema = z.object({
  buckets: z.array(aatUnplannedLeaveTrendBucketSchema),
  flaggedEmployeeIds: z.array(z.string()),
  totalUnplannedEvents: z.number().int().nonnegative(),
  trendDirection: aatTrendDirectionSchema,
});

export const aatShortAbsencePatternSchema = z.object({
  employeeId: z.string().min(1),
  occurrenceCount: z.number().int().positive(),
  totalLostWorkdays: z.number().nonnegative(),
  absenceDates: z.array(z.coerce.date()),
});

export const aatCalendarAbsencePatternSchema = z.object({
  employeeId: z.string().min(1),
  patternKind: aatCalendarPatternKindSchema,
  occurrenceCount: z.number().int().positive(),
  absenceDates: z.array(z.coerce.date()),
});

export const aatExcessiveAbsenceFlagSchema = z.object({
  employeeId: z.string().min(1),
  employeeDisplayName: z.string().optional(),
  lostWorkdays: z.number().nonnegative(),
  absenceFrequency: z.number().int().nonnegative(),
  absenceRatePercent: z.number().min(0).max(100),
  breachedThresholds: z.array(
    z.enum(["lost_workdays", "absence_frequency", "absence_rate"]),
  ),
});

export const aatHighAbsenceGroupFlagSchema = z.object({
  groupKey: z.string().min(1),
  groupLabel: z.string().min(1),
  groupScope: aatGroupScopeSchema,
  headcount: z.number().int().nonnegative(),
  absenceRatePercent: z.number().min(0).max(100),
  lostWorkdays: z.number().nonnegative(),
});

export const aatAttendanceExceptionKindSchema = z.enum([
  "late_arrival",
  "early_departure",
  "absence",
  "missing_punch",
]);

export const aatAttendanceExceptionTrendBucketSchema = z.object({
  periodKey: z.string().min(1),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  lateArrivalCount: z.number().int().nonnegative(),
  earlyDepartureCount: z.number().int().nonnegative(),
  absenceCount: z.number().int().nonnegative(),
  missingPunchCount: z.number().int().nonnegative(),
  totalExceptions: z.number().int().nonnegative(),
});

export const aatAttendanceExceptionTrendResultSchema = z.object({
  buckets: z.array(aatAttendanceExceptionTrendBucketSchema),
  totals: z.object({
    lateArrivalCount: z.number().int().nonnegative(),
    earlyDepartureCount: z.number().int().nonnegative(),
    absenceCount: z.number().int().nonnegative(),
    missingPunchCount: z.number().int().nonnegative(),
    totalExceptions: z.number().int().nonnegative(),
  }),
  trendDirection: aatTrendDirectionSchema,
});

export type AatPeriodQuery = z.infer<typeof aatPeriodQuerySchema>;
export type AatAbsenceThresholds = z.infer<typeof aatAbsenceThresholdsSchema>;
export type AatPatternDetectionConfig = z.infer<
  typeof aatPatternDetectionConfigSchema
>;
export type AatAbsenceEvent = z.infer<typeof aatAbsenceEventSchema>;
export type AatEmployeeAbsenceMetrics = z.infer<
  typeof aatEmployeeAbsenceMetricsSchema
>;
export type AatGroupAbsenceMetrics = z.infer<
  typeof aatGroupAbsenceMetricsSchema
>;
export type AatUnplannedLeaveTrendResult = z.infer<
  typeof aatUnplannedLeaveTrendResultSchema
>;
export type AatShortAbsencePattern = z.infer<
  typeof aatShortAbsencePatternSchema
>;
export type AatCalendarAbsencePattern = z.infer<
  typeof aatCalendarAbsencePatternSchema
>;
export type AatExcessiveAbsenceFlag = z.infer<
  typeof aatExcessiveAbsenceFlagSchema
>;
export type AatHighAbsenceGroupFlag = z.infer<
  typeof aatHighAbsenceGroupFlagSchema
>;
export type AatAttendanceExceptionTrendResult = z.infer<
  typeof aatAttendanceExceptionTrendResultSchema
>;
export type AatTrendDirection = z.infer<typeof aatTrendDirectionSchema>;

export const DEFAULT_AAT_PATTERN_CONFIG: AatPatternDetectionConfig =
  aatPatternDetectionConfigSchema.parse({});
