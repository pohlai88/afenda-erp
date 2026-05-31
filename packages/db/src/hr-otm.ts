import { and, count, desc, eq, gte, ilike, isNull, lte, or, sql } from "drizzle-orm";

import { runWithOrganizationContext } from "./client";
import { createEntityId } from "./ids";
import {
  computeOtmDurationMinutesFromTimeRange,
  formatOtmStatusLabel,
  HRM_OTM_PENDING_APPROVAL_STATUSES,
  resolveOtmEligibilityForSubmit,
  resolveOtmEligibilityFromRules,
  type HrOvertimeEligibilityResult,
  type HrOvertimeEligibilityRuleRow,
  type HrOvertimeReportGroupBy,
  type HrOvertimeRequestStatus,
  type HrOvertimeType,
} from "./hr-otm.shared";
import {
  calculateOtmPayableForApproval,
  DEFAULT_HR_OVERTIME_POLICY,
  deriveOtmDayCategoryFromType,
  type HrOvertimeCalculationResult,
  type HrOvertimeExceptionDraft,
  type HrOvertimePolicyConfig,
  type HrOvertimeRateRuleRow,
  type HrOvertimePeriodUsage,
} from "./hr-otm-calculation.shared";
import {
  hrDepartments,
  hrEmployees,
  hrOvertimeAuditEvents,
  hrOvertimeCalculationSnapshots,
  hrOvertimeEligibilityRules,
  hrOvertimeExceptions,
  hrOvertimeNotifications,
  hrOvertimePolicies,
  hrOvertimeRateRules,
  hrOvertimeRequests,
  hrPositions,
} from "./schema/hr";

export * from "./hr-otm.shared";
export * from "./hr-otm-calculation.shared";

export class HrOtmCommandError extends Error {
  readonly code:
    | "employee_not_found"
    | "request_not_found"
    | "invalid_hours"
    | "invalid_time_range"
    | "invalid_status_transition"
    | "request_not_editable"
    | "request_not_actionable"
    | "ineligible_without_override"
    | "rule_not_found"
    | "rejection_reason_required"
    | "adjust_reason_required"
    | "return_reason_required"
    | "unauthorized_approver"
    | "open_exceptions_block_approval"
    | "exception_not_found";

  constructor(code: HrOtmCommandError["code"], message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const MAX_OVERTIME_HOURS = 24;

function clampPageSize(limit: number | undefined): number {
  if (limit === undefined || !Number.isFinite(limit)) {
    return DEFAULT_PAGE_SIZE;
  }
  const size = Math.floor(limit);
  if (size < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(size, MAX_PAGE_SIZE);
}

function normalizeHours(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0 || hours > MAX_OVERTIME_HOURS) {
    throw new HrOtmCommandError("invalid_hours");
  }
  return hours.toFixed(2);
}

function resolveHoursFromInput(input: {
  hours?: number;
  startTime?: string | null;
  endTime?: string | null;
}): string {
  if (input.hours !== undefined) {
    return normalizeHours(input.hours);
  }
  if (input.startTime && input.endTime) {
    const minutes = computeOtmDurationMinutesFromTimeRange({
      startTime: input.startTime,
      endTime: input.endTime,
    });
    if (minutes === null || minutes <= 0) {
      throw new HrOtmCommandError("invalid_time_range");
    }
    return normalizeHours(minutes / 60);
  }
  throw new HrOtmCommandError("invalid_hours");
}

async function loadEmployeeOtmContext(
  organizationId: string,
  employeeId: string,
) {
  return runWithOrganizationContext(organizationId, async (db) => {
    const [employee] = await db
      .select({
        id: hrEmployees.id,
        legalEntityCode: hrEmployees.legalEntityCode,
        countryCode: hrEmployees.countryCode,
        workLocationCode: hrEmployees.workLocationCode,
        currentDepartmentId: hrEmployees.currentDepartmentId,
        currentPositionId: hrEmployees.currentPositionId,
        grade: hrEmployees.grade,
        employmentType: hrEmployees.employmentType,
        workerCategory: hrEmployees.workerCategory,
        departmentCostCenter: hrDepartments.costCenterCode,
        positionCostCenter: hrPositions.costCenterCode,
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
          eq(hrEmployees.organizationId, organizationId),
          eq(hrEmployees.id, employeeId),
          isNull(hrEmployees.archivedAt),
        ),
      )
      .limit(1);

    if (!employee) {
      throw new HrOtmCommandError("employee_not_found");
    }

    return {
      id: employee.id,
      legalEntityCode: employee.legalEntityCode,
      countryCode: employee.countryCode,
      workLocationCode: employee.workLocationCode,
      currentDepartmentId: employee.currentDepartmentId,
      currentPositionId: employee.currentPositionId,
      grade: employee.grade,
      employmentType: employee.employmentType,
      workerCategory: employee.workerCategory,
      costCenterCode:
        employee.positionCostCenter ?? employee.departmentCostCenter ?? null,
    };
  });
}

export async function appendHrOvertimeAuditEvent(input: {
  organizationId: string;
  requestId?: string | null;
  employeeId?: string | null;
  action: (typeof hrOvertimeAuditEvents.$inferInsert)["action"];
  actorAuthUserId?: string | null;
  actorEmployeeId?: string | null;
  summary: string;
  metadata?: Record<string, unknown>;
}): Promise<{ auditEventId: string }> {
  const auditEventId = createEntityId("hr_ot_aud");
  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(hrOvertimeAuditEvents).values({
      id: auditEventId,
      organizationId: input.organizationId,
      requestId: input.requestId ?? null,
      employeeId: input.employeeId ?? null,
      action: input.action,
      actorAuthUserId: input.actorAuthUserId ?? null,
      actorEmployeeId: input.actorEmployeeId ?? null,
      summary: input.summary,
      metadata: input.metadata ?? null,
    });
  });
  return { auditEventId };
}

export async function listHrOvertimeEligibilityRules(input: {
  organizationId: string;
  policyGroupCode?: string;
  overtimeType?: HrOvertimeType;
}): Promise<readonly HrOvertimeEligibilityRuleRow[]> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrOvertimeEligibilityRules.organizationId, input.organizationId),
    ];
    if (input.policyGroupCode) {
      conditions.push(
        eq(hrOvertimeEligibilityRules.policyGroupCode, input.policyGroupCode),
      );
    }
    if (input.overtimeType) {
      conditions.push(
        eq(hrOvertimeEligibilityRules.overtimeType, input.overtimeType),
      );
    }

    const rows = await db
      .select()
      .from(hrOvertimeEligibilityRules)
      .where(and(...conditions))
      .orderBy(desc(hrOvertimeEligibilityRules.effectiveFrom));

    return rows.map((row) => ({
      id: row.id,
      policyGroupCode: row.policyGroupCode,
      overtimeType: row.overtimeType,
      legalEntityCode: row.legalEntityCode,
      countryCode: row.countryCode,
      workLocationCode: row.workLocationCode,
      departmentId: row.departmentId,
      roleCode: row.roleCode,
      grade: row.grade,
      employmentType: row.employmentType,
      employeeCategory: row.employeeCategory,
      eligible: row.eligible,
      requiresExceptionApproval: row.requiresExceptionApproval,
      effectiveFrom: row.effectiveFrom,
      effectiveTo: row.effectiveTo,
    }));
  });
}

