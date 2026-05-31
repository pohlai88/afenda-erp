import { z } from "zod";

import {
  SBS_MARKET_POSITIONS,
  SBS_PAY_EQUITY_DIMENSIONS,
  SBS_PAY_GAP_DIMENSIONS,
} from "../data/hr.payroll.sbs-calculations.shared";

export const HR_SBS_READ_CAPABILITY = "hr.sbs.read" as const;
export const HR_SBS_WRITE_CAPABILITY = "hr.sbs.write" as const;

export const hrSbsThresholdConfigSchema = z.object({
  targetMarketRatioPercent: z.number().finite().positive().optional(),
  upperMarketRatioPercent: z.number().finite().positive().optional(),
  atMarketLowerPercent: z.number().finite().positive().optional(),
  atMarketUpperPercent: z.number().finite().positive().optional(),
  outlierLowerPercent: z.number().finite().positive().optional(),
  outlierUpperPercent: z.number().finite().positive().optional(),
  payGapSpreadPercent: z.number().finite().nonnegative().optional(),
  payEquityDisparityRatio: z.number().finite().gt(1).optional(),
});

export const hrSbsRunAnalysisSchema = z.object({
  benchmarkVersionId: z.string().trim().min(1),
  /** Pull employee salaries from an active compensation planning cycle. */
  compensationCycleId: z.string().trim().min(1).optional(),
  employeeIds: z.array(z.string().trim().min(1)).optional(),
  thresholds: hrSbsThresholdConfigSchema.optional(),
  label: z.string().trim().min(1).max(200).optional(),
});

export type HrSbsRunAnalysisInput = z.infer<typeof hrSbsRunAnalysisSchema>;

export const hrSbsListAnalysisSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  benchmarkVersionId: z.string().trim().min(1).optional(),
});

export type HrSbsListAnalysisInput = z.infer<typeof hrSbsListAnalysisSchema>;

export const hrSbsComparisonResultSchema = z.object({
  employeeAmount: z.number(),
  benchmarkAmount: z.number(),
  delta: z.number(),
  ratioPercent: z.number().nullable(),
  currencyCode: z.string(),
});

export const hrSbsEmployeeAnalysisResultSchema = z.object({
  employeeId: z.string(),
  currencyCode: z.string(),
  baseSalaryComparison: hrSbsComparisonResultSchema,
  totalCashComparison: hrSbsComparisonResultSchema.nullable(),
  totalCompComparison: hrSbsComparisonResultSchema.nullable(),
  compaRatio: z.number().nullable(),
  marketRatio: z.number().nullable(),
  marketPosition: z.enum(SBS_MARKET_POSITIONS),
  belowTarget: z.boolean(),
  aboveRange: z.boolean(),
});

export const hrSbsPayGapGroupSchema = z.object({
  dimension: z.enum(SBS_PAY_GAP_DIMENSIONS),
  groupKey: z.string(),
  employeeCount: z.number().int(),
  minSalary: z.number(),
  maxSalary: z.number(),
  medianSalary: z.number(),
  spreadPercent: z.number(),
  flagged: z.boolean(),
  employeeIds: z.array(z.string()),
});

export const hrSbsPayEquityGroupSchema = z.object({
  dimension: z.enum(SBS_PAY_EQUITY_DIMENSIONS),
  groupKey: z.string(),
  employeeCount: z.number().int(),
  minSalary: z.number(),
  maxSalary: z.number(),
  medianSalary: z.number(),
  disparityRatio: z.number().nullable(),
  flagged: z.boolean(),
  employeeIds: z.array(z.string()),
});

export const hrSbsAnalysisSnapshotSchema = z.object({
  benchmarkVersionId: z.string(),
  thresholds: hrSbsThresholdConfigSchema,
  employeeResults: z.array(hrSbsEmployeeAnalysisResultSchema),
  payGapGroups: z.array(hrSbsPayGapGroupSchema),
  payEquityGroups: z.array(hrSbsPayEquityGroupSchema),
  analyzedEmployeeCount: z.number().int(),
  flaggedBelowTargetCount: z.number().int(),
  flaggedAboveRangeCount: z.number().int(),
});

export type HrSbsAnalysisSnapshot = z.infer<typeof hrSbsAnalysisSnapshotSchema>;

export const hrSbsAnalysisRecordSchema = z.object({
  analysisId: z.string(),
  organizationId: z.string(),
  benchmarkVersionId: z.string(),
  label: z.string().nullable(),
  snapshot: hrSbsAnalysisSnapshotSchema,
  analyzedEmployeeCount: z.number().int(),
  flaggedBelowTargetCount: z.number().int(),
  flaggedAboveRangeCount: z.number().int(),
  createdAt: z.string(),
  createdByUserId: z.string(),
});

export type HrSbsAnalysisRecord = z.infer<typeof hrSbsAnalysisRecordSchema>;
