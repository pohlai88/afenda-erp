import { and, count, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import {
  hrComplianceEmployeeRequirements,
  hrComplianceObligations,
  hrDepartments,
  hrEmployees,
  hrPositions,
} from "./hr";
import {
  hrShiftAssignments,
  hrShiftAuditEvents,
  hrShiftCoverageRequirements,
  hrShiftScheduleChangeRequests,
  hrShiftSchedulingPolicies,
  hrShiftSwapRequests,
  hrShiftTemplates,
  type HrShiftScheduleChangePayload,
} from "./hr-shift-scheduling";

export class HrShiftWorkflowCommandError extends Error {
  readonly code:
    | "policy_not_found"
    | "swap_disabled"
    | "assignment_not_found"
    | "employee_not_found"
    | "swap_not_found"
    | "schedule_change_not_found"
    | "swap_not_actionable"
    | "schedule_change_not_actionable"
    | "swap_ineligible"
    | "coverage_not_found"
    | "invalid_decision";

  constructor(code: HrShiftWorkflowCommandError["code"], message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const ACTIONABLE_STATUSES = new Set(["pending", "returned"]);

function clampPageSize(limit: number | undefined): number {
  if (limit === undefined || !Number.isFinite(limit)) {
    return DEFAULT_PAGE_SIZE;
  }
  const size = Math.floor(limit);
  if (size < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(size, MAX_PAGE_SIZE);
}

function toUtcDayStart(date: Date): Date {
  const copy = new Date(date);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

async function appendShiftAuditEvent(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    action: (typeof import("./schema/hr-shift-scheduling").hrShiftAuditActionEnum.enumValues)[number];
    summary: string;
    actorAuthUserId?: string | null;
    employeeId?: string | null;
    assignmentId?: string | null;
    swapRequestId?: string | null;
    scheduleChangeRequestId?: string | null;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  await db.insert(hrShiftAuditEvents).values({
    id: createEntityId("hr_sh_aud"),
    organizationId: input.organizationId,
    action: input.action,
    summary: input.summary,
    actorAuthUserId: input.actorAuthUserId ?? null,
    employeeId: input.employeeId ?? null,
    assignmentId: input.assignmentId ?? null,
    swapRequestId: input.swapRequestId ?? null,
    scheduleChangeRequestId: input.scheduleChangeRequestId ?? null,
    metadata: input.metadata ?? null,
  });
}

export async function getHrShiftSchedulingPolicy(input: {
  organizationId: string;
}): Promise<typeof hrShiftSchedulingPolicies.$inferSelect> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [policy] = await db
      .select()
      .from(hrShiftSchedulingPolicies)
      .where(eq(hrShiftSchedulingPolicies.organizationId, input.organizationId))
      .limit(1);

    if (!policy) {
      throw new HrShiftWorkflowCommandError("policy_not_found");
    }

    return policy;
  });
}

export async function createHrShiftCoverageRequirement(input: {
  organizationId: string;
  requirementDate: Date;
  templateId?: string | null;
  departmentId?: string | null;
  positionId?: string | null;
  locationCode?: string | null;
  roleCode?: string | null;
  requiredSkillCode?: string | null;
  requiredCertificationCode?: string | null;
  minHeadcount: number;
  maxHeadcount?: number | null;
  notes?: string | null;
  actorAuthUserId?: string | null;
}): Promise<{ requirementId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const requirementId = createEntityId("hr_sh_cov");
    await db.insert(hrShiftCoverageRequirements).values({
      id: requirementId,
      organizationId: input.organizationId,
      requirementDate: toUtcDayStart(input.requirementDate),
      templateId: input.templateId ?? null,
      departmentId: input.departmentId ?? null,
      positionId: input.positionId ?? null,
      locationCode: input.locationCode?.trim() || null,
      roleCode: input.roleCode?.trim() || null,
      requiredSkillCode: input.requiredSkillCode?.trim() || null,
      requiredCertificationCode:
        input.requiredCertificationCode?.trim() || null,
      minHeadcount: input.minHeadcount,
      maxHeadcount: input.maxHeadcount ?? null,
      notes: input.notes?.trim() || null,
    });

    await appendShiftAuditEvent(db, {
      organizationId: input.organizationId,
      action: "coverage_created",
      summary: "Coverage requirement created",
      actorAuthUserId: input.actorAuthUserId,
      metadata: { requirementId },
    });

    return { requirementId };
  });
}

