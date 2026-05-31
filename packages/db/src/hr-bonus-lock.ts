import { and, eq } from "drizzle-orm";
import type { AfendaTransaction } from "./client";
import { appendHrBonusPayoutAuditEventInTx } from "./hr-bonus-audit";
import {
  HR_BONUS_EDITABLE_PAYOUT_STATUSES,
  HrBonusPayoutCommandError,
  isHrBonusPayoutLocked,
} from "./hr-bonus.shared";
import { createHrBonusPayrollPayoutReferenceInTx } from "./hr-bonus-payroll";
import {
  hrBonusCycles,
  hrBonusPayouts,
  hrBonusPlans,
} from "./schema/hr-bonus";

/** HRM-BON-025 — block normal edits after final approval lock. */
export async function assertHrBonusPayoutEditableInTx(
  db: AfendaTransaction,
  input: { organizationId: string; payoutId: string },
): Promise<void> {
  const [payout] = await db
    .select({
      payoutStatus: hrBonusPayouts.payoutStatus,
      lockedAt: hrBonusPayouts.lockedAt,
    })
    .from(hrBonusPayouts)
    .where(
      and(
        eq(hrBonusPayouts.organizationId, input.organizationId),
        eq(hrBonusPayouts.id, input.payoutId),
      ),
    )
    .limit(1);

  if (!payout) {
    throw new HrBonusPayoutCommandError("payout_not_found");
  }

  if (isHrBonusPayoutLocked(payout)) {
    throw new HrBonusPayoutCommandError("payout_locked");
  }

  if (
    !HR_BONUS_EDITABLE_PAYOUT_STATUSES.includes(
      payout.payoutStatus as (typeof HR_BONUS_EDITABLE_PAYOUT_STATUSES)[number],
    )
  ) {
    throw new HrBonusPayoutCommandError("invalid_payout_status");
  }
}

/**
 * HRM-BON-025 / AC 19 — lock approved payout after final approval.
 * Creates payroll payout reference (HRM-BON-026) and audit event (HRM-BON-030).
 */
export async function lockHrBonusPayoutAfterFinalApprovalInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    payoutId: string;
    actorUserId?: string | null;
    lockedAt?: Date;
  },
): Promise<{
  payoutId: string;
  payrollPayoutReferenceId: string;
  payrollPayoutReference: string;
}> {
  const [payout] = await db
    .select({
      id: hrBonusPayouts.id,
      planId: hrBonusPayouts.planId,
      cycleId: hrBonusPayouts.cycleId,
      employeeId: hrBonusPayouts.employeeId,
      payoutStatus: hrBonusPayouts.payoutStatus,
      lockedAt: hrBonusPayouts.lockedAt,
      finalAmount: hrBonusPayouts.finalAmount,
      adjustedAmount: hrBonusPayouts.adjustedAmount,
      calculatedAmount: hrBonusPayouts.calculatedAmount,
      currencyCode: hrBonusPayouts.currencyCode,
    })
    .from(hrBonusPayouts)
    .where(
      and(
        eq(hrBonusPayouts.organizationId, input.organizationId),
        eq(hrBonusPayouts.id, input.payoutId),
      ),
    )
    .limit(1);

  if (!payout) {
    throw new HrBonusPayoutCommandError("payout_not_found");
  }

  if (isHrBonusPayoutLocked(payout)) {
    throw new HrBonusPayoutCommandError("payout_locked");
  }

  if (payout.payoutStatus !== "approved") {
    throw new HrBonusPayoutCommandError("payout_not_approved");
  }

  const amount =
    payout.finalAmount ?? payout.adjustedAmount ?? payout.calculatedAmount;
  if (!amount) {
    throw new HrBonusPayoutCommandError("invalid_payout_status");
  }

  const lockedAt = input.lockedAt ?? new Date();

  await db
    .update(hrBonusPayouts)
    .set({
      payoutStatus: "locked",
      lockedAt,
      lockedByUserId: input.actorUserId ?? null,
      updatedAt: lockedAt,
    })
    .where(
      and(
        eq(hrBonusPayouts.organizationId, input.organizationId),
        eq(hrBonusPayouts.id, input.payoutId),
      ),
    );

  const payrollRef = await createHrBonusPayrollPayoutReferenceInTx(db, {
    organizationId: input.organizationId,
    payoutId: input.payoutId,
    effectiveFrom: lockedAt,
  });

  await appendHrBonusPayoutAuditEventInTx(db, {
    organizationId: input.organizationId,
    payoutId: input.payoutId,
    planId: payout.planId,
    cycleId: payout.cycleId,
    employeeId: payout.employeeId,
    actorUserId: input.actorUserId,
    action: "hr.bonus.payout.lock",
    summary: "Bonus or incentive payout locked after final approval.",
    metadata: {
      payrollPayoutReference: payrollRef.payrollPayoutReference,
      amount,
      currencyCode: payout.currencyCode,
    },
    occurredAt: lockedAt,
  });

  return {
    payoutId: input.payoutId,
    payrollPayoutReferenceId: payrollRef.deductionReferenceId,
    payrollPayoutReference: payrollRef.payrollPayoutReference,
  };
}

export async function loadHrBonusPayoutContextInTx(
  db: AfendaTransaction,
  input: { organizationId: string; payoutId: string },
) {
  const [row] = await db
    .select({
      payoutId: hrBonusPayouts.id,
      planId: hrBonusPayouts.planId,
      cycleId: hrBonusPayouts.cycleId,
      employeeId: hrBonusPayouts.employeeId,
      planCode: hrBonusPlans.code,
      planType: hrBonusPlans.planType,
      cycleCode: hrBonusCycles.code,
    })
    .from(hrBonusPayouts)
    .innerJoin(hrBonusPlans, eq(hrBonusPayouts.planId, hrBonusPlans.id))
    .innerJoin(hrBonusCycles, eq(hrBonusPayouts.cycleId, hrBonusCycles.id))
    .where(
      and(
        eq(hrBonusPayouts.organizationId, input.organizationId),
        eq(hrBonusPayouts.id, input.payoutId),
      ),
    )
    .limit(1);

  if (!row) {
    throw new HrBonusPayoutCommandError("payout_not_found");
  }

  return row;
}
