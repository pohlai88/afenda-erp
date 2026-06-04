import { and, eq } from "drizzle-orm";

import { runWithOrganizationContext } from "./client";
import { createEntityId } from "./ids";
import {
  appendHrExpenseAuditEvent,
  getHrExpenseClaimById,
  hasOpenHrExpenseExceptions,
  HrExpCommandError,
} from "./hr-exp";
import {
  assertExpClaimStatusTransition,
  HRM_EXP_ACTIONABLE_STATUSES,
} from "./hr-exp.shared";
import {
  assertExpDecisionReason,
  nextExpStageAfterApproval,
  pickHighestPriorityExpApprovalRoute,
  resolveExpApprovalRouteFromChain,
  type HrExpenseApprovalSnapshot,
  type HrExpenseApprovalStage,
  type HrExpenseApprovalRouteRow,
  type HrExpenseDecisionKind,
  type HrExpenseResolvedApprovalRoute,
  type HrExpenseRoutingClaimContext,
  type HrExpenseRoutingEmployeeContext,
  type HrExpenseRoutingPolicy,
} from "./hr-exp-approval.shared";
import {
  hrDepartments,
  hrEmployees,
  hrPositions,
} from "./hr";
import {
  hrExpenseApprovalRoutes,
  hrExpenseApprovals,
  hrExpenseClaims,
  hrExpenseExceptions,
  hrExpensePolicies,
} from "./dbx-hr-expense";

export type DecideHrExpenseClaimInput = {
  organizationId: string;
  claimId: string;
  decision: HrExpenseDecisionKind;
  actorAuthUserId: string;
  actorCanFinanceApprove: boolean;
  actorCanHrApprove: boolean;
  actorManagerEmployeeIds?: readonly string[];
  rejectionReason?: string | null;
  returnReason?: string | null;
  clarificationReason?: string | null;
  decisionNote?: string | null;
  financePoolAuthUserIds?: readonly string[];
  hrPoolAuthUserIds?: readonly string[];
};

export type DecideHrExpenseExceptionInput = {
  organizationId: string;
  exceptionId: string;
  decision: "approve" | "reject";
  actorAuthUserId: string;
  reason?: string | null;
};

const ACTIONABLE_STATUSES = new Set(HRM_EXP_ACTIONABLE_STATUSES);

async function loadHrExpenseApprovalState(input: {
  organizationId: string;
  claimId: string;
}): Promise<{
  snapshot: HrExpenseApprovalSnapshot;
  approvalStage: HrExpenseApprovalStage;
} | null> {
  const rows = await runWithOrganizationContext(input.organizationId, async (db) =>
    db
      .select({ snapshot: hrExpenseApprovals.snapshot })
      .from(hrExpenseApprovals)
      .where(
        and(
          eq(hrExpenseApprovals.organizationId, input.organizationId),
          eq(hrExpenseApprovals.claimId, input.claimId),
        ),
      )
      .limit(1),
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  const snapshot = readApprovalSnapshot(row.snapshot as Record<string, unknown>);
  return { snapshot, approvalStage: snapshot.approvalStage };
}

async function updateHrExpenseApprovalSnapshot(input: {
  organizationId: string;
  claimId: string;
  snapshot: HrExpenseApprovalSnapshot;
  status?: (typeof hrExpenseApprovals.$inferSelect)["status"];
  decidedByAuthUserId?: string | null;
  decidedAt?: Date;
}): Promise<void> {
  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .update(hrExpenseApprovals)
      .set({
        snapshot: input.snapshot as unknown as Record<string, unknown>,
        ...(input.status ? { status: input.status } : {}),
        ...(input.decidedByAuthUserId !== undefined
          ? { decidedByAuthUserId: input.decidedByAuthUserId }
          : {}),
        ...(input.decidedAt ? { decidedAt: input.decidedAt } : {}),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(hrExpenseApprovals.organizationId, input.organizationId),
          eq(hrExpenseApprovals.claimId, input.claimId),
        ),
      );
  });
}

