import { and, eq } from "drizzle-orm";

import { runWithOrganizationContext } from "./client";
import { createEntityId } from "./ids";
import {
  appendHrOvertimeAuditEvent,
  calculateAndPersistHrOvertimeApproval,
  hasOpenHrOvertimeExceptions,
  HrOtmCommandError,
} from "./hr-otm";
import {
  assertOtmDecisionReason,
  nextOtmStageAfterManagerApproval,
  pickHighestPriorityOtmApprovalRoute,
  resolveOtmApprovalRouteFromChain,
  resolveOtmSubmissionApprovers,
  type HrOvertimeApprovalRouteRow,
  type HrOvertimeApprovalSnapshot,
  type HrOvertimeApprovalStage,
  type HrOvertimeDecisionKind,
  type HrOvertimeResolvedApprovalRoute,
  type HrOvertimeRoutingEmployeeContext,
  type HrOvertimeRoutingPolicy,
} from "./hr-otm-approval.shared";
import { creditHrOvertimeCompensatoryLeave } from "./hr-otm-compensatory.server";
import {
  hrDepartments,
  hrEmployees,
  hrOvertimeApprovalRoutes,
  hrOvertimeApprovals,
  hrOvertimeExceptions,
  hrOvertimePolicies,
  hrOvertimeRequests,
  hrPositions,
} from "./schema/hr";

export type ExecuteHrOvertimeApprovalInput = {
  organizationId: string;
  requestId: string;
  decisionNote?: string | null;
  actorAuthUserId?: string | null;
  hourlyRateCents?: number;
  payMultiplier?: number;
  earningCode?: string | null;
  compensatory?: {
    leaveTypeCode: string;
    policyGroupCode?: string;
  } | null;
  payableMinutesOverride?: number;
};

export type DecideHrOvertimeRequestInput = {
  organizationId: string;
  requestId: string;
  decision: HrOvertimeDecisionKind;
  actorAuthUserId: string;
  actorCanHrApprove: boolean;
  actorManagerEmployeeIds?: readonly string[];
  rejectionReason?: string | null;
  returnReason?: string | null;
  adjustReason?: string | null;
  decisionNote?: string | null;
  adjustedHours?: number;
  hourlyRateCents?: number;
};

const ACTIONABLE_STATUSES = new Set(["submitted", "pending"]);

function readApprovalSnapshot(
  value: Record<string, unknown> | null | undefined,
): HrOvertimeApprovalSnapshot {
  const stage = value?.approvalStage;
  return {
    approvalStage:
      stage === "manager" || stage === "hr" || stage === "complete"
        ? stage
        : "manager",
    routingRuleId:
      typeof value?.routingRuleId === "string" ? value.routingRuleId : null,
    routingApproverKind:
      typeof value?.routingApproverKind === "string"
        ? (value.routingApproverKind as HrOvertimeApprovalSnapshot["routingApproverKind"])
        : null,
    managerEmployeeIds: Array.isArray(value?.managerEmployeeIds)
      ? value.managerEmployeeIds.filter(
          (id): id is string => typeof id === "string",
        )
      : [],
    requiresHrSecondApproval: value?.requiresHrSecondApproval === true,
  };
}

async function loadOtmPolicy(
  organizationId: string,
  policyGroupCode: string,
): Promise<HrOvertimeRoutingPolicy & { allowCompensatoryTime: boolean; compensatoryLeaveTypeCode: string | null }> {
  return runWithOrganizationContext(organizationId, async (db) => {
    const [policy] = await db
      .select()
      .from(hrOvertimePolicies)
      .where(
        and(
          eq(hrOvertimePolicies.organizationId, organizationId),
          eq(hrOvertimePolicies.policyGroupCode, policyGroupCode),
        ),
      )
      .limit(1);

    return {
      requireHrSecondApproval: policy?.requireHrSecondApproval ?? false,
      managerChainMaxDepth: policy?.managerChainMaxDepth ?? 3,
      allowCompensatoryTime: policy?.allowCompensatoryTime ?? false,
      compensatoryLeaveTypeCode: policy?.compensatoryLeaveTypeCode ?? null,
    };
  });
}

