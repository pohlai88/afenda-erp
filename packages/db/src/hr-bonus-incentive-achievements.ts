import { and, eq } from "drizzle-orm";
import type { AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import {
  computeBonusAchievementPercent,
  type BonusPayoutCalculationInput,
  calculateBonusPayout,
  type BonusPayoutCalculationResult,
} from "./hr-bonus-incentive-payout.shared";
import {
  formatNumeric,
  HrBonusCommandError,
  parseNumeric,
} from "./hr-bonus-incentive.shared";
import {
  hrBonusAcceleratorRules,
  hrBonusCommissionTiers,
  hrBonusPayoutFormulas,
  hrBonusTargetAchievements,
  hrBonusTargets,
} from "./schema/hr-bonus-incentive";

export type RecordHrBonusTargetAchievementInput = {
  organizationId: string;
  targetId: string;
  actualValue: string;
  recordedByUserId: string;
  recordedAt?: Date;
  notes?: string | null;
};

export type RecordHrBonusTargetAchievementResult = {
  achievementId: string;
  targetId: string;
  actualValue: string;
  achievementPercent: string | null;
};

/** BON-007 + BON-008 — capture achievement and compute percentage. */
export async function recordHrBonusTargetAchievementInTx(
  db: AfendaTransaction,
  input: RecordHrBonusTargetAchievementInput,
): Promise<RecordHrBonusTargetAchievementResult> {
  const actualNumeric = parseNumeric(input.actualValue);
  if (actualNumeric === null || actualNumeric < 0) {
    throw new HrBonusCommandError(
      "invalid_actual_value",
      "Actual achievement must be a non-negative number.",
    );
  }

  const [target] = await db
    .select({
      id: hrBonusTargets.id,
      targetValue: hrBonusTargets.targetValue,
    })
    .from(hrBonusTargets)
    .where(
      and(
        eq(hrBonusTargets.organizationId, input.organizationId),
        eq(hrBonusTargets.id, input.targetId),
      ),
    )
    .limit(1);

  if (!target) {
    throw new HrBonusCommandError("target_not_found");
  }

  const targetNumeric = parseNumeric(target.targetValue);
  if (targetNumeric === null) {
    throw new HrBonusCommandError("invalid_target_value");
  }

  const achievementPercent = computeBonusAchievementPercent(
    targetNumeric,
    actualNumeric,
  );

  const achievementId = createEntityId("hr_bon_ach");
  const recordedAt = input.recordedAt ?? new Date();

  await db
    .insert(hrBonusTargetAchievements)
    .values({
      id: achievementId,
      organizationId: input.organizationId,
      targetId: input.targetId,
      actualValue: formatNumeric(actualNumeric),
      achievementPercent:
        achievementPercent === null
          ? null
          : formatNumeric(achievementPercent),
      recordedByUserId: input.recordedByUserId,
      recordedAt,
      notes: input.notes ?? null,
    })
    .onConflictDoUpdate({
      target: [
        hrBonusTargetAchievements.organizationId,
        hrBonusTargetAchievements.targetId,
      ],
      set: {
        actualValue: formatNumeric(actualNumeric),
        achievementPercent:
          achievementPercent === null
            ? null
            : formatNumeric(achievementPercent),
        recordedByUserId: input.recordedByUserId,
        recordedAt,
        notes: input.notes ?? null,
        updatedAt: new Date(),
      },
    });

  return {
    achievementId,
    targetId: input.targetId,
    actualValue: formatNumeric(actualNumeric),
    achievementPercent:
      achievementPercent === null
        ? null
        : formatNumeric(achievementPercent),
  };
}

export async function getHrBonusTargetAchievementInTx(
  db: AfendaTransaction,
  input: { organizationId: string; targetId: string },
) {
  const [row] = await db
    .select()
    .from(hrBonusTargetAchievements)
    .where(
      and(
        eq(hrBonusTargetAchievements.organizationId, input.organizationId),
        eq(hrBonusTargetAchievements.targetId, input.targetId),
      ),
    )
    .limit(1);

  return row ?? null;
}

export async function loadHrBonusPayoutConfigInTx(
  db: AfendaTransaction,
  input: { organizationId: string; planId: string },
) {
  const [formula] = await db
    .select()
    .from(hrBonusPayoutFormulas)
    .where(
      and(
        eq(hrBonusPayoutFormulas.organizationId, input.organizationId),
        eq(hrBonusPayoutFormulas.planId, input.planId),
      ),
    )
    .limit(1);

  if (!formula) {
    throw new HrBonusCommandError("formula_not_found");
  }

  const tiers = await db
    .select()
    .from(hrBonusCommissionTiers)
    .where(
      and(
        eq(hrBonusCommissionTiers.organizationId, input.organizationId),
        eq(hrBonusCommissionTiers.planId, input.planId),
      ),
    )
    .orderBy(hrBonusCommissionTiers.tierOrder);

  const [accelerator] = await db
    .select()
    .from(hrBonusAcceleratorRules)
    .where(
      and(
        eq(hrBonusAcceleratorRules.organizationId, input.organizationId),
        eq(hrBonusAcceleratorRules.planId, input.planId),
      ),
    )
    .limit(1);

  return { formula, tiers, accelerator: accelerator ?? null };
}

export type CalculateHrBonusPayoutForPlanInput = {
  organizationId: string;
  planId: string;
  baseSalary?: number | null;
  salesAmount?: number | null;
  revenueAmount?: number | null;
  marginAmount?: number | null;
  kpiScore?: number | null;
  performanceRating?: number | null;
  achievementPercent?: number | null;
};

/** BON-009..012 — load plan payout config and calculate payout. */
export async function calculateHrBonusPayoutForPlanInTx(
  db: AfendaTransaction,
  input: CalculateHrBonusPayoutForPlanInput,
): Promise<BonusPayoutCalculationResult & { formulaId: string }> {
  const { formula, tiers, accelerator } = await loadHrBonusPayoutConfigInTx(
    db,
    { organizationId: input.organizationId, planId: input.planId },
  );

  const calcInput: BonusPayoutCalculationInput = {
    formulaKind: formula.formulaKind,
    fixedAmount: parseNumeric(formula.fixedAmount),
    percentageRate: parseNumeric(formula.percentageRate),
    performanceRatingWeight: parseNumeric(formula.performanceRatingWeight),
    baseSalary: input.baseSalary ?? null,
    salesAmount: input.salesAmount ?? null,
    revenueAmount: input.revenueAmount ?? null,
    marginAmount: input.marginAmount ?? null,
    kpiScore: input.kpiScore ?? null,
    performanceRating: input.performanceRating ?? null,
    achievementPercent: input.achievementPercent ?? null,
    tiers: tiers.map((tier) => ({
      minThreshold: parseNumeric(tier.minThreshold) ?? 0,
      maxThreshold: parseNumeric(tier.maxThreshold),
      ratePercent: parseNumeric(tier.ratePercent) ?? 0,
    })),
    accelerator: accelerator
      ? {
          thresholdPercent:
            parseNumeric(accelerator.thresholdPercent) ?? 100,
          acceleratorRate: parseNumeric(accelerator.acceleratorRate) ?? 0,
        }
      : null,
    bounds: {
      payoutFloor: parseNumeric(formula.payoutFloor),
      payoutCap: parseNumeric(formula.payoutCap),
    },
  };

  const result = calculateBonusPayout(calcInput);

  return { ...result, formulaId: formula.id };
}

export {
  computeBonusAchievementPercent,
  calculateBonusPayout,
  applyBonusCommissionTiers,
  applyBonusAccelerator,
  enforceBonusPayoutBounds,
  computeBonusBasePayout,
} from "./hr-bonus-incentive-payout.shared";

export type {
  BonusPayoutCalculationInput,
  BonusPayoutCalculationResult,
  BonusCommissionTier,
  BonusAcceleratorRule,
  BonusPayoutBounds,
  BonusPayoutFormulaKind,
} from "./hr-bonus-incentive-payout.shared";
