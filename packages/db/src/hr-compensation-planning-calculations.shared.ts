import type { HrCompensationEligibilityRuleConfig } from "./schema/hr-compensation-planning";

export class HrCompensationCalculationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HrCompensationCalculationError";
  }
}

function assertFiniteNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new HrCompensationCalculationError(`invalid ${label}`);
  }
}

function assertOptionalFiniteNonNegative(
  value: number | null | undefined,
  label: string,
): void {
  if (value != null && (!Number.isFinite(value) || value < 0)) {
    throw new HrCompensationCalculationError(`invalid ${label}`);
  }
}

function assertSalaryBand(band: SalaryBandReference): void {
  assertFiniteNonNegative(band.minimum, "band minimum");
  assertFiniteNonNegative(band.midpoint, "band midpoint");
  assertFiniteNonNegative(band.maximum, "band maximum");
  if (band.minimum > band.maximum) {
    throw new HrCompensationCalculationError(
      "invalid salary band: minimum exceeds maximum",
    );
  }
}

export type SalaryBandReference = {
  minimum: number;
  midpoint: number;
  maximum: number;
};

export type CompensationIncreaseInput = {
  currentSalary: number;
  increaseAmount?: number | null;
  increasePercent?: number | null;
  /** When true, returns current salary unchanged if no increase is specified. */
  allowUnchanged?: boolean;
};

export type TotalCompImpactInput = {
  proposedSalary: number;
  allowanceAmount?: number | null;
  bonusReferenceAmount?: number | null;
  benefitsReferenceAmount?: number | null;
  employerCostReferenceAmount?: number | null;
};

export type TotalCompImpactResult = {
  baseSalary: number;
  allowances: number;
  bonusReference: number;
  benefitsReference: number;
  employerCostReference: number;
  totalCompensation: number;
};

export type BandValidationResult = {
  status: "within" | "below_min" | "above_max" | "no_band";
  bandFlag: "within_band" | "below_minimum" | "above_maximum" | null;
  rangePosition: number | null;
  compaRatio: number | null;
};

export type BudgetUtilizationResult = {
  allocated: number;
  used: number;
  remaining: number;
  utilizationPercent: number;
  overBudget: boolean;
};

export type CompensationScenarioInput = {
  currentSalary: number;
  increaseAmount?: number | null;
  increasePercent?: number | null;
  allowUnchanged?: boolean;
  allowanceAmount?: number | null;
  bonusReferenceAmount?: number | null;
  benefitsReferenceAmount?: number | null;
  employerCostReferenceAmount?: number | null;
  band?: SalaryBandReference | null;
  budgetAllocated?: number | null;
  existingBudgetImpacts?: readonly number[];
  adjustmentType?: string | null;
};

export type CompensationScenarioResult = {
  proposedSalary: number;
  budgetImpact: number;
  totalCompImpact: TotalCompImpactResult;
  bandValidation: BandValidationResult;
  budgetUtilization: BudgetUtilizationResult | null;
  overBudget: boolean;
  exceptionFlags: readonly string[];
  justificationRequired: boolean;
};

export type EligibilityEvaluationInput = {
  employmentType: string | null;
  employmentStatus: string;
  tenureDays: number | null;
  grade: string | null;
  level: string | null;
  departmentId: string | null;
  legalEntityCode: string | null;
  performanceRating: number | null;
};

export type EligibilityEvaluationResult = {
  eligible: boolean;
  reason: string | null;
};

export function buildCompensationExceptionFlags(input: {
  overBudget: boolean;
  bandFlag: BandValidationResult["bandFlag"];
}): readonly string[] {
  const flags: string[] = [];
  if (input.overBudget) flags.push("over_budget");
  if (input.bandFlag === "below_minimum") flags.push("below_band_minimum");
  if (input.bandFlag === "above_maximum") flags.push("above_band_maximum");
  return flags;
}

/** CPM-013 — proposed salary from amount or percentage. */
export function computeProposedSalary(input: CompensationIncreaseInput): number {
  const { currentSalary, increaseAmount, increasePercent, allowUnchanged } =
    input;

  assertFiniteNonNegative(currentSalary, "current salary");

  const hasAmount = increaseAmount != null;
  const hasPercent = increasePercent != null;

  if (hasAmount && hasPercent) {
    if (!Number.isFinite(increaseAmount!) || !Number.isFinite(increasePercent!)) {
      throw new HrCompensationCalculationError("invalid increase input");
    }
  }

  if (hasAmount) {
    if (!Number.isFinite(increaseAmount!)) {
      throw new HrCompensationCalculationError("invalid increase amount");
    }
    return Math.max(0, currentSalary + increaseAmount!);
  }

  if (hasPercent) {
    if (!Number.isFinite(increasePercent!)) {
      throw new HrCompensationCalculationError("invalid increase percent");
    }
    const raw = currentSalary * (1 + increasePercent! / 100);
    return Math.max(0, Math.round(raw * 100) / 100);
  }

  if (allowUnchanged) {
    return currentSalary;
  }

  throw new HrCompensationCalculationError(
    "increase amount or increase percent required",
  );
}

