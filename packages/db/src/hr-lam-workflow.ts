import { and, desc, eq, gte, lte } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { HrLamCommandError } from "./hr-lam";
import type { HrLeaveType } from "./hr-leave-validation";
import { computeLeaveRemainingBalance, parseBalanceAmount } from "./hr-leave-balance";
import { resolveLeaveApprovalRouteFromChain } from "./hr-leave-routing";
import {
  HrLeaveValidationError,
  validateLeaveApplicationRules,
  type HrLeaveBlackoutRow,
  type HrLeaveOverlapRow,
} from "./hr-leave-validation";
import {
  hrEmployees,
  hrLeaveBalanceLedger,
  hrLeaveBalances,
  hrLeaveBlackoutPeriods,
  hrLeavePolicies,
  hrLeaveRequests,
} from "./hr";

const MAX_PAYROLL_EXPORT = 100;

export type HrLeaveDecision =
  | "approve"
  | "reject"
  | "return"
  | "request_clarification";

export type HrUnpaidLeavePayrollRow = {
  requestId: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  startAt: Date;
  endAt: Date;
  durationDays: string;
  payrollDeductionReference: string;
  approvedAt: Date;
};

const ACTIONABLE_STATUSES = new Set([
  "pending",
  "returned",
  "clarification_requested",
]);

const BALANCE_LEAVE_TYPES = new Set<HrLeaveType>([
  "annual",
  "sick",
  "compassionate",
  "other",
]);

function mapValidationToLam(error: unknown): never {
  if (error instanceof HrLeaveValidationError) {
    throw new HrLamCommandError("leave_application_policy_violation", error.message);
  }
  throw error;
}

async function getOrCreateLeavePolicy(
  db: AfendaTransaction,
  organizationId: string,
  policyGroupCode: string,
): Promise<typeof hrLeavePolicies.$inferSelect> {
  const [existing] = await db
    .select()
    .from(hrLeavePolicies)
    .where(
      and(
        eq(hrLeavePolicies.organizationId, organizationId),
        eq(hrLeavePolicies.policyGroupCode, policyGroupCode),
      ),
    )
    .limit(1);

  if (existing) {
    return existing;
  }

  const policyId = createEntityId("hr_lv_pol");
  await db.insert(hrLeavePolicies).values({
    id: policyId,
    organizationId,
    policyGroupCode,
  });

  const [created] = await db
    .select()
    .from(hrLeavePolicies)
    .where(eq(hrLeavePolicies.id, policyId))
    .limit(1);

  if (!created) {
    throw new HrLamCommandError("leave_policy_not_found");
  }
  return created;
}

async function loadBlackoutPeriods(
  db: AfendaTransaction,
  organizationId: string,
): Promise<readonly HrLeaveBlackoutRow[]> {
  const rows = await db
    .select({
      id: hrLeaveBlackoutPeriods.id,
      label: hrLeaveBlackoutPeriods.label,
      startAt: hrLeaveBlackoutPeriods.startAt,
      endAt: hrLeaveBlackoutPeriods.endAt,
      leaveTypes: hrLeaveBlackoutPeriods.leaveTypes,
    })
    .from(hrLeaveBlackoutPeriods)
    .where(eq(hrLeaveBlackoutPeriods.organizationId, organizationId));

  return rows.map((row) => ({
    id: row.id,
    label: row.label,
    startAt: row.startAt,
    endAt: row.endAt,
    leaveTypes: row.leaveTypes,
  }));
}

async function loadOverlappingRequests(
  db: AfendaTransaction,
  organizationId: string,
  employeeId: string,
): Promise<readonly HrLeaveOverlapRow[]> {
  const rows = await db
    .select({
      id: hrLeaveRequests.id,
      status: hrLeaveRequests.status,
      startAt: hrLeaveRequests.startAt,
      endAt: hrLeaveRequests.endAt,
    })
    .from(hrLeaveRequests)
    .where(
      and(
        eq(hrLeaveRequests.organizationId, organizationId),
        eq(hrLeaveRequests.employeeId, employeeId),
      ),
    );

  return rows;
}