function readApprovalSnapshot(
  value: Record<string, unknown> | null | undefined,
): HrExpenseApprovalSnapshot {
  const stage = value?.approvalStage;
  return {
    approvalStage:
      stage === "manager" ||
      stage === "finance" ||
      stage === "hr" ||
      stage === "exception" ||
      stage === "complete"
        ? stage
        : "manager",
    routingRuleId:
      typeof value?.routingRuleId === "string" ? value.routingRuleId : null,
    routingApproverKind:
      typeof value?.routingApproverKind === "string"
        ? (value.routingApproverKind as HrExpenseApprovalSnapshot["routingApproverKind"])
        : null,
    managerEmployeeIds: Array.isArray(value?.managerEmployeeIds)
      ? value.managerEmployeeIds.filter(
          (id): id is string => typeof id === "string",
        )
      : [],
    requiresFinanceSecondApproval: value?.requiresFinanceSecondApproval === true,
    requiresHrSecondApproval: value?.requiresHrSecondApproval === true,
  };
}

function assertExpApproverAuthorized(input: {
  approvalStage: HrExpenseApprovalStage;
  snapshot: HrExpenseApprovalSnapshot;
  actorCanFinanceApprove: boolean;
  actorCanHrApprove: boolean;
  actorManagerEmployeeIds: readonly string[];
}): void {
  if (input.approvalStage === "finance") {
    if (!input.actorCanFinanceApprove && !input.actorCanHrApprove) {
      throw new HrExpCommandError("unauthorized_approver");
    }
    return;
  }
  if (input.approvalStage === "hr" || input.approvalStage === "exception") {
    if (!input.actorCanHrApprove) {
      throw new HrExpCommandError("unauthorized_approver");
    }
    return;
  }
  if (input.approvalStage === "manager") {
    const allowed = input.actorManagerEmployeeIds.some((id) =>
      input.snapshot.managerEmployeeIds.includes(id),
    );
    if (!allowed && !input.actorCanHrApprove && !input.actorCanFinanceApprove) {
      throw new HrExpCommandError("unauthorized_approver");
    }
  }
}

async function loadExpPolicy(
  organizationId: string,
  policyGroupCode: string,
): Promise<HrExpenseRoutingPolicy> {
  return runWithOrganizationContext(organizationId, async (db) => {
    const [policy] = await db
      .select()
      .from(hrExpensePolicies)
      .where(
        and(
          eq(hrExpensePolicies.organizationId, organizationId),
          eq(hrExpensePolicies.policyGroupCode, policyGroupCode),
        ),
      )
      .limit(1);

    return {
      requireFinanceSecondApproval: policy?.requireFinanceSecondApproval ?? true,
      requireHrSecondApproval: policy?.requireHrSecondApproval ?? false,
      managerChainMaxDepth: policy?.managerChainMaxDepth ?? 3,
    };
  });
}

async function listExpApprovalRoutes(
  organizationId: string,
  policyGroupCode: string,
): Promise<readonly HrExpenseApprovalRouteRow[]> {
  return runWithOrganizationContext(organizationId, async (db) => {
    const rows = await db
      .select()
      .from(hrExpenseApprovalRoutes)
      .where(
        and(
          eq(hrExpenseApprovalRoutes.organizationId, organizationId),
          eq(hrExpenseApprovalRoutes.policyGroupCode, policyGroupCode),
        ),
      );
    return rows.map((row) => ({
      id: row.id,
      policyGroupCode: row.policyGroupCode,
      name: row.name,
      priority: row.priority,
      departmentId: row.departmentId,
      costCenterCode: row.costCenterCode,
      legalEntityCode: row.legalEntityCode,
      categoryCode: row.categoryCode,
      projectCode: row.projectCode,
      minAmountCents: row.minAmountCents,
      maxAmountCents: row.maxAmountCents,
      requiresPolicyException: row.requiresPolicyException,
      approverKind: row.approverKind,
      specificApproverAuthUserId: row.specificApproverAuthUserId,
      managerChainMaxDepth: row.managerChainMaxDepth,
      active: row.active,
      effectiveFrom: row.effectiveFrom,
      effectiveTo: row.effectiveTo,
    }));
  });
}