export type HrShiftCoverageRequirementRow = {
  id: string;
  requirementDate: Date;
  templateId: string | null;
  templateCode: string | null;
  templateName: string | null;
  departmentId: string | null;
  departmentName: string | null;
  positionId: string | null;
  positionCode: string | null;
  locationCode: string | null;
  roleCode: string | null;
  requiredSkillCode: string | null;
  requiredCertificationCode: string | null;
  minHeadcount: number;
  maxHeadcount: number | null;
};

export type HrShiftCoverageCompareWindow = {
  rows: readonly HrShiftCoverageRequirementRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export async function listHrShiftCoverageRequirementsWindow(input: {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  departmentId?: string;
  locationCode?: string;
  limit?: number;
  offset?: number;
}): Promise<HrShiftCoverageCompareWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const periodStart = toUtcDayStart(input.periodStart);
  const periodEnd = toUtcDayStart(input.periodEnd);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrShiftCoverageRequirements.organizationId, input.organizationId),
      gte(hrShiftCoverageRequirements.requirementDate, periodStart),
      lte(hrShiftCoverageRequirements.requirementDate, periodEnd),
    ];

    if (input.departmentId) {
      conditions.push(
        eq(hrShiftCoverageRequirements.departmentId, input.departmentId),
      );
    }
    if (input.locationCode?.trim()) {
      conditions.push(
        eq(hrShiftCoverageRequirements.locationCode, input.locationCode.trim()),
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrShiftCoverageRequirements)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrShiftCoverageRequirements.id,
        requirementDate: hrShiftCoverageRequirements.requirementDate,
        templateId: hrShiftCoverageRequirements.templateId,
        templateCode: hrShiftTemplates.code,
        templateName: hrShiftTemplates.name,
        departmentId: hrShiftCoverageRequirements.departmentId,
        departmentName: hrDepartments.name,
        positionId: hrShiftCoverageRequirements.positionId,
        positionCode: hrPositions.code,
        locationCode: hrShiftCoverageRequirements.locationCode,
        roleCode: hrShiftCoverageRequirements.roleCode,
        requiredSkillCode: hrShiftCoverageRequirements.requiredSkillCode,
        requiredCertificationCode:
          hrShiftCoverageRequirements.requiredCertificationCode,
        minHeadcount: hrShiftCoverageRequirements.minHeadcount,
        maxHeadcount: hrShiftCoverageRequirements.maxHeadcount,
      })
      .from(hrShiftCoverageRequirements)
      .leftJoin(
        hrShiftTemplates,
        eq(hrShiftCoverageRequirements.templateId, hrShiftTemplates.id),
      )
      .leftJoin(
        hrDepartments,
        eq(hrShiftCoverageRequirements.departmentId, hrDepartments.id),
      )
      .leftJoin(
        hrPositions,
        eq(hrShiftCoverageRequirements.positionId, hrPositions.id),
      )
      .where(whereClause)
      .orderBy(hrShiftCoverageRequirements.requirementDate)
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows,
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + rows.length < actualTotal,
    };
  });
}

export type HrShiftCoverageAssignmentRow = {
  id: string;
  employeeId: string;
  templateId: string;
  departmentId: string | null;
  positionId: string | null;
  positionCode: string | null;
  locationCode: string | null;
  shiftDate: Date;
  status: string;
  completedQualificationCodes: readonly string[];
};

