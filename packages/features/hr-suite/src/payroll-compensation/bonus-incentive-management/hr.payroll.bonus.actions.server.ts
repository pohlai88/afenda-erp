"use server";

import {
  appendHrBonusIncentiveAuditEventInTx,
  calculateHrBonusPayoutForPlanInTx,
  recordHrBonusTargetAchievementInTx,
  replaceHrBonusCommissionTiersInTx,
  upsertHrBonusAcceleratorRuleInTx,
  upsertHrBonusPayoutFormulaInTx,
  type BonusPayoutCalculationResult,
} from "@afenda/db";
import {
  actionSuccess,
  zodActionFailure,
  type ActionResult,
} from "@afenda/governed-surface/schemas";

import { hrPayrollBonusAuditActions } from "./hr.payroll.bonus.event";
import { requireHrBonusRead, requireHrBonusWrite } from "./hr.payroll.bonus-access.policy.server";
import {
  parseCalculateBonusPayoutForm,
  parseRecordBonusTargetAchievementForm,
  parseReplaceBonusCommissionTiersForm,
  parseUpsertBonusAcceleratorRuleForm,
  parseUpsertBonusPayoutFormulaForm,
} from "./hr.payroll.bonus-form.shared";
import {
  finalizeBonusMutation,
  finalizeBonusMutationWithData,
} from "./hr.payroll.bonus.mutation.shared.server";

