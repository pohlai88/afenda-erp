import { z } from "zod";

import { aatPeriodQuerySchema } from "./hr.time.aat-patterns.schema";

/** HRM-AAT-019 — absence risk classification bands. */
export const hrAatAbsenceRiskLevelSchema = z.enum([
  "normal",
  "watch",
  "at_risk",
  "high_risk",
  "critical",
]);

export type HrAatAbsenceRiskLevel = z.infer<typeof hrAatAbsenceRiskLevelSchema>;

/** HRM-AAT-018 — configurable risk thresholds (rate % and episode count). */
export const hrAatAbsenceRiskThresholdsSchema = z
  .object({
    watchAbsenceRatePercent: z.number().min(0).max(100).default(5),
    atRiskAbsenceRatePercent: z.number().min(0).max(100).default(10),
    highRiskAbsenceRatePercent: z.number().min(0).max(100).default(15),
    criticalAbsenceRatePercent: z.number().min(0).max(100).default(25),
    watchAbsenceFrequency: z.number().int().nonnegative().default(3),
    atRiskAbsenceFrequency: z.number().int().nonnegative().default(5),
    highRiskAbsenceFrequency: z.number().int().nonnegative().default(7),
    criticalAbsenceFrequency: z.number().int().nonnegative().default(10),
  })
  .superRefine((value, ctx) => {
    const ratePairs: Array<[string, string, number, number]> = [
      ["watchAbsenceRatePercent", "atRiskAbsenceRatePercent", value.watchAbsenceRatePercent, value.atRiskAbsenceRatePercent],
      ["atRiskAbsenceRatePercent", "highRiskAbsenceRatePercent", value.atRiskAbsenceRatePercent, value.highRiskAbsenceRatePercent],
      ["highRiskAbsenceRatePercent", "criticalAbsenceRatePercent", value.highRiskAbsenceRatePercent, value.criticalAbsenceRatePercent],
    ];
    for (const [left, right, leftVal, rightVal] of ratePairs) {
      if (leftVal > rightVal) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${left} must be less than or equal to ${right}`,
          path: [left],
        });
      }
    }
    const freqPairs: Array<[string, string, number, number]> = [
      ["watchAbsenceFrequency", "atRiskAbsenceFrequency", value.watchAbsenceFrequency, value.atRiskAbsenceFrequency],
      ["atRiskAbsenceFrequency", "highRiskAbsenceFrequency", value.atRiskAbsenceFrequency, value.highRiskAbsenceFrequency],
      ["highRiskAbsenceFrequency", "criticalAbsenceFrequency", value.highRiskAbsenceFrequency, value.criticalAbsenceFrequency],
    ];
    for (const [left, right, leftVal, rightVal] of freqPairs) {
      if (leftVal > rightVal) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${left} must be less than or equal to ${right}`,
          path: [left],
        });
      }
    }
  });

export type HrAatAbsenceRiskThresholds = z.infer<
  typeof hrAatAbsenceRiskThresholdsSchema
>;

export const DEFAULT_HR_AAT_ABSENCE_RISK_THRESHOLDS: HrAatAbsenceRiskThresholds =
  hrAatAbsenceRiskThresholdsSchema.parse({});

export const upsertHrAatAbsenceRiskThresholdsFormSchema =
  hrAatAbsenceRiskThresholdsSchema;

/** HRM-AAT-020 — employee risk indicator row for governed list surfaces. */
export const hrAatAbsenceRiskIndicatorSchema = z.object({
  employeeId: z.string().min(1),
  employeeNumber: z.string(),
  employeeDisplayName: z.string(),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  lostWorkdays: z.number().nonnegative(),
  absenceFrequency: z.number().int().nonnegative(),
  absenceRatePercent: z.number().min(0).max(100),
  riskLevel: hrAatAbsenceRiskLevelSchema,
  riskLevelLabel: z.string(),
  breachedSignals: z.array(z.enum(["absence_rate", "absence_frequency"])),
  correctiveActionRefCount: z.number().int().nonnegative().default(0),
});

export type HrAatAbsenceRiskIndicator = z.infer<
  typeof hrAatAbsenceRiskIndicatorSchema
>;

