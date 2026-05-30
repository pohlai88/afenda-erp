import { and, eq } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import {
  HrFwaCommandError,
  getOrCreateDefaultHrFwaPolicyGroup,
  validateHrFwaRequestPrerequisites,
  appendHrFwaAuditEvent,
  computeHrFwaLifecycleDates,
  upsertHrFwaArrangementTypeConfig,
  type HrFwaArrangementKind,
} from "./hr-fwa";
import {
  hrEmployees,
  hrFwaApprovalStages,
  hrFwaArrangements,
  hrFwaPolicyGroups,
  hrFwaRequests,
} from "./schema/hr";

export type HrFwaRequestDecision =
  | "approve"
  | "reject"
  | "return"
  | "exception_approve";

export type HrFwaApprovalRoute = {
  initialStage: (typeof import("./schema/hr").hrFwaApprovalStageKindEnum.enumValues)[number];
  requiresHrStage: boolean;
  requiresDepartmentStage: boolean;
  requiresExceptionStage: boolean;
  managerEmployeeIds: readonly string[];
};

const ACTIONABLE_STATUSES = new Set(["pending", "returned"]);

async function getOrCreateFwaPolicyGroup(
  db: AfendaTransaction,
  organizationId: string,
  policyGroupCode: string,
): Promise<typeof hrFwaPolicyGroups.$inferSelect> {
  const [existing] = await db
    .select()
    .from(hrFwaPolicyGroups)
    .where(
      and(
        eq(hrFwaPolicyGroups.organizationId, organizationId),
        eq(hrFwaPolicyGroups.code, policyGroupCode),
      ),
    )
    .limit(1);

  if (existing) {
    return existing;
  }

  const policyGroupId = createEntityId("hr_fwa_pol");
  await db.insert(hrFwaPolicyGroups).values({
    id: policyGroupId,
    organizationId,
    code: policyGroupCode,
    label: policyGroupCode === "default" ? "Default FWA Policy" : policyGroupCode,
  });

  const [created] = await db
    .select()
    .from(hrFwaPolicyGroups)
    .where(eq(hrFwaPolicyGroups.id, policyGroupId))
    .limit(1);

  if (!created) {
    throw new HrFwaCommandError("policy_group_not_found");
  }
  return created;
}

async function loadManagerEmployeeChain(
  db: AfendaTransaction,
  organizationId: string,
  employeeId: string,
  maxDepth = 3,
): Promise<readonly string[]> {
  const chain: string[] = [];
  const visited = new Set<string>([employeeId]);
  let cursor: string | null = employeeId;
  let depth = 0;
  const cap = Math.min(Math.max(1, maxDepth), 5);

  while (cursor && depth < cap) {
    const [employee]: Array<{ managerEmployeeId: string | null } | undefined> =
      await db
        .select({ managerEmployeeId: hrEmployees.managerEmployeeId })
        .from(hrEmployees)
        .where(
          and(
            eq(hrEmployees.organizationId, organizationId),
            eq(hrEmployees.id, cursor),
          ),
        )
        .limit(1);

    const managerId: string | null = employee?.managerEmployeeId ?? null;
    if (!managerId || visited.has(managerId)) {
      break;
    }
    visited.add(managerId);
    chain.push(managerId);
    cursor = managerId;
    depth += 1;
  }

  return chain;
}

