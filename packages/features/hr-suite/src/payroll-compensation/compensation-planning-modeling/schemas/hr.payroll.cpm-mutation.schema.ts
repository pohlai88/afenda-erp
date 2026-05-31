import { z } from "zod";

import {
  HR_CPM_ADJUSTMENT_TYPES,
  HR_CPM_BUDGET_POOL_SCOPES,
  HR_CPM_CYCLE_TYPES,
} from "./hr.payroll.cpm-constants.shared";

type HrCpmBudgetPoolRequiredScopeField =
  | "legalEntityCode"
  | "departmentId"
  | "businessUnitCode"
  | "grade"
  | "locationCode"
  | "managerEmployeeId";

const requiredBudgetPoolScopeFieldByScope: Partial<
  Record<
    (typeof HR_CPM_BUDGET_POOL_SCOPES)[number],
    HrCpmBudgetPoolRequiredScopeField
  >
> = {
  legal_entity: "legalEntityCode",
  department: "departmentId",
  business_unit: "businessUnitCode",
  grade: "grade",
  location: "locationCode",
  manager_group: "managerEmployeeId",
};

export const hrCpmCreateCycleSchema = z.object({
  code: z.string().min(1).max(64),
  name: z.string().min(1).max(256),
  cycleType: z.enum(HR_CPM_CYCLE_TYPES),
  effectiveDate: z.coerce.date(),
  currencyCode: z.string().length(3).default("USD"),
  approvalRules: z
    .object({
      steps: z.array(
        z.object({
          role: z.string().min(1),
          order: z.number().int().nonnegative(),
          minAmount: z.number().nullable().optional(),
          maxAmount: z.number().nullable().optional(),
          legalEntityCode: z.string().nullable().optional(),
          departmentId: z.string().nullable().optional(),
          grade: z.string().nullable().optional(),
        }),
      ),
    })
    .default({ steps: [] }),
});

export const hrCpmBudgetPoolSchema = z
  .object({
    cycleId: z.string().min(1),
    code: z.string().min(1).max(64),
    name: z.string().min(1).max(256),
    scope: z.enum(HR_CPM_BUDGET_POOL_SCOPES),
    allocatedAmount: z.number().nonnegative(),
    scopeRef: z.string().nullable().optional(),
    legalEntityCode: z.string().nullable().optional(),
    departmentId: z.string().nullable().optional(),
    businessUnitCode: z.string().nullable().optional(),
    grade: z.string().nullable().optional(),
    locationCode: z.string().nullable().optional(),
    managerEmployeeId: z.string().nullable().optional(),
    currencyCode: z.string().length(3).default("USD"),
  })
  .superRefine((data, ctx) => {
    const requiredField = requiredBudgetPoolScopeFieldByScope[data.scope];

    if (!requiredField) {
      return;
    }

    const requiredValue = data[requiredField];

    if (!requiredValue?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: `${data.scope} scope requires ${requiredField}.`,
        path: [requiredField],
      });
    }
  });

export const hrCpmEligibilityRuleSchema = z.object({
  cycleId: z.string().min(1),
  label: z.string().min(1).max(256),
  ruleConfig: z.object({
    employmentTypes: z.array(z.string()).optional(),
    employmentStatuses: z.array(z.string()).optional(),
    minTenureDays: z.number().int().nonnegative().nullable().optional(),
    grades: z.array(z.string()).optional(),
    levels: z.array(z.string()).optional(),
    departmentIds: z.array(z.string()).optional(),
    legalEntityCodes: z.array(z.string()).optional(),
    minPerformanceRating: z.number().nullable().optional(),
  }),
});

export const hrCpmAssignParticipantSchema = z.object({
  cycleId: z.string().min(1),
  employeeId: z.string().min(1),
  budgetPoolId: z.string().nullable().optional(),
  currentSalary: z.number().nonnegative().nullable().optional(),
  performanceRating: z.number().nullable().optional(),
});

const hrCpmRecommendationBaseSchema = z.object({
  cycleId: z.string().min(1),
  participantId: z.string().min(1),
  employeeId: z.string().min(1),
  currentSalary: z.number().nonnegative(),
  increaseAmount: z.number().nullable().optional(),
  increasePercent: z.number().nullable().optional(),
  budgetPoolId: z.string().nullable().optional(),
  allowanceAmount: z.number().nonnegative().nullable().optional(),
  bonusReferenceAmount: z.number().nonnegative().nullable().optional(),
  benefitsReferenceAmount: z.number().nonnegative().nullable().optional(),
  employerCostReferenceAmount: z.number().nonnegative().nullable().optional(),
  managerComments: z.string().max(4000).nullable().optional(),
  justification: z.string().max(4000).nullable().optional(),
  grade: z.string().nullable().optional(),
  legalEntityCode: z.string().nullable().optional(),
});