async function loadManagerEmployeeChain(
  db: AfendaTransaction,
  organizationId: string,
  employee: Pick<
    typeof hrEmployees.$inferSelect,
    "id" | "managerEmployeeId" | "currentDepartmentId" | "grade"
  >,
  maxDepth: number,
): Promise<readonly string[]> {
  const chain: string[] = [];
  const visited = new Set<string>([employee.id]);
  let cursor = employee.managerEmployeeId;
  let depth = 0;
  const cap = Math.min(Math.max(1, maxDepth), 5);

  while (cursor && depth < cap) {
    if (visited.has(cursor)) {
      break;
    }
    visited.add(cursor);
    const [manager] = await db
      .select({
        id: hrEmployees.id,
        managerEmployeeId: hrEmployees.managerEmployeeId,
      })
      .from(hrEmployees)
      .where(
        and(
          eq(hrEmployees.organizationId, organizationId),
          eq(hrEmployees.id, cursor),
        ),
      )
      .limit(1);
    if (!manager) {
      break;
    }
    chain.push(manager.id);
    cursor = manager.managerEmployeeId;
    depth += 1;
  }

  return chain;
}

export async function validateHrLeaveApplicationPolicy(input: {
  organizationId: string;
  employeeId: string;
  leaveType: HrLeaveType;
  startAt: Date;
  endAt: Date;
  durationDays: string;
  policyGroupCode: string;
  submittedAt?: Date;
  excludeRequestId?: string;
}): Promise<void> {
  const submittedAt = input.submittedAt ?? new Date();
  const durationDays = Number(input.durationDays);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const policy = await getOrCreateLeavePolicy(
      db,
      input.organizationId,
      input.policyGroupCode,
    );
    const blackoutPeriods = await loadBlackoutPeriods(db, input.organizationId);
    const overlapping = await loadOverlappingRequests(
      db,
      input.organizationId,
      input.employeeId,
    );

    try {
      validateLeaveApplicationRules({
        candidate: {
          employeeId: input.employeeId,
          leaveType: input.leaveType,
          startAt: input.startAt,
          endAt: input.endAt,
          durationDays,
        },
        policy: {
          minNoticeDays: policy.minNoticeDays,
          maxConsecutiveDays: policy.maxConsecutiveDays,
        },
        submittedAt,
        blackoutPeriods,
        overlappingRequests: overlapping,
        excludeRequestId: input.excludeRequestId,
      });
    } catch (error) {
      mapValidationToLam(error);
    }
  });
}

export async function resolveHrLeaveApprovalRouteForEmployee(input: {
  organizationId: string;
  employeeId: string;
  leaveType: HrLeaveType;
  durationDays: string;
  policyGroupCode: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [employee] = await db
      .select({
        id: hrEmployees.id,
        currentDepartmentId: hrEmployees.currentDepartmentId,
        grade: hrEmployees.grade,
        managerEmployeeId: hrEmployees.managerEmployeeId,
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
      throw new HrLamCommandError("employee_not_found");
    }

    const policy = await getOrCreateLeavePolicy(
      db,
      input.organizationId,
      input.policyGroupCode,
    );
    const managerEmployeeIds = await loadManagerEmployeeChain(
      db,
      input.organizationId,
      employee,
      policy.managerChainMaxDepth,
    );

    return resolveLeaveApprovalRouteFromChain({
      employee: {
        employeeId: employee.id,
        departmentId: employee.currentDepartmentId,
        grade: employee.grade,
        managerEmployeeId: employee.managerEmployeeId,
      },
      leaveType: input.leaveType,
      durationDays: Number(input.durationDays),
      policy: {
        requireHrApprovalWhenDaysGte: policy.requireHrApprovalWhenDaysGte,
        requireHrApprovalLeaveTypes:
          (policy.requireHrApprovalLeaveTypes as string[]) ?? [],
        managerChainMaxDepth: policy.managerChainMaxDepth,
      },
      managerEmployeeIds,
    });
  });
}

function buildPayrollDeductionReference(requestId: string): string {
  return `hr-leave-unpaid:${requestId}`;
}

