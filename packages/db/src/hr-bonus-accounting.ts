import { and, eq } from "drizzle-orm";
import type { AfendaTransaction } from "./client";
import { appendHrBonusPayoutAuditEventInTx } from "./hr-bonus-audit";
import { assertHrBonusPayoutEditableInTx } from "./hr-bonus-lock";
import { HrBonusPayoutCommandError } from "./hr-bonus.shared";
import { hrBonusPayouts } from "./hr-bonus";

export type HrBonusAccountingAllocationInput = {
  legalEntityCode?: string | null;
  departmentId?: string | null;
  costCenterCode?: string | null;
  projectCode?: string | null;
  salesRegionCode?: string | null;
  glReference?: string | null;
};

function hasAnyAllocationField(input: HrBonusAccountingAllocationInput) {
  return Boolean(
    input.legalEntityCode?.trim() ||
      input.departmentId?.trim() ||
      input.costCenterCode?.trim() ||
      input.projectCode?.trim() ||
      input.salesRegionCode?.trim() ||
      input.glReference?.trim(),
  );
}

/** HRM-BON-027 / AC 21 — assign accounting allocation dimensions on payout. */
export async function updateHrBonusPayoutAccountingAllocationInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    payoutId: string;
    allocation: HrBonusAccountingAllocationInput;
    actorUserId?: string | null;
    allowLockedOverride?: boolean;
  },
): Promise<{ payoutId: string }> {
  if (!hasAnyAllocationField(input.allocation)) {
    throw new HrBonusPayoutCommandError("invalid_accounting_allocation");
  }

  if (!input.allowLockedOverride) {
    await assertHrBonusPayoutEditableInTx(db, {
      organizationId: input.organizationId,
      payoutId: input.payoutId,
    });
  } else {
    const [payout] = await db
      .select({ id: hrBonusPayouts.id })
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
  }

  const now = new Date();

  const [updated] = await db
    .update(hrBonusPayouts)
    .set({
      legalEntityCode: input.allocation.legalEntityCode?.trim() || null,
      departmentId: input.allocation.departmentId?.trim() || null,
      costCenterCode: input.allocation.costCenterCode?.trim() || null,
      projectCode: input.allocation.projectCode?.trim() || null,
      salesRegionCode: input.allocation.salesRegionCode?.trim() || null,
      glReference: input.allocation.glReference?.trim() || null,
      updatedAt: now,
    })
    .where(
      and(
        eq(hrBonusPayouts.organizationId, input.organizationId),
        eq(hrBonusPayouts.id, input.payoutId),
      ),
    )
    .returning({
      id: hrBonusPayouts.id,
      planId: hrBonusPayouts.planId,
      cycleId: hrBonusPayouts.cycleId,
      employeeId: hrBonusPayouts.employeeId,
    });

  if (!updated) {
    throw new HrBonusPayoutCommandError("payout_not_found");
  }

  await appendHrBonusPayoutAuditEventInTx(db, {
    organizationId: input.organizationId,
    payoutId: updated.id,
    planId: updated.planId,
    cycleId: updated.cycleId,
    employeeId: updated.employeeId,
    actorUserId: input.actorUserId,
    action: "hr.bonus.accounting.allocate",
    summary: "Accounting allocation updated for bonus or incentive payout.",
    metadata: { ...input.allocation },
    occurredAt: now,
  });

  return { payoutId: updated.id };
}