export async function listHrShiftCoverageAssignmentSlices(input: {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  departmentId?: string;
  locationCode?: string;
}): Promise<readonly HrShiftCoverageAssignmentRow[]> {
  const periodStart = toUtcDayStart(input.periodStart);
  const periodEnd = toUtcDayStart(input.periodEnd);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrShiftAssignments.organizationId, input.organizationId),
      gte(hrShiftAssignments.shiftDate, periodStart),
      lte(hrShiftAssignments.shiftDate, periodEnd),
      inArray(hrShiftAssignments.status, ["scheduled", "published"]),
    ];

    if (input.departmentId) {
      conditions.push(eq(hrShiftAssignments.departmentId, input.departmentId));
    }
    if (input.locationCode?.trim()) {
      conditions.push(
        eq(hrShiftAssignments.locationCode, input.locationCode.trim()),
      );
    }

    const assignmentRows = await db
      .select({
        id: hrShiftAssignments.id,
        employeeId: hrShiftAssignments.employeeId,
        templateId: hrShiftAssignments.templateId,
        departmentId: hrShiftAssignments.departmentId,
        positionId: hrShiftAssignments.positionId,
        positionCode: hrPositions.code,
        locationCode: hrShiftAssignments.locationCode,
        shiftDate: hrShiftAssignments.shiftDate,
        status: hrShiftAssignments.status,
      })
      .from(hrShiftAssignments)
      .leftJoin(
        hrPositions,
        eq(hrShiftAssignments.positionId, hrPositions.id),
      )
      .where(and(...conditions));

    const employeeIds = [...new Set(assignmentRows.map((row) => row.employeeId))];
    const qualificationByEmployee = new Map<string, string[]>();

    if (employeeIds.length > 0) {
      const qualificationRows = await db
        .select({
          employeeId: hrComplianceEmployeeRequirements.employeeId,
          obligationCode: hrComplianceObligations.code,
        })
        .from(hrComplianceEmployeeRequirements)
        .innerJoin(
          hrComplianceObligations,
          eq(
            hrComplianceEmployeeRequirements.obligationId,
            hrComplianceObligations.id,
          ),
        )
        .where(
          and(
            eq(
              hrComplianceEmployeeRequirements.organizationId,
              input.organizationId,
            ),
            inArray(hrComplianceEmployeeRequirements.employeeId, employeeIds),
            eq(hrComplianceEmployeeRequirements.status, "compliant"),
          ),
        );

      for (const row of qualificationRows) {
        const existing = qualificationByEmployee.get(row.employeeId) ?? [];
        existing.push(row.obligationCode);
        qualificationByEmployee.set(row.employeeId, existing);
      }
    }

    return assignmentRows.map((row) => {
      const codes = qualificationByEmployee.get(row.employeeId) ?? [];
      const positionCode = row.positionCode ?? null;
      return {
        ...row,
        positionCode,
        completedQualificationCodes: positionCode
          ? [positionCode, ...codes]
          : codes,
      };
    });
  });
}

async function loadAssignmentForSwap(
  db: AfendaTransaction,
  organizationId: string,
  assignmentId: string,
): Promise<typeof hrShiftAssignments.$inferSelect> {
  const [assignment] = await db
    .select()
    .from(hrShiftAssignments)
    .where(
      and(
        eq(hrShiftAssignments.organizationId, organizationId),
        eq(hrShiftAssignments.id, assignmentId),
      ),
    )
    .limit(1);

  if (!assignment) {
    throw new HrShiftWorkflowCommandError("assignment_not_found");
  }

  return assignment;
}

async function hasPendingSwapOnAssignment(
  db: AfendaTransaction,
  organizationId: string,
  assignmentId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ total: count() })
    .from(hrShiftSwapRequests)
    .where(
      and(
        eq(hrShiftSwapRequests.organizationId, organizationId),
        eq(hrShiftSwapRequests.requesterAssignmentId, assignmentId),
        inArray(hrShiftSwapRequests.status, ["pending", "returned"]),
      ),
    );

  return Number(row?.total ?? 0) > 0;
}

export type HrShiftSwapRequestRow = {
  id: string;
  requesterEmployeeId: string;
  requesterEmployeeNumber: string;
  requesterDisplayName: string;
  requesterAssignmentId: string;
  targetEmployeeId: string | null;
  targetEmployeeNumber: string | null;
  targetDisplayName: string | null;
  targetAssignmentId: string | null;
  status: (typeof hrShiftSwapRequests.$inferSelect)["status"];
  reason: string;
  rejectionReason: string | null;
  overrideReason: string | null;
  submittedAt: Date;
  decidedAt: Date | null;
};

export type HrShiftSwapRequestWindow = {
  rows: readonly HrShiftSwapRequestRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export async function hasPendingHrShiftSwapOnAssignment(input: {
  organizationId: string;
  assignmentId: string;
}): Promise<boolean> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    return hasPendingSwapOnAssignment(
      db,
      input.organizationId,
      input.assignmentId,
    );
  });
}

