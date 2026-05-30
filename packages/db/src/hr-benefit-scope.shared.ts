/** Benefit eligibility rule ↔ employee scope matching (HRM-BEN-003 / HRM-BEN-004). */
export type HrBenefitEligibilityRuleScope = {
  readonly countryCode: string | null;
  readonly legalEntityCode: string | null;
  readonly workLocationCode: string | null;
  readonly employmentType: string | null;
  readonly workerCategory: string | null;
  readonly grade: string | null;
  readonly level: string | null;
  readonly minTenureMonths: number | null;
  readonly maxTenureMonths: number | null;
};

export type HrEmployeeBenefitScope = {
  readonly countryCode: string | null;
  readonly legalEntityCode: string | null;
  readonly workLocationCode: string | null;
  readonly employmentType: string | null;
  readonly workerCategory: string | null;
  readonly grade: string | null;
  readonly level: string | null;
  readonly tenureMonths: number | null;
};

function matchesOptionalScopeValue(
  expected: string | null | undefined,
  actual: string | null | undefined,
): boolean {
  if (!expected?.trim()) return true;
  if (!actual?.trim()) return false;
  return expected.trim().toUpperCase() === actual.trim().toUpperCase();
}

function matchesTenureBand(
  rule: Pick<HrBenefitEligibilityRuleScope, "minTenureMonths" | "maxTenureMonths">,
  tenureMonths: number | null,
): boolean {
  if (rule.minTenureMonths == null && rule.maxTenureMonths == null) {
    return true;
  }
  if (tenureMonths == null) {
    return false;
  }
  if (rule.minTenureMonths != null && tenureMonths < rule.minTenureMonths) {
    return false;
  }
  if (rule.maxTenureMonths != null && tenureMonths > rule.maxTenureMonths) {
    return false;
  }
  return true;
}

export function computeEmployeeTenureMonths(input: {
  employmentStartDate: Date | null | undefined;
  asOf?: Date;
}): number | null {
  if (!input.employmentStartDate) {
    return null;
  }
  const asOf = input.asOf ?? new Date();
  const startMs = input.employmentStartDate.getTime();
  const endMs = asOf.getTime();
  if (endMs < startMs) {
    return 0;
  }
  const months =
    (asOf.getFullYear() - input.employmentStartDate.getFullYear()) * 12 +
    (asOf.getMonth() - input.employmentStartDate.getMonth());
  const dayAdjusted =
    asOf.getDate() < input.employmentStartDate.getDate() ? months - 1 : months;
  return Math.max(0, dayAdjusted);
}

export function appliesBenefitEligibilityRuleToEmployee(
  rule: HrBenefitEligibilityRuleScope,
  employee: HrEmployeeBenefitScope,
): boolean {
  return (
    matchesOptionalScopeValue(rule.countryCode, employee.countryCode) &&
    matchesOptionalScopeValue(rule.legalEntityCode, employee.legalEntityCode) &&
    matchesOptionalScopeValue(rule.workLocationCode, employee.workLocationCode) &&
    matchesOptionalScopeValue(rule.employmentType, employee.employmentType) &&
    matchesOptionalScopeValue(rule.workerCategory, employee.workerCategory) &&
    matchesOptionalScopeValue(rule.grade, employee.grade) &&
    matchesOptionalScopeValue(rule.level, employee.level) &&
    matchesTenureBand(rule, employee.tenureMonths)
  );
}

export function isEmployeeEligibleForBenefitPlan(input: {
  rules: readonly HrBenefitEligibilityRuleScope[];
  employee: HrEmployeeBenefitScope;
}): boolean {
  if (input.rules.length === 0) {
    return true;
  }
  return input.rules.some((rule) =>
    appliesBenefitEligibilityRuleToEmployee(rule, input.employee),
  );
}