function toOptionalNumber(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** BON-007 + BON-008 */
export async function recordBonusTargetAchievementAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrBonusWrite();
  const parsed = parseRecordBonusTargetAchievementForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeBonusMutation(organization.id, async (db) => {
    const recorded = await recordHrBonusTargetAchievementInTx(db, {
      organizationId: organization.id,
      targetId: parsed.data.targetId,
      actualValue: parsed.data.actualValue,
      recordedByUserId: session.id,
      notes: parsed.data.notes ?? null,
    });

    await appendHrBonusIncentiveAuditEventInTx(db, {
      organizationId: organization.id,
      actorUserId: session.id,
      action: hrPayrollBonusAuditActions.achievement.recorded,
      targetId: parsed.data.targetId,
      achievementId: recorded.achievementId,
      summary: "Bonus target achievement recorded",
      metadata: {
        actualValue: recorded.actualValue,
        achievementPercent: recorded.achievementPercent,
      },
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrPayrollBonusAuditActions.achievement.recorded,
      targetId: recorded.achievementId,
      summary: "Bonus target achievement recorded",
      metadata: {
        targetId: parsed.data.targetId,
        achievementPercent: recorded.achievementPercent,
      },
    };
  });
}

/** BON-009 + BON-012 */
export async function upsertBonusPayoutFormulaAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrBonusWrite();
  const parsed = parseUpsertBonusPayoutFormulaForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeBonusMutation(organization.id, async (db) => {
    const saved = await upsertHrBonusPayoutFormulaInTx(db, {
      organizationId: organization.id,
      planId: parsed.data.planId,
      formulaKind: parsed.data.formulaKind,
      fixedAmount: parsed.data.fixedAmount ?? null,
      percentageRate: parsed.data.percentageRate ?? null,
      performanceRatingWeight: parsed.data.performanceRatingWeight ?? null,
      payoutFloor: parsed.data.payoutFloor ?? null,
      payoutCap: parsed.data.payoutCap ?? null,
      currencyCode: parsed.data.currencyCode ?? null,
    });

    await appendHrBonusIncentiveAuditEventInTx(db, {
      organizationId: organization.id,
      actorUserId: session.id,
      action: hrPayrollBonusAuditActions.formula.configured,
      planId: parsed.data.planId,
      summary: "Bonus payout formula configured",
      metadata: {
        formulaKind: parsed.data.formulaKind,
        payoutFloor: parsed.data.payoutFloor ?? null,
        payoutCap: parsed.data.payoutCap ?? null,
      },
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrPayrollBonusAuditActions.formula.configured,
      targetId: saved.formulaId,
      summary: "Bonus payout formula configured",
      metadata: { planId: parsed.data.planId },
    };
  });
}

/** BON-010 */
export async function replaceBonusCommissionTiersAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrBonusWrite();
  const parsed = parseReplaceBonusCommissionTiersForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeBonusMutation(organization.id, async (db) => {
    const saved = await replaceHrBonusCommissionTiersInTx(db, {
      organizationId: organization.id,
      planId: parsed.data.planId,
      tiers: parsed.data.tiers.map((tier) => ({
        organizationId: organization.id,
        planId: parsed.data.planId,
        tierOrder: tier.tierOrder,
        minThreshold: tier.minThreshold,
        maxThreshold: tier.maxThreshold ?? null,
        ratePercent: tier.ratePercent,
      })),
    });

    await appendHrBonusIncentiveAuditEventInTx(db, {
      organizationId: organization.id,
      actorUserId: session.id,
      action: hrPayrollBonusAuditActions.commission.tiersConfigured,
      planId: parsed.data.planId,
      summary: "Commission tiers configured",
      metadata: { tierCount: saved.tierCount },
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrPayrollBonusAuditActions.commission.tiersConfigured,
      targetId: parsed.data.planId,
      summary: "Commission tiers configured",
      metadata: { tierCount: saved.tierCount },
    };
  });
}

/** BON-011 */
export async function upsertBonusAcceleratorRuleAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrBonusWrite();
  const parsed = parseUpsertBonusAcceleratorRuleForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeBonusMutation(organization.id, async (db) => {
    const saved = await upsertHrBonusAcceleratorRuleInTx(db, {
      organizationId: organization.id,
      planId: parsed.data.planId,
      thresholdPercent: parsed.data.thresholdPercent ?? "100",
      acceleratorRate: parsed.data.acceleratorRate,
    });

    await appendHrBonusIncentiveAuditEventInTx(db, {
      organizationId: organization.id,
      actorUserId: session.id,
      action: hrPayrollBonusAuditActions.accelerator.configured,
      planId: parsed.data.planId,
      summary: "Bonus accelerator rule configured",
      metadata: {
        thresholdPercent: parsed.data.thresholdPercent ?? "100",
        acceleratorRate: parsed.data.acceleratorRate,
      },
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrPayrollBonusAuditActions.accelerator.configured,
      targetId: saved.ruleId,
      summary: "Bonus accelerator rule configured",
      metadata: { planId: parsed.data.planId },
    };
  });
}

/** BON-009..012 — payout calculation preview/run. */
export async function calculateBonusPayoutAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult<BonusPayoutCalculationResult & { formulaId: string }>> {
  await requireHrBonusRead();
  const { session, organization } = await requireHrBonusWrite();
  const parsed = parseCalculateBonusPayoutForm(formData);
  if (!parsed.success) {
    return zodActionFailure<
      BonusPayoutCalculationResult & { formulaId: string }
    >(parsed.error);
  }

  return finalizeBonusMutationWithData(organization.id, async (db) => {
    const result = await calculateHrBonusPayoutForPlanInTx(db, {
      organizationId: organization.id,
      planId: parsed.data.planId,
      baseSalary: toOptionalNumber(parsed.data.baseSalary),
      salesAmount: toOptionalNumber(parsed.data.salesAmount),
      revenueAmount: toOptionalNumber(parsed.data.revenueAmount),
      marginAmount: toOptionalNumber(parsed.data.marginAmount),
      kpiScore: toOptionalNumber(parsed.data.kpiScore),
      performanceRating: toOptionalNumber(parsed.data.performanceRating),
      achievementPercent: toOptionalNumber(parsed.data.achievementPercent),
    });

    await appendHrBonusIncentiveAuditEventInTx(db, {
      organizationId: organization.id,
      actorUserId: session.id,
      action: hrPayrollBonusAuditActions.payout.calculated,
      planId: parsed.data.planId,
      summary: "Bonus payout calculated",
      metadata: {
        finalPayout: result.finalPayout,
        capped: result.capped,
        floored: result.floored,
        acceleratorApplied: result.acceleratorApplied,
      },
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrPayrollBonusAuditActions.payout.calculated,
      targetId: result.formulaId,
      summary: "Bonus payout calculated",
      metadata: { planId: parsed.data.planId, finalPayout: result.finalPayout },
      data: result,
    };
  });
}

export async function calculateBonusPayoutReadAction(
  formData: FormData,
): Promise<ActionResult<BonusPayoutCalculationResult & { formulaId: string }>> {
  const { organization } = await requireHrBonusRead();
  const parsed = parseCalculateBonusPayoutForm(formData);
  if (!parsed.success) {
    return zodActionFailure<
      BonusPayoutCalculationResult & { formulaId: string }
    >(parsed.error);
  }

  try {
    const { calculateHrBonusPayoutForPlanInTx, runWithOrganizationContext } =
      await import("@afenda/db");

    const result = await runWithOrganizationContext(
      organization.id,
      async (db) =>
        calculateHrBonusPayoutForPlanInTx(db, {
          organizationId: organization.id,
          planId: parsed.data.planId,
          baseSalary: toOptionalNumber(parsed.data.baseSalary),
          salesAmount: toOptionalNumber(parsed.data.salesAmount),
          revenueAmount: toOptionalNumber(parsed.data.revenueAmount),
          marginAmount: toOptionalNumber(parsed.data.marginAmount),
          kpiScore: toOptionalNumber(parsed.data.kpiScore),
          performanceRating: toOptionalNumber(parsed.data.performanceRating),
          achievementPercent: toOptionalNumber(parsed.data.achievementPercent),
        }),
    );

    return actionSuccess(result);
  } catch (error) {
    const { toBonusActionFailure } = await import(
      "./hr.payroll.bonus-action-result.shared"
    );
    return toBonusActionFailure<BonusPayoutCalculationResult & { formulaId: string }>(
      error,
    );
  }
}
