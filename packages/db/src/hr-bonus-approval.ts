import { and, asc, count, desc, eq } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { appendHrBonusPayoutAuditEventInTx } from "./hr-bonus-audit";
import {
  assertHrBonusPayoutEditableInTx,
  lockHrBonusPayoutAfterFinalApprovalInTx,
} from "./hr-bonus-lock";
import { resolveHrBonusApprovalSteps } from "./hr-bonus-approval.shared";
import {
  buildPaginatedWindow,
  clampPageSize,
  formatEmployeeLabel,
} from "./hr-benefits.shared";
import { formatNumeric, HrBonusCommandError } from "./hr-bonus-incentive.shared";
import { parseNumeric } from "./hr-bonus-incentive.shared";
import {
  hrBonusPayoutApprovalSteps,
  hrBonusPayouts,
} from "./dbx-hr-bonus";
import {
  hrBonusPlans,
  type HrBonusApprovalRoutingConfig,
} from "./dbx-hr-bonus-incentive";
import { hrEmployees } from "./hr";

export type HrBonusPayoutReviewDecision =
  | "approve"
  | "reject"
  | "return"
  | "adjust";

function payoutAmountForRouting(payout: {
  finalAmount: string | null;
  adjustedAmount: string | null;
  calculatedAmount: string | null;
}): number {
  return (
    parseNumeric(payout.finalAmount) ??
    parseNumeric(payout.adjustedAmount) ??
    parseNumeric(payout.calculatedAmount) ??
    0
  );
}

function requireDecisionReason(
  decision: HrBonusPayoutReviewDecision,
  reason: string | null | undefined,
): void {
  const trimmed = reason?.trim();
  if (decision === "reject" && !trimmed) {
    throw new HrBonusCommandError("rejection_reason_required");
  }
  if (decision === "return" && !trimmed) {
    throw new HrBonusCommandError("return_reason_required");
  }
  if (decision === "adjust" && !trimmed) {
    throw new HrBonusCommandError("adjustment_reason_required");
  }
}

async function loadPayoutForApprovalInTx(
  db: AfendaTransaction,
  input: { organizationId: string; payoutId: string },
) {
  const [row] = await db
    .select({
      id: hrBonusPayouts.id,
      planId: hrBonusPayouts.planId,
      cycleId: hrBonusPayouts.cycleId,
      employeeId: hrBonusPayouts.employeeId,
      planType: hrBonusPayouts.planType,
      payoutStatus: hrBonusPayouts.payoutStatus,
      lockedAt: hrBonusPayouts.lockedAt,
      calculatedAmount: hrBonusPayouts.calculatedAmount,
      adjustedAmount: hrBonusPayouts.adjustedAmount,
      finalAmount: hrBonusPayouts.finalAmount,
      legalEntityCode: hrBonusPayouts.legalEntityCode,
      departmentId: hrBonusPayouts.departmentId,
      managerEmployeeId: hrEmployees.managerEmployeeId,
      grade: hrEmployees.grade,
      approvalRoutingConfig: hrBonusPlans.approvalRoutingConfig,
      requiresApproval: hrBonusPlans.requiresApproval,
    })
    .from(hrBonusPayouts)
    .innerJoin(hrBonusPlans, eq(hrBonusPayouts.planId, hrBonusPlans.id))
    .innerJoin(hrEmployees, eq(hrBonusPayouts.employeeId, hrEmployees.id))
    .where(
      and(
        eq(hrBonusPayouts.organizationId, input.organizationId),
        eq(hrBonusPayouts.id, input.payoutId),
      ),
    )
    .limit(1);

  if (!row) {
    throw new HrBonusCommandError("payout_not_found");
  }

  return row;
}