async function loadEmployeeRoutingContext(input: {
  organizationId: string;
  employeeId: string;
}): Promise<HrExpenseRoutingEmployeeContext> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select({
        id: hrEmployees.id,
        currentDepartmentId: hrEmployees.currentDepartmentId,
        legalEntityCode: hrEmployees.legalEntityCode,
        managerEmployeeId: hrEmployees.managerEmployeeId,
        hrOwnerEmployeeId: hrEmployees.hrOwnerEmployeeId,
        departmentCostCenter: hrDepartments.costCenterCode,
        positionCostCenter: hrPositions.costCenterCode,
        departmentHeadEmployeeId: hrDepartments.managerEmployeeId,
      })
      .from(hrEmployees)
      .leftJoin(
        hrDepartments,
        eq(hrEmployees.currentDepartmentId, hrDepartments.id),
      )
      .leftJoin(hrPositions, eq(hrEmployees.currentPositionId, hrPositions.id))
      .where(
        and(
          eq(hrEmployees.organizationId, input.organizationId),
          eq(hrEmployees.id, input.employeeId),
        ),
      )
      .limit(1);

    if (!row) {
      throw new HrExpCommandError("claim_not_found");
    }

    return {
      employeeId: row.id,
      departmentId: row.currentDepartmentId,
      costCenterCode:
        row.departmentCostCenter ?? row.positionCostCenter ?? null,
      legalEntityCode: row.legalEntityCode,
      managerEmployeeId: row.managerEmployeeId,
      departmentHeadEmployeeId: row.departmentHeadEmployeeId,
      hrOwnerEmployeeId: row.hrOwnerEmployeeId,
    };
  });
}

export async function resolveExpApprovalRouteForClaim(input: {
  organizationId: string;
  employeeId: string;
  policyGroupCode: string;
  categoryCode: string;
  projectCode?: string | null;
  amountCents: number;
  hasOpenPolicyException?: boolean;
  asOf?: Date;
}): Promise<HrExpenseResolvedApprovalRoute> {
  const employee = await loadEmployeeRoutingContext({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
  });
  const policy = await loadExpPolicy(
    input.organizationId,
    input.policyGroupCode,
  );
  const routes = await listExpApprovalRoutes(
    input.organizationId,
    input.policyGroupCode,
  );
  const asOf = input.asOf ?? new Date();
  const claim: HrExpenseRoutingClaimContext = {
    policyGroupCode: input.policyGroupCode,
    categoryCode: input.categoryCode,
    projectCode: input.projectCode ?? null,
    amountCents: input.amountCents,
    hasOpenPolicyException: input.hasOpenPolicyException ?? false,
    asOf,
  };
  const matchedRoute = pickHighestPriorityExpApprovalRoute({
    routes,
    employee,
    claim,
  });

  const managerEmployeeIds = await runWithOrganizationContext(
    input.organizationId,
    async (db) => {
      const chain: string[] = [];
      const visited = new Set<string>([employee.employeeId]);
      let cursor = employee.managerEmployeeId;
      let depth = 0;
      const cap = Math.min(Math.max(1, policy.managerChainMaxDepth), 5);

      while (cursor && depth < cap) {
        if (visited.has(cursor)) break;
        visited.add(cursor);
        chain.push(cursor);
        const [manager] = await db
          .select({ managerEmployeeId: hrEmployees.managerEmployeeId })
          .from(hrEmployees)
          .where(
            and(
              eq(hrEmployees.organizationId, input.organizationId),
              eq(hrEmployees.id, cursor),
            ),
          )
          .limit(1);
        cursor = manager?.managerEmployeeId ?? null;
        depth += 1;
      }
      return chain;
    },
  );

  return resolveExpApprovalRouteFromChain({
    employee,
    claim,
    policy,
    managerEmployeeIds,
    matchedRoute,
  });
}