function assertCpmIncreaseInput(
  data: {
    increaseAmount?: number | null;
    increasePercent?: number | null;
  },
  ctx: z.RefinementCtx,
) {
  const hasAmount =
    data.increaseAmount != null && Number.isFinite(data.increaseAmount);
  const hasPercent =
    data.increasePercent != null && Number.isFinite(data.increasePercent);

  if (hasAmount === hasPercent) {
    ctx.addIssue({
      code: "custom",
      message: "Provide either increase amount or increase percent, not both.",
      path: ["increaseAmount"],
    });
  }
}

/** CPM-008 — merit increase recommendation. */
export const hrCpmMeritRecommendationSchema = hrCpmRecommendationBaseSchema
  .extend({
    adjustmentType: z.literal("merit"),
  })
  .superRefine(assertCpmIncreaseInput);

/** CPM-009 — promotion salary increase recommendation. */
export const hrCpmPromotionRecommendationSchema = hrCpmRecommendationBaseSchema
  .extend({
    adjustmentType: z.literal("promotion"),
    proposedGrade: z.string().min(1).nullable().optional(),
    proposedLevel: z.string().min(1).nullable().optional(),
  })
  .superRefine(assertCpmIncreaseInput);

/** CPM-010 — market adjustment recommendation. */
export const hrCpmMarketRecommendationSchema = hrCpmRecommendationBaseSchema
  .extend({
    adjustmentType: z.literal("market"),
    marketReferencePercentile: z.number().min(0).max(100).nullable().optional(),
  })
  .superRefine(assertCpmIncreaseInput);

/** CPM-011 — equity adjustment recommendation. */
export const hrCpmEquityRecommendationSchema = hrCpmRecommendationBaseSchema
  .extend({
    adjustmentType: z.literal("equity"),
    equityGapReference: z.string().max(256).nullable().optional(),
  })
  .superRefine(assertCpmIncreaseInput);

/** CPM-012 — retention adjustment recommendation. */
export const hrCpmRetentionRecommendationSchema = hrCpmRecommendationBaseSchema
  .extend({
    adjustmentType: z.literal("retention"),
    retentionRiskLevel: z
      .enum(["moderate", "high", "critical"])
      .nullable()
      .optional(),
  })
  .superRefine(assertCpmIncreaseInput);

export const hrCpmSpecialRecommendationSchema =
  hrCpmRecommendationBaseSchema.extend({
    adjustmentType: z.literal("special"),
  });

export const hrCpmRecommendationByTypeSchema = z.discriminatedUnion(
  "adjustmentType",
  [
    hrCpmMeritRecommendationSchema,
    hrCpmPromotionRecommendationSchema,
    hrCpmMarketRecommendationSchema,
    hrCpmEquityRecommendationSchema,
    hrCpmRetentionRecommendationSchema,
    hrCpmSpecialRecommendationSchema,
  ],
);

export const hrCpmRecommendationSchema = hrCpmRecommendationBaseSchema.extend({
  adjustmentType: z.enum(HR_CPM_ADJUSTMENT_TYPES),
});

export const hrCpmRecommendationSchemasByType = {
  merit: hrCpmMeritRecommendationSchema,
  promotion: hrCpmPromotionRecommendationSchema,
  market: hrCpmMarketRecommendationSchema,
  equity: hrCpmEquityRecommendationSchema,
  retention: hrCpmRetentionRecommendationSchema,
  special: hrCpmSpecialRecommendationSchema,
} as const;

export function parseHrCpmRecommendationInput(input: unknown) {
  const parsed = hrCpmRecommendationSchema.parse(input);
  return hrCpmRecommendationSchemasByType[parsed.adjustmentType].parse(input);
}

export const hrCpmReviewDecisionSchema = z.object({
  recommendationId: z.string().min(1),
  decision: z.enum(["approve", "reject", "return", "adjust"]),
  notes: z.string().nullable().optional(),
  proposedSalary: z.number().nonnegative().nullable().optional(),
});

export const hrCpmFinalizeApprovalSchema = z.object({
  recommendationId: z.string().min(1),
  effectiveDate: z.coerce.date(),
});

export type HrCpmCreateCycleInput = z.infer<typeof hrCpmCreateCycleSchema>;
export type HrCpmBudgetPoolInput = z.infer<typeof hrCpmBudgetPoolSchema>;
export type HrCpmRecommendationInput = z.infer<
  typeof hrCpmRecommendationSchema
