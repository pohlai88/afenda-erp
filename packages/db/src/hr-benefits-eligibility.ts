import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import {
  appliesBenefitEligibilityRuleToEmployee,
  computeEmployeeTenureMonths,
  isEmployeeEligibleForBenefitPlan,
  type HrBenefitEligibilityRuleScope,
  type HrEmployeeBenefitScope,
} from "./hr-benefit-scope.shared";
import {
  buildPaginatedWindow,
  clampPageSize,
  HrBenefitsCommandError,
  normalizeScopeCode,
  normalizeScopeText,
} from "./hr-benefits.shared";
import type {
  HrBenefitEligibilityDetermination,
  HrBenefitEligibilityRuleWindow,
} from "./hr-benefits.types";
import {
  hrBenefitEligibilityRules,
  hrBenefitPlans,
} from "./schema/hr-benefits";
import { hrEmployees } from "./schema/hr";

export function formatBenefitEligibilityScopeLabel(
  rule: HrBenefitEligibilityRuleScope,
): string {
  const parts = [
    rule.countryCode,
    rule.legalEntityCode,
    rule.workLocationCode,
    rule.employmentType,
    rule.workerCategory,
    rule.grade,
    rule.level,
    rule.minTenureMonths != null ? `≥${rule.minTenureMonths}mo` : null,
    rule.maxTenureMonths != null ? `≤${rule.maxTenureMonths}mo` : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "All employees";
}

export async function listHrBenefitEligibilityRulesWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  planId?: string;
}): Promise<HrBenefitEligibilityRuleWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrBenefitEligibilityRules.organizationId, input.organizationId),
      eq(hrBenefitEligibilityRules.active, true),
    ];

    if (input.planId?.trim()) {
      conditions.push(eq(hrBenefitEligibilityRules.planId, input.planId.trim()));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrBenefitPlans.code, pattern),
          ilike(hrBenefitPlans.name, pattern),
          ilike(hrBenefitEligibilityRules.legalEntityCode, pattern),
          ilike(hrBenefitEligibilityRules.countryCode, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrBenefitEligibilityRules)
      .innerJoin(
        hrBenefitPlans,
        eq(hrBenefitEligibilityRules.planId, hrBenefitPlans.id),
      )
      .where(whereClause);

    const rows = await db
      .select({
        id: hrBenefitEligibilityRules.id,
        planCode: hrBenefitPlans.code,
        planName: hrBenefitPlans.name,
        countryCode: hrBenefitEligibilityRules.countryCode,
        legalEntityCode: hrBenefitEligibilityRules.legalEntityCode,
        workLocationCode: hrBenefitEligibilityRules.workLocationCode,
        employmentType: hrBenefitEligibilityRules.employmentType,
        workerCategory: hrBenefitEligibilityRules.workerCategory,
        grade: hrBenefitEligibilityRules.grade,
        level: hrBenefitEligibilityRules.level,
        minTenureMonths: hrBenefitEligibilityRules.minTenureMonths,
        maxTenureMonths: hrBenefitEligibilityRules.maxTenureMonths,
        active: hrBenefitEligibilityRules.active,
        effectiveFrom: hrBenefitEligibilityRules.effectiveFrom,
      })
      .from(hrBenefitEligibilityRules)
      .innerJoin(
        hrBenefitPlans,
        eq(hrBenefitEligibilityRules.planId, hrBenefitPlans.id),
      )
      .where(whereClause)
      .orderBy(desc(hrBenefitEligibilityRules.updatedAt))
      .limit(pageSize)
      .offset(offset);

    return buildPaginatedWindow({
      rows: rows.map((row) => ({
        id: row.id,
        planCode: row.planCode,
        planName: row.planName,
        scopeLabel: formatBenefitEligibilityScopeLabel(row),
        active: row.active,
        effectiveFrom: row.effectiveFrom,
      })),
      pageSize,
      offset,
      totalCount: Number(totalRow?.total ?? 0),
    });
  });
}

export async function upsertHrBenefitEligibilityRuleInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    planId: string;
    ruleId?: string;
    countryCode?: string | null;
    legalEntityCode?: string | null;
    workLocationCode?: string | null;
    employmentType?: string | null;
    workerCategory?: string | null;
    grade?: string | null;
    level?: string | null;
    minTenureMonths?: number | null;
    maxTenureMonths?: number | null;
    effectiveFrom?: Date;
    effectiveTo?: Date | null;
  },
): Promise<{ ruleId: string }> {
  const [plan] = await db
    .select({ id: hrBenefitPlans.id })
    .from(hrBenefitPlans)
    .where(
      and(
        eq(hrBenefitPlans.organizationId, input.organizationId),
        eq(hrBenefitPlans.id, input.planId),
        eq(hrBenefitPlans.planStatus, "active"),
      ),
    )
    .limit(1);

  if (!plan) {
    throw new HrBenefitsCommandError("plan_not_found");
  }

  const payload = {
    countryCode: normalizeScopeCode(input.countryCode),
    legalEntityCode: normalizeScopeText(input.legalEntityCode),
    workLocationCode: normalizeScopeText(input.workLocationCode),
    employmentType: normalizeScopeText(input.employmentType),
    workerCategory: normalizeScopeText(input.workerCategory),
    grade: normalizeScopeText(input.grade),
    level: normalizeScopeText(input.level),
    minTenureMonths: input.minTenureMonths ?? null,
    maxTenureMonths: input.maxTenureMonths ?? null,
    effectiveFrom: input.effectiveFrom ?? new Date(),
    effectiveTo: input.effectiveTo ?? null,
    active: true,
  };

  if (input.ruleId?.trim()) {
    const [existing] = await db
      .select({ id: hrBenefitEligibilityRules.id })
      .from(hrBenefitEligibilityRules)
      .where(
        and(
          eq(hrBenefitEligibilityRules.organizationId, input.organizationId),
          eq(hrBenefitEligibilityRules.id, input.ruleId.trim()),
        ),
      )
      .limit(1);

    if (!existing) {
      throw new HrBenefitsCommandError("rule_not_found");
    }

    await db
      .update(hrBenefitEligibilityRules)
      .set({ ...payload, planId: input.planId })
      .where(eq(hrBenefitEligibilityRules.id, existing.id));
    return { ruleId: existing.id };
  }

  const ruleId = createEntityId("hr_ben_rule");
  await db.insert(hrBenefitEligibilityRules).values({
    id: ruleId,
    organizationId: input.organizationId,
    planId: input.planId,
    ...payload,
  });
  return { ruleId };
}

export async function upsertHrBenefitEligibilityRule(
  input: Parameters<typeof upsertHrBenefitEligibilityRuleInTx>[1],
): Promise<{ ruleId: string }> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    upsertHrBenefitEligibilityRuleInTx(db, input),
  );
}

export async function loadActiveBenefitEligibilityRulesInTx(
  db: AfendaTransaction,
  input: { organizationId: string; planId: string },
): Promise<
  Array<
    HrBenefitEligibilityRuleScope & {
      id: string;
    }
  >
> {
  const rows = await db
    .select({
      id: hrBenefitEligibilityRules.id,
      countryCode: hrBenefitEligibilityRules.countryCode,
      legalEntityCode: hrBenefitEligibilityRules.legalEntityCode,
      workLocationCode: hrBenefitEligibilityRules.workLocationCode,
      employmentType: hrBenefitEligibilityRules.employmentType,
      workerCategory: hrBenefitEligibilityRules.workerCategory,
      grade: hrBenefitEligibilityRules.grade,
      level: hrBenefitEligibilityRules.level,
      minTenureMonths: hrBenefitEligibilityRules.minTenureMonths,
      maxTenureMonths: hrBenefitEligibilityRules.maxTenureMonths,
    })
    .from(hrBenefitEligibilityRules)
    .where(
      and(
        eq(hrBenefitEligibilityRules.organizationId, input.organizationId),
        eq(hrBenefitEligibilityRules.planId, input.planId),
        eq(hrBenefitEligibilityRules.active, true),
      ),
    );

  return rows;
}

export async function determineHrBenefitEligibility(input: {
  organizationId: string;
  employeeId: string;
  planId: string;
  asOf?: Date;
}): Promise<HrBenefitEligibilityDetermination> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [employee] = await db
      .select({
        id: hrEmployees.id,
        countryCode: hrEmployees.countryCode,
        legalEntityCode: hrEmployees.legalEntityCode,
        workLocationCode: hrEmployees.workLocationCode,
        employmentType: hrEmployees.employmentType,
        workerCategory: hrEmployees.workerCategory,
        grade: hrEmployees.grade,
        level: hrEmployees.level,
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
      throw new HrBenefitsCommandError("employee_not_found");
    }

    const rules = await loadActiveBenefitEligibilityRulesInTx(db, {
      organizationId: input.organizationId,
      planId: input.planId,
    });

    const employeeScope: HrEmployeeBenefitScope = {
      countryCode: employee.countryCode,
      legalEntityCode: employee.legalEntityCode,
      workLocationCode: employee.workLocationCode,
      employmentType: employee.employmentType,
      workerCategory: employee.workerCategory,
      grade: employee.grade,
      level: employee.level,
      tenureMonths: computeEmployeeTenureMonths({
        employmentStartDate: employee.employmentStartDate,
        asOf: input.asOf,
      }),
    };

    const matchedRuleIds = rules
      .filter((rule) =>
        appliesBenefitEligibilityRuleToEmployee(rule, employeeScope),
      )
      .map((rule) => rule.id);

    return {
      employeeId: employee.id,
      planId: input.planId,
      eligible: isEmployeeEligibleForBenefitPlan({ rules, employee: employeeScope }),
      matchedRuleIds,
    };
  });
}
