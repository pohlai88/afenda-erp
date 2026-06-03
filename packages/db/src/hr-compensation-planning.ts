import { and, count, desc, eq, gte, ilike, inArray, lte, or, sql } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { appendHrCompensationAuditEventInTx } from "./hr-compensation-planning-audit";
import { insertHrEmployeeRecordEventInTx } from "./hr-employee-records-commands";
import { buildPaginatedWindow, clampPageSize } from "./hr-benefits.shared";
import {
  computeCompensationScenario,
  evaluateAllCompensationEligibilityRules,
  validateBandPosition,
  type CompensationScenarioInput,
  type SalaryBandReference,
} from "./hr-compensation-planning-calculations.shared";
import {
  assertBudgetPoolScopeFields,
  assertHrCompensationCycleStatusTransition,
  deriveBudgetPoolScopeRef,
} from "./hr-compensation-planning-scope.shared";
import {
  formatNumeric,
  HrCompensationCommandError,
  isHrCompensationRecommendationLocked,
  parseNumeric,
} from "./hr-compensation-planning.shared";
import {
  hrCompensationApprovalSteps,
  hrCompensationBudgetPools,
  hrCompensationCycleParticipants,
  hrCompensationCycles,
  hrCompensationEligibilityRules,
  hrCompensationPayrollRefs,
  hrCompensationRecommendations,
  hrCompensationSalaryBands,
  hrCompensationSalaryChanges,
  hrCompensationScenarios,
  type HrCompensationApprovalRules,
  type HrCompensationEligibilityRuleConfig,
} from "./hr-compensation-planning";
import { hrEmployees } from "./hr";

export {
  HrCompensationCommandError,
  isHrCompensationRecommendationLocked,
  HR_COMPENSATION_LOCKED_STATUSES,
  HR_COMPENSATION_EDITABLE_STATUSES,
} from "./hr-compensation-planning.shared";

export {
  HrCompensationCalculationError,
  computeProposedSalary,
  computeTotalCompImpact,
  validateBandPosition,
  computeBudgetUtilization,
  computeCompensationScenario,
  buildCompensationExceptionFlags,
  requiresJustification,
  evaluateCompensationEligibility,
  evaluateAllCompensationEligibilityRules,
  computeBudgetImpact,
} from "./hr-compensation-planning-calculations.shared";

export type {
  CompensationIncreaseInput,
  CompensationScenarioInput,
  CompensationScenarioResult,
  TotalCompImpactInput,
  TotalCompImpactResult,
  BandValidationResult,
  BudgetUtilizationResult,
  SalaryBandReference,
} from "./hr-compensation-planning-calculations.shared";

export {
  assertBudgetPoolScopeFields,
  assertHrCompensationCycleStatusTransition,
  deriveBudgetPoolScopeRef,
} from "./hr-compensation-planning-scope.shared";

export {
  appendHrCompensationAuditEventInTx,
  listHrCompensationAuditTrailWindow,
} from "./hr-compensation-planning-audit";
export {
  resolveHrCompensationApprovalSteps,
  type HrCompensationApprovalRouteContext,
} from "./hr-compensation-planning-approval.shared";

export type CreateHrCompensationCycleInput = {
  organizationId: string;
  actorUserId: string;
  code: string;
  name: string;
  cycleType: (typeof hrCompensationCycles.$inferInsert)["cycleType"];
  effectiveDate: Date;
  currencyCode?: string;
  approvalRules?: HrCompensationApprovalRules;
};

export async function createHrCompensationCycleInTx(
  db: AfendaTransaction,
  input: CreateHrCompensationCycleInput,
): Promise<{ cycleId: string }> {
  const cycleId = createEntityId("hr_cpm_cycle");

  await db.insert(hrCompensationCycles).values({
    id: cycleId,
    organizationId: input.organizationId,
    code: input.code,
    name: input.name,
    cycleType: input.cycleType,
    effectiveDate: input.effectiveDate,
    currencyCode: input.currencyCode ?? "USD",
    approvalRules: input.approvalRules ?? { steps: [] },
  });

  await appendHrCompensationAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.cpm.cycle.create",
    cycleId,
    summary: `Created compensation cycle ${input.code}`,
  });

  return { cycleId };
}

async function assertHrCompensationCycleExistsInTx(
  db: AfendaTransaction,
  organizationId: string,
  cycleId: string,
): Promise<(typeof hrCompensationCycles.$inferSelect)> {
  const [cycle] = await db
    .select()
    .from(hrCompensationCycles)
    .where(
      and(
        eq(hrCompensationCycles.organizationId, organizationId),
        eq(hrCompensationCycles.id, cycleId),
      ),
    )
    .limit(1);

  if (!cycle) {
    throw new HrCompensationCommandError("cycle_not_found");
  }

  return cycle;
}

async function loadActiveEligibilityRulesForCycleInTx(
  db: AfendaTransaction,
  organizationId: string,
  cycleId: string,
): Promise<readonly HrCompensationEligibilityRuleConfig[]> {
  const rows = await db
    .select({ ruleConfig: hrCompensationEligibilityRules.ruleConfig })
    .from(hrCompensationEligibilityRules)
    .where(
      and(
        eq(hrCompensationEligibilityRules.organizationId, organizationId),
        eq(hrCompensationEligibilityRules.cycleId, cycleId),
        eq(hrCompensationEligibilityRules.active, true),
      ),
    );

  return rows.map((row) => row.ruleConfig);
}

const MAX_CPM_PAYROLL_EXPORT = 500;

async function loadFinalizedCompensationArtifactsInTx(
  db: AfendaTransaction,
  input: { organizationId: string; recommendationId: string },
): Promise<{
  salaryChangeId: string;
  payrollRefId: string;
  historyEventId: string;
} | null> {
  const [salaryChange] = await db
    .select({
      id: hrCompensationSalaryChanges.id,
      employeeHistoryEventId: hrCompensationSalaryChanges.employeeHistoryEventId,
    })
    .from(hrCompensationSalaryChanges)
    .where(
      and(
        eq(hrCompensationSalaryChanges.organizationId, input.organizationId),
        eq(hrCompensationSalaryChanges.recommendationId, input.recommendationId),
      ),
    )
    .limit(1);

  if (!salaryChange) {
    return null;
  }

  const [payrollRef] = await db
    .select({ id: hrCompensationPayrollRefs.id })
    .from(hrCompensationPayrollRefs)
    .where(
      and(
        eq(hrCompensationPayrollRefs.organizationId, input.organizationId),
        eq(hrCompensationPayrollRefs.salaryChangeId, salaryChange.id),
      ),
    )
    .limit(1);

  if (!payrollRef) {
    return null;
  }

  return {
    salaryChangeId: salaryChange.id,
    payrollRefId: payrollRef.id,
    historyEventId: salaryChange.employeeHistoryEventId ?? salaryChange.id,
  };
}