export async function getHrShiftAssignmentSwapContext(input: {
  organizationId: string;
  assignmentId: string;
}): Promise<{
  assignmentId: string;
  employeeId: string;
  templateId: string;
  shiftDate: Date;
  status: string;
} | null> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [assignment] = await db
      .select({
        assignmentId: hrShiftAssignments.id,
        employeeId: hrShiftAssignments.employeeId,
        templateId: hrShiftAssignments.templateId,
        shiftDate: hrShiftAssignments.shiftDate,
        status: hrShiftAssignments.status,
      })
      .from(hrShiftAssignments)
      .where(
        and(
          eq(hrShiftAssignments.organizationId, input.organizationId),
          eq(hrShiftAssignments.id, input.assignmentId),
        ),
      )
      .limit(1);

    return assignment ?? null;
  });
}

export async function getHrShiftEmployeeManagerId(input: {
  organizationId: string;
  employeeId: string;
}): Promise<string | null> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [employee] = await db
      .select({ managerEmployeeId: hrEmployees.managerEmployeeId })
      .from(hrEmployees)
      .where(
        and(
          eq(hrEmployees.organizationId, input.organizationId),
          eq(hrEmployees.id, input.employeeId),
        ),
      )
      .limit(1);

    return employee?.managerEmployeeId ?? null;
  });
}

export async function submitHrShiftSwapRequest(input: {
  organizationId: string;
  requesterEmployeeId: string;
  requesterAssignmentId: string;
  targetEmployeeId?: string | null;
  targetAssignmentId?: string | null;
  reason: string;
  actorAuthUserId?: string | null;
}): Promise<{ swapRequestId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [policy] = await db
      .select({ swapRequestsEnabled: hrShiftSchedulingPolicies.swapRequestsEnabled })
      .from(hrShiftSchedulingPolicies)
      .where(eq(hrShiftSchedulingPolicies.organizationId, input.organizationId))
      .limit(1);

    if (!policy?.swapRequestsEnabled) {
      throw new HrShiftWorkflowCommandError("swap_disabled");
    }

    const assignment = await loadAssignmentForSwap(
      db,
      input.organizationId,
      input.requesterAssignmentId,
    );

    if (assignment.employeeId !== input.requesterEmployeeId) {
      throw new HrShiftWorkflowCommandError("swap_ineligible");
    }

    if (await hasPendingSwapOnAssignment(db, input.organizationId, assignment.id)) {
      throw new HrShiftWorkflowCommandError("swap_ineligible");
    }

    const [requester] = await db
      .select({ managerEmployeeId: hrEmployees.managerEmployeeId })
      .from(hrEmployees)
      .where(
        and(
          eq(hrEmployees.organizationId, input.organizationId),
          eq(hrEmployees.id, input.requesterEmployeeId),
        ),
      )
      .limit(1);

    const swapRequestId = createEntityId("hr_sh_swp");
    await db.insert(hrShiftSwapRequests).values({
      id: swapRequestId,
      organizationId: input.organizationId,
      requesterEmployeeId: input.requesterEmployeeId,
      requesterAssignmentId: input.requesterAssignmentId,
      targetEmployeeId: input.targetEmployeeId ?? null,
      targetAssignmentId: input.targetAssignmentId ?? null,
      reason: input.reason.trim(),
      status: "pending",
      currentApproverAuthUserId: null,
    });

    await appendShiftAuditEvent(db, {
      organizationId: input.organizationId,
      action: "swap_submitted",
      summary: "Shift swap request submitted",
      actorAuthUserId: input.actorAuthUserId,
      employeeId: input.requesterEmployeeId,
      assignmentId: input.requesterAssignmentId,
      swapRequestId,
      metadata: {
        targetEmployeeId: input.targetEmployeeId ?? null,
        managerEmployeeId: requester?.managerEmployeeId ?? null,
      },
    });

    return { swapRequestId };
  });
}

export type HrShiftSwapDecision =
  | "approve"
  | "reject"
  | "return"
  | "override";