export async function createHrOvertimeEligibilityRule(input: {
  organizationId: string;
  policyGroupCode?: string;
  overtimeType?: HrOvertimeType | null;
  legalEntityCode?: string | null;
  countryCode?: string | null;
  workLocationCode?: string | null;
  departmentId?: string | null;
  roleCode?: string | null;
  grade?: string | null;
  employmentType?: string | null;
  employeeCategory?: string | null;
  eligible?: boolean;
  requiresExceptionApproval?: boolean;
  effectiveFrom?: Date;
  effectiveTo?: Date | null;
}): Promise<{ ruleId: string }> {
  const ruleId = createEntityId("hr_ot_elig");
  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(hrOvertimeEligibilityRules).values({
      id: ruleId,
      organizationId: input.organizationId,
      policyGroupCode: input.policyGroupCode ?? "default",
      overtimeType: input.overtimeType ?? null,
      legalEntityCode: input.legalEntityCode ?? null,
      countryCode: input.countryCode ?? null,
      workLocationCode: input.workLocationCode ?? null,
      departmentId: input.departmentId ?? null,
      roleCode: input.roleCode ?? null,
      grade: input.grade ?? null,
      employmentType: input.employmentType ?? null,
      employeeCategory: input.employeeCategory ?? null,
      eligible: input.eligible ?? true,
      requiresExceptionApproval: input.requiresExceptionApproval ?? false,
      effectiveFrom: input.effectiveFrom ?? new Date(),
      effectiveTo: input.effectiveTo ?? null,
    });
  });
  return { ruleId };
}

export async function evaluateHrOvertimeEmployeeEligibility(input: {
  organizationId: string;
  employeeId: string;
  overtimeType: HrOvertimeType;
  policyGroupCode?: string;
  asOf?: Date;
}): Promise<HrOvertimeEligibilityResult> {
  const policyGroupCode = input.policyGroupCode ?? "default";
  const asOf = input.asOf ?? new Date();
  const employee = await loadEmployeeOtmContext(
    input.organizationId,
    input.employeeId,
  );

  const rules = await listHrOvertimeEligibilityRules({
    organizationId: input.organizationId,
    policyGroupCode,
    overtimeType: input.overtimeType,
  });

  return resolveOtmEligibilityFromRules({
    rules,
    context: {
      overtimeType: input.overtimeType,
      legalEntityCode: employee.legalEntityCode,
      countryCode: employee.countryCode,
      workLocationCode: employee.workLocationCode,
      departmentId: employee.currentDepartmentId,
      roleCode: null,
      grade: employee.grade,
      employmentType: employee.employmentType,
      employeeCategory: employee.workerCategory,
      asOf,
    },
  });
}

export async function validateHrOvertimeEligibilityForSubmit(input: {
  organizationId: string;
  employeeId: string;
  overtimeType: HrOvertimeType;
  policyGroupCode?: string;
  eligibilityExceptionReason?: string | null;
}): Promise<HrOvertimeEligibilityResult> {
  const result = await evaluateHrOvertimeEmployeeEligibility(input);
  const resolved = resolveOtmEligibilityForSubmit({
    result,
    eligibilityExceptionReason: input.eligibilityExceptionReason,
  });
  if (!resolved.eligible) {
    throw new HrOtmCommandError("ineligible_without_override");
  }
  return resolved;
}

export type HrOvertimeRequestRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  departmentId: string | null;
  departmentName: string | null;
  managerEmployeeId: string | null;
  costCenterCode: string | null;
  legalEntityCode: string | null;
  workLocationCode: string | null;
  overtimeType: HrOvertimeType;
  timingKind: (typeof hrOvertimeRequests.$inferSelect)["timingKind"];
  status: HrOvertimeRequestStatus;
  statusLabel: string;
  policyGroupCode: string;
  workDate: Date;
  startTime: string | null;
  endTime: string | null;
  hours: string;
  payableMinutes: number | null;
  amountCents: number | null;
  earningCode: string | null;
  reason: string | null;
  decisionNote: string | null;
  returnReason: string | null;
  submittedAt: Date | null;
  decidedAt: Date | null;
  payrollReadyAt: Date | null;
  paidAt: Date | null;
};