export async function resolveHrFwaApprovalRoute(input: {
  organizationId: string;
  employeeId: string;
  policyGroupCode?: string;
  exceptionRequested?: boolean;
}): Promise<HrFwaApprovalRoute> {
  const policyGroupCode = input.policyGroupCode ?? "default";

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const policy = await getOrCreateFwaPolicyGroup(
      db,
      input.organizationId,
      policyGroupCode,
    );
    const managerEmployeeIds = await loadManagerEmployeeChain(
      db,
      input.organizationId,
      input.employeeId,
    );

    const requiresExceptionStage =
      input.exceptionRequested === true && policy.allowExceptionApproval;
    const requiresHrStage = policy.requireHrApproval;
    const requiresDepartmentStage = policy.requireDepartmentApproval;

    let initialStage: HrFwaApprovalRoute["initialStage"] = "manager";
    if (requiresExceptionStage) {
      initialStage = "exception";
    } else if (managerEmployeeIds.length === 0 && requiresDepartmentStage) {
      initialStage = "department";
    } else if (managerEmployeeIds.length === 0 && requiresHrStage) {
      initialStage = "hr";
    }

    return {
      initialStage,
      requiresHrStage,
      requiresDepartmentStage,
      requiresExceptionStage,
      managerEmployeeIds,
    };
  });
}

async function seedApprovalStages(
  tx: AfendaTransaction,
  input: {
    organizationId: string;
    requestId: string;
    route: HrFwaApprovalRoute;
  },
): Promise<void> {
  const stages: Array<{
    stageKind: HrFwaApprovalRoute["initialStage"];
    title: string;
    assigneeRole: string;
    sortOrder: number;
  }> = [];

  if (input.route.requiresExceptionStage) {
    stages.push({
      stageKind: "exception",
      title: "Exception approval",
      assigneeRole: "hr",
      sortOrder: 0,
    });
  }

  if (input.route.managerEmployeeIds.length > 0) {
    stages.push({
      stageKind: "manager",
      title: "Manager approval",
      assigneeRole: "manager",
      sortOrder: stages.length,
    });
  }

  if (input.route.requiresDepartmentStage) {
    stages.push({
      stageKind: "department",
      title: "Department approval",
      assigneeRole: "department",
      sortOrder: stages.length,
    });
  }

  if (input.route.requiresHrStage) {
    stages.push({
      stageKind: "hr",
      title: "HR approval",
      assigneeRole: "hr",
      sortOrder: stages.length,
    });
  }

  for (const stage of stages) {
    await tx.insert(hrFwaApprovalStages).values({
      id: createEntityId("hr_fwa_stage"),
      organizationId: input.organizationId,
      requestId: input.requestId,
      stageKind: stage.stageKind,
      title: stage.title,
      assigneeRole: stage.assigneeRole,
      sortOrder: stage.sortOrder,
    });
  }
}

function buildPayrollReference(arrangementId: string): string {
  return `hr-fwa:${arrangementId}`;
}

export async function submitHrFwaRequest(input: {
  organizationId: string;
  employeeId: string;
  arrangementKind: HrFwaArrangementKind;
  startDate: Date;
  endDate?: Date | null;
  reason?: string | null;
  policyGroupCode?: string;
  initiatorKind?: "employee" | "manager" | "hr";
  initiatorEmployeeId?: string | null;
  initiatorAuthUserId?: string | null;
  schedulePatternId?: string | null;
  remoteLocationId?: string | null;
  supportingDocumentId?: string | null;
  exceptionRequested?: boolean;
}): Promise<{ requestId: string }> {
  const policyGroupCode = input.policyGroupCode ?? "default";

  const eligibility = await validateHrFwaRequestPrerequisites({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    arrangementKind: input.arrangementKind,
    policyGroupCode,
    startDate: input.startDate,
    endDate: input.endDate,
    supportingDocumentId: input.supportingDocumentId,
    remoteLocationId: input.remoteLocationId,
    exceptionRequested: input.exceptionRequested,
  });

  const route = await resolveHrFwaApprovalRoute({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    policyGroupCode,
    exceptionRequested:
      input.exceptionRequested ?? !eligibility.eligible,
  });

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const requestId = createEntityId("hr_fwa_req");

    await db.transaction(async (tx) => {
      await tx.insert(hrFwaRequests).values({
        id: requestId,
        organizationId: input.organizationId,
        employeeId: input.employeeId,
        arrangementKind: input.arrangementKind,
        policyGroupCode,
        approvalStage: route.initialStage,
        initiatorKind: input.initiatorKind ?? "employee",
        initiatorEmployeeId: input.initiatorEmployeeId ?? input.employeeId,
        initiatorAuthUserId: input.initiatorAuthUserId ?? null,
        reason: input.reason?.trim() || null,
        startDate: input.startDate,
        endDate: input.endDate ?? null,
        schedulePatternId: input.schedulePatternId ?? null,
        remoteLocationId: input.remoteLocationId ?? null,
        supportingDocumentId: input.supportingDocumentId?.trim() || null,
        exceptionRequested:
          input.exceptionRequested ?? !eligibility.eligible,
        eligibilitySnapshot: eligibility,
        policySnapshot: { route },
      });

      await seedApprovalStages(tx, {
        organizationId: input.organizationId,
        requestId,
        route,
      });
    });

    await appendHrFwaAuditEvent({
      organizationId: input.organizationId,
      action: "request_submitted",
      summary: `Flexible work request submitted (${input.arrangementKind})`,
      requestId,
      employeeId: input.employeeId,
      actorAuthUserId: input.initiatorAuthUserId ?? null,
      actorEmployeeId: input.initiatorEmployeeId ?? input.employeeId,
      metadata: { eligibility, route },
    });

    await appendHrFwaAuditEvent({
      organizationId: input.organizationId,
      action: eligibility.eligible
        ? "eligibility_validated"
        : "eligibility_failed",
      summary: eligibility.reason,
      requestId,
      employeeId: input.employeeId,
      metadata: { eligibility },
    });

    return { requestId };
  });
}