async function executeHrExpenseClaimApproval(input: {
  organizationId: string;
  claimId: string;
  actorAuthUserId: string;
  decisionNote?: string | null;
}): Promise<{ claimId: string; status: string }> {
  const claim = await getHrExpenseClaimById({
    organizationId: input.organizationId,
    claimId: input.claimId,
  });
  if (!claim) {
    throw new HrExpCommandError("claim_not_found");
  }

  if (
    await hasOpenHrExpenseExceptions({
      organizationId: input.organizationId,
      claimId: input.claimId,
    })
  ) {
    throw new HrExpCommandError("open_exceptions_block_approval");
  }

  assertExpClaimStatusTransition(claim.claimStatus, "approved");

  await runWithOrganizationContext(input.organizationId, async (db) => {
    const decidedAt = new Date();
    await db
      .update(hrExpenseClaims)
      .set({
        claimStatus: "approved",
        approvedAt: decidedAt,
        approvedByUserId: input.actorAuthUserId,
        updatedAt: decidedAt,
      })
      .where(eq(hrExpenseClaims.id, input.claimId));

    await db
      .update(hrExpenseApprovals)
      .set({
        status: "approved",
        decidedByAuthUserId: input.actorAuthUserId,
        decidedAt,
        updatedAt: decidedAt,
      })
      .where(
        and(
          eq(hrExpenseApprovals.organizationId, input.organizationId),
          eq(hrExpenseApprovals.claimId, input.claimId),
        ),
      );
  });

  await appendHrExpenseAuditEvent({
    organizationId: input.organizationId,
    claimId: input.claimId,
    employeeId: claim.employeeId,
    action: "claim_approve",
    actorUserId: input.actorAuthUserId,
    summary: "Expense claim approved",
    metadata: input.decisionNote
      ? { decisionNote: input.decisionNote.trim() }
      : undefined,
  });

  return { claimId: input.claimId, status: "approved" };
}