export type HrOvertimeRequestWindow = {
  rows: readonly HrOvertimeRequestRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

function mapOvertimeRequestRow(row: {
  id: string;
  employeeId: string;
  employeeNumber: string;
  legalName: string;
  preferredName: string | null;
  departmentId: string | null;
  departmentName: string | null;
  managerEmployeeId: string | null;
  costCenterCode: string | null;
  legalEntityCode: string | null;
  workLocationCode: string | null;
  overtimeType: HrOvertimeType;
  timingKind: (typeof hrOvertimeRequests.$inferSelect)["timingKind"];
  status: HrOvertimeRequestStatus;
  policyGroupCode: string;
  workDate: Date;
  startTime: string | null;
  endTime: string | null;
  hours: string;
  payableMinutes: number | null;
  amountCents: number | null;
  earningCode: string | null;
  reason: string | null;
  decisionNote: string | null;
  returnReason: string | null;
  submittedAt: Date | null;
  decidedAt: Date | null;
  payrollReadyAt: Date | null;
  paidAt: Date | null;
}): HrOvertimeRequestRow {
  return {
    id: row.id,
    employeeId: row.employeeId,
    employeeNumber: row.employeeNumber,
    employeeDisplayName: row.preferredName?.trim() || row.legalName,
    departmentId: row.departmentId,
    departmentName: row.departmentName,
    managerEmployeeId: row.managerEmployeeId,
    costCenterCode: row.costCenterCode,
    legalEntityCode: row.legalEntityCode,
    workLocationCode: row.workLocationCode,
    overtimeType: row.overtimeType,
    timingKind: row.timingKind,
    status: row.status,
    statusLabel: formatOtmStatusLabel(row.status),
    policyGroupCode: row.policyGroupCode,
    workDate: row.workDate,
    startTime: row.startTime,
    endTime: row.endTime,
    hours: row.hours,
    payableMinutes: row.payableMinutes,
    amountCents: row.amountCents,
    earningCode: row.earningCode,
    reason: row.reason,
    decisionNote: row.decisionNote,
    returnReason: row.returnReason,
    submittedAt: row.submittedAt,
    decidedAt: row.decidedAt,
    payrollReadyAt: row.payrollReadyAt,
    paidAt: row.paidAt,
  };
}

export async function listHrOvertimeRequestsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  status?: HrOvertimeRequestStatus;
  statuses?: readonly HrOvertimeRequestStatus[];
  employeeId?: string;
  pendingOnly?: boolean;
  periodStart?: Date;
  periodEnd?: Date;
  visibleEmployeeIds?: readonly string[] | null;
}): Promise<HrOvertimeRequestWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrOvertimeRequests.organizationId, input.organizationId),
    ];

    if (input.pendingOnly) {
      conditions.push(
        sql`${hrOvertimeRequests.status} IN (${sql.join(
          HRM_OTM_PENDING_APPROVAL_STATUSES.map((status) => sql`${status}`),
          sql`, `,
        )})`,
      );
    } else if (input.statuses?.length) {
      conditions.push(
        sql`${hrOvertimeRequests.status} IN (${sql.join(
          input.statuses.map((status) => sql`${status}`),
          sql`, `,
        )})`,
      );
    } else if (input.status) {
      conditions.push(eq(hrOvertimeRequests.status, input.status));
    }

    if (input.employeeId) {
      conditions.push(eq(hrOvertimeRequests.employeeId, input.employeeId));
    }

    if (input.periodStart) {
      conditions.push(gte(hrOvertimeRequests.workDate, input.periodStart));
    }
    if (input.periodEnd) {
      conditions.push(lte(hrOvertimeRequests.workDate, input.periodEnd));
    }

    if (input.visibleEmployeeIds) {
      if (input.visibleEmployeeIds.length === 0) {
        return { rows: [], pageSize, totalCount: 0, hasNextPage: false };
      }
      conditions.push(
        sql`${hrOvertimeRequests.employeeId} IN (${sql.join(
          input.visibleEmployeeIds.map((id) => sql`${id}`),
          sql`, `,
        )})`,
      );
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrOvertimeRequests.reason, pattern),
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrOvertimeRequests)
      .innerJoin(hrEmployees, eq(hrOvertimeRequests.employeeId, hrEmployees.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrOvertimeRequests.id,
        employeeId: hrOvertimeRequests.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        departmentId: hrEmployees.currentDepartmentId,
        departmentName: hrDepartments.name,
        managerEmployeeId: hrEmployees.managerEmployeeId,
        legalEntityCode: hrEmployees.legalEntityCode,
        workLocationCode: hrEmployees.workLocationCode,
        departmentCostCenter: hrDepartments.costCenterCode,
        positionCostCenter: hrPositions.costCenterCode,
        overtimeType: hrOvertimeRequests.overtimeType,
        timingKind: hrOvertimeRequests.timingKind,
        status: hrOvertimeRequests.status,
        policyGroupCode: hrOvertimeRequests.policyGroupCode,
        workDate: hrOvertimeRequests.workDate,
        startTime: hrOvertimeRequests.startTime,
        endTime: hrOvertimeRequests.endTime,
        hours: hrOvertimeRequests.hours,
        payableMinutes: hrOvertimeRequests.payableMinutes,
        amountCents: hrOvertimeRequests.amountCents,
        earningCode: hrOvertimeRequests.earningCode,
        reason: hrOvertimeRequests.reason,
        decisionNote: hrOvertimeRequests.decisionNote,
        returnReason: hrOvertimeRequests.returnReason,
        submittedAt: hrOvertimeRequests.submittedAt,
        decidedAt: hrOvertimeRequests.decidedAt,
        payrollReadyAt: hrOvertimeRequests.payrollReadyAt,
        paidAt: hrOvertimeRequests.paidAt,
      })
      .from(hrOvertimeRequests)
      .innerJoin(hrEmployees, eq(hrOvertimeRequests.employeeId, hrEmployees.id))
      .leftJoin(
        hrDepartments,
        eq(hrEmployees.currentDepartmentId, hrDepartments.id),
      )
      .leftJoin(
        hrPositions,
        eq(hrEmployees.currentPositionId, hrPositions.id),
      )
      .where(whereClause)
      .orderBy(desc(hrOvertimeRequests.submittedAt))
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) =>
        mapOvertimeRequestRow({
          ...row,
          costCenterCode: row.positionCostCenter ?? row.departmentCostCenter,
        }),
      ),
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + rows.length < actualTotal,
    };
  });
}

async function getHrOvertimeRequestRecord(
  organizationId: string,
  requestId: string,
) {
  return runWithOrganizationContext(organizationId, async (db) => {
    const [request] = await db
      .select({
        id: hrOvertimeRequests.id,
        employeeId: hrOvertimeRequests.employeeId,
        status: hrOvertimeRequests.status,
      })
      .from(hrOvertimeRequests)
      .where(
        and(
          eq(hrOvertimeRequests.organizationId, organizationId),
          eq(hrOvertimeRequests.id, requestId),
        ),
      )
      .limit(1);
    return request ?? null;
  });
}

export async function saveHrOvertimeDraft(input: {
  organizationId: string;
  employeeId: string;
  requestId?: string;
  overtimeType: HrOvertimeType;
  timingKind?: (typeof hrOvertimeRequests.$inferInsert)["timingKind"];
  workDate: Date;
  startTime?: string | null;
  endTime?: string | null;
  hours?: number;
  reason?: string | null;
  policyGroupCode?: string;
}): Promise<{ requestId: string }> {
  await loadEmployeeOtmContext(input.organizationId, input.employeeId);
  const hours = resolveHoursFromInput(input);

  if (input.requestId) {
    const requestId = input.requestId;
    const existing = await getHrOvertimeRequestRecord(
      input.organizationId,
      requestId,
    );
    if (!existing || existing.employeeId !== input.employeeId) {
      throw new HrOtmCommandError("request_not_found");
    }
    if (existing.status !== "draft" && existing.status !== "returned") {
      throw new HrOtmCommandError("request_not_editable");
    }

    await runWithOrganizationContext(input.organizationId, async (db) => {
      await db
        .update(hrOvertimeRequests)
        .set({
          overtimeType: input.overtimeType,
          timingKind: input.timingKind ?? "planned",
          workDate: input.workDate,
          startTime: input.startTime?.trim() || null,
          endTime: input.endTime?.trim() || null,
          hours,
          reason: input.reason?.trim() || null,
          policyGroupCode: input.policyGroupCode ?? "default",
          status: "draft",
        })
        .where(eq(hrOvertimeRequests.id, requestId));
    });

    await appendHrOvertimeAuditEvent({
      organizationId: input.organizationId,
      requestId,
      employeeId: input.employeeId,
      action: "request_draft_save",
      summary: "Overtime draft saved",
    });

    return { requestId };
  }

  const requestId = createEntityId("hr_ot_req");
  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(hrOvertimeRequests).values({
      id: requestId,
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      overtimeType: input.overtimeType,
      timingKind: input.timingKind ?? "planned",
      status: "draft",
      workDate: input.workDate,
      startTime: input.startTime?.trim() || null,
      endTime: input.endTime?.trim() || null,
      hours,
      reason: input.reason?.trim() || null,
      policyGroupCode: input.policyGroupCode ?? "default",
    });
  });

  await appendHrOvertimeAuditEvent({
    organizationId: input.organizationId,
    requestId,
    employeeId: input.employeeId,
    action: "request_create",
    summary: "Overtime draft created",
  });

  return { requestId };
}