function assertApproverAuthorized(input: {
  request: typeof hrFwaRequests.$inferSelect;
  route: HrFwaApprovalRoute;
  actorCanHrApprove: boolean;
  actorCanDepartmentApprove?: boolean;
  actorManagerEmployeeIds: readonly string[];
}): void {
  const stage = input.request.approvalStage;

  if (stage === "exception" || stage === "hr") {
    if (!input.actorCanHrApprove) {
      throw new HrFwaCommandError("not_eligible", "Unauthorized approver");
    }
    return;
  }

  if (stage === "department") {
    if (!input.actorCanDepartmentApprove && !input.actorCanHrApprove) {
      throw new HrFwaCommandError("not_eligible", "Unauthorized approver");
    }
    return;
  }

  if (stage === "manager") {
    const allowed = input.actorManagerEmployeeIds.some((id) =>
      input.route.managerEmployeeIds.includes(id),
    );
    if (!allowed && !input.actorCanHrApprove) {
      throw new HrFwaCommandError("not_eligible", "Unauthorized approver");
    }
  }
}

async function advanceOrFinalizeApproval(
  tx: AfendaTransaction,
  input: {
    request: typeof hrFwaRequests.$inferSelect;
    route: HrFwaApprovalRoute;
    decisionNote?: string | null;
  },
): Promise<{ status: string; arrangementId?: string }> {
  const stageOrder: HrFwaApprovalRoute["initialStage"][] = [];
  if (input.route.requiresExceptionStage) stageOrder.push("exception");
  if (input.route.managerEmployeeIds.length > 0) stageOrder.push("manager");
  if (input.route.requiresDepartmentStage) stageOrder.push("department");
  if (input.route.requiresHrStage) stageOrder.push("hr");

  const currentIndex = stageOrder.indexOf(input.request.approvalStage);
  const nextStage =
    currentIndex >= 0 && currentIndex < stageOrder.length - 1
      ? stageOrder[currentIndex + 1]
      : null;

  await tx
    .update(hrFwaApprovalStages)
    .set({
      status: "approved",
      decidedAt: new Date(),
      decisionNote: input.decisionNote?.trim() || null,
    })
    .where(
      and(
        eq(hrFwaApprovalStages.organizationId, input.request.organizationId),
        eq(hrFwaApprovalStages.requestId, input.request.id),
        eq(hrFwaApprovalStages.stageKind, input.request.approvalStage),
      ),
    );

  if (nextStage) {
    await tx
      .update(hrFwaRequests)
      .set({ approvalStage: nextStage })
      .where(eq(hrFwaRequests.id, input.request.id));
    return { status: "pending" };
  }

  const arrangementId = createEntityId("hr_fwa_arr");
  const payrollReference = buildPayrollReference(arrangementId);
  const lifecycleDates = computeHrFwaLifecycleDates({
    effectiveFrom: input.request.startDate,
    effectiveTo: input.request.endDate,
  });

  await tx.insert(hrFwaArrangements).values({
    id: arrangementId,
    organizationId: input.request.organizationId,
    employeeId: input.request.employeeId,
    requestId: input.request.id,
    arrangementKind: input.request.arrangementKind,
    policyGroupCode: input.request.policyGroupCode,
    status: "active",
    effectiveFrom: input.request.startDate,
    effectiveTo: input.request.endDate,
    reviewDate: lifecycleDates.reviewDate,
    renewalDate: lifecycleDates.renewalDate,
    schedulePatternId: input.request.schedulePatternId,
    remoteLocationId: input.request.remoteLocationId,
    reason: input.request.reason,
    exceptionApproved: input.request.exceptionRequested,
    exceptionReason: input.request.exceptionRequested
      ? input.request.reason
      : null,
    payrollReference,
  });

  await tx
    .update(hrFwaRequests)
    .set({
      status: "approved",
      decisionNote: input.decisionNote?.trim() || null,
      currentApproverAuthUserId: null,
      decidedAt: new Date(),
    })
    .where(eq(hrFwaRequests.id, input.request.id));

  return { status: "approved", arrangementId };
}