/** HRM-EXP-018/019 — approve, reject, return, or request clarification. */
export async function decideHrExpenseClaim(
  input: DecideHrExpenseClaimInput,
): Promise<{ claimId: string; status: string }> {
  const claim = await getHrExpenseClaimById({
    organizationId: input.organizationId,
    claimId: input.claimId,
  });
  if (!claim) {
    throw new HrExpCommandError("claim_not_found");
  }
  if (!ACTIONABLE_STATUSES.has(claim.claimStatus as (typeof HRM_EXP_ACTIONABLE_STATUSES)[number])) {
    throw new HrExpCommandError("claim_not_actionable");
  }

  const approvalState = await loadHrExpenseApprovalState({
    organizationId: input.organizationId,
    claimId: input.claimId,
  });
  const snapshot = approvalState?.snapshot ?? readApprovalSnapshot(undefined);
  const approvalStage = approvalState?.approvalStage ?? snapshot.approvalStage;

  assertExpApproverAuthorized({
    approvalStage,
    snapshot,
    actorCanFinanceApprove: input.actorCanFinanceApprove,
    actorCanHrApprove: input.actorCanHrApprove,
    actorManagerEmployeeIds: input.actorManagerEmployeeIds ?? [],
  });

  if (input.decision === "reject") {
    try {
      assertExpDecisionReason({
        decision: "reject",
        reason: input.rejectionReason,
      });
    } catch {
      throw new HrExpCommandError("rejection_reason_required");
    }

    assertExpClaimStatusTransition(claim.claimStatus, "rejected");

    await runWithOrganizationContext(input.organizationId, async (db) => {
      const decidedAt = new Date();
      await db
        .update(hrExpenseClaims)
        .set({
          claimStatus: "rejected",
          rejectionReason: input.rejectionReason?.trim() || null,
          updatedAt: decidedAt,
        })
        .where(eq(hrExpenseClaims.id, input.claimId));

      await db
        .update(hrExpenseApprovals)
        .set({
          status: "rejected",
          decidedByAuthUserId: input.actorAuthUserId,
          decidedAt,
          updatedAt: decidedAt,
        })
        .where(
          and(
            eq(hrExpenseApprovals.organizationId, input.organizationId),
            eq(hrExpenseApprovals.claimId, input.claimId),
          ),
        );
    });

    await appendHrExpenseAuditEvent({
      organizationId: input.organizationId,
      claimId: input.claimId,
      employeeId: claim.employeeId,
      action: "claim_reject",
      actorUserId: input.actorAuthUserId,
      summary: "Expense claim rejected",
      metadata: { rejectionReason: input.rejectionReason?.trim() },
    });

    return { claimId: input.claimId, status: "rejected" };
  }

  if (input.decision === "return") {
    try {
      assertExpDecisionReason({
        decision: "return",
        reason: input.returnReason,
      });
    } catch {
      throw new HrExpCommandError("return_reason_required");
    }

    assertExpClaimStatusTransition(claim.claimStatus, "returned");

    await runWithOrganizationContext(input.organizationId, async (db) => {
      const decidedAt = new Date();
      await db
        .update(hrExpenseClaims)
        .set({
          claimStatus: "returned",
          returnReason: input.returnReason?.trim() || null,
          updatedAt: decidedAt,
        })
        .where(eq(hrExpenseClaims.id, input.claimId));

      await db
        .update(hrExpenseApprovals)
        .set({
          status: "returned",
          decidedByAuthUserId: input.actorAuthUserId,
          decidedAt,
          snapshot: {
            ...snapshot,
            approvalStage: "manager",
          } as unknown as Record<string, unknown>,
          updatedAt: decidedAt,
        })
        .where(
          and(
            eq(hrExpenseApprovals.organizationId, input.organizationId),
            eq(hrExpenseApprovals.claimId, input.claimId),
          ),
        );
    });

    await appendHrExpenseAuditEvent({
      organizationId: input.organizationId,
      claimId: input.claimId,
      employeeId: claim.employeeId,
      action: "claim_return",
      actorUserId: input.actorAuthUserId,
      summary: "Expense claim returned to employee",
      metadata: { returnReason: input.returnReason?.trim() },
    });

    return { claimId: input.claimId, status: "returned" };
  }

  if (input.decision === "request_clarification") {
    try {
      assertExpDecisionReason({
        decision: "request_clarification",
        reason: input.clarificationReason,
      });
    } catch {
      throw new HrExpCommandError("clarification_reason_required");
    }

    assertExpClaimStatusTransition(claim.claimStatus, "clarification_requested");

    await runWithOrganizationContext(input.organizationId, async (db) => {
      const decidedAt = new Date();
      await db
        .update(hrExpenseClaims)
        .set({
          claimStatus: "clarification_requested",
          updatedAt: decidedAt,
        })
        .where(eq(hrExpenseClaims.id, input.claimId));

      await db
        .update(hrExpenseApprovals)
        .set({
          status: "clarification_requested",
          decidedByAuthUserId: input.actorAuthUserId,
          decidedAt,
          updatedAt: decidedAt,
        })
        .where(
          and(
            eq(hrExpenseApprovals.organizationId, input.organizationId),
            eq(hrExpenseApprovals.claimId, input.claimId),
          ),
        );
    });

    await appendHrExpenseAuditEvent({
      organizationId: input.organizationId,
      claimId: input.claimId,
      employeeId: claim.employeeId,
      action: "claim_clarification_request",
      actorUserId: input.actorAuthUserId,
      summary: "Clarification requested on expense claim",
      metadata: { clarificationReason: input.clarificationReason?.trim() },
    });

    return { claimId: input.claimId, status: "clarification_requested" };
  }

  const nextStage = nextExpStageAfterApproval({
    currentStage: approvalStage,
    requiresFinanceSecondApproval: snapshot.requiresFinanceSecondApproval,
    requiresHrSecondApproval: snapshot.requiresHrSecondApproval,
  });

  if (nextStage !== "complete") {
    const updatedSnapshot: HrExpenseApprovalSnapshot = {
      ...snapshot,
      approvalStage: nextStage,
    };

    await runWithOrganizationContext(input.organizationId, async (db) => {
      await db
        .update(hrExpenseClaims)
        .set({
          claimStatus: "under_review",
          updatedAt: new Date(),
        })
        .where(eq(hrExpenseClaims.id, input.claimId));
    });

    await updateHrExpenseApprovalSnapshot({
      organizationId: input.organizationId,
      claimId: input.claimId,
      snapshot: updatedSnapshot,
    });

    await appendHrExpenseAuditEvent({
      organizationId: input.organizationId,
      claimId: input.claimId,
      employeeId: claim.employeeId,
      action: "claim_approve",
      actorUserId: input.actorAuthUserId,
      summary: `Expense claim advanced to ${nextStage} approval`,
      metadata: { approvalStage: nextStage },
    });

    return { claimId: input.claimId, status: "under_review" };
  }

  return executeHrExpenseClaimApproval({
    organizationId: input.organizationId,
    claimId: input.claimId,
    actorAuthUserId: input.actorAuthUserId,
    decisionNote: input.decisionNote,
  });
}