async function appendLedger(
  tx: AfendaTransaction,
  input: {
    organizationId: string;
    balanceId: string;
    kind: (typeof hrLeaveBalanceLedger.$inferInsert)["kind"];
    amountDays: string;
    reason: string;
    leaveRequestId?: string;
    authorizedByAuthUserId?: string;
  },
): Promise<void> {
  await tx.insert(hrLeaveBalanceLedger).values({
    id: createEntityId("hr_lv_ledger"),
    organizationId: input.organizationId,
    balanceId: input.balanceId,
    leaveRequestId: input.leaveRequestId ?? null,
    kind: input.kind,
    amountDays: input.amountDays,
    reason: input.reason,
    authorizedByAuthUserId: input.authorizedByAuthUserId ?? null,
  });
}

async function releasePendingForRequest(
  tx: AfendaTransaction,
  request: typeof hrLeaveRequests.$inferSelect,
): Promise<void> {
  if (!BALANCE_LEAVE_TYPES.has(request.leaveType)) {
    return;
  }

  const [balance] = await tx
    .select()
    .from(hrLeaveBalances)
    .where(
      and(
        eq(hrLeaveBalances.organizationId, request.organizationId),
        eq(hrLeaveBalances.employeeId, request.employeeId),
        eq(hrLeaveBalances.leaveType, request.leaveType),
        eq(hrLeaveBalances.entitlementYear, request.entitlementYear),
      ),
    )
    .limit(1);

  if (!balance) {
    return;
  }

  const nextPending = (
    Number(balance.pendingDays) - Number(request.durationDays)
  ).toFixed(2);

  await tx
    .update(hrLeaveBalances)
    .set({ pendingDays: nextPending })
    .where(eq(hrLeaveBalances.id, balance.id));

  await appendLedger(tx, {
    organizationId: request.organizationId,
    balanceId: balance.id,
    kind: "pending_release",
    amountDays: request.durationDays,
    reason: `Release pending for request ${request.id}`,
    leaveRequestId: request.id,
  });
}

async function finalizeApprovedRequest(
  tx: AfendaTransaction,
  request: typeof hrLeaveRequests.$inferSelect,
): Promise<void> {
  if (!BALANCE_LEAVE_TYPES.has(request.leaveType)) {
    return;
  }

  const [balance] = await tx
    .select()
    .from(hrLeaveBalances)
    .where(
      and(
        eq(hrLeaveBalances.organizationId, request.organizationId),
        eq(hrLeaveBalances.employeeId, request.employeeId),
        eq(hrLeaveBalances.leaveType, request.leaveType),
        eq(hrLeaveBalances.entitlementYear, request.entitlementYear),
      ),
    )
    .limit(1);

  if (!balance) {
    throw new HrLamCommandError("insufficient_leave_balance");
  }

  const nextPending = (
    Number(balance.pendingDays) - Number(request.durationDays)
  ).toFixed(2);
  const nextUsed = (
    Number(balance.usedDays) + Number(request.durationDays)
  ).toFixed(2);

  await tx
    .update(hrLeaveBalances)
    .set({ pendingDays: nextPending, usedDays: nextUsed })
    .where(eq(hrLeaveBalances.id, balance.id));

  await appendLedger(tx, {
    organizationId: request.organizationId,
    balanceId: balance.id,
    kind: "used",
    amountDays: request.durationDays,
    reason: `Approved leave request ${request.id}`,
    leaveRequestId: request.id,
  });
}

async function reverseApprovedRequest(
  tx: AfendaTransaction,
  request: typeof hrLeaveRequests.$inferSelect,
): Promise<void> {
  if (!BALANCE_LEAVE_TYPES.has(request.leaveType)) {
    return;
  }

  const [balance] = await tx
    .select()
    .from(hrLeaveBalances)
    .where(
      and(
        eq(hrLeaveBalances.organizationId, request.organizationId),
        eq(hrLeaveBalances.employeeId, request.employeeId),
        eq(hrLeaveBalances.leaveType, request.leaveType),
        eq(hrLeaveBalances.entitlementYear, request.entitlementYear),
      ),
    )
    .limit(1);

  if (!balance) {
    return;
  }

  const nextUsed = (
    Number(balance.usedDays) - Number(request.durationDays)
  ).toFixed(2);

  await tx
    .update(hrLeaveBalances)
    .set({ usedDays: nextUsed })
    .where(eq(hrLeaveBalances.id, balance.id));

  await appendLedger(tx, {
    organizationId: request.organizationId,
    balanceId: balance.id,
    kind: "reversal",
    amountDays: request.durationDays,
    reason: `Reversal for cancelled request ${request.id}`,
    leaveRequestId: request.id,
  });
}

