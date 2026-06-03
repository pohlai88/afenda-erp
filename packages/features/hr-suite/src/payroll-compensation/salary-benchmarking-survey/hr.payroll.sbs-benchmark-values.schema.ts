import { z } from "zod";

const optionalSalaryValue = z.number().nonnegative().nullable().optional();

function assertSbsBenchmarkValuesPresent(
  data: {
    salaryMinimum?: number | null;
    salaryMaximum?: number | null;
    salaryMedian?: number | null;
    salaryAverage?: number | null;
    salaryMidpoint?: number | null;
    percentile25?: number | null;
    percentile50?: number | null;
    percentile75?: number | null;
    percentile90?: number | null;
  },
  ctx: z.RefinementCtx,
) {
  const values = [
    data.salaryMinimum,
    data.salaryMaximum,
    data.salaryMedian,
    data.salaryAverage,
    data.salaryMidpoint,
    data.percentile25,
    data.percentile50,
    data.percentile75,
    data.percentile90,
  ];

  const hasValue = values.some(
    (value) => value != null && Number.isFinite(value),
  );

  if (!hasValue) {
    ctx.addIssue({
      code: "custom",
      message:
        "Provide at least one benchmark salary value or percentile (25/50/75/90).",
      path: ["salaryMidpoint"],
    });
  }
}

function assertSbsMinMaxOrder(
  data: {
    salaryMinimum?: number | null;
    salaryMaximum?: number | null;
  },
  ctx: z.RefinementCtx,
) {
  if (
    data.salaryMinimum != null &&
    data.salaryMaximum != null &&
    data.salaryMinimum > data.salaryMaximum
  ) {
    ctx.addIssue({
      code: "custom",
      message: "Salary minimum cannot exceed salary maximum.",
      path: ["salaryMinimum"],
    });
  }
}

function assertSbsPercentileOrder(
  data: {
    percentile25?: number | null;
    percentile50?: number | null;
    percentile75?: number | null;
    percentile90?: number | null;
  },
  ctx: z.RefinementCtx,
) {
  const ordered = [
    ["percentile25", data.percentile25],
    ["percentile50", data.percentile50],
    ["percentile75", data.percentile75],
    ["percentile90", data.percentile90],
  ] as const;

  let previous: number | null = null;
  for (const [path, value] of ordered) {
    if (value == null || !Number.isFinite(value)) continue;
    if (previous != null && value < previous) {
      ctx.addIssue({
        code: "custom",
        message: "Percentiles must be non-decreasing (25 ≤ 50 ≤ 75 ≤ 90).",
        path: [path],
      });
      return;
    }
    previous = value;
  }
}

/** SBS-003/004 — benchmark salary values and market percentiles. */
export const hrSbsBenchmarkValuesSchema = z
  .object({
    salaryMinimum: optionalSalaryValue,
    salaryMaximum: optionalSalaryValue,
    salaryMedian: optionalSalaryValue,
    salaryAverage: optionalSalaryValue,
    salaryMidpoint: optionalSalaryValue,
    percentile25: optionalSalaryValue,
    percentile50: optionalSalaryValue,
    percentile75: optionalSalaryValue,
    percentile90: optionalSalaryValue,
  })
  .superRefine((data, ctx) => {
    assertSbsBenchmarkValuesPresent(data, ctx);
    assertSbsMinMaxOrder(data, ctx);
    assertSbsPercentileOrder(data, ctx);
  });

/** SBS-003/004 — upsert benchmark values for an existing version row. */
export const hrSbsUpsertBenchmarkEntrySchema = z
  .object({
    versionId: z.string().min(1),
    industry: z.string().min(1).max(128),
    country: z.string().min(1).max(64),
    location: z.string().min(1).max(128),
    jobFamily: z.string().min(1).max(128),
    jobLevel: z.string().min(1).max(64),
    currencyCode: z.string().length(3).default("USD"),
  })
  .merge(hrSbsBenchmarkValuesSchema);

export const hrSbsListBenchmarkEntriesQuerySchema = z.object({
  versionId: z.string().min(1),
  search: z.string().max(256).optional(),
  jobFamily: z.string().max(128).optional(),
  jobLevel: z.string().max(64).optional(),
  country: z.string().max(64).optional(),
  currencyCode: z.string().length(3).optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
});

export type HrSbsBenchmarkValuesInput = z.infer<typeof hrSbsBenchmarkValuesSchema>;