export async function decideHrFwaRequest(input: {
  organizationId: string;
  requestId: string;
  decision: HrFwaRequestDecision;
  actorAuthUserId: string;
  actorCanHrApprove: boolean;
  actorCanDepartmentApprove?: boolean;
  actorManagerEmployeeIds?: readonly string[];
  rejectionReason?: string | null;
  decisionNote?: string | null;
  returnedNote?: string | null;
}): Promise<{ requestId: string; status: string; arrangementId?: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [request] = await db
      .select()
      .from(hrFwaRequests)
      .where(
        and(
          eq(hrFwaRequests.organizationId, input.organizationId),
          eq(hrFwaRequests.id, input.requestId),
        ),
      )
      .limit(1);

    if (!request) {
      throw new HrFwaCommandError("request_not_found");
    }
    if (!ACTIONABLE_STATUSES.has(request.status)) {
      throw new HrFwaCommandError("request_not_found", "Request not actionable");
    }

    const route =
      (request.policySnapshot as { route?: HrFwaApprovalRoute } | null)?.route ??
      (await resolveHrFwaApprovalRoute({
        organizationId: input.organizationId,
        employeeId: request.employeeId,
        policyGroupCode: request.policyGroupCode,
        exceptionRequested: request.exceptionRequested,
      }));

    if (input.decision === "reject") {
      const reason = input.rejectionReason?.trim();
      if (!reason) {
        throw new HrFwaCommandError("not_eligible", "Rejection reason required");
      }

      await db
        .update(hrFwaRequests)
        .set({
          status: "rejected",
          rejectionReason: reason,
          decisionNote: input.decisionNote?.trim() || null,
          currentApproverAuthUserId: null,
          decidedAt: new Date(),
        })
        .where(eq(hrFwaRequests.id, input.requestId));

      await appendHrFwaAuditEvent({
        organizationId: input.organizationId,
        action: "rejection",
        summary: reason,
        requestId: input.requestId,
        employeeId: request.employeeId,
        actorAuthUserId: input.actorAuthUserId,
        metadata: { decisionNote: input.decisionNote },
      });

      return { requestId: input.requestId, status: "rejected" };
    }

    if (input.decision === "return") {
      await db
        .update(hrFwaRequests)
        .set({
          status: "returned",
          returnedNote:
            input.returnedNote?.trim() || input.decisionNote?.trim() || null,
          currentApproverAuthUserId: null,
        })
        .where(eq(hrFwaRequests.id, input.requestId));

      await appendHrFwaAuditEvent({
        organizationId: input.organizationId,
        action: "returned",
        summary: "Request returned for revision",
        requestId: input.requestId,
        employeeId: request.employeeId,
        actorAuthUserId: input.actorAuthUserId,
      });

      return { requestId: input.requestId, status: "returned" };
    }

    assertApproverAuthorized({
      request,
      route,
      actorCanHrApprove: input.actorCanHrApprove,
      actorCanDepartmentApprove: input.actorCanDepartmentApprove,
      actorManagerEmployeeIds: input.actorManagerEmployeeIds ?? [],
    });

    const result = await db.transaction(async (tx) =>
      advanceOrFinalizeApproval(tx, {
        request,
        route,
        decisionNote: input.decisionNote,
      }),
    );

    await appendHrFwaAuditEvent({
      organizationId: input.organizationId,
      action:
        input.decision === "exception_approve"
          ? "exception_approved"
          : "approval",
      summary: `Request ${result.status}`,
      requestId: input.requestId,
      employeeId: request.employeeId,
      arrangementId: result.arrangementId ?? null,
      actorAuthUserId: input.actorAuthUserId,
      metadata: { decision: input.decision },
    });

    if (result.arrangementId) {
      await appendHrFwaAuditEvent({
        organizationId: input.organizationId,
        action: "payroll_reference",
        summary: "Payroll reference assigned to approved arrangement",
        arrangementId: result.arrangementId,
        requestId: input.requestId,
        employeeId: request.employeeId,
        metadata: {
          payrollReference: buildPayrollReference(result.arrangementId),
        },
      });
    }

    return {
      requestId: input.requestId,
      status: result.status,
      arrangementId: result.arrangementId,
    };
  });
}

