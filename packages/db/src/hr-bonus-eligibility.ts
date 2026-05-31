import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import {
  buildPaginatedWindow,
  clampPageSize,
  normalizeScopeText,
} from "./hr-benefits.shared";
import {
  appliesBonusEligibilityRuleToEmployee,
  computeEmployeeTenureMonths,
  isEmployeeEligibleForBonusPlan,
  type HrBonusEligibilityRuleScope,
  type HrEmployeeBonusScope,
} from "./hr-bonus-scope.shared";
import { HrBonusCommandError } from "./hr-bonus-incentive.shared";
import {
  hrBonusEligibilityRules,
  hrBonusPlanParticipants,
  hrBonusPlans,
} from "./schema/hr-bonus-incentive";
import { hrDepartments, hrEmployees } from "./schema/hr";

export type HrBonusEligibilityDetermination = {
  employeeId: string;
  planId: string;
  eligible: boolean;
  matchedRuleIds: string[];
  ineligibilityReason?: string;
};

export function formatBonusEligibilityScopeLabel(
  rule: HrBonusEligibilityRuleScope & { departmentName?: string | null },
): string {
  const parts = [
    rule.legalEntityCode,
    rule.departmentName ?? rule.departmentId,
    rule.grade,
    rule.jobRole,
    rule.employmentType,
    rule.performanceRating,
    rule.salesTeamCode,
    rule.employeeStatus,
    rule.minTenureMonths != null ? `≥${rule.minTenureMonths}mo` : null,
    rule.maxTenureMonths != null ? `≤${rule.maxTenureMonths}mo` : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "All employees";
}

export async function listHrBonusEligibilityRulesWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  planId?: string;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrBonusEligibilityRules.organizationId, input.organizationId),
      eq(hrBonusEligibilityRules.active, true),
    ];

    if (input.planId?.trim()) {
      conditions.push(eq(hrBonusEligibilityRules.planId, input.planId.trim()));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrBonusPlans.code, pattern),
          ilike(hrBonusPlans.name, pattern),
          ilike(hrBonusEligibilityRules.legalEntityCode, pattern),
          ilike(hrBonusEligibilityRules.jobRole, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrBonusEligibilityRules)
      .innerJoin(hrBonusPlans, eq(hrBonusEligibilityRules.planId, hrBonusPlans.id))
      .leftJoin(
        hrDepartments,
        eq(hrBonusEligibilityRules.departmentId, hrDepartments.id),
      )
      .where(whereClause);

    const rows = await db
      .select({
        id: hrBonusEligibilityRules.id,
        planCode: hrBonusPlans.code,
        planName: hrBonusPlans.name,
        legalEntityCode: hrBonusEligibilityRules.legalEntityCode,
        departmentId: hrBonusEligibilityRules.departmentId,
        departmentName: hrDepartments.name,
        grade: hrBonusEligibilityRules.grade,
        jobRole: hrBonusEligibilityRules.jobRole,
        employmentType: hrBonusEligibilityRules.employmentType,
        minTenureMonths: hrBonusEligibilityRules.minTenureMonths,
        maxTenureMonths: hrBonusEligibilityRules.maxTenureMonths,
        performanceRating: hrBonusEligibilityRules.performanceRating,
        salesTeamCode: hrBonusEligibilityRules.salesTeamCode,
        employeeStatus: hrBonusEligibilityRules.employeeStatus,
        active: hrBonusEligibilityRules.active,
        effectiveFrom: hrBonusEligibilityRules.effectiveFrom,
      })
      .from(hrBonusEligibilityRules)
      .innerJoin(hrBonusPlans, eq(hrBonusEligibilityRules.planId, hrBonusPlans.id))
      .leftJoin(
        hrDepartments,
        eq(hrBonusEligibilityRules.departmentId, hrDepartments.id),
      )
      .where(whereClause)
      .orderBy(desc(hrBonusEligibilityRules.updatedAt))
      .limit(pageSize)
      .offset(offset);

    return buildPaginatedWindow({
      rows: rows.map((row) => ({
        id: row.id,
        planCode: row.planCode,
        planName: row.planName,
        scopeLabel: formatBonusEligibilityScopeLabel(row),
        active: row.active,
        effectiveFrom: row.effectiveFrom,
      })),
      pageSize,
      offset,
      totalCount: Number(totalRow?.total ?? 0),
    });
  });
}

export async function upsertHrBonusEligibilityRuleInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    planId: string;
    ruleId?: string;
    legalEntityCode?: string | null;
    departmentId?: string | null;
    grade?: string | null;
    jobRole?: string | null;
    employmentType?: string | null;
    minTenureMonths?: number | null;
    maxTenureMonths?: number | null;
    performanceRating?: string | null;
    salesTeamCode?: string | null;
    employeeStatus?: string | null;
    effectiveFrom?: Date;
    effectiveTo?: Date | null;
  },
): Promise<{ ruleId: string }> {
  const [plan] = await db
    .select({ id: hrBonusPlans.id })
    .from(hrBonusPlans)
    .where(
      and(
        eq(hrBonusPlans.organizationId, input.organizationId),
        eq(hrBonusPlans.id, input.planId),
      ),
    )
    .limit(1);

  if (!plan) {
    throw new HrBonusCommandError("plan_not_found");
  }

  const payload = {
    legalEntityCode: normalizeScopeText(input.legalEntityCode),
    departmentId: input.departmentId?.trim() || null,
    grade: normalizeScopeText(input.grade),
    jobRole: normalizeScopeText(input.jobRole),
    employmentType: normalizeScopeText(input.employmentType),
    minTenureMonths: input.minTenureMonths ?? null,
    maxTenureMonths: input.maxTenureMonths ?? null,
    performanceRating: normalizeScopeText(input.performanceRating),
    salesTeamCode: normalizeScopeText(input.salesTeamCode),
    employeeStatus: normalizeScopeText(input.employeeStatus),
    effectiveFrom: input.effectiveFrom ?? new Date(),
    effectiveTo: input.effectiveTo ?? null,
    active: true,
  };

  if (input.ruleId?.trim()) {
    const [existing] = await db
      .select({ id: hrBonusEligibilityRules.id })
      .from(hrBonusEligibilityRules)
      .where(
        and(
          eq(hrBonusEligibilityRules.organizationId, input.organizationId),
          eq(hrBonusEligibilityRules.id, input.ruleId.trim()),
        ),
      )
      .limit(1);

    if (!existing) {
      throw new HrBonusCommandError("rule_not_found");
    }

    await db
      .update(hrBonusEligibilityRules)
      .set({ ...payload, planId: input.planId })
      .where(eq(hrBonusEligibilityRules.id, existing.id));
    return { ruleId: existing.id };
  }

  const ruleId = createEntityId("hr_bon_rule");
  await db.insert(hrBonusEligibilityRules).values({
    id: ruleId,
    organizationId: input.organizationId,
    planId: input.planId,
    ...payload,
  });
  return { ruleId };
}

async function loadActiveBonusEligibilityRulesInTx(
  db: AfendaTransaction,
  input: { organizationId: string; planId: string },
): Promise<Array<HrBonusEligibilityRuleScope & { id: string }>> {
  return db
    .select({
      id: hrBonusEligibilityRules.id,
      legalEntityCode: hrBonusEligibilityRules.legalEntityCode,
      departmentId: hrBonusEligibilityRules.departmentId,
      grade: hrBonusEligibilityRules.grade,
      jobRole: hrBonusEligibilityRules.jobRole,
      employmentType: hrBonusEligibilityRules.employmentType,
      minTenureMonths: hrBonusEligibilityRules.minTenureMonths,
      maxTenureMonths: hrBonusEligibilityRules.maxTenureMonths,
      performanceRating: hrBonusEligibilityRules.performanceRating,
      salesTeamCode: hrBonusEligibilityRules.salesTeamCode,
      employeeStatus: hrBonusEligibilityRules.employeeStatus,
    })
    .from(hrBonusEligibilityRules)
    .where(
      and(
        eq(hrBonusEligibilityRules.organizationId, input.organizationId),
        eq(hrBonusEligibilityRules.planId, input.planId),
        eq(hrBonusEligibilityRules.active, true),
      ),
    );
}

export async function determineHrBonusEligibilityInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
    planId: string;
    asOf?: Date;
  },
): Promise<HrBonusEligibilityDetermination> {
  const [employee] = await db
    .select({
      id: hrEmployees.id,
      legalEntityCode: hrEmployees.legalEntityCode,
      currentDepartmentId: hrEmployees.currentDepartmentId,
      grade: hrEmployees.grade,
      level: hrEmployees.level,
      employmentType: hrEmployees.employmentType,
      employmentStatus: hrEmployees.employmentStatus,
      employmentStartDate: hrEmployees.employmentStartDate,
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
    throw new HrBonusCommandError("employee_not_found");
  }

  const rules = await loadActiveBonusEligibilityRulesInTx(db, {
    organizationId: input.organizationId,
    planId: input.planId,
  });

  const employeeScope: HrEmployeeBonusScope = {
    legalEntityCode: employee.legalEntityCode,
    departmentId: employee.currentDepartmentId,
    grade: employee.grade,
    jobRole: employee.level,
    employmentType: employee.employmentType,
    employmentStatus: employee.employmentStatus,
    performanceRating: null,
    salesTeamCode: null,
    tenureMonths: computeEmployeeTenureMonths({
      employmentStartDate: employee.employmentStartDate,
      asOf: input.asOf,
    }),
  };

  const matchedRuleIds = rules
    .filter((rule) =>
      appliesBonusEligibilityRuleToEmployee(rule, employeeScope),
    )
    .map((rule) => rule.id);

  const eligible = isEmployeeEligibleForBonusPlan({
    rules,
    employee: employeeScope,
  });

  return {
    employeeId: employee.id,
    planId: input.planId,
    eligible,
    matchedRuleIds,
    ineligibilityReason: eligible
      ? undefined
      : "Employee does not match any active eligibility rule for this plan.",
  };
}

export async function determineHrBonusEligibility(input: {
  organizationId: string;
  employeeId: string;
  planId: string;
  asOf?: Date;
}): Promise<HrBonusEligibilityDetermination> {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    determineHrBonusEligibilityInTx(db, input),
  );
}

export { loadActiveBonusEligibilityRulesInTx };

/** BON-019 — block payout calculation when employee is ineligible or unassigned. */
export async function validateHrBonusEligibilityBeforePayoutInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
    planId: string;
    asOf?: Date;
  },
): Promise<HrBonusEligibilityDetermination> {
  const determination = await determineHrBonusEligibilityInTx(db, input);

  const [participant] = await db
    .select({
      eligible: hrBonusPlanParticipants.eligible,
      assignmentStatus: hrBonusPlanParticipants.assignmentStatus,
    })
    .from(hrBonusPlanParticipants)
    .where(
      and(
        eq(hrBonusPlanParticipants.organizationId, input.organizationId),
        eq(hrBonusPlanParticipants.planId, input.planId),
        eq(hrBonusPlanParticipants.employeeId, input.employeeId),
      ),
    )
    .limit(1);

  if (!participant || participant.assignmentStatus !== "assigned") {
    throw new HrBonusCommandError(
      "participant_not_assigned",
      "Employee is not assigned to this bonus or incentive plan.",
    );
  }

  if (!participant.eligible || !determination.eligible) {
    throw new HrBonusCommandError(
      "ineligible_for_payout",
      determination.ineligibilityReason ??
        "Employee is not eligible for payout on this plan.",
    );
  }

  return determination;
}