/** BON-021 + BON-022 — submit payout and route approval steps. */
export async function submitHrBonusPayoutForApprovalInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    payoutId: string;
  },
): Promise<{ stepIds: string[] }> {
  await assertHrBonusPayoutEditableInTx(db, {
    organizationId: input.organizationId,
    payoutId: input.payoutId,
  });

  const payout = await loadPayoutForApprovalInTx(db, input);

  if (!["draft", "returned"].includes(payout.payoutStatus)) {
    throw new HrBonusCommandError("invalid_payout_status");
  }

  const amount = payoutAmountForRouting(payout);
  const steps = resolveHrBonusApprovalSteps({
    routingConfig:
      payout.approvalRoutingConfig as HrBonusApprovalRoutingConfig | null,
    context: {
      planType: payout.planType,
      payoutAmount: amount,
      legalEntityCode: payout.legalEntityCode,
      departmentId: payout.departmentId,
      grade: payout.grade,
      managerEmployeeId: payout.managerEmployeeId,
      budgetImpact: amount,
    },
  });

  await db
    .delete(hrBonusPayoutApprovalSteps)
    .where(
      and(
        eq(hrBonusPayoutApprovalSteps.organizationId, input.organizationId),
        eq(hrBonusPayoutApprovalSteps.payoutId, input.payoutId),
      ),
    );

  const stepIds: string[] = [];
  const now = new Date();

  for (const step of steps) {
    const stepId = createEntityId("hr_bon_appr");
    stepIds.push(stepId);
    await db.insert(hrBonusPayoutApprovalSteps).values({
      id: stepId,
      organizationId: input.organizationId,
      payoutId: input.payoutId,
      stepOrder: step.order,
      approverRole: step.role,
      stepStatus: "pending",
      createdAt: now,
      updatedAt: now,
    });
  }

  await db
    .update(hrBonusPayouts)
    .set({
      payoutStatus: payout.requiresApproval ? "pending_approval" : "approved",
      submittedAt: now,
      updatedAt: now,
    })
    .where(
      and(
        eq(hrBonusPayouts.organizationId, input.organizationId),
        eq(hrBonusPayouts.id, input.payoutId),
      ),
    );

  await appendHrBonusPayoutAuditEventInTx(db, {
    organizationId: input.organizationId,
    payoutId: input.payoutId,
    planId: payout.planId,
    cycleId: payout.cycleId,
    employeeId: payout.employeeId,
    actorUserId: input.actorUserId,
    action: "hr.bonus.payout.submit",
    summary: "Bonus payout submitted for approval.",
    metadata: { stepCount: stepIds.length, amount },
    occurredAt: now,
  });

  if (!payout.requiresApproval) {
    await lockHrBonusPayoutAfterFinalApprovalInTx(db, {
      organizationId: input.organizationId,
      payoutId: input.payoutId,
      actorUserId: input.actorUserId,
      lockedAt: now,
    });
  }

  return { stepIds };
}

