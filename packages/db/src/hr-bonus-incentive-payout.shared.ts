import type {
  hrBonusPayoutFormulaKindEnum,
} from "./hr-bonus-incentive";

export type BonusPayoutFormulaKind =
  (typeof hrBonusPayoutFormulaKindEnum.enumValues)[number];

export type BonusCommissionTier = {
  minThreshold: number;
  maxThreshold: number | null;
  ratePercent: number;
};

export type BonusAcceleratorRule = {
  thresholdPercent: number;
  acceleratorRate: number;
};

export type BonusPayoutBounds = {
  payoutFloor: number | null;
  payoutCap: number | null;
};

export type BonusPayoutCalculationInput = {
  formulaKind: BonusPayoutFormulaKind;
  fixedAmount?: number | null;
  percentageRate?: number | null;
  performanceRatingWeight?: number | null;
  baseSalary?: number | null;
  salesAmount?: number | null;
  revenueAmount?: number | null;
  marginAmount?: number | null;
  kpiScore?: number | null;
  performanceRating?: number | null;
  achievementPercent?: number | null;
  tiers?: readonly BonusCommissionTier[];
  accelerator?: BonusAcceleratorRule | null;
  bounds?: BonusPayoutBounds | null;
};

export type BonusPayoutCalculationResult = {
  basePayout: number;
  tieredPayout: number;
  acceleratedPayout: number;
  finalPayout: number;
  achievementPercent: number | null;
  appliedTierIndex: number | null;
  acceleratorApplied: boolean;
  capped: boolean;
  floored: boolean;
};

/** BON-008 — achievement percentage against target. */
export function computeBonusAchievementPercent(
  targetValue: number,
  actualValue: number,
): number | null {
  if (!Number.isFinite(targetValue) || !Number.isFinite(actualValue)) {
    return null;
  }
  if (targetValue === 0) {
    return actualValue === 0 ? 100 : null;
  }
  return (actualValue / targetValue) * 100;
}

/** BON-009 — base payout from formula kind. */
export function computeBonusBasePayout(input: BonusPayoutCalculationInput): number {
  const rate = input.percentageRate ?? 0;

  switch (input.formulaKind) {
    case "fixed_amount":
      return Math.max(0, input.fixedAmount ?? 0);
    case "salary_percentage":
      return Math.max(0, (input.baseSalary ?? 0) * (rate / 100));
    case "sales_percentage":
      return Math.max(0, (input.salesAmount ?? 0) * (rate / 100));
    case "revenue_percentage":
      return Math.max(0, (input.revenueAmount ?? 0) * (rate / 100));
    case "margin_percentage":
      return Math.max(0, (input.marginAmount ?? 0) * (rate / 100));
    case "kpi_score":
      return Math.max(0, input.kpiScore ?? 0);
    case "performance_rating": {
      const weight = input.performanceRatingWeight ?? 1;
      return Math.max(0, (input.performanceRating ?? 0) * weight);
    }
    default:
      return 0;
  }
}

/** BON-010 — apply tiered commission rate to basis amount. */
export function applyBonusCommissionTiers(
  basisAmount: number,
  tiers: readonly BonusCommissionTier[],
): { payout: number; tierIndex: number | null } {
  if (!Number.isFinite(basisAmount) || basisAmount <= 0 || tiers.length === 0) {
    return { payout: 0, tierIndex: null };
  }

  const sorted = [...tiers].sort((a, b) => a.minThreshold - b.minThreshold);

  for (let index = 0; index < sorted.length; index += 1) {
    const tier = sorted[index]!;
    const withinMin = basisAmount >= tier.minThreshold;
    const withinMax =
      tier.maxThreshold === null || basisAmount < tier.maxThreshold;

    if (withinMin && withinMax) {
      return {
        payout: basisAmount * (tier.ratePercent / 100),
        tierIndex: index,
      };
    }
  }

  return { payout: 0, tierIndex: null };
}

/** BON-011 — accelerator for overachievement above threshold. */
export function applyBonusAccelerator(
  payout: number,
  achievementPercent: number | null,
  rule: BonusAcceleratorRule | null | undefined,
): { payout: number; applied: boolean } {
  if (!rule || achievementPercent === null || !Number.isFinite(payout)) {
    return { payout, applied: false };
  }

  if (achievementPercent <= rule.thresholdPercent) {
    return { payout, applied: false };
  }

  const overageRatio =
    (achievementPercent - rule.thresholdPercent) / rule.thresholdPercent;
  const multiplier = 1 + overageRatio * rule.acceleratorRate;

  return {
    payout: payout * multiplier,
    applied: true,
  };
}

/** BON-012 — enforce payout floor and cap. */
export function enforceBonusPayoutBounds(
  amount: number,
  bounds: BonusPayoutBounds | null | undefined,
): { payout: number; capped: boolean; floored: boolean } {
  let payout = amount;
  let capped = false;
  let floored = false;

  if (bounds?.payoutFloor !== null && bounds?.payoutFloor !== undefined) {
    if (payout < bounds.payoutFloor) {
      payout = bounds.payoutFloor;
      floored = true;
    }
  }

  if (bounds?.payoutCap !== null && bounds?.payoutCap !== undefined) {
    if (payout > bounds.payoutCap) {
      payout = bounds.payoutCap;
      capped = true;
    }
  }

  return { payout, capped, floored };
}

/** BON-009..012 — full payout pipeline. */
export function calculateBonusPayout(
  input: BonusPayoutCalculationInput,
): BonusPayoutCalculationResult {
  const basePayout = computeBonusBasePayout(input);

  const tierBasis =
    input.formulaKind === "sales_percentage" ||
    input.formulaKind === "revenue_percentage" ||
    input.formulaKind === "margin_percentage"
      ? (input.salesAmount ??
        input.revenueAmount ??
        input.marginAmount ??
        basePayout)
      : basePayout;

  const tierResult =
    input.tiers && input.tiers.length > 0
      ? applyBonusCommissionTiers(tierBasis, input.tiers)
      : { payout: basePayout, tierIndex: null as number | null };

  const acceleratorResult = applyBonusAccelerator(
    tierResult.payout,
    input.achievementPercent ?? null,
    input.accelerator ?? null,
  );

  const bounded = enforceBonusPayoutBounds(
    acceleratorResult.payout,
    input.bounds ?? null,
  );

  return {
    basePayout,
    tieredPayout: tierResult.payout,
    acceleratedPayout: acceleratorResult.payout,
    finalPayout: bounded.payout,
    achievementPercent: input.achievementPercent ?? null,
    appliedTierIndex: tierResult.tierIndex,
    acceleratorApplied: acceleratorResult.applied,
    capped: bounded.capped,
    floored: bounded.floored,
  };
}