>;
export type HrCpmMeritRecommendationInput = z.infer<
  typeof hrCpmMeritRecommendationSchema
>;
export type HrCpmPromotionRecommendationInput = z.infer<
  typeof hrCpmPromotionRecommendationSchema
>;
export type HrCpmMarketRecommendationInput = z.infer<
  typeof hrCpmMarketRecommendationSchema
>;
export type HrCpmEquityRecommendationInput = z.infer<
  typeof hrCpmEquityRecommendationSchema
>;
export type HrCpmRetentionRecommendationInput = z.infer<
  typeof hrCpmRetentionRecommendationSchema
>;

export const hrCpmSubmitRecommendationFormSchema = z.object({
  recommendationId: z.string().min(1),
});

export const hrCpmReviewRecommendationFormSchema = z.object({
  recommendationId: z.string().min(1),
  decision: z.enum(["approve", "reject", "return", "adjust"]),
  notes: z.string().nullable().optional(),
  proposedSalary: z.coerce.number().nonnegative().nullable().optional(),
});

export const hrCpmFinalizeApprovalFormSchema = z.object({
  recommendationId: z.string().min(1),
  effectiveDate: z.coerce.date(),
});

export const hrCpmRouteApprovalSchema = z.object({
  cycleId: z.string().min(1),
  recommendationId: z.string().min(1),
});

export const hrCpmScenarioSchema = z.object({
  cycleId: z.string().min(1),
  participantId: z.string().min(1),
  label: z.string().min(1).max(256),
  snapshot: z.record(z.string(), z.unknown()),
  recommendationId: z.string().nullable().optional(),
});

const readOptionalNumber = (value: unknown) => {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const hrCpmCreateRecommendationFormSchema = z
  .object({
    cycleId: z.string().min(1),
    participantId: z.string().min(1),
    employeeId: z.string().min(1),
    adjustmentType: z.enum([
      "merit",
      "promotion",
      "market",
      "equity",
      "retention",
    ]),
    currentSalary: z.coerce.number().nonnegative(),
    increaseMode: z.enum(["amount", "percent"]),
    increaseAmount: z.preprocess(readOptionalNumber, z.number().nullable()),
    increasePercent: z.preprocess(readOptionalNumber, z.number().nullable()),
    budgetPoolId: z.string().nullable().optional(),
    managerComments: z.string().max(4000).nullable().optional(),
    justification: z.string().max(4000).nullable().optional(),
    grade: z.string().nullable().optional(),
    legalEntityCode: z.string().nullable().optional(),
    proposedGrade: z.string().nullable().optional(),
    proposedLevel: z.string().nullable().optional(),
    marketReferencePercentile: z.preprocess(
      readOptionalNumber,
      z.number().min(0).max(100).nullable(),
    ),
    equityGapReference: z.string().max(256).nullable().optional(),
    retentionRiskLevel: z
      .enum(["moderate", "high", "critical"])
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.increaseMode === "amount") {
      if (data.increaseAmount == null) {
        ctx.addIssue({
          code: "custom",
          message: "Increase amount is required.",
          path: ["increaseAmount"],
        });
      }
      return;
    }

    if (data.increasePercent == null) {
      ctx.addIssue({
        code: "custom",
        message: "Increase percent is required.",
        path: ["increasePercent"],
      });
    }
  });

export function mapHrCpmCreateRecommendationFormToMutation(
  form: z.infer<typeof hrCpmCreateRecommendationFormSchema>,
) {
  return {
    cycleId: form.cycleId,
    participantId: form.participantId,
    employeeId: form.employeeId,
    adjustmentType: form.adjustmentType,
    currentSalary: form.currentSalary,
    increaseAmount: form.increaseMode === "amount" ? form.increaseAmount : null,
    increasePercent:
      form.increaseMode === "percent" ? form.increasePercent : null,
    budgetPoolId: form.budgetPoolId ?? null,
    managerComments: form.managerComments ?? null,
    justification: form.justification ?? null,
    grade: form.grade ?? null,
    legalEntityCode: form.legalEntityCode ?? null,
    ...(form.adjustmentType === "promotion"
      ? {
          proposedGrade: form.proposedGrade ?? null,
          proposedLevel: form.proposedLevel ?? null,
        }
      : {}),
    ...(form.adjustmentType === "market"
      ? { marketReferencePercentile: form.marketReferencePercentile ?? null }
      : {}),
    ...(form.adjustmentType === "equity"
      ? { equityGapReference: form.equityGapReference ?? null }
      : {}),
    ...(form.adjustmentType === "retention"
      ? { retentionRiskLevel: form.retentionRiskLevel ?? null }
      : {}),
  };
}