export type UpdateHrCompensationCycleInput = {
  organizationId: string;
  actorUserId: string;
  cycleId: string;
  name?: string;
  effectiveDate?: Date;
  cycleStatus?: (typeof hrCompensationCycles.$inferInsert)["cycleStatus"];
  currencyCode?: string;
  approvalRules?: HrCompensationApprovalRules;
};

export async function updateHrCompensationCycleInTx(
  db: AfendaTransaction,
  input: UpdateHrCompensationCycleInput,
): Promise<{ cycleId: string }> {
  const cycle = await assertHrCompensationCycleExistsInTx(
    db,
    input.organizationId,
    input.cycleId,
  );

  if (input.cycleStatus && input.cycleStatus !== cycle.cycleStatus) {
    try {
      assertHrCompensationCycleStatusTransition(
        cycle.cycleStatus,
        input.cycleStatus,
      );
    } catch {
      throw new HrCompensationCommandError("invalid_status_transition");
    }
  }

  const updates: Partial<typeof hrCompensationCycles.$inferInsert> = {};

  if (input.name != null) updates.name = input.name;
  if (input.effectiveDate != null) updates.effectiveDate = input.effectiveDate;
  if (input.cycleStatus != null) updates.cycleStatus = input.cycleStatus;
  if (input.currencyCode != null) updates.currencyCode = input.currencyCode;
  if (input.approvalRules != null) updates.approvalRules = input.approvalRules;

  if (Object.keys(updates).length === 0) {
    return { cycleId: input.cycleId };
  }

  await db
    .update(hrCompensationCycles)
    .set(updates)
    .where(eq(hrCompensationCycles.id, input.cycleId));

  await appendHrCompensationAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.cpm.cycle.update",
    cycleId: input.cycleId,
    summary: `Updated compensation cycle ${cycle.code}`,
    metadata: { updates: Object.keys(updates) },
  });

  return { cycleId: input.cycleId };
}

export async function listHrCompensationCyclesWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  cycleStatus?: (typeof hrCompensationCycles.$inferSelect)["cycleStatus"];
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrCompensationCycles.organizationId, input.organizationId),
    ];

    if (input.cycleStatus) {
      conditions.push(eq(hrCompensationCycles.cycleStatus, input.cycleStatus));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrCompensationCycles.code, pattern),
          ilike(hrCompensationCycles.name, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrCompensationCycles)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrCompensationCycles.id,
        code: hrCompensationCycles.code,
        name: hrCompensationCycles.name,
        cycleType: hrCompensationCycles.cycleType,
        cycleStatus: hrCompensationCycles.cycleStatus,
        effectiveDate: hrCompensationCycles.effectiveDate,
        currencyCode: hrCompensationCycles.currencyCode,
      })
      .from(hrCompensationCycles)
      .where(whereClause)
      .orderBy(desc(hrCompensationCycles.effectiveDate))
      .limit(pageSize)
      .offset(offset);

    return buildPaginatedWindow({
      rows,
      pageSize,
      offset,
      totalCount: Number(totalRow?.total ?? 0),
    });
  });
}

export type UpsertHrCompensationBudgetPoolInput = {
  organizationId: string;
  actorUserId: string;
  cycleId: string;
  code: string;
  name: string;
  scope: (typeof hrCompensationBudgetPools.$inferInsert)["scope"];
  allocatedAmount: number;
  scopeRef?: string | null;
  legalEntityCode?: string | null;
  departmentId?: string | null;
  businessUnitCode?: string | null;
  grade?: string | null;
  locationCode?: string | null;
  managerEmployeeId?: string | null;
  currencyCode?: string;
};

export async function upsertHrCompensationBudgetPoolInTx(
  db: AfendaTransaction,
  input: UpsertHrCompensationBudgetPoolInput,
): Promise<{ budgetPoolId: string }> {
  await assertHrCompensationCycleExistsInTx(
    db,
    input.organizationId,
    input.cycleId,
  );

  try {
    assertBudgetPoolScopeFields(input);
  } catch {
    throw new HrCompensationCommandError("invalid_budget_pool_scope");
  }

  const scopeRef = deriveBudgetPoolScopeRef(input);
  const budgetPoolId = createEntityId("hr_cpm_pool");

  await db.insert(hrCompensationBudgetPools).values({
    id: budgetPoolId,
    organizationId: input.organizationId,
    cycleId: input.cycleId,
    code: input.code,
    name: input.name,
    scope: input.scope,
    scopeRef,
    legalEntityCode: input.legalEntityCode ?? null,
    departmentId: input.departmentId ?? null,
    businessUnitCode: input.businessUnitCode ?? null,
    grade: input.grade ?? null,
    locationCode: input.locationCode ?? null,
    managerEmployeeId: input.managerEmployeeId ?? null,
    allocatedAmount: formatNumeric(input.allocatedAmount, 2),
    currencyCode: input.currencyCode ?? "USD",
  });

  await appendHrCompensationAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.cpm.budget_pool.create",
    cycleId: input.cycleId,
    summary: `Created budget pool ${input.code}`,
    metadata: { budgetPoolId, scope: input.scope },
  });

  return { budgetPoolId };
}

export type UpsertHrCompensationEligibilityRuleInput = {
  organizationId: string;
  actorUserId: string;
  cycleId: string;
  label: string;
  ruleConfig: HrCompensationEligibilityRuleConfig;
};

export async function upsertHrCompensationEligibilityRuleInTx(
  db: AfendaTransaction,
  input: UpsertHrCompensationEligibilityRuleInput,
): Promise<{ ruleId: string }> {
  await assertHrCompensationCycleExistsInTx(
    db,
    input.organizationId,
    input.cycleId,
  );

  const ruleId = createEntityId("hr_cpm_elig");

  await db.insert(hrCompensationEligibilityRules).values({
    id: ruleId,
    organizationId: input.organizationId,
    cycleId: input.cycleId,
    label: input.label,
    ruleConfig: input.ruleConfig,
  });

  await appendHrCompensationAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.cpm.eligibility_rule.create",
    cycleId: input.cycleId,
    summary: `Created eligibility rule ${input.label}`,
  });

  return { ruleId };
}