export async function suspendHrFwaArrangement(input: {
  organizationId: string;
  arrangementId: string;
  actorAuthUserId: string;
  suspensionReason: string;
}): Promise<{ arrangementId: string }> {
  const reason = input.suspensionReason.trim();
  if (!reason) {
    throw new HrFwaCommandError("not_eligible", "Suspension reason required");
  }

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [arrangement] = await db
      .select()
      .from(hrFwaArrangements)
      .where(
        and(
          eq(hrFwaArrangements.organizationId, input.organizationId),
          eq(hrFwaArrangements.id, input.arrangementId),
        ),
      )
      .limit(1);

    if (!arrangement) {
      throw new HrFwaCommandError("arrangement_not_found");
    }

    await db
      .update(hrFwaArrangements)
      .set({
        status: "suspended",
        suspendedAt: new Date(),
        suspensionReason: reason,
      })
      .where(eq(hrFwaArrangements.id, input.arrangementId));

    await appendHrFwaAuditEvent({
      organizationId: input.organizationId,
      action: "suspension",
      summary: reason,
      arrangementId: input.arrangementId,
      employeeId: arrangement.employeeId,
      actorAuthUserId: input.actorAuthUserId,
    });

    return { arrangementId: input.arrangementId };
  });
}

export async function terminateHrFwaArrangement(input: {
  organizationId: string;
  arrangementId: string;
  actorAuthUserId: string;
  terminationReason: string;
}): Promise<{ arrangementId: string }> {
  const reason = input.terminationReason.trim();
  if (!reason) {
    throw new HrFwaCommandError("not_eligible", "Termination reason required");
  }

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [arrangement] = await db
      .select()
      .from(hrFwaArrangements)
      .where(
        and(
          eq(hrFwaArrangements.organizationId, input.organizationId),
          eq(hrFwaArrangements.id, input.arrangementId),
        ),
      )
      .limit(1);

    if (!arrangement) {
      throw new HrFwaCommandError("arrangement_not_found");
    }

    await db
      .update(hrFwaArrangements)
      .set({
        status: "terminated",
        terminatedAt: new Date(),
        terminationReason: reason,
      })
      .where(eq(hrFwaArrangements.id, input.arrangementId));

    await appendHrFwaAuditEvent({
      organizationId: input.organizationId,
      action: "termination",
      summary: reason,
      arrangementId: input.arrangementId,
      employeeId: arrangement.employeeId,
      actorAuthUserId: input.actorAuthUserId,
    });

    return { arrangementId: input.arrangementId };
  });
}