function assertApproverAuthorized(input: {
  request: typeof hrLeaveRequests.$inferSelect;
  actorCanHrApprove: boolean;
  actorManagerEmployeeIds: readonly string[];
}): void {
  if (input.request.approvalStage === "hr") {
    if (!input.actorCanHrApprove) {
      throw new HrLamCommandError("unauthorized_approver");
    }
    return;
  }
  if (input.request.approvalStage === "manager") {
    const snapshot = input.request.policySnapshot as
      | { route?: { managerEmployeeIds?: readonly string[] } }
      | null;
    const managerIds = snapshot?.route?.managerEmployeeIds ?? [];
    const allowed = input.actorManagerEmployeeIds.some((id) =>
      managerIds.includes(id),
    );
    if (!allowed && !input.actorCanHrApprove) {
      throw new HrLamCommandError("unauthorized_approver");
    }
    return;
  }
  if (!input.actorCanHrApprove) {
    throw new HrLamCommandError("unauthorized_approver");
  }
}

export async function decideHrLeaveApplication(input: {
  organizationId: string;
  requestId: string;
  decision: HrLeaveDecision;
  actorAuthUserId: string;
  actorCanHrApprove: boolean;
  actorManagerEmployeeIds?: readonly string[];
  rejectionReason?: string | null;
  decisionNote?: string | null;
  returnedNote?: string | null;
  clarificationNote?: string | null;
}): Promise<{ requestId: string; status: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [request] = await db
      .select()
      .from(hrLeaveRequests)
      .where(
        and(
          eq(hrLeaveRequests.organizationId, input.organizationId),
          eq(hrLeaveRequests.id, input.requestId),
        ),
      )
      .limit(1);

    if (!request) {
      throw new HrLamCommandError("request_not_found");
    }
    if (!ACTIONABLE_STATUSES.has(request.status)) {
      throw new HrLamCommandError("request_not_actionable");
    }

    if (input.decision === "reject") {
      const reason = input.rejectionReason?.trim();
      if (!reason) {
        throw new HrLamCommandError("rejection_reason_required");
      }

      await db.transaction(async (tx) => {
        await releasePendingForRequest(tx, request);
        await tx
          .update(hrLeaveRequests)
          .set({
            status: "rejected",
            approvalStage: "complete",
            rejectionReason: reason,
            decisionNote: input.decisionNote?.trim() || null,
            currentApproverAuthUserId: null,
            decidedAt: new Date(),
          })
          .where(eq(hrLeaveRequests.id, input.requestId));
      });

      return { requestId: input.requestId, status: "rejected" };
    }

    if (input.decision === "return") {
      await db
        .update(hrLeaveRequests)
        .set({
          status: "returned",
          returnedNote:
            input.returnedNote?.trim() || input.decisionNote?.trim() || null,
          currentApproverAuthUserId: null,
        })
        .where(eq(hrLeaveRequests.id, input.requestId));
      return { requestId: input.requestId, status: "returned" };
    }

    if (input.decision === "request_clarification") {
      await db
        .update(hrLeaveRequests)
        .set({
          status: "clarification_requested",
          clarificationNote:
            input.clarificationNote?.trim() ||
            input.decisionNote?.trim() ||
            null,
          currentApproverAuthUserId: null,
        })
        .where(eq(hrLeaveRequests.id, input.requestId));
      return { requestId: input.requestId, status: "clarification_requested" };
    }

    assertApproverAuthorized({
      request,
      actorCanHrApprove: input.actorCanHrApprove,
      actorManagerEmployeeIds: input.actorManagerEmployeeIds ?? [],
    });

    const snapshot = request.policySnapshot as
      | {
          route?: {
            requiresHrStage?: boolean;
            managerEmployeeIds?: readonly string[];
          };
        }
      | null;
    const requiresHrStage = snapshot?.route?.requiresHrStage === true;

    if (request.approvalStage === "manager" && requiresHrStage) {
      await db
        .update(hrLeaveRequests)
        .set({
          approvalStage: "hr",
          decisionNote: input.decisionNote?.trim() || null,
        })
        .where(eq(hrLeaveRequests.id, input.requestId));
      return { requestId: input.requestId, status: "pending" };
    }

    const payrollRef =
      request.leaveType === "unpaid"
        ? buildPayrollDeductionReference(request.id)
        : null;

    await db.transaction(async (tx) => {
      await finalizeApprovedRequest(tx, request);
      await tx
        .update(hrLeaveRequests)
        .set({
          status: "approved",
          approvalStage: "complete",
          decisionNote: input.decisionNote?.trim() || null,
          payrollDeductionReference: payrollRef,
          currentApproverAuthUserId: null,
          decidedAt: new Date(),
        })
        .where(eq(hrLeaveRequests.id, input.requestId));
    });

    return { requestId: input.requestId, status: "approved" };
  });
}