export async function submitHrOvertimeDraft(input: {
  organizationId: string;
  employeeId: string;
  requestId: string;
  eligibilityExceptionReason?: string | null;
  actorAuthUserId?: string | null;
}): Promise<{ requestId: string }> {
  const existing = await getHrOvertimeRequestRecord(
    input.organizationId,
    input.requestId,
  );
  if (!existing || existing.employeeId !== input.employeeId) {
    throw new HrOtmCommandError("request_not_found");
  }
  if (existing.status !== "draft" && existing.status !== "returned") {
    throw new HrOtmCommandError("request_not_editable");
  }

  const [request] = await runWithOrganizationContext(
    input.organizationId,
    async (db) =>
      db
        .select({
          overtimeType: hrOvertimeRequests.overtimeType,
          policyGroupCode: hrOvertimeRequests.policyGroupCode,
        })
        .from(hrOvertimeRequests)
        .where(eq(hrOvertimeRequests.id, input.requestId))
        .limit(1),
  );

  if (!request) {
    throw new HrOtmCommandError("request_not_found");
  }

  await validateHrOvertimeEligibilityForSubmit({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    overtimeType: request.overtimeType,
    policyGroupCode: request.policyGroupCode,
    eligibilityExceptionReason: input.eligibilityExceptionReason,
  });

  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .update(hrOvertimeRequests)
      .set({
        status: "submitted",
        submittedAt: new Date(),
        eligibilityExceptionReason:
          input.eligibilityExceptionReason?.trim() || null,
      })
      .where(eq(hrOvertimeRequests.id, input.requestId));
  });

  await appendHrOvertimeAuditEvent({
    organizationId: input.organizationId,
    requestId: input.requestId,
    employeeId: input.employeeId,
    action: "request_submit",
    actorAuthUserId: input.actorAuthUserId ?? null,
    summary: "Overtime request submitted",
  });

  return { requestId: input.requestId };
}

export async function submitHrOvertimeRequest(input: {
  organizationId: string;
  employeeId: string;
  overtimeType: HrOvertimeType;
  timingKind?: (typeof hrOvertimeRequests.$inferInsert)["timingKind"];
  workDate: Date;
  startTime?: string | null;
  endTime?: string | null;
  hours?: number;
  reason?: string | null;
  policyGroupCode?: string;
  eligibilityExceptionReason?: string | null;
  actorAuthUserId?: string | null;
}): Promise<{ requestId: string }> {
  await validateHrOvertimeEligibilityForSubmit(input);
  const hours = resolveHoursFromInput(input);
  const requestId = createEntityId("hr_ot_req");

  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(hrOvertimeRequests).values({
      id: requestId,
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      overtimeType: input.overtimeType,
      timingKind: input.timingKind ?? "planned",
      status: "submitted",
      workDate: input.workDate,
      startTime: input.startTime?.trim() || null,
      endTime: input.endTime?.trim() || null,
      hours,
      reason: input.reason?.trim() || null,
      policyGroupCode: input.policyGroupCode ?? "default",
      eligibilityExceptionReason:
        input.eligibilityExceptionReason?.trim() || null,
      submittedAt: new Date(),
    });
  });

  await appendHrOvertimeAuditEvent({
    organizationId: input.organizationId,
    requestId,
    employeeId: input.employeeId,
    action: "request_submit",
    actorAuthUserId: input.actorAuthUserId ?? null,
    summary: "Overtime request submitted",
  });

  return { requestId };
}

export async function markHrOvertimePayrollReady(input: {
  organizationId: string;
  requestId: string;
  actorAuthUserId?: string | null;
}): Promise<{ requestId: string }> {
  const existing = await getHrOvertimeRequestRecord(
    input.organizationId,
    input.requestId,
  );
  if (!existing) {
    throw new HrOtmCommandError("request_not_found");
  }
  if (existing.status !== "approved") {
    throw new HrOtmCommandError("invalid_status_transition");
  }

  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .update(hrOvertimeRequests)
      .set({
        status: "payroll_ready",
        payrollReadyAt: new Date(),
      })
      .where(eq(hrOvertimeRequests.id, input.requestId));
  });

  await appendHrOvertimeAuditEvent({
    organizationId: input.organizationId,
    requestId: input.requestId,
    employeeId: existing.employeeId,
    action: "payroll_ready",
    actorAuthUserId: input.actorAuthUserId ?? null,
    summary: "Overtime marked payroll ready",
  });

  return { requestId: input.requestId };
}

export async function markHrOvertimePaid(input: {
  organizationId: string;
  requestId: string;
  actorAuthUserId?: string | null;
}): Promise<{ requestId: string }> {
  const existing = await getHrOvertimeRequestRecord(
    input.organizationId,
    input.requestId,
  );
  if (!existing) {
    throw new HrOtmCommandError("request_not_found");
  }
  if (existing.status !== "payroll_ready") {
    throw new HrOtmCommandError("invalid_status_transition");
  }

  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .update(hrOvertimeRequests)
      .set({
        status: "paid",
        paidAt: new Date(),
      })
      .where(eq(hrOvertimeRequests.id, input.requestId));
  });

  await appendHrOvertimeAuditEvent({
    organizationId: input.organizationId,
    requestId: input.requestId,
    employeeId: existing.employeeId,
    action: "paid",
    actorAuthUserId: input.actorAuthUserId ?? null,
    summary: "Overtime marked paid via payroll lock",
  });

  return { requestId: input.requestId };
}

export type HrOvertimeReportRow = {
  groupKey: string;
  groupLabel: string;
  periodLabel: string | null;
  requestCount: number;
  totalHours: number;
  payableMinutes: number;
  amountCents: number;
};

function periodBucketKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  return `${year}-${String(month).padStart(2, "0")}`;
}