export async function renewHrFwaArrangement(input: {
  organizationId: string;
  arrangementId: string;
  actorAuthUserId: string;
  newEffectiveTo: Date;
  renewalReason?: string | null;
}): Promise<{ arrangementId: string }> {
  if (input.newEffectiveTo.getTime() <= Date.now()) {
    throw new HrFwaCommandError("invalid_date_range");
  }

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [arrangement] = await db
      .select()
      .from(hrFwaArrangements)
      .where(
        and(
          eq(hrFwaArrangements.organizationId, input.organizationId),
          eq(hrFwaArrangements.id, input.arrangementId),
        ),
      )
      .limit(1);

    if (!arrangement) {
      throw new HrFwaCommandError("arrangement_not_found");
    }

    await db
      .update(hrFwaArrangements)
      .set({
        effectiveTo: input.newEffectiveTo,
        renewalDate: new Date(),
        status: "active",
        suspendedAt: null,
        suspensionReason: null,
      })
      .where(eq(hrFwaArrangements.id, input.arrangementId));

    await appendHrFwaAuditEvent({
      organizationId: input.organizationId,
      action: "renewal",
      summary: input.renewalReason?.trim() || "Arrangement renewed",
      arrangementId: input.arrangementId,
      employeeId: arrangement.employeeId,
      actorAuthUserId: input.actorAuthUserId,
      metadata: { newEffectiveTo: input.newEffectiveTo.toISOString() },
    });

    return { arrangementId: input.arrangementId };
  });
}

export async function cancelHrFwaRequest(input: {
  organizationId: string;
  requestId: string;
}): Promise<{ requestId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [request] = await db
      .select()
      .from(hrFwaRequests)
      .where(
        and(
          eq(hrFwaRequests.organizationId, input.organizationId),
          eq(hrFwaRequests.id, input.requestId),
        ),
      )
      .limit(1);

    if (!request) {
      throw new HrFwaCommandError("request_not_found");
    }
    if (!ACTIONABLE_STATUSES.has(request.status)) {
      throw new HrFwaCommandError("request_not_found", "Request not actionable");
    }

    await db
      .update(hrFwaRequests)
      .set({
        status: "cancelled",
        currentApproverAuthUserId: null,
        decidedAt: new Date(),
      })
      .where(eq(hrFwaRequests.id, input.requestId));

    return { requestId: input.requestId };
  });
}

export async function ensureDefaultHrFwaArrangementTypes(input: {
  organizationId: string;
  policyGroupCode?: string;
}): Promise<{ seeded: number }> {
  await getOrCreateDefaultHrFwaPolicyGroup({
    organizationId: input.organizationId,
  });

  const defaults: Array<{ kind: HrFwaArrangementKind; label: string }> = [
    { kind: "hybrid", label: "Hybrid Work" },
    { kind: "remote", label: "Remote Work" },
    { kind: "compressed_week", label: "Compressed Work Week" },
    { kind: "flexible_hours", label: "Flexible Hours" },
    { kind: "staggered_hours", label: "Staggered Hours" },
    { kind: "part_time", label: "Part-Time Schedule" },
    { kind: "temporary", label: "Temporary Arrangement" },
  ];

  let seeded = 0;
  for (const entry of defaults) {
    await upsertHrFwaArrangementTypeConfig({
      organizationId: input.organizationId,
      policyGroupCode: input.policyGroupCode,
      arrangementKind: entry.kind,
      label: entry.label,
      requiresRemoteLocation: entry.kind === "remote" || entry.kind === "hybrid",
    });
    seeded += 1;
  }
  return { seeded };
}