function computeTenureDays(
  employmentStartDate: Date | null | undefined,
  asOf: Date,
): number | null {
  if (!employmentStartDate) return null;
  const diffMs = asOf.getTime() - employmentStartDate.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export type AssignHrCompensationParticipantInput = {
  organizationId: string;
  actorUserId: string;
  cycleId: string;
  employeeId: string;
  budgetPoolId?: string | null;
  currentSalary?: number | null;
  performanceRating?: number | null;
  eligibilityRules?: readonly HrCompensationEligibilityRuleConfig[];
};

export async function assignHrCompensationParticipantInTx(
  db: AfendaTransaction,
  input: AssignHrCompensationParticipantInput,
): Promise<{ participantId: string; eligible: boolean }> {
  const cycle = await assertHrCompensationCycleExistsInTx(
    db,
    input.organizationId,
    input.cycleId,
  );

  if (input.budgetPoolId) {
    const [pool] = await db
      .select({ id: hrCompensationBudgetPools.id })
      .from(hrCompensationBudgetPools)
      .where(
        and(
          eq(hrCompensationBudgetPools.organizationId, input.organizationId),
          eq(hrCompensationBudgetPools.id, input.budgetPoolId),
          eq(hrCompensationBudgetPools.cycleId, input.cycleId),
        ),
      )
      .limit(1);

    if (!pool) {
      throw new HrCompensationCommandError("pool_not_found");
    }
  }

  const [employee] = await db
    .select()
    .from(hrEmployees)
    .where(
      and(
        eq(hrEmployees.organizationId, input.organizationId),
        eq(hrEmployees.id, input.employeeId),
      ),
    )
    .limit(1);

  if (!employee) {
    throw new HrCompensationCommandError("employee_not_found");
  }

  const asOf = cycle.effectiveDate ?? new Date();
  const tenureDays = computeTenureDays(employee.employmentStartDate, asOf);
  const rules =
    input.eligibilityRules ??
    (await loadActiveEligibilityRulesForCycleInTx(
      db,
      input.organizationId,
      input.cycleId,
    ));

  const eligibility = evaluateAllCompensationEligibilityRules(
    {
      employmentType: employee.employmentType,
      employmentStatus: employee.employmentStatus,
      tenureDays,
      grade: employee.grade,
      level: employee.level,
      departmentId: employee.currentDepartmentId,
      legalEntityCode: employee.legalEntityCode,
      performanceRating: input.performanceRating ?? null,
    },
    rules,
  );
  const eligible = eligibility.eligible;
  const reason = eligibility.reason;

  const [existing] = await db
    .select({ id: hrCompensationCycleParticipants.id })
    .from(hrCompensationCycleParticipants)
    .where(
      and(
        eq(hrCompensationCycleParticipants.organizationId, input.organizationId),
        eq(hrCompensationCycleParticipants.cycleId, input.cycleId),
        eq(hrCompensationCycleParticipants.employeeId, input.employeeId),
      ),
    )
    .limit(1);

  const participantPayload = {
    budgetPoolId: input.budgetPoolId ?? null,
    eligibilityStatus: eligible ? ("eligible" as const) : ("ineligible" as const),
    eligibilityReason: reason,
    currentSalary:
      input.currentSalary != null
        ? formatNumeric(input.currentSalary, 2)
        : null,
    currentGrade: employee.grade,
    currentLevel: employee.level,
    departmentId: employee.currentDepartmentId,
    managerEmployeeId: employee.managerEmployeeId,
    salaryEffectiveDate: employee.employmentStartDate,
    performanceRating:
      input.performanceRating != null
        ? formatNumeric(input.performanceRating, 2)
        : null,
    legalEntityCode: employee.legalEntityCode,
  };

  if (existing) {
    await db
      .update(hrCompensationCycleParticipants)
      .set(participantPayload)
      .where(eq(hrCompensationCycleParticipants.id, existing.id));

    await appendHrCompensationAuditEventInTx(db, {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      action: "hr.cpm.participant.assign",
      cycleId: input.cycleId,
      employeeId: input.employeeId,
      summary: eligible
        ? "Re-assigned eligible participant"
        : `Re-assigned ineligible participant: ${reason}`,
    });

    return { participantId: existing.id, eligible };
  }

  const participantId = createEntityId("hr_cpm_part");

  await db.insert(hrCompensationCycleParticipants).values({
    id: participantId,
    organizationId: input.organizationId,
    cycleId: input.cycleId,
    employeeId: input.employeeId,
    ...participantPayload,
  });

  await appendHrCompensationAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.cpm.participant.assign",
    cycleId: input.cycleId,
    employeeId: input.employeeId,
    summary: eligible
      ? "Assigned eligible participant"
      : `Assigned ineligible participant: ${reason}`,
  });

  return { participantId, eligible };
}

export type BulkAssignHrCompensationParticipantsInput = {
  organizationId: string;
  actorUserId: string;
  cycleId: string;
  employeeIds: readonly string[];
  budgetPoolId?: string | null;
};

export async function bulkAssignHrCompensationParticipantsInTx(
  db: AfendaTransaction,
  input: BulkAssignHrCompensationParticipantsInput,
): Promise<{ assignedCount: number; skippedCount: number }> {
  let assignedCount = 0;
  let skippedCount = 0;

  for (const employeeId of input.employeeIds) {
    try {
      await assignHrCompensationParticipantInTx(db, {
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        cycleId: input.cycleId,
        employeeId,
        budgetPoolId: input.budgetPoolId,
      });
      assignedCount += 1;
    } catch (error) {
      if (
        error instanceof HrCompensationCommandError &&
        error.code === "employee_not_found"
      ) {
        skippedCount += 1;
        continue;
      }
      throw error;
    }
  }

  if (assignedCount > 0) {
    await appendHrCompensationAuditEventInTx(db, {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      action: "hr.cpm.participant.bulk_assign",
      cycleId: input.cycleId,
      summary: `Bulk-assigned ${assignedCount} participant(s)`,
      metadata: {
        assignedCount,
        skippedCount,
        employeeIds: input.employeeIds.slice(0, 50),
      },
    });
  }

  return { assignedCount, skippedCount };
}

export async function getHrCompensationCycleSummary(input: {
  organizationId: string;
  cycleId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [cycle] = await db
      .select({
        id: hrCompensationCycles.id,
        code: hrCompensationCycles.code,
        name: hrCompensationCycles.name,
        cycleType: hrCompensationCycles.cycleType,
        cycleStatus: hrCompensationCycles.cycleStatus,
        effectiveDate: hrCompensationCycles.effectiveDate,
        currencyCode: hrCompensationCycles.currencyCode,
      })
      .from(hrCompensationCycles)
      .where(
        and(
          eq(hrCompensationCycles.organizationId, input.organizationId),
          eq(hrCompensationCycles.id, input.cycleId),
        ),
      )
      .limit(1);

    return cycle ?? null;
  });
}

