"use server";

import {
  appendHrBonusPayoutAuditEventInTx,
  prepareHrBonusPayoutInTx,
  reviewHrBonusPayoutInTx,
  submitHrBonusPayoutForApprovalInTx,
} from "@afenda/db";
import {
  actionSuccess,
  zodActionFailure,
  type ActionResult,
} from "@afenda/governed-surface/schemas";

import { hrPayrollBonusAuditActions } from "../events/hr.payroll.bonus.event";
import {
  requireHrBonusApprove,
  requireHrBonusWrite,
} from "../policies/hr.payroll.bonus-access.policy.server";
import {
  prepareBonusPayoutSchema,
  reviewBonusPayoutSchema,
  submitBonusPayoutApprovalSchema,
} from "../schemas/hr.payroll.bonus-workflow.schema";
import {
  finalizeBonusMutation,
  finalizeBonusMutationWithData,
} from "./hr.payroll.bonus.mutation.shared.server";

/** BON-019 + BON-020 — eligibility validation, data-quality flags, payout prepare. */
export async function prepareBonusPayoutAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult<{
  payoutId: string;
  finalPayout: number;
  validationFlags: readonly string[];
  eligible: boolean;
}>> {
  const { session, organization } = await requireHrBonusWrite();
  const raw = Object.fromEntries(formData.entries());
  const parsed = prepareBonusPayoutSchema.safeParse({
    planId: raw.planId,
    cycleId: raw.cycleId,
    employeeId: raw.employeeId,
    payoutId: raw.payoutId,
    performanceRating: raw.performanceRating,
    baseSalary: raw.baseSalary,
    salesAmount: raw.salesAmount,
    revenueAmount: raw.revenueAmount,
    marginAmount: raw.marginAmount,
    kpiScore: raw.kpiScore,
    achievementPercent: raw.achievementPercent,
  });
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeBonusMutationWithData(organization.id, async (db) => {
    const result = await prepareHrBonusPayoutInTx(db, {
      organizationId: organization.id,
      actorUserId: session.id,
      planId: parsed.data.planId,
      cycleId: parsed.data.cycleId,
      employeeId: parsed.data.employeeId,
      payoutId: parsed.data.payoutId,
      performanceRating: parsed.data.performanceRating ?? null,
      calculation: {
        baseSalary: parsed.data.baseSalary ?? null,
        salesAmount: parsed.data.salesAmount ?? null,
        revenueAmount: parsed.data.revenueAmount ?? null,
        marginAmount: parsed.data.marginAmount ?? null,
        kpiScore: parsed.data.kpiScore ?? null,
        achievementPercent: parsed.data.achievementPercent ?? null,
      },
    });

    await appendHrBonusPayoutAuditEventInTx(db, {
      organizationId: organization.id,
      payoutId: result.payoutId,
      actorUserId: session.id,
      action: hrPayrollBonusAuditActions.eligibility.validated,
      summary: "Bonus payout eligibility validated before calculation.",
      metadata: {
        eligible: result.eligible,
        validationFlags: result.validationFlags,
      },
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrPayrollBonusAuditActions.payout.calculated,
      targetId: result.payoutId,
      summary: "Bonus payout prepared",
      metadata: { validationFlags: result.validationFlags },
      data: result,
    };
  });
}

/** BON-021 + BON-022 */
export async function submitBonusPayoutForApprovalAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrBonusWrite();
  const parsed = submitBonusPayoutApprovalSchema.safeParse({
    payoutId: formData.get("payoutId"),
  });
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeBonusMutation(organization.id, async (db) => {
    const routed = await submitHrBonusPayoutForApprovalInTx(db, {
      organizationId: organization.id,
      actorUserId: session.id,
      payoutId: parsed.data.payoutId,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrPayrollBonusAuditActions.payout.submitted,
      targetId: parsed.data.payoutId,
      summary: "Bonus payout submitted for approval",
      metadata: { stepIds: routed.stepIds },
    };
  });
}

/** BON-023 + BON-024 */
export async function reviewBonusPayoutAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrBonusApprove();
  const raw = Object.fromEntries(formData.entries());
  const parsed = reviewBonusPayoutSchema.safeParse({
    payoutId: raw.payoutId,
    decision: raw.decision,
    reason: raw.reason,
    adjustedAmount: raw.adjustedAmount,
  });
  if (!parsed.success) return zodActionFailure(parsed.error);

  const decisionActionMap = {
    approve: hrPayrollBonusAuditActions.payout.approved,
    reject: hrPayrollBonusAuditActions.payout.rejected,
    return: hrPayrollBonusAuditActions.payout.returned,
    adjust: hrPayrollBonusAuditActions.payout.adjusted,
  } as const;

  return finalizeBonusMutation(organization.id, async (db) => {
    const reviewed = await reviewHrBonusPayoutInTx(db, {
      organizationId: organization.id,
      actorUserId: session.id,
      payoutId: parsed.data.payoutId,
      decision: parsed.data.decision,
      reason: parsed.data.reason ?? null,
      adjustedAmount: parsed.data.adjustedAmount ?? null,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: decisionActionMap[parsed.data.decision],
      targetId: parsed.data.payoutId,
      summary: `Bonus payout ${parsed.data.decision}`,
      reason: parsed.data.reason ?? undefined,
      metadata: {
        payoutStatus: reviewed.payoutStatus,
        locked: reviewed.locked,
      },
    };
  });
}

export async function reviewBonusPayoutJsonAction(
  input: unknown,
): Promise<ActionResult<{ payoutStatus: string; locked: boolean }>> {
  const { session, organization } = await requireHrBonusApprove();
  const parsed = reviewBonusPayoutSchema.safeParse(input);
  if (!parsed.success) return zodActionFailure(parsed.error);

  try {
    const { runWithOrganizationContext } = await import("@afenda/db");
    const reviewed = await runWithOrganizationContext(organization.id, async (db) => {
      const result = await reviewHrBonusPayoutInTx(db, {
        organizationId: organization.id,
        actorUserId: session.id,
        payoutId: parsed.data.payoutId,
        decision: parsed.data.decision,
        reason: parsed.data.reason ?? null,
        adjustedAmount: parsed.data.adjustedAmount ?? null,
      });
      return result;
    });
    return actionSuccess(reviewed);
  } catch (error) {
    const { toBonusActionFailure } = await import(
      "../data/hr.payroll.bonus-action-result.shared"
    );
    return toBonusActionFailure(error) as ActionResult<{
      payoutStatus: string;
      locked: boolean;
    }>;
  }
}