async function listOtmApprovalRoutes(
  organizationId: string,
  policyGroupCode: string,
): Promise<readonly HrOvertimeApprovalRouteRow[]> {
  return runWithOrganizationContext(organizationId, async (db) => {
    const rows = await db
      .select()
      .from(hrOvertimeApprovalRoutes)
      .where(
        and(
          eq(hrOvertimeApprovalRoutes.organizationId, organizationId),
          eq(hrOvertimeApprovalRoutes.policyGroupCode, policyGroupCode),
        ),
      );
    return rows.map((row) => ({
      id: row.id,
      policyGroupCode: row.policyGroupCode,
      name: row.name,
      priority: row.priority,
      departmentId: row.departmentId,
      costCenterCode: row.costCenterCode,
      workLocationCode: row.workLocationCode,
      grade: row.grade,
      minEstimatedAmountCents: row.minEstimatedAmountCents,
      maxEstimatedAmountCents: row.maxEstimatedAmountCents,
      requiresEligibilityException: row.requiresEligibilityException,
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

/** HRM-OTM-016 — resolve approver auth user IDs for submission / stage. */
export async function resolveOtmSubmissionApproversForRequest(input: {
  organizationId: string;
  employeeId: string;
  policyGroupCode: string;
  estimatedAmountCents?: number;
  hasEligibilityException?: boolean;
  hasOpenPolicyException?: boolean;
  stage?: HrOvertimeApprovalStage;
  hrPoolAuthUserIds?: readonly string[];
}): Promise<{
  route: HrOvertimeResolvedApprovalRoute;
  approverAuthUserIds: readonly string[];
}> {
  const employee = await runWithOrganizationContext(
    input.organizationId,
    async (db) => {
      const [row] = await db
        .select({
          id: hrEmployees.id,
          currentDepartmentId: hrEmployees.currentDepartmentId,
          workLocationCode: hrEmployees.workLocationCode,
          grade: hrEmployees.grade,
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
        .leftJoin(
          hrPositions,
          eq(hrEmployees.currentPositionId, hrPositions.id),
        )
        .where(
          and(
            eq(hrEmployees.organizationId, input.organizationId),
            eq(hrEmployees.id, input.employeeId),
          ),
        )
        .limit(1);
      if (!row) {
        throw new HrOtmCommandError("employee_not_found");
      }
      return row;
    },
  );

  const policy = await loadOtmPolicy(input.organizationId, input.policyGroupCode);
  const routes = await listOtmApprovalRoutes(
    input.organizationId,
    input.policyGroupCode,
  );

  const employeeContext: HrOvertimeRoutingEmployeeContext = {
    employeeId: employee.id,
    departmentId: employee.currentDepartmentId,
    costCenterCode:
      employee.positionCostCenter ?? employee.departmentCostCenter ?? null,
    workLocationCode: employee.workLocationCode,
    grade: employee.grade,
    managerEmployeeId: employee.managerEmployeeId,
    departmentHeadEmployeeId: employee.departmentHeadEmployeeId,
    hrOwnerEmployeeId: employee.hrOwnerEmployeeId,
  };

  const managerEmployeeIds = await runWithOrganizationContext(
    input.organizationId,
    async (db) => {
      const chain: string[] = [];
      const visited = new Set<string>([employee.id]);
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

  const matchedRoute = pickHighestPriorityOtmApprovalRoute({
    routes,
    employee: employeeContext,
    request: {
      policyGroupCode: input.policyGroupCode,
      estimatedAmountCents: input.estimatedAmountCents ?? 0,
      hasEligibilityException: input.hasEligibilityException ?? false,
      hasOpenPolicyException: input.hasOpenPolicyException ?? false,
      asOf: new Date(),
    },
  });

  const route = resolveOtmApprovalRouteFromChain({
    employee: employeeContext,
    request: {
      policyGroupCode: input.policyGroupCode,
      estimatedAmountCents: input.estimatedAmountCents ?? 0,
      hasEligibilityException: input.hasEligibilityException ?? false,
      hasOpenPolicyException: input.hasOpenPolicyException ?? false,
      asOf: new Date(),
    },
    policy,
    managerEmployeeIds,
    matchedRoute,
  });

  const stage = input.stage ?? route.initialStage;
  const approverAuthUserIds = resolveOtmSubmissionApprovers({
    route,
    stage,
    resolveAuthUserIdForEmployee: () => null,
    hrPoolAuthUserIds: input.hrPoolAuthUserIds ?? [],
  });

  return { route, approverAuthUserIds };
}

/** HRM-OTM-015 — create pending approval record on submit. */
export async function createHrOvertimeApprovalOnSubmit(input: {
  organizationId: string;
  requestId: string;
  employeeId: string;
  policyGroupCode: string;
  estimatedAmountCents?: number;
  hasEligibilityException?: boolean;
}): Promise<{ approvalId: string; snapshot: HrOvertimeApprovalSnapshot }> {
  const { route } = await resolveOtmSubmissionApproversForRequest({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    policyGroupCode: input.policyGroupCode,
    estimatedAmountCents: input.estimatedAmountCents,
    hasEligibilityException: input.hasEligibilityException,
  });

  const approvalId = createEntityId("hr_ot_apr");
  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(hrOvertimeApprovals).values({
      id: approvalId,
      organizationId: input.organizationId,
      requestId: input.requestId,
      status: "pending",
      snapshot: route.snapshot as Record<string, unknown>,
    });

    await db
      .update(hrOvertimeRequests)
      .set({
        approvalStage: route.initialStage,
        approvalSnapshot: route.snapshot as Record<string, unknown>,
      })
      .where(eq(hrOvertimeRequests.id, input.requestId));
  });

  return { approvalId, snapshot: route.snapshot };
}

function assertOtmApproverAuthorized(input: {
  approvalStage: HrOvertimeApprovalStage;
  snapshot: HrOvertimeApprovalSnapshot;
  actorCanHrApprove: boolean;
  actorManagerEmployeeIds: readonly string[];
}): void {
  if (input.approvalStage === "hr") {
    if (!input.actorCanHrApprove) {
      throw new HrOtmCommandError("unauthorized_approver");
    }
    return;
  }
  if (input.approvalStage === "manager") {
    const allowed = input.actorManagerEmployeeIds.some((id) =>
      input.snapshot.managerEmployeeIds.includes(id),
    );
    if (!allowed && !input.actorCanHrApprove) {
      throw new HrOtmCommandError("unauthorized_approver");
    }
    return;
  }
  if (!input.actorCanHrApprove) {
    throw new HrOtmCommandError("unauthorized_approver");
  }
}

/**
 * HRM-OTM-020 — final overtime approval: payable minutes, amount snapshot,
 * optional compensatory credit. Blocks when open policy exceptions remain.
 */
export async function executeHrOvertimeRequestApproval(
  input: ExecuteHrOvertimeApprovalInput,
): Promise<{
  requestId: string;
  payableMinutes: number;
  amountCents: number;
  earningCode: string;
  compensatoryCredited: boolean;
}> {
  const request = await runWithOrganizationContext(
    input.organizationId,
    async (db) => {
      const [row] = await db
        .select({
          id: hrOvertimeRequests.id,
          employeeId: hrOvertimeRequests.employeeId,
          status: hrOvertimeRequests.status,
          policyGroupCode: hrOvertimeRequests.policyGroupCode,
          workDate: hrOvertimeRequests.workDate,
          hours: hrOvertimeRequests.hours,
        })
        .from(hrOvertimeRequests)
        .where(
          and(
            eq(hrOvertimeRequests.organizationId, input.organizationId),
            eq(hrOvertimeRequests.id, input.requestId),
          ),
        )
        .limit(1);
      return row ?? null;
    },
  );

  if (!request) {
    throw new HrOtmCommandError("request_not_found");
  }
  if (request.status !== "pending" && request.status !== "submitted") {
    throw new HrOtmCommandError("invalid_status_transition");
  }

  if (
    await hasOpenHrOvertimeExceptions({
      organizationId: input.organizationId,
      requestId: input.requestId,
    })
  ) {
    throw new HrOtmCommandError("open_exceptions_block_approval");
  }

  const policy = await loadOtmPolicy(
    input.organizationId,
    request.policyGroupCode,
  );

  const calculation = await calculateAndPersistHrOvertimeApproval({
    organizationId: input.organizationId,
    requestId: input.requestId,
    hourlyRateCents: input.hourlyRateCents ?? null,
  });

  if (input.payableMinutesOverride !== undefined) {
    void input.payableMinutesOverride;
  }

  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .update(hrOvertimeRequests)
      .set({
        status: "approved",
        approvalStage: "complete",
        decisionNote: input.decisionNote?.trim() || null,
        decidedAt: new Date(),
        currentApproverAuthUserId: null,
      })
      .where(eq(hrOvertimeRequests.id, input.requestId));

    await db
      .update(hrOvertimeApprovals)
      .set({
        status: "approved",
        decidedByAuthUserId: input.actorAuthUserId ?? null,
        decidedAt: new Date(),
      })
      .where(
        and(
          eq(hrOvertimeApprovals.organizationId, input.organizationId),
          eq(hrOvertimeApprovals.requestId, input.requestId),
        ),
      );
  });

  let compensatoryCredited = false;
  if (
    policy.allowCompensatoryTime &&
    policy.compensatoryLeaveTypeCode?.trim()
  ) {
    const credit = await creditHrOvertimeCompensatoryLeave({
      organizationId: input.organizationId,
      requestId: input.requestId,
      employeeId: request.employeeId,
      workDate: request.workDate,
      payableMinutes: calculation.payableMinutes,
      leaveTypeCode: policy.compensatoryLeaveTypeCode,
      policyGroupCode: request.policyGroupCode,
      actorAuthUserId: input.actorAuthUserId,
    });
    compensatoryCredited = credit.credited;
  }

  await appendHrOvertimeAuditEvent({
    organizationId: input.organizationId,
    requestId: input.requestId,
    employeeId: request.employeeId,
    action: "request_approve",
    actorAuthUserId: input.actorAuthUserId ?? null,
    summary: "Overtime request approved",
    metadata: input.decisionNote
      ? { decisionNote: input.decisionNote.trim() }
      : undefined,
  });

  return {
    requestId: input.requestId,
    payableMinutes: calculation.payableMinutes,
    amountCents: calculation.amountCents ?? 0,
    earningCode: calculation.earningCode,
    compensatoryCredited,
  };
}

/** HRM-OTM-017/018 — approve, reject, return, or adjust overtime request. */
export async function decideHrOvertimeRequest(
  input: DecideHrOvertimeRequestInput,
): Promise<{ requestId: string; status: string }> {
  const row = await runWithOrganizationContext(
    input.organizationId,
    async (db) => {
      const [found] = await db
        .select()
        .from(hrOvertimeRequests)
        .where(
          and(
            eq(hrOvertimeRequests.organizationId, input.organizationId),
            eq(hrOvertimeRequests.id, input.requestId),
          ),
        )
        .limit(1);
      return found ?? null;
    },
  );
  if (!row) {
    throw new HrOtmCommandError("request_not_found");
  }
  if (!ACTIONABLE_STATUSES.has(row.status)) {
    throw new HrOtmCommandError("request_not_actionable");
  }

  const snapshot = readApprovalSnapshot(
    (row.approvalSnapshot as Record<string, unknown> | null) ?? undefined,
  );
  const approvalStage = row.approvalStage ?? snapshot.approvalStage;

  assertOtmApproverAuthorized({
    approvalStage,
    snapshot,
    actorCanHrApprove: input.actorCanHrApprove,
    actorManagerEmployeeIds: input.actorManagerEmployeeIds ?? [],
  });

  if (input.decision === "reject") {
    try {
      assertOtmDecisionReason({
        decision: "reject",
        reason: input.rejectionReason,
      });
    } catch {
      throw new HrOtmCommandError("rejection_reason_required");
    }

    await runWithOrganizationContext(input.organizationId, async (db) => {
      await db
        .update(hrOvertimeRequests)
        .set({
          status: "rejected",
          approvalStage: "complete",
          decisionNote: input.rejectionReason?.trim() || null,
          decidedAt: new Date(),
          payableMinutes: null,
          amountCents: null,
        })
        .where(eq(hrOvertimeRequests.id, input.requestId));

      await db
        .update(hrOvertimeApprovals)
        .set({
          status: "rejected",
          decidedByAuthUserId: input.actorAuthUserId,
          decidedAt: new Date(),
        })
        .where(
          and(
            eq(hrOvertimeApprovals.organizationId, input.organizationId),
            eq(hrOvertimeApprovals.requestId, input.requestId),
          ),
        );
    });

    await appendHrOvertimeAuditEvent({
      organizationId: input.organizationId,
      requestId: input.requestId,
      employeeId: row.employeeId,
      action: "request_reject",
      actorAuthUserId: input.actorAuthUserId,
      summary: "Overtime request rejected",
      metadata: { rejectionReason: input.rejectionReason?.trim() },
    });

    return { requestId: input.requestId, status: "rejected" };
  }

  if (input.decision === "return") {
    try {
      assertOtmDecisionReason({
        decision: "return",
        reason: input.returnReason,
      });
    } catch {
      throw new HrOtmCommandError("return_reason_required");
    }

    await runWithOrganizationContext(input.organizationId, async (db) => {
      await db
        .update(hrOvertimeRequests)
        .set({
          status: "returned",
          returnReason: input.returnReason?.trim() || null,
          approvalStage: "manager",
          currentApproverAuthUserId: null,
        })
        .where(eq(hrOvertimeRequests.id, input.requestId));

      await db
        .update(hrOvertimeApprovals)
        .set({
          status: "returned",
          decidedByAuthUserId: input.actorAuthUserId,
          decidedAt: new Date(),
        })
        .where(
          and(
            eq(hrOvertimeApprovals.organizationId, input.organizationId),
            eq(hrOvertimeApprovals.requestId, input.requestId),
          ),
        );
    });

    await appendHrOvertimeAuditEvent({
      organizationId: input.organizationId,
      requestId: input.requestId,
      employeeId: row.employeeId,
      action: "request_return",
      actorAuthUserId: input.actorAuthUserId,
      summary: "Overtime request returned to employee",
      metadata: { returnReason: input.returnReason?.trim() },
    });

    return { requestId: input.requestId, status: "returned" };
  }

  if (input.decision === "adjust") {
    try {
      assertOtmDecisionReason({
        decision: "adjust",
        reason: input.adjustReason,
      });
    } catch {
      throw new HrOtmCommandError("adjust_reason_required");
    }
    if (
      input.adjustedHours === undefined ||
      !Number.isFinite(input.adjustedHours) ||
      input.adjustedHours <= 0
    ) {
      throw new HrOtmCommandError("invalid_hours");
    }

    await runWithOrganizationContext(input.organizationId, async (db) => {
      await db
        .update(hrOvertimeRequests)
        .set({
          hours: input.adjustedHours!.toFixed(2),
          decisionNote: input.adjustReason?.trim() || null,
        })
        .where(eq(hrOvertimeRequests.id, input.requestId));
    });

    await appendHrOvertimeAuditEvent({
      organizationId: input.organizationId,
      requestId: input.requestId,
      employeeId: row.employeeId,
      action: "request_adjust",
      actorAuthUserId: input.actorAuthUserId,
      summary: "Overtime request adjusted",
      metadata: {
        adjustReason: input.adjustReason?.trim(),
        adjustedHours: input.adjustedHours,
      },
    });

    return { requestId: input.requestId, status: row.status };
  }

  const nextStage = nextOtmStageAfterManagerApproval({
    requiresHrSecondApproval: snapshot.requiresHrSecondApproval,
  });

  if (approvalStage === "manager" && nextStage === "hr") {
    const updatedSnapshot: HrOvertimeApprovalSnapshot = {
      ...snapshot,
      approvalStage: "hr",
    };

    await runWithOrganizationContext(input.organizationId, async (db) => {
      await db
        .update(hrOvertimeRequests)
        .set({
          approvalStage: "hr",
          approvalSnapshot: updatedSnapshot as Record<string, unknown>,
        })
        .where(eq(hrOvertimeRequests.id, input.requestId));

      await db
        .update(hrOvertimeApprovals)
        .set({
          snapshot: updatedSnapshot as Record<string, unknown>,
        })
        .where(
          and(
            eq(hrOvertimeApprovals.organizationId, input.organizationId),
            eq(hrOvertimeApprovals.requestId, input.requestId),
          ),
        );
    });

    await appendHrOvertimeAuditEvent({
      organizationId: input.organizationId,
      requestId: input.requestId,
      employeeId: row.employeeId,
      action: "request_approve",
      actorAuthUserId: input.actorAuthUserId,
      summary: "Overtime manager approval — advanced to HR",
    });

    return { requestId: input.requestId, status: "submitted" };
  }

  const result = await executeHrOvertimeRequestApproval({
    organizationId: input.organizationId,
    requestId: input.requestId,
    decisionNote: input.decisionNote,
    actorAuthUserId: input.actorAuthUserId,
    hourlyRateCents: input.hourlyRateCents,
  });

  return { requestId: result.requestId, status: "approved" };
}

/** bulk-016 — bulk approve up to 25 pending requests with partial success. */
export async function bulkApproveHrOvertimeRequests(input: {
  organizationId: string;
  requestIds: readonly string[];
  actorAuthUserId: string;
  actorCanHrApprove: boolean;
  actorManagerEmployeeIds?: readonly string[];
  decisionNote?: string | null;
  maxBatchSize?: number;
}): Promise<{
  approved: readonly string[];
  failed: readonly { requestId: string; code: string }[];
}> {
  const cap = Math.min(input.maxBatchSize ?? 25, 25);
  const ids = input.requestIds.slice(0, cap);
  const approved: string[] = [];
  const failed: { requestId: string; code: string }[] = [];

  for (const requestId of ids) {
    try {
      await decideHrOvertimeRequest({
        organizationId: input.organizationId,
        requestId,
        decision: "approve",
        actorAuthUserId: input.actorAuthUserId,
        actorCanHrApprove: input.actorCanHrApprove,
        actorManagerEmployeeIds: input.actorManagerEmployeeIds,
        decisionNote: input.decisionNote,
      });
      approved.push(requestId);
    } catch (error) {
      failed.push({
        requestId,
        code:
          error instanceof HrOtmCommandError ? error.code : "unknown_error",
      });
    }
  }

  if (approved.length > 0 || failed.length > 0) {
    await appendHrOvertimeAuditEvent({
      organizationId: input.organizationId,
      action: "request_approve",
      actorAuthUserId: input.actorAuthUserId,
      summary: "Bulk overtime approval summary",
      metadata: {
        approvedCount: approved.length,
        failedCount: failed.length,
      },
    });
  }

  return { approved, failed };
}

/** HRM-OTM-019 — approve or reject an open policy exception. */
export async function decideHrOvertimeException(input: {
  organizationId: string;
  exceptionId: string;
  decision: "approve" | "reject";
  actorAuthUserId: string;
  reason?: string | null;
}): Promise<{ exceptionId: string; status: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [exception] = await db
      .select()
      .from(hrOvertimeExceptions)
      .where(
        and(
          eq(hrOvertimeExceptions.organizationId, input.organizationId),
          eq(hrOvertimeExceptions.id, input.exceptionId),
        ),
      )
      .limit(1);

    if (!exception) {
      throw new HrOtmCommandError("exception_not_found");
    }
    if (exception.status !== "open") {
      throw new HrOtmCommandError("invalid_status_transition");
    }

    if (input.decision === "reject") {
      try {
        assertOtmDecisionReason({
          decision: "reject",
          reason: input.reason,
        });
      } catch {
        throw new HrOtmCommandError("rejection_reason_required");
      }
    }

    const nextStatus = input.decision === "approve" ? "approved" : "rejected";
    await db
      .update(hrOvertimeExceptions)
      .set({
        status: nextStatus,
        resolvedAt: new Date(),
        resolvedByAuthUserId: input.actorAuthUserId,
      })
      .where(eq(hrOvertimeExceptions.id, input.exceptionId));

    await appendHrOvertimeAuditEvent({
      organizationId: input.organizationId,
      requestId: exception.requestId,
      action:
        input.decision === "approve" ? "exception_approve" : "exception_reject",
      actorAuthUserId: input.actorAuthUserId,
      summary:
        input.decision === "approve"
          ? "Overtime exception approved"
          : "Overtime exception rejected",
      metadata: input.reason ? { reason: input.reason.trim() } : undefined,
    });

    return { exceptionId: input.exceptionId, status: nextStatus };
  });
}