/** CPM-014 — total compensation impact breakdown. */
export function computeTotalCompImpact(
  input: TotalCompImpactInput,
): TotalCompImpactResult {
  assertFiniteNonNegative(input.proposedSalary, "proposed salary");
  assertOptionalFiniteNonNegative(input.allowanceAmount, "allowance amount");
  assertOptionalFiniteNonNegative(
    input.bonusReferenceAmount,
    "bonus reference amount",
  );
  assertOptionalFiniteNonNegative(
    input.benefitsReferenceAmount,
    "benefits reference amount",
  );
  assertOptionalFiniteNonNegative(
    input.employerCostReferenceAmount,
    "employer cost reference amount",
  );

  const baseSalary = input.proposedSalary;
  const allowances = input.allowanceAmount ?? 0;
  const bonusReference = input.bonusReferenceAmount ?? 0;
  const benefitsReference = input.benefitsReferenceAmount ?? 0;
  const employerCostReference = input.employerCostReferenceAmount ?? 0;

  return {
    baseSalary,
    allowances,
    bonusReference,
    benefitsReference,
    employerCostReference,
    totalCompensation:
      baseSalary +
      allowances +
      bonusReference +
      benefitsReference +
      employerCostReference,
  };
}

/** CPM-016/017 — band comparison and flags. */
export function validateBandPosition(
  proposedSalary: number,
  band: SalaryBandReference | null | undefined,
): BandValidationResult {
  assertFiniteNonNegative(proposedSalary, "proposed salary");

  if (!band) {
    return {
      status: "no_band",
      bandFlag: null,
      rangePosition: null,
      compaRatio: null,
    };
  }

  assertSalaryBand(band);

  const { minimum, midpoint, maximum } = band;
  const span = maximum - minimum;
  const rangePosition =
    span > 0 ? ((proposedSalary - minimum) / span) * 100 : null;
  const compaRatio = midpoint > 0 ? (proposedSalary / midpoint) * 100 : null;

  if (proposedSalary < minimum) {
    return {
      status: "below_min",
      bandFlag: "below_minimum",
      rangePosition,
      compaRatio,
    };
  }

  if (proposedSalary > maximum) {
    return {
      status: "above_max",
      bandFlag: "above_maximum",
      rangePosition,
      compaRatio,
    };
  }

  return {
    status: "within",
    bandFlag: "within_band",
    rangePosition,
    compaRatio,
  };
}

/** CPM-018/019 — budget utilization and over-budget flag. */
export function computeBudgetUtilization(
  allocated: number,
  recommendationImpacts: readonly number[],
): BudgetUtilizationResult {
  assertFiniteNonNegative(allocated, "allocated budget");

  let used = 0;
  for (const value of recommendationImpacts) {
    if (!Number.isFinite(value)) {
      throw new HrCompensationCalculationError("invalid budget impact");
    }
    used += Math.max(0, value);
  }

  const remaining = allocated - used;
  const utilizationPercent =
    allocated > 0 ? (used / allocated) * 100 : used > 0 ? 100 : 0;

  return {
    allocated,
    used,
    remaining,
    utilizationPercent,
    overBudget: used > allocated,
  };
}

/** CPM-015 — what-if scenario modeling (salary, band, budget, total comp). */
export function computeCompensationScenario(
  input: CompensationScenarioInput,
): CompensationScenarioResult {
  const proposedSalary = computeProposedSalary({
    currentSalary: input.currentSalary,
    increaseAmount: input.increaseAmount,
    increasePercent: input.increasePercent,
    allowUnchanged: input.allowUnchanged,
  });

  const budgetImpact = computeBudgetImpact(input.currentSalary, proposedSalary);
  const totalCompImpact = computeTotalCompImpact({
    proposedSalary,
    allowanceAmount: input.allowanceAmount,
    bonusReferenceAmount: input.bonusReferenceAmount,
    benefitsReferenceAmount: input.benefitsReferenceAmount,
    employerCostReferenceAmount: input.employerCostReferenceAmount,
  });
  const bandValidation = validateBandPosition(proposedSalary, input.band ?? null);

  const existingImpacts = input.existingBudgetImpacts ?? [];
  let budgetUtilization: BudgetUtilizationResult | null = null;
  let overBudget = false;

  if (input.budgetAllocated != null) {
    budgetUtilization = computeBudgetUtilization(input.budgetAllocated, [
      ...existingImpacts,
      budgetImpact,
    ]);
    overBudget = budgetUtilization.overBudget;
  }

  const exceptionFlags = buildCompensationExceptionFlags({
    overBudget,
    bandFlag: bandValidation.bandFlag,
  });

  const justificationRequired = requiresJustification({
    overBudget,
    bandFlag: bandValidation.bandFlag,
    adjustmentType: input.adjustmentType,
    exceptionFlags,
  });

  return {
    proposedSalary,
    budgetImpact,
    totalCompImpact,
    bandValidation,
    budgetUtilization,
    overBudget,
    exceptionFlags,
    justificationRequired,
  };
}