export async function decideHrShiftSwapRequest(input: {
  organizationId: string;
  swapRequestId: string;
  decision: HrShiftSwapDecision;
  actorAuthUserId: string;
  rejectionReason?: string | null;
  overrideReason?: string | null;
  returnedNote?: string | null;
  decisionNote?: string | null;
}): Promise<{ swapRequestId: string; status: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [swap] = await db
      .select()
      .from(hrShiftSwapRequests)
      .where(
        and(
          eq(hrShiftSwapRequests.organizationId, input.organizationId),
          eq(hrShiftSwapRequests.id, input.swapRequestId),
        ),
      )
      .limit(1);

    if (!swap) {
      throw new HrShiftWorkflowCommandError("swap_not_found");
    }
    if (!ACTIONABLE_STATUSES.has(swap.status)) {
      throw new HrShiftWorkflowCommandError("swap_not_actionable");
    }

    if (input.decision === "reject" && !input.rejectionReason?.trim()) {
      throw new HrShiftWorkflowCommandError("invalid_decision");
    }
    if (input.decision === "override" && !input.overrideReason?.trim()) {
      throw new HrShiftWorkflowCommandError("invalid_decision");
    }

    let nextStatus: (typeof hrShiftSwapRequests.$inferSelect)["status"];
    let auditAction: (typeof import("./schema/hr-shift-scheduling").hrShiftAuditActionEnum.enumValues)[number];

    switch (input.decision) {
      case "approve":
        nextStatus = "approved";
        auditAction = "swap_approved";
        break;
      case "reject":
        nextStatus = "rejected";
        auditAction = "swap_rejected";
        break;
      case "return":
        nextStatus = "returned";
        auditAction = "swap_returned";
        break;
      case "override":
        nextStatus = "overridden";
        auditAction = "swap_overridden";
        break;
      default:
        throw new HrShiftWorkflowCommandError("invalid_decision");
    }

    await db
      .update(hrShiftSwapRequests)
      .set({
        status: nextStatus,
        rejectionReason:
          input.decision === "reject"
            ? input.rejectionReason?.trim() || null
            : swap.rejectionReason,
        overrideReason:
          input.decision === "override"
            ? input.overrideReason?.trim() || null
            : swap.overrideReason,
        decisionNote: input.decisionNote?.trim() || input.returnedNote?.trim() || null,
        decidedAt: new Date(),
        currentApproverAuthUserId: null,
      })
      .where(eq(hrShiftSwapRequests.id, input.swapRequestId));

    if (input.decision === "approve" || input.decision === "override") {
      const requesterAssignment = await loadAssignmentForSwap(
        db,
        input.organizationId,
        swap.requesterAssignmentId,
      );

      if (swap.targetAssignmentId && swap.targetEmployeeId) {
        const targetAssignment = await loadAssignmentForSwap(
          db,
          input.organizationId,
          swap.targetAssignmentId,
        );

        await db
          .update(hrShiftAssignments)
          .set({ employeeId: swap.targetEmployeeId })
          .where(eq(hrShiftAssignments.id, requesterAssignment.id));

        await db
          .update(hrShiftAssignments)
          .set({ employeeId: swap.requesterEmployeeId })
          .where(eq(hrShiftAssignments.id, targetAssignment.id));
      } else if (swap.targetEmployeeId) {
        await db
          .update(hrShiftAssignments)
          .set({ employeeId: swap.targetEmployeeId })
          .where(eq(hrShiftAssignments.id, requesterAssignment.id));
      }
    }

    await appendShiftAuditEvent(db, {
      organizationId: input.organizationId,
      action: auditAction,
      summary: `Shift swap ${input.decision}`,
      actorAuthUserId: input.actorAuthUserId,
      employeeId: swap.requesterEmployeeId,
      assignmentId: swap.requesterAssignmentId,
      swapRequestId: input.swapRequestId,
      metadata: {
        rejectionReason: input.rejectionReason ?? null,
        overrideReason: input.overrideReason ?? null,
      },
    });

    return { swapRequestId: input.swapRequestId, status: nextStatus };
  });
}

export async function listHrShiftSwapRequestsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  status?: (typeof hrShiftSwapRequests.$inferSelect)["status"] | "actionable";
  requesterEmployeeId?: string;
  managerEmployeeId?: string;
  search?: string;
}): Promise<HrShiftSwapRequestWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrShiftSwapRequests.organizationId, input.organizationId),
    ];

    if (input.status === "actionable") {
      conditions.push(inArray(hrShiftSwapRequests.status, ["pending", "returned"]));
    } else if (input.status) {
      conditions.push(eq(hrShiftSwapRequests.status, input.status));
    }

    if (input.requesterEmployeeId) {
      conditions.push(
        eq(hrShiftSwapRequests.requesterEmployeeId, input.requesterEmployeeId),
      );
    }

    if (input.managerEmployeeId) {
      conditions.push(
        sql`${hrShiftSwapRequests.requesterEmployeeId} IN (
          SELECT id FROM ${hrEmployees}
          WHERE ${hrEmployees.organizationId} = ${input.organizationId}
          AND ${hrEmployees.managerEmployeeId} = ${input.managerEmployeeId}
        )`,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrShiftSwapRequests)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrShiftSwapRequests.id,
        requesterEmployeeId: hrShiftSwapRequests.requesterEmployeeId,
        requesterEmployeeNumber: hrEmployees.employeeNumber,
        requesterLegalName: hrEmployees.legalName,
        requesterPreferredName: hrEmployees.preferredName,
        requesterAssignmentId: hrShiftSwapRequests.requesterAssignmentId,
        targetEmployeeId: hrShiftSwapRequests.targetEmployeeId,
        targetAssignmentId: hrShiftSwapRequests.targetAssignmentId,
        status: hrShiftSwapRequests.status,
        reason: hrShiftSwapRequests.reason,
        rejectionReason: hrShiftSwapRequests.rejectionReason,
        overrideReason: hrShiftSwapRequests.overrideReason,
        submittedAt: hrShiftSwapRequests.submittedAt,
        decidedAt: hrShiftSwapRequests.decidedAt,
      })
      .from(hrShiftSwapRequests)
      .innerJoin(
        hrEmployees,
        eq(hrShiftSwapRequests.requesterEmployeeId, hrEmployees.id),
      )
      .where(whereClause)
      .orderBy(desc(hrShiftSwapRequests.submittedAt))
      .limit(pageSize)
      .offset(offset);

    const targetIds = rows
      .map((row) => row.targetEmployeeId)
      .filter((id): id is string => Boolean(id));

    const targetEmployees =
      targetIds.length > 0
        ? await db
            .select({
              id: hrEmployees.id,
              employeeNumber: hrEmployees.employeeNumber,
              legalName: hrEmployees.legalName,
              preferredName: hrEmployees.preferredName,
            })
            .from(hrEmployees)
            .where(
              and(
                eq(hrEmployees.organizationId, input.organizationId),
                inArray(hrEmployees.id, targetIds),
              ),
            )
        : [];

    const targetById = new Map(targetEmployees.map((row) => [row.id, row]));

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => {
        const targetEmployee = row.targetEmployeeId
          ? targetById.get(row.targetEmployeeId)
          : null;
        return {
          id: row.id,
          requesterEmployeeId: row.requesterEmployeeId,
          requesterEmployeeNumber: row.requesterEmployeeNumber,
          requesterDisplayName:
            row.requesterPreferredName?.trim() || row.requesterLegalName,
          requesterAssignmentId: row.requesterAssignmentId,
          targetEmployeeId: row.targetEmployeeId,
          targetEmployeeNumber: targetEmployee?.employeeNumber ?? null,
          targetDisplayName: targetEmployee
            ? targetEmployee.preferredName?.trim() || targetEmployee.legalName
            : null,
          targetAssignmentId: row.targetAssignmentId,
          status: row.status,
          reason: row.reason,
          rejectionReason: row.rejectionReason,
          overrideReason: row.overrideReason,
          submittedAt: row.submittedAt,
          decidedAt: row.decidedAt,
        };
      }),
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + rows.length < actualTotal,
    };
  });
}

export type HrShiftScheduleChangeRequestRow = {
  id: string;
  requestingEmployeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  assignmentId: string | null;
  status: (typeof hrShiftScheduleChangeRequests.$inferSelect)["status"];
  proposedChanges: HrShiftScheduleChangePayload;
  reason: string;
  rejectionReason: string | null;
  overrideReason: string | null;
  submittedAt: Date;
  decidedAt: Date | null;
};