/** HRM-EXP-020 — exception approval for over-limit, late, missing receipt, non-standard. */
export async function decideHrExpenseException(
  input: DecideHrExpenseExceptionInput,
): Promise<{ exceptionId: string; status: string }> {
  const rows = await runWithOrganizationContext(
    input.organizationId,
    async (db) =>
      db
        .select()
        .from(hrExpenseExceptions)
        .where(
          and(
            eq(hrExpenseExceptions.organizationId, input.organizationId),
            eq(hrExpenseExceptions.id, input.exceptionId),
          ),
        )
        .limit(1),
  );

  const row = rows[0];
  if (!row) {
    throw new HrExpCommandError("exception_not_found");
  }
  if (row.status !== "open") {
    throw new HrExpCommandError("claim_not_actionable");
  }

  const nextStatus = input.decision === "approve" ? "approved" : "rejected";

  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .update(hrExpenseExceptions)
      .set({
        status: nextStatus,
        resolvedAt: new Date(),
        resolvedByAuthUserId: input.actorAuthUserId,
      })
      .where(eq(hrExpenseExceptions.id, input.exceptionId));
  });

  await appendHrExpenseAuditEvent({
    organizationId: input.organizationId,
    claimId: row.claimId,
    action:
      input.decision === "approve" ? "exception_approve" : "exception_reject",
    actorUserId: input.actorAuthUserId,
    summary: `Expense exception ${input.decision}d`,
    metadata: {
      exceptionId: input.exceptionId,
      kind: row.kind,
      reason: input.reason?.trim(),
    },
  });

  return { exceptionId: input.exceptionId, status: nextStatus };
}

export async function createHrExpenseApprovalOnSubmit(input: {
  organizationId: string;
  claimId: string;
  employeeId: string;
  policyGroupCode: string;
  categoryCode: string;
  projectCode?: string | null;
  amountCents: number;
  hasOpenPolicyException?: boolean;
}): Promise<HrExpenseResolvedApprovalRoute> {
  const route = await resolveExpApprovalRouteForClaim({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    policyGroupCode: input.policyGroupCode,
    categoryCode: input.categoryCode,
    projectCode: input.projectCode,
    amountCents: input.amountCents,
    hasOpenPolicyException: input.hasOpenPolicyException,
  });

  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(hrExpenseApprovals).values({
      id: createEntityId("hr_exp_apv"),
      organizationId: input.organizationId,
      claimId: input.claimId,
      status: "pending",
      snapshot: route.snapshot as unknown as Record<string, unknown>,
    });

    await db
      .update(hrExpenseClaims)
      .set({
        claimStatus: "submitted",
        submittedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(hrExpenseClaims.id, input.claimId));
  });

  return route;
}

export {
  assertExpDecisionReason,
  buildExpManagerChain,
  clampExpManagerChainDepth,
  matchesExpApprovalRoute,
  nextExpStageAfterApproval,
  pickHighestPriorityExpApprovalRoute,
  resolveExpApprovalRouteFromChain,
  resolveExpInitialApprovalStage,
  resolveExpSubmissionApprovers,
} from "./hr-exp-approval.shared";

