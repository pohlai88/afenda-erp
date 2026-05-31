import { and, eq } from "drizzle-orm";
import type { AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { appendHrBonusPayoutAuditEventInTx } from "./hr-bonus-audit";
import {
  assertHrBonusPayoutEditableInTx,
} from "./hr-bonus-lock";
import { validateHrBonusEligibilityBeforePayoutInTx } from "./hr-bonus-eligibility";
import {
  calculateHrBonusPayoutForPlanInTx,
  loadHrBonusPayoutConfigInTx,
  type CalculateHrBonusPayoutForPlanInput,
} from "./hr-bonus-incentive-achievements";
import {
  formatNumeric,
  HrBonusCommandError,
  parseNumeric,
} from "./hr-bonus-incentive.shared";
import {
  assertHrBonusPayoutValidationClear,
  collectHrBonusPayoutValidationFlagsInTx,
} from "./hr-bonus-payout-validation";
import type { BonusPayoutCalculationInput } from "./hr-bonus-incentive-payout.shared";
import { hrBonusCycles, hrBonusPlans } from "./schema/hr-bonus-incentive";
import { hrBonusPayouts } from "./schema/hr-bonus";
import { hrEmployees } from "./schema/hr";

export type PrepareHrBonusPayoutInput = {
  organizationId: string;
  actorUserId: string;
  planId: string;
  cycleId: string;
  employeeId: string;
  payoutId?: string;
  performanceRating?: number | null;
  calculation: Omit<CalculateHrBonusPayoutForPlanInput, "organizationId" | "planId">;
};

/** BON-019 + BON-020 + calculation — validate, flag, and persist draft payout. */
export async function prepareHrBonusPayoutInTx(
  db: AfendaTransaction,
  input: PrepareHrBonusPayoutInput,
): Promise<{
  payoutId: string;
  finalPayout: number;
  validationFlags: readonly string[];
  eligible: boolean;
}> {
  const [plan] = await db
    .select({
      id: hrBonusPlans.id,
      planType: hrBonusPlans.planType,
      requiresApproval: hrBonusPlans.requiresApproval,
    })
    .from(hrBonusPlans)
    .where(
      and(
        eq(hrBonusPlans.organizationId, input.organizationId),
        eq(hrBonusPlans.id, input.planId),
      ),
    )
    .limit(1);

  if (!plan) {
    throw new HrBonusCommandError("plan_not_found");
  }

  const [cycle] = await db
    .select({ id: hrBonusCycles.id })
    .from(hrBonusCycles)
    .where(
      and(
        eq(hrBonusCycles.organizationId, input.organizationId),
        eq(hrBonusCycles.id, input.cycleId),
        eq(hrBonusCycles.planId, input.planId),
      ),
    )
    .limit(1);

  if (!cycle) {
    throw new HrBonusCommandError("cycle_not_found");
  }

  const [employee] = await db
    .select({
      id: hrEmployees.id,
      legalEntityCode: hrEmployees.legalEntityCode,
      currentDepartmentId: hrEmployees.currentDepartmentId,
      grade: hrEmployees.grade,
    })
    .from(hrEmployees)
    .where(
      and(
        eq(hrEmployees.organizationId, input.organizationId),
        eq(hrEmployees.id, input.employeeId),
      ),
    )
    .limit(1);

  if (!employee) {
    throw new HrBonusCommandError("employee_not_found");
  }

  const eligibility = await validateHrBonusEligibilityBeforePayoutInTx(db, {
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    planId: input.planId,
  });

  const { formula, tiers, accelerator } = await loadHrBonusPayoutConfigInTx(db, {
    organizationId: input.organizationId,
    planId: input.planId,
  });

  const calculationInput: BonusPayoutCalculationInput = {
    formulaKind: formula.formulaKind,
    fixedAmount: parseNumeric(formula.fixedAmount),
    percentageRate: parseNumeric(formula.percentageRate),
    performanceRatingWeight: parseNumeric(formula.performanceRatingWeight),
    baseSalary: input.calculation.baseSalary ?? null,
    salesAmount: input.calculation.salesAmount ?? null,
    revenueAmount: input.calculation.revenueAmount ?? null,
    marginAmount: input.calculation.marginAmount ?? null,
    kpiScore: input.calculation.kpiScore ?? null,
    performanceRating:
      input.performanceRating ?? input.calculation.performanceRating ?? null,
    achievementPercent: input.calculation.achievementPercent ?? null,
    tiers: tiers.map((tier) => ({
      minThreshold: parseNumeric(tier.minThreshold) ?? 0,
      maxThreshold: parseNumeric(tier.maxThreshold),
      ratePercent: parseNumeric(tier.ratePercent) ?? 0,
    })),
    accelerator: accelerator
      ? {
          thresholdPercent: parseNumeric(accelerator.thresholdPercent) ?? 100,
          acceleratorRate: parseNumeric(accelerator.acceleratorRate) ?? 0,
        }
      : null,
    bounds: {
      payoutFloor: parseNumeric(formula.payoutFloor),
      payoutCap: parseNumeric(formula.payoutCap),
    },
  };

  const validation = await collectHrBonusPayoutValidationFlagsInTx(db, {
    organizationId: input.organizationId,
    planId: input.planId,
    cycleId: input.cycleId,
    employeeId: input.employeeId,
    performanceRating: input.performanceRating ?? null,
    calculationInput,
  });

  assertHrBonusPayoutValidationClear(validation);

  const calculated = await calculateHrBonusPayoutForPlanInTx(db, {
    organizationId: input.organizationId,
    planId: input.planId,
    ...input.calculation,
    performanceRating:
      input.performanceRating ?? input.calculation.performanceRating ?? null,
  });

  const payoutId = input.payoutId?.trim() || createEntityId("hr_bon_payout");
  const now = new Date();

  if (input.payoutId?.trim()) {
    await assertHrBonusPayoutEditableInTx(db, {
      organizationId: input.organizationId,
      payoutId,
    });
  }

  const payload = {
    planId: input.planId,
    cycleId: input.cycleId,
    employeeId: input.employeeId,
    planType: plan.planType,
    payoutStatus: "draft" as const,
    calculatedAmount: formatNumeric(calculated.finalPayout, 2),
    finalAmount: formatNumeric(calculated.finalPayout, 2),
    currencyCode: formula.currencyCode ?? "USD",
    eligible: eligibility.eligible,
    eligibilityNotes: eligibility.ineligibilityReason ?? null,
    validationFlags: [...validation.flags],
    performanceRating:
      input.performanceRating != null
        ? formatNumeric(input.performanceRating, 4)
        : null,
    legalEntityCode: employee.legalEntityCode,
    departmentId: employee.currentDepartmentId,
    updatedAt: now,
  };

  if (input.payoutId?.trim()) {
    await db
      .update(hrBonusPayouts)
      .set(payload)
      .where(
        and(
          eq(hrBonusPayouts.organizationId, input.organizationId),
          eq(hrBonusPayouts.id, payoutId),
        ),
      );
  } else {
    await db.insert(hrBonusPayouts).values({
      id: payoutId,
      organizationId: input.organizationId,
      ...payload,
      createdAt: now,
    });
  }

  await appendHrBonusPayoutAuditEventInTx(db, {
    organizationId: input.organizationId,
    payoutId,
    planId: input.planId,
    cycleId: input.cycleId,
    employeeId: input.employeeId,
    actorUserId: input.actorUserId,
    action: "hr.bonus.payout.calculate",
    summary: "Bonus payout prepared after eligibility and validation checks.",
    metadata: {
      finalPayout: calculated.finalPayout,
      validationFlags: validation.flags,
      eligible: eligibility.eligible,
    },
    occurredAt: now,
  });

  return {
    payoutId,
    finalPayout: calculated.finalPayout,
    validationFlags: validation.flags,
    eligible: eligibility.eligible,
  };
}
