import { z } from "zod";

import { hrLamLeaveTypeSchema } from "../leave-attendance-management/hr.time.lam-form.schema";

/** HRM-AAT-001 — analytics grouping dimension. */
export const hrAatAnalyticsDimensionSchema = z.enum([
  "employee",
  "team",
  "department",
  "manager",
  "location",
  "legal_entity",
]);

export type HrAatAnalyticsDimension = z.infer<typeof hrAatAnalyticsDimensionSchema>;

/** Period bucket for trend views (daily … yearly). */
export const hrAatAnalyticsPeriodKindSchema = z.enum([
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
]);

export type HrAatAnalyticsPeriodKind = z.infer<
  typeof hrAatAnalyticsPeriodKindSchema
>;

export const hrAatAnalyticsPeriodSchema = z
  .object({
    periodStart: z.coerce.date(),
    periodEnd: z.coerce.date(),
    periodKind: hrAatAnalyticsPeriodKindSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.periodStart.getTime() > value.periodEnd.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "periodStart must be on or before periodEnd",
        path: ["periodStart"],
      });
    }
  });

export type HrAatAnalyticsPeriod = z.infer<typeof hrAatAnalyticsPeriodSchema>;

/** HRM-AAT-001 — scope filters; organizationId is resolved server-side only. */
export const hrAatAnalyticsScopeSchema = z.object({
  dimension: hrAatAnalyticsDimensionSchema,
  employeeId: z.string().trim().min(1).optional(),
  teamId: z.string().trim().min(1).optional(),
  departmentId: z.string().trim().min(1).optional(),
  managerEmployeeId: z.string().trim().min(1).optional(),
  workLocationCode: z.string().trim().min(1).optional(),
  legalEntityCode: z.string().trim().min(1).optional(),
});

export type HrAatAnalyticsScope = z.infer<typeof hrAatAnalyticsScopeSchema>;

/** Combined analytics query (route/search-param contract). */
export const hrAatAnalyticsQuerySchema = z
  .object({
    periodStart: z.coerce.date(),
    periodEnd: z.coerce.date(),
    periodKind: hrAatAnalyticsPeriodKindSchema.optional(),
    dimension: hrAatAnalyticsDimensionSchema,
    employeeId: z.string().trim().min(1).optional(),
    teamId: z.string().trim().min(1).optional(),
    departmentId: z.string().trim().min(1).optional(),
    managerEmployeeId: z.string().trim().min(1).optional(),
    workLocationCode: z.string().trim().min(1).optional(),
    legalEntityCode: z.string().trim().min(1).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.periodStart.getTime() > value.periodEnd.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "periodStart must be on or before periodEnd",
        path: ["periodStart"],
      });
    }
  });

export type HrAatAnalyticsQuery = z.infer<typeof hrAatAnalyticsQuerySchema>;

/** Serializable metric row for governed list surfaces. */
export const hrAatMetricRowSchema = z.object({
  groupKey: z.string(),
  groupLabel: z.string(),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
});

/** HRM-AAT-002 — absence rate (% of scheduled workdays lost). */
export const hrAatAbsenceRateMetricSchema = hrAatMetricRowSchema.extend({
  lostWorkdays: z.number().nonnegative(),
  scheduledWorkdays: z.number().nonnegative(),
  absenceRatePercent: z.number().min(0).max(100),
});

export type HrAatAbsenceRateMetric = z.infer<typeof hrAatAbsenceRateMetricSchema>;

/** HRM-AAT-003 — absence frequency (distinct absence episodes). */
export const hrAatAbsenceFrequencyMetricSchema = hrAatMetricRowSchema.extend({
  absenceEpisodeCount: z.number().int().nonnegative(),
  employeeCount: z.number().int().nonnegative(),
  averageEpisodesPerEmployee: z.number().nonnegative(),
});

export type HrAatAbsenceFrequencyMetric = z.infer<
  typeof hrAatAbsenceFrequencyMetricSchema
>;

/** HRM-AAT-004 — total lost workdays. */
export const hrAatLostWorkdaysMetricSchema = hrAatMetricRowSchema.extend({
  totalLostWorkdays: z.number().nonnegative(),
  attendanceAbsentDays: z.number().nonnegative(),
  approvedLeaveDays: z.number().nonnegative(),
});

export type HrAatLostWorkdaysMetric = z.infer<typeof hrAatLostWorkdaysMetricSchema>;

/** HRM-AAT-005 — duration by leave type within period. */
export const hrAatLeaveTypeDurationMetricSchema = z.object({
  leaveType: hrLamLeaveTypeSchema,
  leaveTypeLabel: z.string(),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  totalDurationDays: z.number().nonnegative(),
  requestCount: z.number().int().nonnegative(),
  employeeCount: z.number().int().nonnegative(),
});

export type HrAatLeaveTypeDurationMetric = z.infer<
  typeof hrAatLeaveTypeDurationMetricSchema
>;

/** HRM-AAT-001 — dimensional absence analysis row. */
export const hrAatAbsenceAnalysisRowSchema = hrAatMetricRowSchema.extend({
  employeeCount: z.number().int().nonnegative(),
  totalLostWorkdays: z.number().nonnegative(),
  absenceRatePercent: z.number().min(0).max(100),
  absenceEpisodeCount: z.number().int().nonnegative(),
});

export type HrAatAbsenceAnalysisRow = z.infer<typeof hrAatAbsenceAnalysisRowSchema>;

/** Full analytics snapshot returned by the core query. */
export const hrAatAnalyticsSnapshotSchema = z.object({
  requirementCodes: z.array(
    z.enum(["HRM-AAT-001", "HRM-AAT-002", "HRM-AAT-003", "HRM-AAT-004", "HRM-AAT-005"]),
  ),
  dimension: hrAatAnalyticsDimensionSchema,
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  analysisRows: z.array(hrAatAbsenceAnalysisRowSchema),
  absenceRates: z.array(hrAatAbsenceRateMetricSchema),
  absenceFrequencies: z.array(hrAatAbsenceFrequencyMetricSchema),
  lostWorkdays: z.array(hrAatLostWorkdaysMetricSchema),
  durationByLeaveType: z.array(hrAatLeaveTypeDurationMetricSchema),
  totals: z.object({
    totalLostWorkdays: z.number().nonnegative(),
    scheduledWorkdays: z.number().nonnegative(),
    absenceRatePercent: z.number().min(0).max(100),
    absenceEpisodeCount: z.number().int().nonnegative(),
    employeeCount: z.number().int().nonnegative(),
  }),
});

export type HrAatAnalyticsSnapshot = z.infer<typeof hrAatAnalyticsSnapshotSchema>;

export function parseHrAatAnalyticsQuery(input: unknown) {
  return hrAatAnalyticsQuerySchema.safeParse(input);
}

export function formatHrAatLeaveTypeLabel(leaveType: string): string {
  return leaveType.replace(/_/g, " ");
}
