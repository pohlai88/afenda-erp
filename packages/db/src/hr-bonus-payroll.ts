import { and, desc, eq, gte, inArray, isNull, lte, or } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { appendHrBonusPayoutAuditEventInTx } from "./hr-bonus-audit";
import { formatEmployeeLabel } from "./hr-benefits.shared";
import {
  buildBonusEarningsCode,
  HrBonusPayoutCommandError,
} from "./hr-bonus.shared";
import type { HrBonusPayrollPayoutRefRow } from "./hr-bonus.types";
import {
  hrBonusPayrollPayoutReferences,
  hrBonusPayouts,
} from "./dbx-hr-bonus";
import {
  hrBonusCycles,
  hrBonusPlans,
} from "./dbx-hr-bonus-incentive";
import { hrEmployees } from "./hr";

const MAX_PAYROLL_EXPORT = 500;

/** HRM-BON-026 — payroll processing reference for locked approved payout. */
export async function createHrBonusPayrollPayoutReferenceInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    payoutId: string;
    effectiveFrom?: Date;
  },
): Promise<{
  deductionReferenceId: string;
  payrollPayoutReference: string;
}> {
  const [payout] = await db
    .select({
      id: hrBonusPayouts.id,
      planId: hrBonusPayouts.planId,
      employeeId: hrBonusPayouts.employeeId,
      payoutStatus: hrBonusPayouts.payoutStatus,
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

  if (payout.payoutStatus !== "locked") {
    throw new HrBonusPayoutCommandError("payout_not_locked");
  }

  const amount =
    payout.finalAmount ?? payout.adjustedAmount ?? payout.calculatedAmount;
  if (!amount) {
    throw new HrBonusPayoutCommandError("invalid_payout_status");
  }

  const [plan] = await db
    .select({
      code: hrBonusPlans.code,
      planType: hrBonusPlans.planType,
    })
    .from(hrBonusPlans)
    .where(
      and(
        eq(hrBonusPlans.organizationId, input.organizationId),
        eq(hrBonusPlans.id, payout.planId),
      ),
    )
    .limit(1);

  if (!plan) {
    throw new HrBonusPayoutCommandError("plan_not_found");
  }

  const [existing] = await db
    .select({ id: hrBonusPayrollPayoutReferences.id })
    .from(hrBonusPayrollPayoutReferences)
    .where(
      and(
        eq(hrBonusPayrollPayoutReferences.organizationId, input.organizationId),
        eq(hrBonusPayrollPayoutReferences.payoutId, input.payoutId),
        eq(hrBonusPayrollPayoutReferences.active, true),
      ),
    )
    .limit(1);

  if (existing) {
    const [ref] = await db
      .select({
        id: hrBonusPayrollPayoutReferences.id,
        payrollPayoutReference:
          hrBonusPayrollPayoutReferences.payrollPayoutReference,
      })
      .from(hrBonusPayrollPayoutReferences)
      .where(eq(hrBonusPayrollPayoutReferences.id, existing.id))
      .limit(1);
    return {
      deductionReferenceId: ref!.id,
      payrollPayoutReference: ref!.payrollPayoutReference,
    };
  }

  const referenceId = createEntityId("hr_bon_pay_ref");
  const payrollPayoutReference = createEntityId("pay_bon");
  const earningsCode = buildBonusEarningsCode(plan.code, plan.planType);

  await db.insert(hrBonusPayrollPayoutReferences).values({
    id: referenceId,
    organizationId: input.organizationId,
    payoutId: input.payoutId,
    payrollPayoutReference,
    earningsCode,
    amount,
    currencyCode: payout.currencyCode,
    active: true,
    effectiveFrom: input.effectiveFrom ?? new Date(),
  });

  return { deductionReferenceId: referenceId, payrollPayoutReference };
}

export async function listHrBonusPayrollPayoutRefs(input: {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  limit?: number;
}): Promise<readonly HrBonusPayrollPayoutRefRow[]> {
  const limit = Math.min(input.limit ?? MAX_PAYROLL_EXPORT, MAX_PAYROLL_EXPORT);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        id: hrBonusPayrollPayoutReferences.id,
        payoutId: hrBonusPayrollPayoutReferences.payoutId,
        payrollPayoutReference:
          hrBonusPayrollPayoutReferences.payrollPayoutReference,
        earningsCode: hrBonusPayrollPayoutReferences.earningsCode,
        amount: hrBonusPayrollPayoutReferences.amount,
        currencyCode: hrBonusPayrollPayoutReferences.currencyCode,
        syncedAt: hrBonusPayrollPayoutReferences.syncedAt,
        employeeId: hrBonusPayouts.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        planCode: hrBonusPlans.code,
        planName: hrBonusPlans.name,
        planType: hrBonusPlans.planType,
        cycleCode: hrBonusCycles.code,
        payoutDueAt: hrBonusCycles.payoutAt,
      })
      .from(hrBonusPayrollPayoutReferences)
      .innerJoin(
        hrBonusPayouts,
        eq(hrBonusPayrollPayoutReferences.payoutId, hrBonusPayouts.id),
      )
      .innerJoin(hrEmployees, eq(hrBonusPayouts.employeeId, hrEmployees.id))
      .innerJoin(hrBonusPlans, eq(hrBonusPayouts.planId, hrBonusPlans.id))
      .innerJoin(hrBonusCycles, eq(hrBonusPayouts.cycleId, hrBonusCycles.id))
      .where(
        and(
          eq(hrBonusPayrollPayoutReferences.organizationId, input.organizationId),
          eq(hrBonusPayrollPayoutReferences.active, true),
          eq(hrBonusPayouts.payoutStatus, "locked"),
          or(
            isNull(hrBonusPayrollPayoutReferences.syncedAt),
            and(
              gte(hrBonusPayrollPayoutReferences.effectiveFrom, input.periodStart),
              lte(hrBonusPayrollPayoutReferences.effectiveFrom, input.periodEnd),
            ),
          )!,
        ),
      )
      .orderBy(desc(hrBonusPayrollPayoutReferences.createdAt))
      .limit(limit);

    return rows.map((row) => ({
      id: row.id,
      payoutId: row.payoutId,
      payrollPayoutReference: row.payrollPayoutReference,
      earningsCode: row.earningsCode,
      amount: row.amount,
      currencyCode: row.currencyCode,
      employeeId: row.employeeId,
      employeeLabel: formatEmployeeLabel(row),
      planCode: row.planCode,
      planName: row.planName,
      planType: row.planType,
      cycleCode: row.cycleCode,
      payoutDueAt: row.payoutDueAt,
      syncedAt: row.syncedAt,
    }));
  });
}

