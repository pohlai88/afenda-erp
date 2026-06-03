import { z } from "zod";

import { HR_SBS_VERSION_STATUSES } from "./hr.payroll.sbs-constants.shared";
import { hrSbsBenchmarkValuesSchema } from "./hr.payroll.sbs-benchmark-values.schema";

/** SBS-002 — benchmark dimension keys for survey rows. */
export const hrSbsBenchmarkDimensionsSchema = z.object({
  industry: z.string().min(1).max(128),
  country: z.string().min(1).max(64),
  location: z.string().min(1).max(128),
  jobFamily: z.string().min(1).max(128),
  jobLevel: z.string().min(1).max(64),
  currencyCode: z.string().length(3).default("USD"),
});

/** SBS-001/002 — single survey benchmark row. */
export const hrSbsBenchmarkEntrySchema = hrSbsBenchmarkDimensionsSchema.merge(
  hrSbsBenchmarkValuesSchema,
);

/** SBS-001 — survey upload payload (version header + benchmark rows). */
export const hrSbsSurveyUploadSchema = z.object({
  code: z.string().min(1).max(64),
  label: z.string().min(1).max(256),
  provider: z.string().min(1).max(128),
  surveyYear: z.number().int().gte(1990).lte(2100),
  effectiveDate: z.coerce.date(),
  sourceReference: z.string().max(512).nullable().optional(),
  entries: z.array(hrSbsBenchmarkEntrySchema).min(1).max(5000),
});

export type HrSbsSurveyUploadInput = z.infer<typeof hrSbsSurveyUploadSchema>;

/** SBS-022 — create benchmark version without rows. */
export const hrSbsCreateVersionSchema = z.object({
  code: z.string().min(1).max(64),
  label: z.string().min(1).max(256),
  provider: z.string().min(1).max(128),
  surveyYear: z.number().int().gte(1990).lte(2100),
  effectiveDate: z.coerce.date(),
  sourceReference: z.string().max(512).nullable().optional(),
});

/** SBS-022 — update version metadata or lifecycle status. */
export const hrSbsUpdateVersionSchema = z.object({
  versionId: z.string().min(1),
  label: z.string().min(1).max(256).optional(),
  sourceReference: z.string().max(512).nullable().optional(),
  versionStatus: z.enum(HR_SBS_VERSION_STATUSES).optional(),
});

export const hrSbsListVersionsQuerySchema = z.object({
  search: z.string().max(256).optional(),
  provider: z.string().max(128).optional(),
  surveyYear: z.coerce.number().int().optional(),
  versionStatus: z.enum(HR_SBS_VERSION_STATUSES).optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
});