export async function listHrCompensationParticipantsWindow(input: {
  organizationId: string;
  cycleId: string;
  limit?: number;
  offset?: number;
  search?: string;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrCompensationCycleParticipants.organizationId, input.organizationId),
      eq(hrCompensationCycleParticipants.cycleId, input.cycleId),
    ];

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrCompensationCycleParticipants.currentGrade, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrCompensationCycleParticipants)
      .innerJoin(
        hrEmployees,
        eq(hrCompensationCycleParticipants.employeeId, hrEmployees.id),
      )
      .where(whereClause);

    const rows = await db
      .select({
        id: hrCompensationCycleParticipants.id,
        employeeId: hrCompensationCycleParticipants.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        employeeName: hrEmployees.legalName,
        eligibilityStatus: hrCompensationCycleParticipants.eligibilityStatus,
        currentSalary: hrCompensationCycleParticipants.currentSalary,
        currentGrade: hrCompensationCycleParticipants.currentGrade,
        departmentId: hrCompensationCycleParticipants.departmentId,
        managerEmployeeId: hrCompensationCycleParticipants.managerEmployeeId,
        legalEntityCode: hrCompensationCycleParticipants.legalEntityCode,
      })
      .from(hrCompensationCycleParticipants)
      .innerJoin(
        hrEmployees,
        eq(hrCompensationCycleParticipants.employeeId, hrEmployees.id),
      )
      .where(whereClause)
      .orderBy(desc(hrCompensationCycleParticipants.createdAt))
      .limit(pageSize)
      .offset(offset);

    return buildPaginatedWindow({
      rows: rows.map((row) => ({
        ...row,
        currentSalary: parseNumeric(row.currentSalary),
      })),
      pageSize,
      offset,
      totalCount: Number(totalRow?.total ?? 0),
    });
  });
}

export async function listHrCompensationRecommendationsWindow(input: {
  organizationId: string;
  cycleId: string;
  participantId?: string | null;
  limit?: number;
  offset?: number;
  search?: string;
  recommendationStatus?: (typeof hrCompensationRecommendations.$inferSelect)["recommendationStatus"];
  adjustmentType?: (typeof hrCompensationRecommendations.$inferSelect)["adjustmentType"];
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrCompensationRecommendations.organizationId, input.organizationId),
      eq(hrCompensationRecommendations.cycleId, input.cycleId),
    ];

    if (input.participantId) {
      conditions.push(
        eq(hrCompensationRecommendations.participantId, input.participantId),
      );
    }

    if (input.adjustmentType) {
      conditions.push(
        eq(hrCompensationRecommendations.adjustmentType, input.adjustmentType),
      );
    }

    if (input.recommendationStatus) {
      conditions.push(
        eq(
          hrCompensationRecommendations.recommendationStatus,
          input.recommendationStatus,
        ),
      );
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrCompensationRecommendations.adjustmentType, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrCompensationRecommendations)
      .innerJoin(
        hrEmployees,
        eq(hrCompensationRecommendations.employeeId, hrEmployees.id),
      )
      .where(whereClause);

    const rows = await db
      .select({
        id: hrCompensationRecommendations.id,
        employeeId: hrCompensationRecommendations.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        employeeName: hrEmployees.legalName,
        adjustmentType: hrCompensationRecommendations.adjustmentType,
        recommendationStatus: hrCompensationRecommendations.recommendationStatus,
        currentSalary: hrCompensationRecommendations.currentSalary,
        proposedSalary: hrCompensationRecommendations.proposedSalary,
        overBudget: hrCompensationRecommendations.overBudget,
        bandFlag: hrCompensationRecommendations.bandFlag,
        lockedAt: hrCompensationRecommendations.lockedAt,
      })
      .from(hrCompensationRecommendations)
      .innerJoin(
        hrEmployees,
        eq(hrCompensationRecommendations.employeeId, hrEmployees.id),
      )
      .where(whereClause)
      .orderBy(desc(hrCompensationRecommendations.createdAt))
      .limit(pageSize)
      .offset(offset);

    return buildPaginatedWindow({
      rows: rows.map((row) => ({
        ...row,
        currentSalary: parseNumeric(row.currentSalary) ?? 0,
        proposedSalary: parseNumeric(row.proposedSalary) ?? 0,
      })),
      pageSize,
      offset,
      totalCount: Number(totalRow?.total ?? 0),
    });
  });
}

async function loadBudgetPoolImpactsInTx(
  db: AfendaTransaction,
  organizationId: string,
  budgetPoolId: string,
): Promise<number[]> {
  const rows = await db
    .select({ budgetImpact: hrCompensationRecommendations.budgetImpact })
    .from(hrCompensationRecommendations)
    .where(
      and(
        eq(hrCompensationRecommendations.organizationId, organizationId),
        eq(hrCompensationRecommendations.budgetPoolId, budgetPoolId),
      ),
    );

  return rows.map((row) => parseNumeric(row.budgetImpact) ?? 0);
}

async function loadSalaryBandInTx(
  db: AfendaTransaction,
  organizationId: string,
  grade: string | null,
  legalEntityCode: string | null,
): Promise<SalaryBandReference | null> {
  if (!grade) return null;

  const [band] = await db
    .select()
    .from(hrCompensationSalaryBands)
    .where(
      and(
        eq(hrCompensationSalaryBands.organizationId, organizationId),
        eq(hrCompensationSalaryBands.grade, grade),
        eq(hrCompensationSalaryBands.active, true),
        legalEntityCode
          ? eq(hrCompensationSalaryBands.legalEntityCode, legalEntityCode)
          : sql`${hrCompensationSalaryBands.legalEntityCode} IS NULL`,
      ),
    )
    .limit(1);

  if (!band) return null;

  return {
    minimum: parseNumeric(band.bandMinimum) ?? 0,
    midpoint: parseNumeric(band.bandMidpoint) ?? 0,
    maximum: parseNumeric(band.bandMaximum) ?? 0,
  };
}

export type UpsertHrCompensationRecommendationInput = {
  organizationId: string;
  actorUserId: string;
  cycleId: string;
  participantId: string;
  employeeId: string;
  adjustmentType: (typeof hrCompensationRecommendations.$inferInsert)["adjustmentType"];
  currentSalary: number;
  increaseAmount?: number | null;
  increasePercent?: number | null;
  budgetPoolId?: string | null;
  allowanceAmount?: number | null;
  bonusReferenceAmount?: number | null;
  benefitsReferenceAmount?: number | null;
  employerCostReferenceAmount?: number | null;
  managerComments?: string | null;
  justification?: string | null;
  grade?: string | null;
  legalEntityCode?: string | null;
};

