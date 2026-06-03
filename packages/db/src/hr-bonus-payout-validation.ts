import { and, eq } from "drizzle-orm";
import type { AfendaTransaction } from "./client";
import { determineHrBonusEligibilityInTx } from "./hr-bonus-eligibility";
import {
  computeBonusBasePayout,
  type BonusPayoutCalculationInput,
} from "./hr-bonus-incentive-payout.shared";
import {
  hasBlockingBonusValidationFlags,
  type HrBonusPayoutValidationFlag,
  type HrBonusPayoutValidationResult,
} from "./hr-bonus-payout-validation.shared";
import { parseNumeric, HrBonusCommandError } from "./hr-bonus-incentive.shared";
import {
  hrBonusPayoutFormulas,
  hrBonusPlanParticipants,
  hrBonusTargetAchievements,
  hrBonusTargets,
} from "./hr-bonus-incentive";

export {
  HR_BONUS_PAYOUT_VALIDATION_FLAGS,
  HR_BONUS_BLOCKING_VALIDATION_FLAGS,
  hasBlockingBonusValidationFlags,
  type HrBonusPayoutValidationFlag,
  type HrBonusPayoutValidationResult,
} from "./hr-bonus-payout-validation.shared";

function isFormulaInputValid(input: BonusPayoutCalculationInput): boolean {
  try {
    const payout = computeBonusBasePayout(input);
    return Number.isFinite(payout) && payout >= 0;
  } catch {
    return false;
  }
}

/** BON-020 — collect missing target, achievement, rating, and formula flags. */
export async function collectHrBonusPayoutValidationFlagsInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    planId: string;
    cycleId: string;
    employeeId: string;
    performanceRating?: number | null;
    calculationInput: BonusPayoutCalculationInput;
  },
): Promise<HrBonusPayoutValidationResult> {
  const flags: HrBonusPayoutValidationFlag[] = [];

  const [participant] = await db
    .select({
      eligible: hrBonusPlanParticipants.eligible,
      assignmentStatus: hrBonusPlanParticipants.assignmentStatus,
    })
    .from(hrBonusPlanParticipants)
    .where(
      and(
        eq(hrBonusPlanParticipants.organizationId, input.organizationId),
        eq(hrBonusPlanParticipants.planId, input.planId),
        eq(hrBonusPlanParticipants.employeeId, input.employeeId),
      ),
    )
    .limit(1);

  if (!participant || participant.assignmentStatus !== "assigned") {
    flags.push("participant_not_assigned");
  } else if (!participant.eligible) {
    flags.push("ineligible_employee");
  } else {
    const eligibility = await determineHrBonusEligibilityInTx(db, {
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      planId: input.planId,
    });
    if (!eligibility.eligible) {
      flags.push("ineligible_employee");
    }
  }

  const [target] = await db
    .select({ id: hrBonusTargets.id })
    .from(hrBonusTargets)
    .where(
      and(
        eq(hrBonusTargets.organizationId, input.organizationId),
        eq(hrBonusTargets.planId, input.planId),
        eq(hrBonusTargets.cycleId, input.cycleId),
        eq(hrBonusTargets.employeeId, input.employeeId),
      ),
    )
    .limit(1);

  if (!target) {
    flags.push("missing_target");
  } else {
    const [achievement] = await db
      .select({ id: hrBonusTargetAchievements.id })
      .from(hrBonusTargetAchievements)
      .where(
        and(
          eq(hrBonusTargetAchievements.organizationId, input.organizationId),
          eq(hrBonusTargetAchievements.targetId, target.id),
        ),
      )
      .limit(1);

    if (!achievement) {
      flags.push("missing_achievement");
    }
  }

  if (
    input.calculationInput.formulaKind === "performance_rating" &&
    (input.performanceRating == null ||
      !Number.isFinite(input.performanceRating))
  ) {
    flags.push("incomplete_performance_rating");
  }

  const [formula] = await db
    .select({
      formulaKind: hrBonusPayoutFormulas.formulaKind,
      fixedAmount: hrBonusPayoutFormulas.fixedAmount,
      percentageRate: hrBonusPayoutFormulas.percentageRate,
    })
    .from(hrBonusPayoutFormulas)
    .where(
      and(
        eq(hrBonusPayoutFormulas.organizationId, input.organizationId),
        eq(hrBonusPayoutFormulas.planId, input.planId),
      ),
    )
    .limit(1);

  if (!formula) {
    flags.push("invalid_payout_formula");
  } else if (!isFormulaInputValid(input.calculationInput)) {
    flags.push("invalid_payout_formula");
  } else if (
    formula.formulaKind !== "fixed_amount" &&
    formula.formulaKind !== "kpi_score" &&
    formula.formulaKind !== "performance_rating" &&
    parseNumeric(formula.percentageRate) == null
  ) {
    flags.push("invalid_payout_formula");
  }

  return {
    flags,
    blocking: hasBlockingBonusValidationFlags(flags),
  };
}

/** BON-020 — throw when blocking validation flags exist. */
export function assertHrBonusPayoutValidationClear(
  validation: HrBonusPayoutValidationResult,
): void {
  if (validation.blocking) {
    throw new HrBonusCommandError(
      "payout_validation_failed",
      `Payout validation failed: ${validation.flags.join(", ")}`,
    );
  }
}