export async function summarizeHrOvertimeReport(input: {
  organizationId: string;
  groupBy: HrOvertimeReportGroupBy;
  periodStart?: Date;
  periodEnd?: Date;
  visibleEmployeeIds?: readonly string[] | null;
}): Promise<readonly HrOvertimeReportRow[]> {
  const window = await listHrOvertimeRequestsWindow({
    organizationId: input.organizationId,
    limit: MAX_PAGE_SIZE,
    offset: 0,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    visibleEmployeeIds: input.visibleEmployeeIds,
  });

  const managerIds = [
    ...new Set(
      window.rows
        .map((row) => row.managerEmployeeId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const managerLabels = new Map<string, string>();
  if (managerIds.length > 0) {
    await runWithOrganizationContext(input.organizationId, async (db) => {
      const managers = await db
        .select({
          id: hrEmployees.id,
          legalName: hrEmployees.legalName,
          preferredName: hrEmployees.preferredName,
        })
        .from(hrEmployees)
        .where(
          and(
            eq(hrEmployees.organizationId, input.organizationId),
            sql`${hrEmployees.id} IN (${sql.join(
              managerIds.map((id) => sql`${id}`),
              sql`, `,
            )})`,
          ),
        );
      for (const manager of managers) {
        managerLabels.set(
          manager.id,
          manager.preferredName?.trim() || manager.legalName,
        );
      }
    });
  }

  const buckets = new Map<
    string,
    {
      label: string;
      periodLabel: string | null;
      requestCount: number;
      totalHours: number;
      payableMinutes: number;
      amountCents: number;
    }
  >();

  for (const row of window.rows) {
    const periodLabel = periodBucketKey(row.workDate);
    let groupKey: string;
    let groupLabel: string;

    switch (input.groupBy) {
      case "employee":
        groupKey = row.employeeId;
        groupLabel = `${row.employeeNumber} · ${row.employeeDisplayName}`;
        break;
      case "department":
        groupKey = row.departmentId ?? "unassigned";
        groupLabel = row.departmentName ?? "Unassigned";
        break;
      case "manager":
        groupKey = row.managerEmployeeId ?? "unassigned";
        groupLabel =
          (row.managerEmployeeId
            ? managerLabels.get(row.managerEmployeeId)
            : null) ?? "Unassigned";
        break;
      case "cost_center":
        groupKey = row.costCenterCode ?? "unassigned";
        groupLabel = row.costCenterCode ?? "Unassigned";
        break;
      case "legal_entity":
        groupKey = row.legalEntityCode ?? "unassigned";
        groupLabel = row.legalEntityCode ?? "Unassigned";
        break;
      case "location":
        groupKey = row.workLocationCode ?? "unassigned";
        groupLabel = row.workLocationCode ?? "Unassigned";
        break;
      case "overtime_type":
        groupKey = row.overtimeType;
        groupLabel = row.overtimeType;
        break;
      case "status":
        groupKey = row.status;
        groupLabel = row.statusLabel;
        break;
      case "period":
        groupKey = periodLabel;
        groupLabel = periodLabel;
        break;
      default:
        groupKey = row.employeeId;
        groupLabel = row.employeeDisplayName;
    }

    const bucketKey =
      input.groupBy === "period" ? groupKey : `${groupKey}::${periodLabel}`;

    const existing = buckets.get(bucketKey) ?? {
      label: groupLabel,
      periodLabel: input.groupBy === "period" ? null : periodLabel,
      requestCount: 0,
      totalHours: 0,
      payableMinutes: 0,
      amountCents: 0,
    };

    existing.requestCount += 1;
    existing.totalHours += Number(row.hours);
    existing.payableMinutes += row.payableMinutes ?? 0;
    existing.amountCents += row.amountCents ?? 0;
    buckets.set(bucketKey, existing);
  }

  return [...buckets.entries()]
    .map(([groupKey, bucket]) => ({
      groupKey,
      groupLabel: bucket.label,
      periodLabel: bucket.periodLabel,
      requestCount: bucket.requestCount,
      totalHours: Number(bucket.totalHours.toFixed(2)),
      payableMinutes: bucket.payableMinutes,
      amountCents: bucket.amountCents,
    }))
    .sort((a, b) => a.groupLabel.localeCompare(b.groupLabel));
}

export function buildHrOvertimeReportCsv(
  rows: readonly HrOvertimeReportRow[],
): string {
  const headers = [
    "Group",
    "Period",
    "Requests",
    "Total hours",
    "Payable minutes",
    "Amount cents",
  ];
  const escape = (value: string) =>
    /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      [
        row.groupLabel,
        row.periodLabel ?? "",
        String(row.requestCount),
        String(row.totalHours),
        String(row.payableMinutes),
        String(row.amountCents),
      ]
        .map(escape)
        .join(","),
    ),
  ];
  return lines.join("\n");
}

function mapHrOvertimePolicyRow(row: {
  compareAttendanceEnabled: boolean;
  minOvertimeMinutes: number;
  roundingMode: HrOvertimePolicyConfig["roundingMode"];
  roundingIntervalMinutes: number;
  graceMinutesBeforeRounding: number;
  dailyCapMinutes: number | null;
  weeklyCapMinutes: number | null;
  monthlyCapMinutes: number | null;
  statutoryCapMinutes: number | null;
  budgetCapMinutes: number | null;
  attendanceVarianceToleranceMinutes: number;
  shiftVarianceToleranceMinutes: number;
}): HrOvertimePolicyConfig {
  return {
    compareAttendanceEnabled: row.compareAttendanceEnabled,
    minOvertimeMinutes: row.minOvertimeMinutes,
    roundingMode: row.roundingMode,
    roundingIntervalMinutes: row.roundingIntervalMinutes,
    graceMinutesBeforeRounding: row.graceMinutesBeforeRounding,
    dailyCapMinutes: row.dailyCapMinutes,
    weeklyCapMinutes: row.weeklyCapMinutes,
    monthlyCapMinutes: row.monthlyCapMinutes,
    statutoryCapMinutes: row.statutoryCapMinutes,
    budgetCapMinutes: row.budgetCapMinutes,
    attendanceVarianceToleranceMinutes: row.attendanceVarianceToleranceMinutes,
    shiftVarianceToleranceMinutes: row.shiftVarianceToleranceMinutes,
  };
}

/** HRM-OTM-011–013/010 — load org policy with defaults when unset. */
export async function getHrOvertimePolicy(input: {
  organizationId: string;
  policyGroupCode?: string;
}): Promise<HrOvertimePolicyConfig & { policyId: string | null }> {
  const policyGroupCode = input.policyGroupCode ?? "default";
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select()
      .from(hrOvertimePolicies)
      .where(
        and(
          eq(hrOvertimePolicies.organizationId, input.organizationId),
          eq(hrOvertimePolicies.policyGroupCode, policyGroupCode),
        ),
      )
      .limit(1);

    if (!row) {
      return { ...DEFAULT_HR_OVERTIME_POLICY, policyId: null };
    }

    return {
      policyId: row.id,
      ...mapHrOvertimePolicyRow(row),
    };
  });
}