export type HrShiftScheduleChangeRequestWindow = {
  rows: readonly HrShiftScheduleChangeRequestRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export async function submitHrShiftScheduleChangeRequest(input: {
  organizationId: string;
  requestingEmployeeId: string;
  assignmentId?: string | null;
  proposedChanges: HrShiftScheduleChangePayload;
  reason: string;
  initiatorAuthUserId?: string | null;
  managerInitiated?: boolean;
}): Promise<{ scheduleChangeRequestId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    if (input.assignmentId) {
      await loadAssignmentForSwap(db, input.organizationId, input.assignmentId);
    }

    const scheduleChangeRequestId = createEntityId("hr_sh_chg");
    await db.insert(hrShiftScheduleChangeRequests).values({
      id: scheduleChangeRequestId,
      organizationId: input.organizationId,
      requestingEmployeeId: input.requestingEmployeeId,
      assignmentId: input.assignmentId ?? null,
      proposedChanges: input.proposedChanges,
      reason: input.reason.trim(),
      status: input.managerInitiated ? "approved" : "pending",
      initiatorAuthUserId: input.initiatorAuthUserId ?? null,
      decidedAt: input.managerInitiated ? new Date() : null,
    });

    if (input.managerInitiated && input.assignmentId) {
      const changes = input.proposedChanges;
      const patch: Partial<typeof hrShiftAssignments.$inferInsert> = {};
      if (changes.templateId) patch.templateId = changes.templateId;
      if (changes.notes !== undefined) patch.notes = changes.notes ?? null;
      if (Object.keys(patch).length > 0) {
        await db
          .update(hrShiftAssignments)
          .set(patch)
          .where(eq(hrShiftAssignments.id, input.assignmentId));
      }
    }

    await appendShiftAuditEvent(db, {
      organizationId: input.organizationId,
      action: "schedule_change_submitted",
      summary: input.managerInitiated
        ? "Manager-initiated schedule change applied"
        : "Schedule change request submitted",
      actorAuthUserId: input.initiatorAuthUserId,
      employeeId: input.requestingEmployeeId,
      assignmentId: input.assignmentId ?? null,
      scheduleChangeRequestId,
    });

    return { scheduleChangeRequestId };
  });
}

export type HrShiftScheduleChangeDecision =
  | "approve"
  | "reject"
  | "return"
  | "override";

export async function decideHrShiftScheduleChangeRequest(input: {
  organizationId: string;
  scheduleChangeRequestId: string;
  decision: HrShiftScheduleChangeDecision;
  actorAuthUserId: string;
  rejectionReason?: string | null;
  overrideReason?: string | null;
  returnedNote?: string | null;
  decisionNote?: string | null;
}): Promise<{ scheduleChangeRequestId: string; status: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [request] = await db
      .select()
      .from(hrShiftScheduleChangeRequests)
      .where(
        and(
          eq(hrShiftScheduleChangeRequests.organizationId, input.organizationId),
          eq(hrShiftScheduleChangeRequests.id, input.scheduleChangeRequestId),
        ),
      )
      .limit(1);

    if (!request) {
      throw new HrShiftWorkflowCommandError("schedule_change_not_found");
    }
    if (!ACTIONABLE_STATUSES.has(request.status)) {
      throw new HrShiftWorkflowCommandError("schedule_change_not_actionable");
    }

    if (input.decision === "reject" && !input.rejectionReason?.trim()) {
      throw new HrShiftWorkflowCommandError("invalid_decision");
    }
    if (input.decision === "override" && !input.overrideReason?.trim()) {
      throw new HrShiftWorkflowCommandError("invalid_decision");
    }

    let nextStatus: (typeof hrShiftScheduleChangeRequests.$inferSelect)["status"];
    let auditAction: (typeof import("./schema/hr-shift-scheduling").hrShiftAuditActionEnum.enumValues)[number];

    switch (input.decision) {
      case "approve":
        nextStatus = "approved";
        auditAction = "schedule_change_approved";
        break;
      case "reject":
        nextStatus = "rejected";
        auditAction = "schedule_change_rejected";
        break;
      case "return":
        nextStatus = "returned";
        auditAction = "schedule_change_returned";
        break;
      case "override":
        nextStatus = "overridden";
        auditAction = "schedule_change_overridden";
        break;
      default:
        throw new HrShiftWorkflowCommandError("invalid_decision");
    }

    await db
      .update(hrShiftScheduleChangeRequests)
      .set({
        status: nextStatus,
        rejectionReason:
          input.decision === "reject"
            ? input.rejectionReason?.trim() || null
            : request.rejectionReason,
        overrideReason:
          input.decision === "override"
            ? input.overrideReason?.trim() || null
            : request.overrideReason,
        decisionNote: input.decisionNote?.trim() || input.returnedNote?.trim() || null,
        decidedAt: new Date(),
        currentApproverAuthUserId: null,
      })
      .where(eq(hrShiftScheduleChangeRequests.id, input.scheduleChangeRequestId));

    if (
      (input.decision === "approve" || input.decision === "override") &&
      request.assignmentId
    ) {
      const changes = request.proposedChanges;
      const patch: Partial<typeof hrShiftAssignments.$inferInsert> = {};
      if (changes.templateId) patch.templateId = changes.templateId;
      if (changes.notes !== undefined) patch.notes = changes.notes ?? null;
      if (Object.keys(patch).length > 0) {
        await db
          .update(hrShiftAssignments)
          .set(patch)
          .where(eq(hrShiftAssignments.id, request.assignmentId));
      }
    }

    await appendShiftAuditEvent(db, {
      organizationId: input.organizationId,
      action: auditAction,
      summary: `Schedule change ${input.decision}`,
      actorAuthUserId: input.actorAuthUserId,
      employeeId: request.requestingEmployeeId,
      assignmentId: request.assignmentId,
      scheduleChangeRequestId: input.scheduleChangeRequestId,
      metadata: {
        rejectionReason: input.rejectionReason ?? null,
        overrideReason: input.overrideReason ?? null,
      },
    });

    return {
      scheduleChangeRequestId: input.scheduleChangeRequestId,
      status: nextStatus,
    };
  });
}

export async function listHrShiftScheduleChangeRequestsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  status?: (typeof hrShiftScheduleChangeRequests.$inferSelect)["status"] | "actionable";
  requestingEmployeeId?: string;
}): Promise<HrShiftScheduleChangeRequestWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrShiftScheduleChangeRequests.organizationId, input.organizationId),
    ];

    if (input.status === "actionable") {
      conditions.push(
        inArray(hrShiftScheduleChangeRequests.status, ["pending", "returned"]),
      );
    } else if (input.status) {
      conditions.push(eq(hrShiftScheduleChangeRequests.status, input.status));
    }

    if (input.requestingEmployeeId) {
      conditions.push(
        eq(
          hrShiftScheduleChangeRequests.requestingEmployeeId,
          input.requestingEmployeeId,
        ),
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrShiftScheduleChangeRequests)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrShiftScheduleChangeRequests.id,
        requestingEmployeeId: hrShiftScheduleChangeRequests.requestingEmployeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        assignmentId: hrShiftScheduleChangeRequests.assignmentId,
        status: hrShiftScheduleChangeRequests.status,
        proposedChanges: hrShiftScheduleChangeRequests.proposedChanges,
        reason: hrShiftScheduleChangeRequests.reason,
        rejectionReason: hrShiftScheduleChangeRequests.rejectionReason,
        overrideReason: hrShiftScheduleChangeRequests.overrideReason,
        submittedAt: hrShiftScheduleChangeRequests.submittedAt,
        decidedAt: hrShiftScheduleChangeRequests.decidedAt,
      })
      .from(hrShiftScheduleChangeRequests)
      .innerJoin(
        hrEmployees,
        eq(hrShiftScheduleChangeRequests.requestingEmployeeId, hrEmployees.id),
      )
      .where(whereClause)
      .orderBy(desc(hrShiftScheduleChangeRequests.submittedAt))
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        requestingEmployeeId: row.requestingEmployeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName?.trim() || row.legalName,
        assignmentId: row.assignmentId,
        status: row.status,
        proposedChanges: row.proposedChanges,
        reason: row.reason,
        rejectionReason: row.rejectionReason,
        overrideReason: row.overrideReason,
        submittedAt: row.submittedAt,
        decidedAt: row.decidedAt,
      })),
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + rows.length < actualTotal,
    };
  });
}