/** CPM-020 — exception justification requirement. */
export function requiresJustification(flags: {
  overBudget?: boolean;
  bandFlag?: string | null;
  adjustmentType?: string | null;
  exceptionFlags?: readonly string[] | null;
}): boolean {
  if (flags.overBudget) return true;
  if (flags.bandFlag === "below_minimum" || flags.bandFlag === "above_maximum") {
    return true;
  }
  if (flags.adjustmentType === "special") return true;
  return (flags.exceptionFlags?.length ?? 0) > 0;
}

/** CPM-005 — eligibility rule evaluation. */
export function evaluateCompensationEligibility(
  input: EligibilityEvaluationInput,
  rules: HrCompensationEligibilityRuleConfig,
): EligibilityEvaluationResult {
  if (
    rules.employmentStatuses?.length &&
    !rules.employmentStatuses.includes(input.employmentStatus)
  ) {
    return {
      eligible: false,
      reason: `employment status ${input.employmentStatus} not eligible`,
    };
  }

  if (rules.employmentTypes?.length) {
    if (!input.employmentType) {
      return {
        eligible: false,
        reason: "employment type not specified",
      };
    }
    if (!rules.employmentTypes.includes(input.employmentType)) {
      return {
        eligible: false,
        reason: `employment type ${input.employmentType} not eligible`,
      };
    }
  }

  if (
    rules.minTenureDays != null &&
    (input.tenureDays == null || input.tenureDays < rules.minTenureDays)
  ) {
    return {
      eligible: false,
      reason: `tenure below minimum ${rules.minTenureDays} days`,
    };
  }

  if (rules.grades?.length) {
    if (!input.grade) {
      return { eligible: false, reason: "grade not specified" };
    }
    if (!rules.grades.includes(input.grade)) {
      return { eligible: false, reason: `grade ${input.grade} not eligible` };
    }
  }

  if (rules.levels?.length) {
    if (!input.level) {
      return { eligible: false, reason: "job level not specified" };
    }
    if (!rules.levels.includes(input.level)) {
      return { eligible: false, reason: `level ${input.level} not eligible` };
    }
  }

  if (rules.departmentIds?.length) {
    if (!input.departmentId) {
      return { eligible: false, reason: "department not specified" };
    }
    if (!rules.departmentIds.includes(input.departmentId)) {
      return {
        eligible: false,
        reason: `department ${input.departmentId} not eligible`,
      };
    }
  }

  if (rules.legalEntityCodes?.length) {
    if (!input.legalEntityCode) {
      return { eligible: false, reason: "legal entity not specified" };
    }
    if (!rules.legalEntityCodes.includes(input.legalEntityCode)) {
      return {
        eligible: false,
        reason: `legal entity ${input.legalEntityCode} not eligible`,
      };
    }
  }

  if (
    rules.minPerformanceRating != null &&
    (input.performanceRating == null ||
      input.performanceRating < rules.minPerformanceRating)
  ) {
    return {
      eligible: false,
      reason: `performance rating below ${rules.minPerformanceRating}`,
    };
  }

  return { eligible: true, reason: null };
}

/** CPM-005 — evaluate all active cycle rules (AND semantics). */
export function evaluateAllCompensationEligibilityRules(
  input: EligibilityEvaluationInput,
  rules: readonly HrCompensationEligibilityRuleConfig[],
): EligibilityEvaluationResult {
  for (const rule of rules) {
    const result = evaluateCompensationEligibility(input, rule);
    if (!result.eligible) {
      return result;
    }
  }

  return { eligible: true, reason: null };
}

export function computeBudgetImpact(
  currentSalary: number,
  proposedSalary: number,
): number {
  assertFiniteNonNegative(currentSalary, "current salary");
  assertFiniteNonNegative(proposedSalary, "proposed salary");
  return Math.max(0, proposedSalary - currentSalary);
}