export async function upsertHrOvertimePolicy(input: {
  organizationId: string;
  policyGroupCode?: string;
  policy: Partial<HrOvertimePolicyConfig>;
}): Promise<{ policyId: string }> {
  const policyGroupCode = input.policyGroupCode ?? "default";
  const existing = await getHrOvertimePolicy({
    organizationId: input.organizationId,
    policyGroupCode,
  });

  if (existing.policyId) {
    await runWithOrganizationContext(input.organizationId, async (db) => {
      await db
        .update(hrOvertimePolicies)
        .set({
          compareAttendanceEnabled:
            input.policy.compareAttendanceEnabled ??
            existing.compareAttendanceEnabled,
          minOvertimeMinutes:
            input.policy.minOvertimeMinutes ?? existing.minOvertimeMinutes,
          roundingMode: input.policy.roundingMode ?? existing.roundingMode,
          roundingIntervalMinutes:
            input.policy.roundingIntervalMinutes ??
            existing.roundingIntervalMinutes,
          graceMinutesBeforeRounding:
            input.policy.graceMinutesBeforeRounding ??
            existing.graceMinutesBeforeRounding,
          dailyCapMinutes:
            input.policy.dailyCapMinutes ?? existing.dailyCapMinutes,
          weeklyCapMinutes:
            input.policy.weeklyCapMinutes ?? existing.weeklyCapMinutes,
          monthlyCapMinutes:
            input.policy.monthlyCapMinutes ?? existing.monthlyCapMinutes,
          statutoryCapMinutes:
            input.policy.statutoryCapMinutes ?? existing.statutoryCapMinutes,
          budgetCapMinutes:
            input.policy.budgetCapMinutes ?? existing.budgetCapMinutes,
          attendanceVarianceToleranceMinutes:
            input.policy.attendanceVarianceToleranceMinutes ??
            existing.attendanceVarianceToleranceMinutes,
          shiftVarianceToleranceMinutes:
            input.policy.shiftVarianceToleranceMinutes ??
            existing.shiftVarianceToleranceMinutes,
        })
        .where(eq(hrOvertimePolicies.id, existing.policyId!));
    });
    return { policyId: existing.policyId };
  }

  const policyId = createEntityId("hr_ot_pol");
  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(hrOvertimePolicies).values({
      id: policyId,
      organizationId: input.organizationId,
      policyGroupCode,
      compareAttendanceEnabled:
        input.policy.compareAttendanceEnabled ??
        DEFAULT_HR_OVERTIME_POLICY.compareAttendanceEnabled,
      minOvertimeMinutes:
        input.policy.minOvertimeMinutes ??
        DEFAULT_HR_OVERTIME_POLICY.minOvertimeMinutes,
      roundingMode:
        input.policy.roundingMode ?? DEFAULT_HR_OVERTIME_POLICY.roundingMode,
      roundingIntervalMinutes:
        input.policy.roundingIntervalMinutes ??
        DEFAULT_HR_OVERTIME_POLICY.roundingIntervalMinutes,
      graceMinutesBeforeRounding:
        input.policy.graceMinutesBeforeRounding ??
        DEFAULT_HR_OVERTIME_POLICY.graceMinutesBeforeRounding,
      dailyCapMinutes: input.policy.dailyCapMinutes ?? null,
      weeklyCapMinutes: input.policy.weeklyCapMinutes ?? null,
      monthlyCapMinutes: input.policy.monthlyCapMinutes ?? null,
      statutoryCapMinutes: input.policy.statutoryCapMinutes ?? null,
      budgetCapMinutes: input.policy.budgetCapMinutes ?? null,
      attendanceVarianceToleranceMinutes:
        input.policy.attendanceVarianceToleranceMinutes ??
        DEFAULT_HR_OVERTIME_POLICY.attendanceVarianceToleranceMinutes,
      shiftVarianceToleranceMinutes:
        input.policy.shiftVarianceToleranceMinutes ??
        DEFAULT_HR_OVERTIME_POLICY.shiftVarianceToleranceMinutes,
    });
  });
  return { policyId };
}

/** HRM-OTM-007 — list configured rate rules for admin Pattern C surfaces. */
export async function listHrOvertimeRateRules(input: {
  organizationId: string;
  policyGroupCode?: string;
}): Promise<readonly HrOvertimeRateRuleRow[]> {
  const policyGroupCode = input.policyGroupCode ?? "default";
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select()
      .from(hrOvertimeRateRules)
      .where(
        and(
          eq(hrOvertimeRateRules.organizationId, input.organizationId),
          eq(hrOvertimeRateRules.policyGroupCode, policyGroupCode),
        ),
      )
      .orderBy(
        desc(hrOvertimeRateRules.priority),
        desc(hrOvertimeRateRules.effectiveFrom),
      );

    return rows.map((row) => ({
      id: row.id,
      policyGroupCode: row.policyGroupCode,
      name: row.name,
      overtimeType: row.overtimeType,
      dayCategory: row.dayCategory,
      shiftCategory: row.shiftCategory,
      employeeCategory: row.employeeCategory,
      countryCode: row.countryCode,
      multiplier: row.multiplier,
      earningCode: row.earningCode,
      priority: row.priority,
      effectiveFrom: row.effectiveFrom,
      effectiveTo: row.effectiveTo,
    }));
  });
}

export async function createHrOvertimeRateRule(input: {
  organizationId: string;
  policyGroupCode?: string;
  name: string;
  overtimeType?: HrOvertimeType | null;
  dayCategory?: HrOvertimeRateRuleRow["dayCategory"];
  shiftCategory?: string | null;
  employeeCategory?: string | null;
  countryCode?: string | null;
  multiplier?: string;
  earningCode?: string;
  priority?: number;
  effectiveFrom?: Date;
  effectiveTo?: Date | null;
}): Promise<{ ruleId: string }> {
  const ruleId = createEntityId("hr_ot_rate");
  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(hrOvertimeRateRules).values({
      id: ruleId,
      organizationId: input.organizationId,
      policyGroupCode: input.policyGroupCode ?? "default",
      name: input.name,
      overtimeType: input.overtimeType ?? null,
      dayCategory: input.dayCategory ?? null,
      shiftCategory: input.shiftCategory ?? null,
      employeeCategory: input.employeeCategory ?? null,
      countryCode: input.countryCode ?? null,
      multiplier: input.multiplier ?? "1.50",
      earningCode: input.earningCode ?? "OT",
      priority: input.priority ?? 0,
      effectiveFrom: input.effectiveFrom ?? new Date(),
      effectiveTo: input.effectiveTo ?? null,
    });
  });
  return { ruleId };
}