export async function cancelHrLeaveApplication(input: {
  organizationId: string;
  requestId: string;
}): Promise<{ requestId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [request] = await db
      .select()
      .from(hrLeaveRequests)
      .where(
        and(
          eq(hrLeaveRequests.organizationId, input.organizationId),
          eq(hrLeaveRequests.id, input.requestId),
        ),
      )
      .limit(1);

    if (!request) {
      throw new HrLamCommandError("request_not_found");
    }

    const policy = await getOrCreateLeavePolicy(
      db,
      input.organizationId,
      request.policyGroupCode,
    );

    if (request.status === "pending" || ACTIONABLE_STATUSES.has(request.status)) {
      if (!policy.allowCancellationWhilePending) {
        throw new HrLamCommandError("cancellation_not_allowed");
      }
      await db.transaction(async (tx) => {
        await releasePendingForRequest(tx, request);
        await tx
          .update(hrLeaveRequests)
          .set({
            status: "cancelled",
            approvalStage: "complete",
            decidedAt: new Date(),
          })
          .where(eq(hrLeaveRequests.id, input.requestId));
      });
      return { requestId: input.requestId };
    }

    if (request.status === "approved") {
      if (!policy.allowAmendmentAfterApproval) {
        throw new HrLamCommandError("cancellation_not_allowed");
      }
      await db.transaction(async (tx) => {
        await reverseApprovedRequest(tx, request);
        await tx
          .update(hrLeaveRequests)
          .set({
            status: "cancelled",
            approvalStage: "complete",
            decidedAt: new Date(),
          })
          .where(eq(hrLeaveRequests.id, input.requestId));
      });
      return { requestId: input.requestId };
    }

    throw new HrLamCommandError("request_not_actionable");
  });
}