/** BON-023 + BON-024 — approve, reject, return, or adjust payout. */
export async function reviewHrBonusPayoutInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    payoutId: string;
    decision: HrBonusPayoutReviewDecision;
    reason?: string | null;
    adjustedAmount?: number | null;
  },
): Promise<{ payoutStatus: string; locked: boolean }> {
  requireDecisionReason(input.decision, input.reason);

  if (input.decision === "adjust" && input.adjustedAmount == null) {
    throw new HrBonusCommandError("adjusted_amount_required");
  }

  const payout = await loadPayoutForApprovalInTx(db, input);

  if (payout.lockedAt || payout.payoutStatus === "locked") {
    throw new HrBonusCommandError("payout_locked");
  }

  const now = new Date();
  const trimmedReason = input.reason?.trim() ?? null;

  if (input.decision === "reject") {
    await db
      .update(hrBonusPayouts)
      .set({
        payoutStatus: "rejected",
        rejectionReason: trimmedReason,
        updatedAt: now,
      })
      .where(eq(hrBonusPayouts.id, input.payoutId));

    await appendHrBonusPayoutAuditEventInTx(db, {
      organizationId: input.organizationId,
      payoutId: input.payoutId,
      planId: payout.planId,
      cycleId: payout.cycleId,
      employeeId: payout.employeeId,
      actorUserId: input.actorUserId,
      action: "hr.bonus.payout.reject",
      summary: trimmedReason ?? "Bonus payout rejected.",
      occurredAt: now,
    });

    return { payoutStatus: "rejected", locked: false };
  }

  if (input.decision === "return") {
    await db
      .update(hrBonusPayouts)
      .set({
        payoutStatus: "returned",
        returnReason: trimmedReason,
        updatedAt: now,
      })
      .where(eq(hrBonusPayouts.id, input.payoutId));

    await appendHrBonusPayoutAuditEventInTx(db, {
      organizationId: input.organizationId,
      payoutId: input.payoutId,
      planId: payout.planId,
      cycleId: payout.cycleId,
      employeeId: payout.employeeId,
      actorUserId: input.actorUserId,
      action: "hr.bonus.payout.return",
      summary: trimmedReason ?? "Bonus payout returned for correction.",
      occurredAt: now,
    });

    return { payoutStatus: "returned", locked: false };
  }

  if (input.decision === "adjust") {
    const adjusted = formatNumeric(input.adjustedAmount!, 2);
    await db
      .update(hrBonusPayouts)
      .set({
        payoutStatus: "draft",
        adjustedAmount: adjusted,
        finalAmount: adjusted,
        adjustmentReason: trimmedReason,
        updatedAt: now,
      })
      .where(eq(hrBonusPayouts.id, input.payoutId));

    await appendHrBonusPayoutAuditEventInTx(db, {
      organizationId: input.organizationId,
      payoutId: input.payoutId,
      planId: payout.planId,
      cycleId: payout.cycleId,
      employeeId: payout.employeeId,
      actorUserId: input.actorUserId,
      action: "hr.bonus.payout.adjust",
      summary: trimmedReason ?? "Bonus payout adjusted.",
      metadata: { adjustedAmount: input.adjustedAmount },
      occurredAt: now,
    });

    return { payoutStatus: "draft", locked: false };
  }

  const pendingSteps = await db
    .select()
    .from(hrBonusPayoutApprovalSteps)
    .where(
      and(
        eq(hrBonusPayoutApprovalSteps.organizationId, input.organizationId),
        eq(hrBonusPayoutApprovalSteps.payoutId, input.payoutId),
        eq(hrBonusPayoutApprovalSteps.stepStatus, "pending"),
      ),
    )
    .orderBy(asc(hrBonusPayoutApprovalSteps.stepOrder));

  const [currentStep] = pendingSteps;
  if (!currentStep) {
    throw new HrBonusCommandError("approval_step_not_found");
  }

  await db
    .update(hrBonusPayoutApprovalSteps)
    .set({
      stepStatus: "approved",
      approverUserId: input.actorUserId,
      decidedAt: now,
      decisionNotes: trimmedReason,
      updatedAt: now,
    })
    .where(eq(hrBonusPayoutApprovalSteps.id, currentStep.id));

  const remaining = pendingSteps.length - 1;
  let payoutStatus = "pending_approval";
  let locked = false;

  if (remaining === 0) {
    payoutStatus = "approved";
    await db
      .update(hrBonusPayouts)
      .set({
        payoutStatus: "approved",
        approvedAt: now,
        approvedByUserId: input.actorUserId,
        updatedAt: now,
      })
      .where(eq(hrBonusPayouts.id, input.payoutId));

    await lockHrBonusPayoutAfterFinalApprovalInTx(db, {
      organizationId: input.organizationId,
      payoutId: input.payoutId,
      actorUserId: input.actorUserId,
      lockedAt: now,
    });
    locked = true;
  }

  await appendHrBonusPayoutAuditEventInTx(db, {
    organizationId: input.organizationId,
    payoutId: input.payoutId,
    planId: payout.planId,
    cycleId: payout.cycleId,
    employeeId: payout.employeeId,
    actorUserId: input.actorUserId,
    action: "hr.bonus.payout.approve",
    summary:
      remaining === 0
        ? "Bonus payout fully approved and locked."
        : `Approval step ${currentStep.approverRole} completed.`,
    metadata: { remainingSteps: remaining },
    occurredAt: now,
  });

  return { payoutStatus: locked ? "locked" : payoutStatus, locked };
}

export async function listHrBonusPayoutsPendingApprovalWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const whereClause = and(
      eq(hrBonusPayouts.organizationId, input.organizationId),
      eq(hrBonusPayouts.payoutStatus, "pending_approval"),
    );

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrBonusPayouts)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrBonusPayouts.id,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        planType: hrBonusPayouts.planType,
        finalAmount: hrBonusPayouts.finalAmount,
        submittedAt: hrBonusPayouts.submittedAt,
        validationFlags: hrBonusPayouts.validationFlags,
      })
      .from(hrBonusPayouts)
      .innerJoin(hrEmployees, eq(hrBonusPayouts.employeeId, hrEmployees.id))
      .where(whereClause)
      .orderBy(desc(hrBonusPayouts.submittedAt))
      .limit(pageSize)
      .offset(offset);

    return buildPaginatedWindow({
      rows: rows.map((row) => ({
        id: row.id,
        employeeLabel: formatEmployeeLabel(row),
        planType: row.planType,
        finalAmount: row.finalAmount,
        submittedAt: row.submittedAt,
        validationFlags: row.validationFlags ?? [],
      })),
      pageSize,
      offset,
      totalCount: Number(totalRow?.total ?? 0),
    });
  });
}