export async function sumHrOvertimeApprovedMinutesForEmployee(input: {
  organizationId: string;
  employeeId: string;
  workDate: Date;
}): Promise<HrOvertimePeriodUsage> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const dayStart = new Date(input.workDate);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const weekStart = new Date(dayStart);
    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());

    const monthStart = new Date(
      Date.UTC(dayStart.getUTCFullYear(), dayStart.getUTCMonth(), 1),
    );
    const monthEnd = new Date(
      Date.UTC(dayStart.getUTCFullYear(), dayStart.getUTCMonth() + 1, 1),
    );

    const approvedStatuses = ["approved", "payroll_ready", "paid"] as const;

    const [dailyRow] = await db
      .select({
        total: sql<number>`coalesce(sum(${hrOvertimeRequests.payableMinutes}), 0)`,
      })
      .from(hrOvertimeRequests)
      .where(
        and(
          eq(hrOvertimeRequests.organizationId, input.organizationId),
          eq(hrOvertimeRequests.employeeId, input.employeeId),
          gte(hrOvertimeRequests.workDate, dayStart),
          lte(hrOvertimeRequests.workDate, dayEnd),
          sql`${hrOvertimeRequests.status} IN (${sql.join(
            approvedStatuses.map((s) => sql`${s}`),
            sql`, `,
          )})`,
        ),
      );

    const [weeklyRow] = await db
      .select({
        total: sql<number>`coalesce(sum(${hrOvertimeRequests.payableMinutes}), 0)`,
      })
      .from(hrOvertimeRequests)
      .where(
        and(
          eq(hrOvertimeRequests.organizationId, input.organizationId),
          eq(hrOvertimeRequests.employeeId, input.employeeId),
          gte(hrOvertimeRequests.workDate, weekStart),
          lte(hrOvertimeRequests.workDate, dayEnd),
          sql`${hrOvertimeRequests.status} IN (${sql.join(
            approvedStatuses.map((s) => sql`${s}`),
            sql`, `,
          )})`,
        ),
      );

    const [monthlyRow] = await db
      .select({
        total: sql<number>`coalesce(sum(${hrOvertimeRequests.payableMinutes}), 0)`,
      })
      .from(hrOvertimeRequests)
      .where(
        and(
          eq(hrOvertimeRequests.organizationId, input.organizationId),
          eq(hrOvertimeRequests.employeeId, input.employeeId),
          gte(hrOvertimeRequests.workDate, monthStart),
          lte(hrOvertimeRequests.workDate, monthEnd),
          sql`${hrOvertimeRequests.status} IN (${sql.join(
            approvedStatuses.map((s) => sql`${s}`),
            sql`, `,
          )})`,
        ),
      );

    return {
      dailyMinutes: Number(dailyRow?.total ?? 0),
      weeklyMinutes: Number(weeklyRow?.total ?? 0),
      monthlyMinutes: Number(monthlyRow?.total ?? 0),
    };
  });
}

/** HRM-OTM-014 — replace open exceptions for a request from detection output. */
export async function syncHrOvertimeExceptions(input: {
  organizationId: string;
  requestId: string;
  exceptions: readonly HrOvertimeExceptionDraft[];
}): Promise<{ exceptionIds: string[] }> {
  const exceptionIds: string[] = [];
  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .delete(hrOvertimeExceptions)
      .where(
        and(
          eq(hrOvertimeExceptions.organizationId, input.organizationId),
          eq(hrOvertimeExceptions.requestId, input.requestId),
          eq(hrOvertimeExceptions.status, "open"),
        ),
      );

    for (const exception of input.exceptions) {
      const exceptionId = createEntityId("hr_ot_exc");
      exceptionIds.push(exceptionId);
      await db.insert(hrOvertimeExceptions).values({
        id: exceptionId,
        organizationId: input.organizationId,
        requestId: input.requestId,
        kind: exception.kind,
        status: "open",
        message: exception.message,
        metadata: exception.metadata ?? null,
      });
    }
  });
  return { exceptionIds };
}

export async function listHrOvertimeExceptions(input: {
  organizationId: string;
  requestId?: string;
  status?: "open" | "approved" | "rejected";
}): Promise<
  readonly {
    id: string;
    requestId: string;
    kind: string;
    status: string;
    message: string;
    metadata: Record<string, unknown> | null;
  }[]
> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrOvertimeExceptions.organizationId, input.organizationId),
    ];
    if (input.requestId) {
      conditions.push(eq(hrOvertimeExceptions.requestId, input.requestId));
    }
    if (input.status) {
      conditions.push(eq(hrOvertimeExceptions.status, input.status));
    }

    const rows = await db
      .select()
      .from(hrOvertimeExceptions)
      .where(and(...conditions))
      .orderBy(desc(hrOvertimeExceptions.createdAt));

    return rows.map((row) => ({
      id: row.id,
      requestId: row.requestId,
      kind: row.kind,
      status: row.status,
      message: row.message,
      metadata: row.metadata,
    }));
  });
}

export async function hasOpenHrOvertimeExceptions(input: {
  organizationId: string;
  requestId: string;
}): Promise<boolean> {
  const rows = await listHrOvertimeExceptions({
    organizationId: input.organizationId,
    requestId: input.requestId,
    status: "open",
  });
  return rows.length > 0;
}