export async function amendHrLeaveApplication(input: {
  organizationId: string;
  requestId: string;
  startAt: Date;
  endAt: Date;
  reason?: string | null;
  supportingDocumentId?: string | null;
}): Promise<{ requestId: string; amendmentRequestId: string }> {
  const original = await runWithOrganizationContext(
    input.organizationId,
    async (db) => {
      const [request] = await db
        .select()
        .from(hrLeaveRequests)
        .where(
          and(
            eq(hrLeaveRequests.organizationId, input.organizationId),
            eq(hrLeaveRequests.id, input.requestId),
          ),
        )
        .limit(1);

      if (!request) {
        throw new HrLamCommandError("request_not_found");
      }

      const policy = await getOrCreateLeavePolicy(
        db,
        input.organizationId,
        request.policyGroupCode,
      );

      if (request.status === "approved" && !policy.allowAmendmentAfterApproval) {
        throw new HrLamCommandError("amendment_not_allowed");
      }

      if (request.status === "approved") {
        await db.transaction(async (tx) => {
          await reverseApprovedRequest(tx, request);
          await tx
            .update(hrLeaveRequests)
            .set({
              status: "cancelled",
              approvalStage: "complete",
              decidedAt: new Date(),
            })
            .where(eq(hrLeaveRequests.id, input.requestId));
        });
      } else if (ACTIONABLE_STATUSES.has(request.status)) {
        await db.transaction(async (tx) => {
          await releasePendingForRequest(tx, request);
          await tx
            .update(hrLeaveRequests)
            .set({
              status: "cancelled",
              approvalStage: "complete",
              decidedAt: new Date(),
            })
            .where(eq(hrLeaveRequests.id, input.requestId));
        });
      } else {
        throw new HrLamCommandError("amendment_not_allowed");
      }

      return {
        employeeId: request.employeeId,
        leaveType: request.leaveType,
        policyGroupCode: request.policyGroupCode,
        supportingDocumentId: request.supportingDocumentId,
      };
    },
  );

  const { submitHrLeaveApplication } = await import("./hr-lam");
  const submitted = await submitHrLeaveApplication({
    organizationId: input.organizationId,
    employeeId: original.employeeId,
    leaveType: original.leaveType,
    startAt: input.startAt,
    endAt: input.endAt,
    reason: input.reason,
    supportingDocumentId:
      input.supportingDocumentId ?? original.supportingDocumentId,
    policyGroupCode: original.policyGroupCode,
  });

  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .update(hrLeaveRequests)
      .set({ amendmentOfRequestId: input.requestId })
      .where(eq(hrLeaveRequests.id, submitted.requestId));
  });

  return {
    requestId: input.requestId,
    amendmentRequestId: submitted.requestId,
  };
}

export async function adjustHrLeaveBalanceManual(input: {
  organizationId: string;
  employeeId: string;
  leaveType: HrLeaveType;
  entitlementYear: number;
  adjustmentDays: number;
  reason: string;
  authorizedByAuthUserId: string;
  policyGroupCode?: string;
}): Promise<{ balanceId: string }> {
  const trimmedReason = input.reason.trim();
  if (!trimmedReason) {
    throw new HrLamCommandError("adjustment_reason_required");
  }

  const { ensureHrLeaveBalance } = await import("./hr-lam");

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const { balanceId } = await ensureHrLeaveBalance({
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      leaveType: input.leaveType,
      entitlementYear: input.entitlementYear,
      policyGroupCode: input.policyGroupCode,
    });

    const [balance] = await db
      .select()
      .from(hrLeaveBalances)
      .where(eq(hrLeaveBalances.id, balanceId))
      .limit(1);

    if (!balance) {
      throw new HrLamCommandError("insufficient_leave_balance");
    }

    const nextAdjusted = (
      Number(balance.adjustedDays) + input.adjustmentDays
    ).toFixed(2);

    await db
      .update(hrLeaveBalances)
      .set({ adjustedDays: nextAdjusted })
      .where(eq(hrLeaveBalances.id, balanceId));

    await appendLedger(db, {
      organizationId: input.organizationId,
      balanceId,
      kind: "manual_correction",
      amountDays: Math.abs(input.adjustmentDays).toFixed(2),
      reason: trimmedReason,
      authorizedByAuthUserId: input.authorizedByAuthUserId,
    });

    return { balanceId };
  });
}