export async function upsertHrCompensationRecommendationInTx(
  db: AfendaTransaction,
  input: UpsertHrCompensationRecommendationInput,
): Promise<{ recommendationId: string }> {
  if (
    input.increaseAmount == null &&
    input.increasePercent == null &&
    input.adjustmentType !== "special"
  ) {
    throw new HrCompensationCommandError("invalid_increase_input");
  }

  const band = await loadSalaryBandInTx(
    db,
    input.organizationId,
    input.grade ?? null,
    input.legalEntityCode ?? null,
  );

  let budgetAllocated: number | null = null;
  let existingBudgetImpacts: number[] = [];

  if (input.budgetPoolId) {
    const [pool] = await db
      .select()
      .from(hrCompensationBudgetPools)
      .where(
        and(
          eq(hrCompensationBudgetPools.organizationId, input.organizationId),
          eq(hrCompensationBudgetPools.id, input.budgetPoolId),
        ),
      )
      .limit(1);

    if (pool) {
      budgetAllocated = parseNumeric(pool.allocatedAmount) ?? 0;
      existingBudgetImpacts = await loadBudgetPoolImpactsInTx(
        db,
        input.organizationId,
        input.budgetPoolId,
      );
    }
  }

  const scenario = computeCompensationScenario({
    currentSalary: input.currentSalary,
    increaseAmount: input.increaseAmount,
    increasePercent: input.increasePercent,
    allowUnchanged: input.adjustmentType === "special",
    allowanceAmount: input.allowanceAmount,
    bonusReferenceAmount: input.bonusReferenceAmount,
    benefitsReferenceAmount: input.benefitsReferenceAmount,
    employerCostReferenceAmount: input.employerCostReferenceAmount,
    band,
    budgetAllocated,
    existingBudgetImpacts,
    adjustmentType: input.adjustmentType,
  });

  const {
    proposedSalary,
    budgetImpact,
    totalCompImpact: totalComp,
    bandValidation,
    overBudget,
    exceptionFlags,
    justificationRequired: needsJustification,
  } = scenario;

  if (needsJustification && !input.justification?.trim()) {
    throw new HrCompensationCommandError("justification_required");
  }

  const recommendationId = createEntityId("hr_cpm_rec");

  await db.insert(hrCompensationRecommendations).values({
    id: recommendationId,
    organizationId: input.organizationId,
    cycleId: input.cycleId,
    participantId: input.participantId,
    employeeId: input.employeeId,
    budgetPoolId: input.budgetPoolId ?? null,
    adjustmentType: input.adjustmentType,
    currentSalary: formatNumeric(input.currentSalary, 2),
    increaseAmount:
      input.increaseAmount != null
        ? formatNumeric(input.increaseAmount, 2)
        : null,
    increasePercent:
      input.increasePercent != null
        ? formatNumeric(input.increasePercent, 4)
        : null,
    proposedSalary: formatNumeric(proposedSalary, 2),
    totalCompImpact: formatNumeric(totalComp.totalCompensation, 2),
    bandMinimum: band ? formatNumeric(band.minimum, 2) : null,
    bandMidpoint: band ? formatNumeric(band.midpoint, 2) : null,
    bandMaximum: band ? formatNumeric(band.maximum, 2) : null,
    rangePosition:
      bandValidation.rangePosition != null
        ? formatNumeric(bandValidation.rangePosition, 4)
        : null,
    compaRatio:
      bandValidation.compaRatio != null
        ? formatNumeric(bandValidation.compaRatio, 4)
        : null,
    bandFlag: bandValidation.bandFlag,
    budgetImpact: formatNumeric(budgetImpact, 2),
    overBudget,
    exceptionFlags,
    justification: input.justification ?? null,
    managerComments: input.managerComments ?? null,
    recommenderUserId: input.actorUserId,
  });

  await appendHrCompensationAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.cpm.recommendation.create",
    cycleId: input.cycleId,
    recommendationId,
    employeeId: input.employeeId,
    summary: `Created ${input.adjustmentType} recommendation`,
  });

  return { recommendationId };
}

export type CreateHrCompensationScenarioInput = {
  organizationId: string;
  actorUserId: string;
  cycleId: string;
  participantId: string;
  label: string;
  recommendationId?: string | null;
  /** Pre-computed snapshot; ignored when scenarioInput is provided. */
  snapshot?: Record<string, unknown>;
  /** CPM-015 — what-if inputs; computed snapshot is persisted. */
  scenarioInput?: CompensationScenarioInput;
};

function compensationScenarioToSnapshot(
  result: ReturnType<typeof computeCompensationScenario>,
): Record<string, unknown> {
  return {
    proposedSalary: result.proposedSalary,
    budgetImpact: result.budgetImpact,
    totalCompImpact: result.totalCompImpact,
    bandValidation: result.bandValidation,
    budgetUtilization: result.budgetUtilization,
    overBudget: result.overBudget,
    exceptionFlags: result.exceptionFlags,
    justificationRequired: result.justificationRequired,
  };
}

export async function createHrCompensationScenarioInTx(
  db: AfendaTransaction,
  input: CreateHrCompensationScenarioInput,
): Promise<{ scenarioId: string; snapshot: Record<string, unknown> }> {
  if (!input.scenarioInput && !input.snapshot) {
    throw new HrCompensationCommandError("invalid_increase_input");
  }

  const snapshot = input.scenarioInput
    ? compensationScenarioToSnapshot(
        computeCompensationScenario(input.scenarioInput),
      )
    : input.snapshot!;

  const scenarioId = createEntityId("hr_cpm_scn");

  await db.insert(hrCompensationScenarios).values({
    id: scenarioId,
    organizationId: input.organizationId,
    cycleId: input.cycleId,
    participantId: input.participantId,
    recommendationId: input.recommendationId ?? null,
    label: input.label,
    snapshot,
    createdByUserId: input.actorUserId,
  });

  await appendHrCompensationAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.cpm.scenario.create",
    cycleId: input.cycleId,
    summary: `Created scenario ${input.label}`,
  });

  return { scenarioId, snapshot };
}

export async function submitHrCompensationRecommendationInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    recommendationId: string;
  },
): Promise<void> {
  const [rec] = await db
    .select()
    .from(hrCompensationRecommendations)
    .where(
      and(
        eq(hrCompensationRecommendations.organizationId, input.organizationId),
        eq(hrCompensationRecommendations.id, input.recommendationId),
      ),
    )
    .limit(1);

  if (!rec) throw new HrCompensationCommandError("recommendation_not_found");
  if (isHrCompensationRecommendationLocked(rec.recommendationStatus, rec.lockedAt)) {
    throw new HrCompensationCommandError("recommendation_locked");
  }
  if (!["draft", "returned"].includes(rec.recommendationStatus)) {
    throw new HrCompensationCommandError("invalid_status_transition");
  }

  await db
    .update(hrCompensationRecommendations)
    .set({ recommendationStatus: "submitted" })
    .where(eq(hrCompensationRecommendations.id, input.recommendationId));

  await appendHrCompensationAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.cpm.recommendation.submit",
    cycleId: rec.cycleId,
    recommendationId: input.recommendationId,
    employeeId: rec.employeeId,
  });
}

export async function reviewHrCompensationRecommendationInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    recommendationId: string;
    decision: "approve" | "reject" | "return" | "adjust";
    notes?: string | null;
    proposedSalary?: number | null;
  },
): Promise<void> {
  const [rec] = await db
    .select()
    .from(hrCompensationRecommendations)
    .where(
      and(
        eq(hrCompensationRecommendations.organizationId, input.organizationId),
        eq(hrCompensationRecommendations.id, input.recommendationId),
      ),
    )
    .limit(1);

  if (!rec) throw new HrCompensationCommandError("recommendation_not_found");
  if (isHrCompensationRecommendationLocked(rec.recommendationStatus, rec.lockedAt)) {
    throw new HrCompensationCommandError("recommendation_locked");
  }
  if (!["submitted", "hr_review"].includes(rec.recommendationStatus)) {
    throw new HrCompensationCommandError("invalid_status_transition");
  }

  const statusMap = {
    approve: "pending_approval" as const,
    reject: "rejected" as const,
    return: "returned" as const,
    adjust: "hr_review" as const,
  };

  const updates: Partial<typeof hrCompensationRecommendations.$inferInsert> = {
    recommendationStatus: statusMap[input.decision],
    reviewerUserId: input.actorUserId,
  };

  if (input.proposedSalary != null) {
    updates.proposedSalary = formatNumeric(input.proposedSalary, 2);
  }

  await db
    .update(hrCompensationRecommendations)
    .set(updates)
    .where(eq(hrCompensationRecommendations.id, input.recommendationId));

  await appendHrCompensationAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: `hr.cpm.recommendation.${input.decision}`,
    cycleId: rec.cycleId,
    recommendationId: input.recommendationId,
    employeeId: rec.employeeId,
    summary: input.notes ?? undefined,
  });

  if (input.decision === "approve") {
    const [cycle] = await db
      .select({ approvalRules: hrCompensationCycles.approvalRules })
      .from(hrCompensationCycles)
      .where(
        and(
          eq(hrCompensationCycles.organizationId, input.organizationId),
          eq(hrCompensationCycles.id, rec.cycleId),
        ),
      )
      .limit(1);

    await routeHrCompensationApprovalInTx(db, {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      recommendationId: input.recommendationId,
      approvalRules: cycle?.approvalRules ?? { steps: [] },
    });
  }
}

export async function routeHrCompensationApprovalInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    recommendationId: string;
    approvalRules: HrCompensationApprovalRules;
  },
): Promise<{ stepIds: string[] }> {
  const { resolveHrCompensationApprovalSteps } = await import(
    "./hr-compensation-planning-approval.shared"
  );

  const [rec] = await db
    .select()
    .from(hrCompensationRecommendations)
    .where(
      and(
        eq(hrCompensationRecommendations.organizationId, input.organizationId),
        eq(hrCompensationRecommendations.id, input.recommendationId),
      ),
    )
    .limit(1);

  if (!rec) throw new HrCompensationCommandError("recommendation_not_found");
  if (isHrCompensationRecommendationLocked(rec.recommendationStatus, rec.lockedAt)) {
    throw new HrCompensationCommandError("recommendation_locked");
  }

  const existingSteps = await db
    .select({ id: hrCompensationApprovalSteps.id })
    .from(hrCompensationApprovalSteps)
    .where(
      and(
        eq(hrCompensationApprovalSteps.organizationId, input.organizationId),
        eq(hrCompensationApprovalSteps.recommendationId, input.recommendationId),
      ),
    );

  if (existingSteps.length > 0) {
    return { stepIds: existingSteps.map((row) => row.id) };
  }

  const [participant] = await db
    .select()
    .from(hrCompensationCycleParticipants)
    .where(
      and(
        eq(hrCompensationCycleParticipants.organizationId, input.organizationId),
        eq(hrCompensationCycleParticipants.id, rec.participantId),
      ),
    )
    .limit(1);

  const budgetImpact = parseNumeric(rec.budgetImpact) ?? 0;
  const proposedSalary = parseNumeric(rec.proposedSalary) ?? 0;
  const increasePercent = parseNumeric(rec.increasePercent) ?? 0;

  const applicableSteps = resolveHrCompensationApprovalSteps({
    approvalRules: input.approvalRules,
    context: {
      budgetImpact,
      proposedSalary,
      increasePercent,
      legalEntityCode: participant?.legalEntityCode ?? null,
      departmentId: participant?.departmentId ?? null,
      grade: participant?.currentGrade ?? null,
      managerEmployeeId: participant?.managerEmployeeId ?? null,
    },
  });

  const stepIds: string[] = [];

  for (const step of applicableSteps) {
    const stepId = createEntityId("hr_cpm_appr");
    stepIds.push(stepId);
    await db.insert(hrCompensationApprovalSteps).values({
      id: stepId,
      organizationId: input.organizationId,
      recommendationId: input.recommendationId,
      stepOrder: step.order,
      approverRole: step.role,
    });
  }

  await db
    .update(hrCompensationRecommendations)
    .set({ recommendationStatus: "pending_approval" })
    .where(eq(hrCompensationRecommendations.id, input.recommendationId));

  await appendHrCompensationAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.cpm.approval.route",
    cycleId: rec.cycleId,
    recommendationId: input.recommendationId,
    metadata: { stepCount: stepIds.length, budgetImpact, proposedSalary, increasePercent },
  });

  return { stepIds };
}

export async function finalizeHrCompensationApprovalInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    recommendationId: string;
    effectiveDate: Date;
  },
): Promise<{ salaryChangeId: string; payrollRefId: string; historyEventId: string }> {
  const existing = await loadFinalizedCompensationArtifactsInTx(db, {
    organizationId: input.organizationId,
    recommendationId: input.recommendationId,
  });
  if (existing) {
    return existing;
  }

  const [rec] = await db
    .select()
    .from(hrCompensationRecommendations)
    .where(
      and(
        eq(hrCompensationRecommendations.organizationId, input.organizationId),
        eq(hrCompensationRecommendations.id, input.recommendationId),
      ),
    )
    .limit(1);

  if (!rec) throw new HrCompensationCommandError("recommendation_not_found");

  const alreadyApproved =
    rec.recommendationStatus === "approved" && rec.lockedAt != null;

  if (
    isHrCompensationRecommendationLocked(rec.recommendationStatus, rec.lockedAt) &&
    !alreadyApproved
  ) {
    throw new HrCompensationCommandError("recommendation_locked");
  }
  if (rec.recommendationStatus !== "pending_approval" && !alreadyApproved) {
    throw new HrCompensationCommandError("invalid_status_transition");
  }

  const lockedAt = rec.lockedAt ?? new Date();

  if (!alreadyApproved) {
    await db
      .update(hrCompensationRecommendations)
      .set({
        recommendationStatus: "approved",
        approverUserId: input.actorUserId,
        lockedAt,
        effectiveDate: input.effectiveDate,
      })
      .where(eq(hrCompensationRecommendations.id, input.recommendationId));
  }

  const previousSalary = parseNumeric(rec.currentSalary) ?? 0;
  const newSalary = parseNumeric(rec.proposedSalary) ?? 0;
  const salaryChangeId = createEntityId("hr_cpm_sal");
  const historyEventId = createEntityId("hr_cpm_hist");

  await insertHrEmployeeRecordEventInTx(db, {
    organizationId: input.organizationId,
    employeeId: rec.employeeId,
    eventId: historyEventId,
    kind: "updated",
    fieldName: "base_salary",
    previousValue: formatNumeric(previousSalary, 2),
    newValue: formatNumeric(newSalary, 2),
    effectiveDate: input.effectiveDate,
    reason: `Compensation approval (${rec.adjustmentType})`,
    approvalReference: input.recommendationId,
    actorUserId: input.actorUserId,
  });

  await db.insert(hrCompensationSalaryChanges).values({
    id: salaryChangeId,
    organizationId: input.organizationId,
    cycleId: rec.cycleId,
    recommendationId: input.recommendationId,
    employeeId: rec.employeeId,
    previousSalary: formatNumeric(previousSalary, 2),
    newSalary: formatNumeric(newSalary, 2),
    adjustmentType: rec.adjustmentType,
    effectiveDate: input.effectiveDate,
    employeeHistoryEventId: historyEventId,
  });

  const payrollRefId = createEntityId("hr_cpm_pay");
  const amountDelta = newSalary - previousSalary;
  const payrollReferenceCode = `CPM-${input.recommendationId.slice(-8)}`;

  await db.insert(hrCompensationPayrollRefs).values({
    id: payrollRefId,
    organizationId: input.organizationId,
    salaryChangeId,
    employeeId: rec.employeeId,
    payrollReferenceCode,
    effectiveDate: input.effectiveDate,
    amountDelta: formatNumeric(amountDelta, 2),
  });

  await appendHrCompensationAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.cpm.recommendation.approve",
    cycleId: rec.cycleId,
    recommendationId: input.recommendationId,
    employeeId: rec.employeeId,
    summary: "Final approval — recommendation locked",
    metadata: { salaryChangeId, historyEventId },
  });

  await appendHrCompensationAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.cpm.payroll.integrate",
    cycleId: rec.cycleId,
    recommendationId: input.recommendationId,
    employeeId: rec.employeeId,
    summary: "Approved compensation change queued for Payroll Processing",
    metadata: {
      payrollRefId,
      salaryChangeId,
      payrollReferenceCode,
      effectiveDate: input.effectiveDate.toISOString(),
      amountDelta,
    },
  });

  return { salaryChangeId, payrollRefId, historyEventId };
}

export type HrCompensationPayrollRefRow = {
  id: string;
  employeeId: string;
  payrollReferenceCode: string;
  effectiveDate: Date;
  amountDelta: number;
  syncStatus: string;
};

export async function listHrCompensationPayrollRefs(input: {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  limit?: number;
}): Promise<readonly HrCompensationPayrollRefRow[]> {
  const { getDb } = await import("./client");
  const db = getDb();
  const limit = Math.min(input.limit ?? MAX_CPM_PAYROLL_EXPORT, MAX_CPM_PAYROLL_EXPORT);

  const rows = await db
    .select({
      id: hrCompensationPayrollRefs.id,
      employeeId: hrCompensationPayrollRefs.employeeId,
      payrollReferenceCode: hrCompensationPayrollRefs.payrollReferenceCode,
      effectiveDate: hrCompensationPayrollRefs.effectiveDate,
      amountDelta: hrCompensationPayrollRefs.amountDelta,
      syncStatus: hrCompensationPayrollRefs.syncStatus,
    })
    .from(hrCompensationPayrollRefs)
    .where(
      and(
        eq(hrCompensationPayrollRefs.organizationId, input.organizationId),
        eq(hrCompensationPayrollRefs.syncStatus, "pending"),
        gte(hrCompensationPayrollRefs.effectiveDate, input.periodStart),
        lte(hrCompensationPayrollRefs.effectiveDate, input.periodEnd),
      ),
    )
    .orderBy(desc(hrCompensationPayrollRefs.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    employeeId: row.employeeId,
    payrollReferenceCode: row.payrollReferenceCode,
    effectiveDate: row.effectiveDate,
    amountDelta: parseNumeric(row.amountDelta) ?? 0,
    syncStatus: row.syncStatus,
  }));
}

export async function markHrCompensationPayrollRefsSyncedInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    payrollReferenceIds: readonly string[];
    syncedAt?: Date;
    actorUserId?: string | null;
  },
): Promise<{ syncedCount: number }> {
  if (input.payrollReferenceIds.length === 0) {
    return { syncedCount: 0 };
  }

  const syncedAt = input.syncedAt ?? new Date();

  const updated = await db
    .update(hrCompensationPayrollRefs)
    .set({ syncStatus: "synced", syncedAt })
    .where(
      and(
        eq(hrCompensationPayrollRefs.organizationId, input.organizationId),
        inArray(hrCompensationPayrollRefs.id, [...input.payrollReferenceIds]),
      ),
    )
    .returning({ id: hrCompensationPayrollRefs.id });

  if (input.actorUserId && updated.length > 0) {
    await appendHrCompensationAuditEventInTx(db, {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      action: "hr.cpm.payroll.synced",
      summary: `Synced ${updated.length} payroll refs`,
      metadata: {
        payrollReferenceIds: updated.map((row) => row.id),
        syncedAt: syncedAt.toISOString(),
      },
      occurredAt: syncedAt,
    });
  }

  return { syncedCount: updated.length };
}

export type HrCompensationReportRow = {
  cycleId: string;
  departmentId: string | null;
  managerEmployeeId: string | null;
  legalEntityCode: string | null;
  grade: string | null;
  budgetPoolId: string | null;
  recommendationStatus: string;
  count: number;
};