/** HRM-OTM-007–014 — run calculation and persist snapshot + exceptions. */
export async function calculateAndPersistHrOvertimeApproval(input: {
  organizationId: string;
  requestId: string;
  attendanceOvertimeMinutes?: number | null;
  scheduledShift?: {
    shiftStartTime: string;
    shiftEndTime: string;
    workingMinutes: number;
  } | null;
  shiftCategory?: string | null;
  hourlyRateCents?: number | null;
}): Promise<HrOvertimeCalculationResult> {
  const [request] = await runWithOrganizationContext(
    input.organizationId,
    async (db) =>
      db
        .select({
          employeeId: hrOvertimeRequests.employeeId,
          overtimeType: hrOvertimeRequests.overtimeType,
          policyGroupCode: hrOvertimeRequests.policyGroupCode,
          workDate: hrOvertimeRequests.workDate,
          startTime: hrOvertimeRequests.startTime,
          endTime: hrOvertimeRequests.endTime,
          hours: hrOvertimeRequests.hours,
          dayCategory: hrOvertimeRequests.dayCategory,
        })
        .from(hrOvertimeRequests)
        .where(
          and(
            eq(hrOvertimeRequests.organizationId, input.organizationId),
            eq(hrOvertimeRequests.id, input.requestId),
          ),
        )
        .limit(1),
  );

  if (!request) {
    throw new HrOtmCommandError("request_not_found");
  }

  const employee = await loadEmployeeOtmContext(
    input.organizationId,
    request.employeeId,
  );

  const policy = await getHrOvertimePolicy({
    organizationId: input.organizationId,
    policyGroupCode: request.policyGroupCode,
  });

  const rateRules = await listHrOvertimeRateRules({
    organizationId: input.organizationId,
    policyGroupCode: request.policyGroupCode,
  });

  const periodUsage = await sumHrOvertimeApprovedMinutesForEmployee({
    organizationId: input.organizationId,
    employeeId: request.employeeId,
    workDate: request.workDate,
  });

  const dayCategory =
    request.dayCategory ?? deriveOtmDayCategoryFromType(request.overtimeType);

  const result = calculateOtmPayableForApproval({
    policy,
    rateRules,
    rateContext: {
      overtimeType: request.overtimeType,
      dayCategory,
      shiftCategory: input.shiftCategory ?? null,
      employeeCategory: employee.workerCategory,
      countryCode: employee.countryCode,
      asOf: request.workDate,
    },
    periodUsage,
    hours: request.hours,
    startTime: request.startTime,
    endTime: request.endTime,
    attendanceOvertimeMinutes: input.attendanceOvertimeMinutes,
    scheduledShift: input.scheduledShift,
    hourlyRateCents: input.hourlyRateCents,
  });

  await syncHrOvertimeExceptions({
    organizationId: input.organizationId,
    requestId: input.requestId,
    exceptions: result.exceptions,
  });

  const snapshotId = createEntityId("hr_ot_calc");
  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .insert(hrOvertimeCalculationSnapshots)
      .values({
        id: snapshotId,
        organizationId: input.organizationId,
        requestId: input.requestId,
        requestedMinutes: result.requestedMinutes,
        attendanceMinutes: result.attendanceMinutes,
        roundedMinutes: result.roundedMinutes,
        cappedMinutes: result.cappedMinutes,
        payableMinutes: result.payableMinutes,
        rateMultiplier: result.rateMultiplier.toFixed(2),
        earningCode: result.earningCode,
        amountCents: result.amountCents,
        rateRuleId: result.rateRuleId,
        calculationDetail: result.calculationDetail,
      })
      .onConflictDoUpdate({
        target: [
          hrOvertimeCalculationSnapshots.organizationId,
          hrOvertimeCalculationSnapshots.requestId,
        ],
        set: {
          requestedMinutes: result.requestedMinutes,
          attendanceMinutes: result.attendanceMinutes,
          roundedMinutes: result.roundedMinutes,
          cappedMinutes: result.cappedMinutes,
          payableMinutes: result.payableMinutes,
          rateMultiplier: result.rateMultiplier.toFixed(2),
          earningCode: result.earningCode,
          amountCents: result.amountCents,
          rateRuleId: result.rateRuleId,
          calculationDetail: result.calculationDetail,
          calculatedAt: new Date(),
        },
      });

    await db
      .update(hrOvertimeRequests)
      .set({
        payableMinutes: result.payableMinutes,
        amountCents: result.amountCents,
        earningCode: result.earningCode,
      })
      .where(eq(hrOvertimeRequests.id, input.requestId));
  });

  await appendHrOvertimeAuditEvent({
    organizationId: input.organizationId,
    requestId: input.requestId,
    employeeId: request.employeeId,
    action: "calculation_apply",
    summary: "Overtime calculation applied on approval",
    metadata: {
      payableMinutes: result.payableMinutes,
      rateMultiplier: result.rateMultiplier,
      exceptionCount: result.exceptions.length,
    },
  });

  return result;
}

/** HRM-OTM-026 — enqueue in-app overtime notification (deduped per recipient/kind/subject). */
export async function enqueueHrOvertimeNotification(input: {
  organizationId: string;
  recipientAuthUserId: string;
  kind: (typeof hrOvertimeNotifications.$inferInsert)["kind"];
  subjectType: string;
  subjectId: string;
  employeeId?: string | null;
  title: string;
  body: string;
}): Promise<{ notificationId: string; created: boolean }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [existing] = await db
      .select({ id: hrOvertimeNotifications.id })
      .from(hrOvertimeNotifications)
      .where(
        and(
          eq(hrOvertimeNotifications.organizationId, input.organizationId),
          eq(
            hrOvertimeNotifications.recipientAuthUserId,
            input.recipientAuthUserId,
          ),
          eq(hrOvertimeNotifications.kind, input.kind),
          eq(hrOvertimeNotifications.subjectType, input.subjectType),
          eq(hrOvertimeNotifications.subjectId, input.subjectId),
        ),
      )
      .limit(1);

    if (existing) {
      return { notificationId: existing.id, created: false };
    }

    const notificationId = createEntityId("hr_ot_ntf");
    await db.insert(hrOvertimeNotifications).values({
      id: notificationId,
      organizationId: input.organizationId,
      recipientAuthUserId: input.recipientAuthUserId,
      kind: input.kind,
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      employeeId: input.employeeId ?? null,
      title: input.title.trim(),
      body: input.body.trim(),
    });

    return { notificationId, created: true };
  });
}

export type HrOvertimeNotificationWindow = Awaited<
  ReturnType<typeof listHrOvertimeNotificationsWindow>
>;

/** HRM-OTM-026 — list overtime notifications for workbench. */
export async function listHrOvertimeNotificationsWindow(input: {
  organizationId: string;
  recipientAuthUserId?: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<{
  rows: readonly {
    id: string;
    kind: string;
    title: string;
    body: string;
    subjectType: string;
    subjectId: string;
    employeeId: string | null;
    readAt: Date | null;
    createdAt: Date;
  }[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
}> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrOvertimeNotifications.organizationId, input.organizationId),
    ];

    if (input.recipientAuthUserId) {
      conditions.push(
        eq(
          hrOvertimeNotifications.recipientAuthUserId,
          input.recipientAuthUserId,
        ),
      );
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrOvertimeNotifications.title, pattern),
          ilike(hrOvertimeNotifications.body, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrOvertimeNotifications)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrOvertimeNotifications.id,
        kind: hrOvertimeNotifications.kind,
        title: hrOvertimeNotifications.title,
        body: hrOvertimeNotifications.body,
        subjectType: hrOvertimeNotifications.subjectType,
        subjectId: hrOvertimeNotifications.subjectId,
        employeeId: hrOvertimeNotifications.employeeId,
        readAt: hrOvertimeNotifications.readAt,
        createdAt: hrOvertimeNotifications.createdAt,
      })
      .from(hrOvertimeNotifications)
      .where(whereClause)
      .orderBy(desc(hrOvertimeNotifications.createdAt))
      .limit(pageSize)
      .offset(offset);

    const totalCount = Number(totalRow?.total ?? 0);

    return {
      rows,
      pageSize,
      totalCount,
      hasNextPage: offset + rows.length < totalCount,
    };
  });
}