export async function processHrLeaveCarryForwardForYear(input: {
  organizationId: string;
  fromYear: number;
  toYear: number;
  policyGroupCode?: string;
}): Promise<{ processed: number }> {
  const policyGroupCode = input.policyGroupCode ?? "default";

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const policy = await getOrCreateLeavePolicy(
      db,
      input.organizationId,
      policyGroupCode,
    );
    if (!policy.carryForwardEnabled) {
      return { processed: 0 };
    }

    const balances = await db
      .select()
      .from(hrLeaveBalances)
      .where(
        and(
          eq(hrLeaveBalances.organizationId, input.organizationId),
          eq(hrLeaveBalances.entitlementYear, input.fromYear),
        ),
      );

    let processed = 0;
    const maxCarry =
      policy.maxCarryForwardDays !== null
        ? Number(policy.maxCarryForwardDays)
        : null;

    for (const balance of balances) {
      const remaining = computeLeaveRemainingBalance({
        openingDays: parseBalanceAmount(balance.openingDays),
        earnedDays: parseBalanceAmount(balance.earnedDays),
        usedDays: parseBalanceAmount(balance.usedDays),
        pendingDays: parseBalanceAmount(balance.pendingDays),
        adjustedDays: parseBalanceAmount(balance.adjustedDays),
        forfeitedDays: parseBalanceAmount(balance.forfeitedDays),
        carriedForwardDays: parseBalanceAmount(balance.carriedForwardDays),
      });

      if (remaining <= 0) {
        continue;
      }

      const carryDays = maxCarry !== null ? Math.min(remaining, maxCarry) : remaining;
      const forfeitDays = remaining - carryDays;

      await db.transaction(async (tx) => {
        if (forfeitDays > 0 && policy.forfeitureAtYearEnd) {
          const nextForfeited = (
            Number(balance.forfeitedDays) + forfeitDays
          ).toFixed(2);
          await tx
            .update(hrLeaveBalances)
            .set({ forfeitedDays: nextForfeited })
            .where(eq(hrLeaveBalances.id, balance.id));
          await appendLedger(tx, {
            organizationId: input.organizationId,
            balanceId: balance.id,
            kind: "forfeiture",
            amountDays: forfeitDays.toFixed(2),
            reason: `Year-end forfeiture ${input.fromYear}`,
          });
        }

        if (carryDays > 0) {
          const { ensureHrLeaveBalance } = await import("./hr-lam");
          const { balanceId: nextBalanceId } = await ensureHrLeaveBalance({
            organizationId: input.organizationId,
            employeeId: balance.employeeId,
            leaveType: balance.leaveType,
            entitlementYear: input.toYear,
            policyGroupCode,
          });

          const [nextBalance] = await tx
            .select()
            .from(hrLeaveBalances)
            .where(eq(hrLeaveBalances.id, nextBalanceId))
            .limit(1);

          if (nextBalance) {
            const nextOpening = (
              Number(nextBalance.openingDays) + carryDays
            ).toFixed(2);
            await tx
              .update(hrLeaveBalances)
              .set({ openingDays: nextOpening })
              .where(eq(hrLeaveBalances.id, nextBalanceId));
            await appendLedger(tx, {
              organizationId: input.organizationId,
              balanceId: nextBalanceId,
              kind: "carry_forward",
              amountDays: carryDays.toFixed(2),
              reason: `Carry forward from ${input.fromYear}`,
            });
          }
        }
      });

      processed += 1;
    }

    return { processed };
  });
}

export async function listHrUnpaidLeavePayrollDeductionRefs(input: {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  limit?: number;
}): Promise<readonly HrUnpaidLeavePayrollRow[]> {
  const pageSize = Math.min(input.limit ?? MAX_PAYROLL_EXPORT, MAX_PAYROLL_EXPORT);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        requestId: hrLeaveRequests.id,
        employeeId: hrLeaveRequests.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        startAt: hrLeaveRequests.startAt,
        endAt: hrLeaveRequests.endAt,
        durationDays: hrLeaveRequests.durationDays,
        payrollDeductionReference: hrLeaveRequests.payrollDeductionReference,
        decidedAt: hrLeaveRequests.decidedAt,
      })
      .from(hrLeaveRequests)
      .innerJoin(hrEmployees, eq(hrLeaveRequests.employeeId, hrEmployees.id))
      .where(
        and(
          eq(hrLeaveRequests.organizationId, input.organizationId),
          eq(hrLeaveRequests.leaveType, "unpaid"),
          eq(hrLeaveRequests.status, "approved"),
          gte(hrLeaveRequests.startAt, input.periodStart),
          lte(hrLeaveRequests.endAt, input.periodEnd),
        ),
      )
      .orderBy(desc(hrLeaveRequests.decidedAt))
      .limit(pageSize);

    return rows
      .filter((row) => row.payrollDeductionReference && row.decidedAt)
      .map((row) => ({
        requestId: row.requestId,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName?.trim() || row.legalName,
        startAt: row.startAt,
        endAt: row.endAt,
        durationDays: row.durationDays,
        payrollDeductionReference: row.payrollDeductionReference!,
        approvedAt: row.decidedAt!,
      }));
  });
}