export async function listHrCompensationPlanningReportRows(input: {
  organizationId: string;
  cycleId?: string | null;
}): Promise<readonly HrCompensationReportRow[]> {
  const { getDb } = await import("./client");
  const db = getDb();

  const rows = await db
    .select({
      cycleId: hrCompensationRecommendations.cycleId,
      departmentId: hrCompensationCycleParticipants.departmentId,
      managerEmployeeId: hrCompensationCycleParticipants.managerEmployeeId,
      legalEntityCode: hrCompensationCycleParticipants.legalEntityCode,
      grade: hrCompensationCycleParticipants.currentGrade,
      budgetPoolId: hrCompensationRecommendations.budgetPoolId,
      recommendationStatus: hrCompensationRecommendations.recommendationStatus,
      count: sql<number>`count(*)::int`,
    })
    .from(hrCompensationRecommendations)
    .innerJoin(
      hrCompensationCycleParticipants,
      eq(
        hrCompensationRecommendations.participantId,
        hrCompensationCycleParticipants.id,
      ),
    )
    .where(
      input.cycleId
        ? and(
            eq(hrCompensationRecommendations.organizationId, input.organizationId),
            eq(hrCompensationRecommendations.cycleId, input.cycleId),
          )
        : eq(hrCompensationRecommendations.organizationId, input.organizationId),
    )
    .groupBy(
      hrCompensationRecommendations.cycleId,
      hrCompensationCycleParticipants.departmentId,
      hrCompensationCycleParticipants.managerEmployeeId,
      hrCompensationCycleParticipants.legalEntityCode,
      hrCompensationCycleParticipants.currentGrade,
      hrCompensationRecommendations.budgetPoolId,
      hrCompensationRecommendations.recommendationStatus,
    );

  return rows;
}

export type HrCompensationParticipantContext = {
  participantId: string;
  cycleId: string;
  employeeId: string;
  employeeLabel: string;
  currentSalary: number | null;
  currentGrade: string | null;
  currentLevel: string | null;
  departmentId: string | null;
  departmentName: string | null;
  managerEmployeeId: string | null;
  managerLabel: string | null;
  salaryEffectiveDate: Date | null;
  legalEntityCode: string | null;
  eligibilityStatus: string;
  budgetPoolId: string | null;
  currencyCode: string;
};

/** CPM-006 — participant compensation snapshot for planning UI. */
export async function getHrCompensationParticipantContext(input: {
  organizationId: string;
  participantId: string;
}): Promise<HrCompensationParticipantContext | null> {
  const { alias } = await import("drizzle-orm/pg-core");
  const { hrDepartments } = await import("./schema/hr");
  const { formatEmployeeLabel } = await import("./hr-benefits.shared");

  const managerEmployee = alias(hrEmployees, "cpm_manager_employee");

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select({
        participant: hrCompensationCycleParticipants,
        employee: hrEmployees,
        departmentName: hrDepartments.name,
        manager: managerEmployee,
        cycleCurrency: hrCompensationCycles.currencyCode,
      })
      .from(hrCompensationCycleParticipants)
      .innerJoin(
        hrEmployees,
        eq(hrCompensationCycleParticipants.employeeId, hrEmployees.id),
      )
      .innerJoin(
        hrCompensationCycles,
        eq(hrCompensationCycleParticipants.cycleId, hrCompensationCycles.id),
      )
      .leftJoin(
        hrDepartments,
        eq(hrCompensationCycleParticipants.departmentId, hrDepartments.id),
      )
      .leftJoin(
        managerEmployee,
        eq(
          hrCompensationCycleParticipants.managerEmployeeId,
          managerEmployee.id,
        ),
      )
      .where(
        and(
          eq(hrCompensationCycleParticipants.organizationId, input.organizationId),
          eq(hrCompensationCycleParticipants.id, input.participantId),
        ),
      )
      .limit(1);

    if (!row) return null;

    const { participant, employee, departmentName, manager, cycleCurrency } = row;

    return {
      participantId: participant.id,
      cycleId: participant.cycleId,
      employeeId: participant.employeeId,
      employeeLabel: formatEmployeeLabel(employee),
      currentSalary: parseNumeric(participant.currentSalary),
      currentGrade: participant.currentGrade,
      currentLevel: participant.currentLevel,
      departmentId: participant.departmentId,
      departmentName: departmentName ?? null,
      managerEmployeeId: participant.managerEmployeeId,
      managerLabel: manager ? formatEmployeeLabel(manager) : null,
      salaryEffectiveDate: participant.salaryEffectiveDate,
      legalEntityCode: participant.legalEntityCode,
      eligibilityStatus: participant.eligibilityStatus,
      budgetPoolId: participant.budgetPoolId,
      currencyCode: cycleCurrency ?? "USD",
    };
  });
}

export type HrCompensationSalaryBandContext = SalaryBandReference & {
  grade: string;
  currencyCode: string;
  rangePosition: number | null;
  compaRatio: number | null;
  bandFlag: ReturnType<typeof validateBandPosition>["bandFlag"];
};

/** CPM-007 — salary band reference with range position for current salary. */
export async function getHrCompensationSalaryBandContext(input: {
  organizationId: string;
  grade: string | null;
  legalEntityCode: string | null;
  currentSalary: number | null;
}): Promise<HrCompensationSalaryBandContext | null> {
  if (!input.grade) return null;

  const grade = input.grade;

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const band = await loadSalaryBandInTx(
      db,
      input.organizationId,
      grade,
      input.legalEntityCode,
    );

    if (!band) return null;

    const [bandRow] = await db
      .select({
        grade: hrCompensationSalaryBands.grade,
        currencyCode: hrCompensationSalaryBands.currencyCode,
      })
      .from(hrCompensationSalaryBands)
      .where(
        and(
          eq(hrCompensationSalaryBands.organizationId, input.organizationId),
          eq(hrCompensationSalaryBands.grade, grade),
          eq(hrCompensationSalaryBands.active, true),
          input.legalEntityCode
            ? eq(
                hrCompensationSalaryBands.legalEntityCode,
                input.legalEntityCode,
              )
            : sql`${hrCompensationSalaryBands.legalEntityCode} IS NULL`,
        ),
      )
      .limit(1);

    const currentSalary = input.currentSalary ?? 0;
    const bandValidation = validateBandPosition(currentSalary, band);

    return {
      grade: bandRow?.grade ?? grade,
      currencyCode: bandRow?.currencyCode ?? "USD",
      minimum: band.minimum,
      midpoint: band.midpoint,
      maximum: band.maximum,
      rangePosition: bandValidation.rangePosition,
      compaRatio: bandValidation.compaRatio,
      bandFlag: bandValidation.bandFlag,
    };
  });
}