export const hrAatAbsenceRiskIndicatorsResultSchema = z.object({
  requirementCodes: z.array(
    z.enum(["HRM-AAT-018", "HRM-AAT-019", "HRM-AAT-020"]),
  ),
  thresholds: hrAatAbsenceRiskThresholdsSchema,
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  indicators: z.array(hrAatAbsenceRiskIndicatorSchema),
});

export type HrAatAbsenceRiskIndicatorsResult = z.infer<
  typeof hrAatAbsenceRiskIndicatorsResultSchema
>;

/** HRM-AAT-021 — corrective action reference kinds. */
export const hrAatCorrectiveActionKindSchema = z.enum([
  "coaching",
  "hr_review",
  "attendance_improvement_plan",
]);

export type HrAatCorrectiveActionKind = z.infer<
  typeof hrAatCorrectiveActionKindSchema
>;

export const linkHrAatCorrectiveActionRefFormSchema = z
  .object({
    employeeId: z.string().trim().min(1),
    insightKind: z.string().trim().min(1),
    insightRef: z.string().trim().min(1).optional(),
    actionKind: hrAatCorrectiveActionKindSchema,
    externalReference: z.string().trim().min(1),
    periodStart: z.coerce.date(),
    periodEnd: z.coerce.date(),
    notes: z.string().trim().max(2000).optional(),
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

export type LinkHrAatCorrectiveActionRefInput = z.infer<
  typeof linkHrAatCorrectiveActionRefFormSchema
>;

export const hrAatCorrectiveActionRefRowSchema = z.object({
  id: z.string().min(1),
  employeeId: z.string().min(1),
  employeeDisplayName: z.string(),
  insightKind: z.string(),
  insightRef: z.string().nullable(),
  actionKind: hrAatCorrectiveActionKindSchema,
  actionKindLabel: z.string(),
  externalReference: z.string(),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
});

export type HrAatCorrectiveActionRefRow = z.infer<
  typeof hrAatCorrectiveActionRefRowSchema
>;

/** HRM-AAT-022 — payroll impact refs exposed via LAM boundary. */
export const hrAatPayrollReferenceRowSchema = z.object({
  referenceId: z.string().min(1),
  source: z.enum(["leave", "attendance"]),
  employeeId: z.string().min(1),
  employeeNumber: z.string(),
  employeeDisplayName: z.string(),
  kind: z.string(),
  amountLabel: z.string(),
  workDate: z.coerce.date().nullable(),
  readyForPayroll: z.boolean(),
  lamBoundary: z.literal("leave_attendance_management"),
});

export type HrAatPayrollReferenceRow = z.infer<
  typeof hrAatPayrollReferenceRowSchema
>;

export const hrAatPayrollReferencesResultSchema = z.object({
  requirementCodes: z.array(z.enum(["HRM-AAT-022"])),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  references: z.array(hrAatPayrollReferenceRowSchema),
});

export type HrAatPayrollReferencesResult = z.infer<
  typeof hrAatPayrollReferencesResultSchema
>;

export const hrAatRiskQuerySchema = aatPeriodQuerySchema;

export type HrAatRiskQuery = z.infer<typeof hrAatRiskQuerySchema>;

/** Governed badge tone for risk level (metadata-eui-polish). */
export const HR_AAT_RISK_LEVEL_BADGE_TONE: Record<
  HrAatAbsenceRiskLevel,
  "default" | "attention" | "critical"
> = {
  normal: "default",
  watch: "attention",
  at_risk: "attention",
  high_risk: "critical",
  critical: "critical",
};

export function formatHrAatAbsenceRiskLevelLabel(
  level: HrAatAbsenceRiskLevel,
): string {
  switch (level) {
    case "normal":
      return "Normal";
    case "watch":
      return "Watch";
    case "at_risk":
      return "At risk";
    case "high_risk":
      return "High risk";
    case "critical":
      return "Critical";
    default:
      return level;
  }
}

export function formatHrAatCorrectiveActionKindLabel(
  kind: HrAatCorrectiveActionKind,
): string {
  switch (kind) {
    case "coaching":
      return "Coaching";
    case "hr_review":
      return "HR review";
    case "attendance_improvement_plan":
      return "Attendance improvement plan";
    default:
      return kind;
  }
}