export async function markHrBonusPayrollPayoutRefsSyncedInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    payoutReferenceIds: readonly string[];
    syncedAt?: Date;
    actorUserId?: string | null;
  },
): Promise<{ syncedCount: number }> {
  if (input.payoutReferenceIds.length === 0) {
    return { syncedCount: 0 };
  }

  const syncedAt = input.syncedAt ?? new Date();

  const updated = await db
    .update(hrBonusPayrollPayoutReferences)
    .set({ syncedAt, updatedAt: syncedAt })
    .where(
      and(
        eq(hrBonusPayrollPayoutReferences.organizationId, input.organizationId),
        inArray(hrBonusPayrollPayoutReferences.id, [...input.payoutReferenceIds]),
      ),
    )
    .returning({
      id: hrBonusPayrollPayoutReferences.id,
      payoutId: hrBonusPayrollPayoutReferences.payoutId,
    });

  for (const row of updated) {
    await appendHrBonusPayoutAuditEventInTx(db, {
      organizationId: input.organizationId,
      payoutId: row.payoutId,
      actorUserId: input.actorUserId,
      action: "hr.bonus.payroll.integrate",
      summary: "Bonus or incentive payout reference acknowledged by Payroll Processing.",
      metadata: { payoutReferenceId: row.id, syncedAt: syncedAt.toISOString() },
      occurredAt: syncedAt,
    });
  }

  return { syncedCount: updated.length };
}

