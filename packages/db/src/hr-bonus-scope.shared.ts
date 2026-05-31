/** Bonus eligibility rule ↔ employee scope matching (HRM-BON-003 / HRM-BON-004). */
import { computeEmployeeTenureMonths } from "./hr-benefit-scope.shared";

export { computeEmployeeTenureMonths };

export type HrBonusEligibilityRuleScope = {
  readonly legalEntityCode: string | null;
  readonly departmentId: string | null;
  readonly grade: string | null;
  readonly jobRole: string | null;
  readonly employmentType: string | null;
  readonly minTenureMonths: number | null;
  readonly maxTenureMonths: number | null;
  readonly performanceRating: string | null;
  readonly salesTeamCode: string | null;
  readonly employeeStatus: string | null;
};

export type HrEmployeeBonusScope = {
  readonly legalEntityCode: string | null;
  readonly departmentId: string | null;
  readonly grade: string | null;
  readonly jobRole: string | null;
  readonly employmentType: string | null;
  readonly employmentStatus: string | null;
  readonly performanceRating: string | null;
  readonly salesTeamCode: string | null;
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
  rule: Pick<HrBonusEligibilityRuleScope, "minTenureMonths" | "maxTenureMonths">,
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

export function appliesBonusEligibilityRuleToEmployee(
  rule: HrBonusEligibilityRuleScope,
  employee: HrEmployeeBonusScope,
): boolean {
  return (
    matchesOptionalScopeValue(rule.legalEntityCode, employee.legalEntityCode) &&
    matchesOptionalScopeValue(rule.departmentId, employee.departmentId) &&
    matchesOptionalScopeValue(rule.grade, employee.grade) &&
    matchesOptionalScopeValue(rule.jobRole, employee.jobRole) &&
    matchesOptionalScopeValue(rule.employmentType, employee.employmentType) &&
    matchesOptionalScopeValue(rule.performanceRating, employee.performanceRating) &&
    matchesOptionalScopeValue(rule.salesTeamCode, employee.salesTeamCode) &&
    matchesOptionalScopeValue(rule.employeeStatus, employee.employmentStatus) &&
    matchesTenureBand(rule, employee.tenureMonths)
  );
}

export function isEmployeeEligibleForBonusPlan(input: {
  rules: readonly HrBonusEligibilityRuleScope[];
  employee: HrEmployeeBonusScope;
}): boolean {
  if (input.rules.length === 0) {
    return true;
  }
  return input.rules.some((rule) =>
    appliesBonusEligibilityRuleToEmployee(rule, input.employee),
  );
}

export function buildBonusTargetScopeKey(input: {
  targetKind: string;
  employeeId?: string | null;
  departmentId?: string | null;
  teamRef?: string | null;
  projectRef?: string | null;
  label?: string | null;
}): string {
  switch (input.targetKind) {
    case "individual":
      if (!input.employeeId?.trim()) {
        throw new Error("individual target requires employeeId");
      }
      return `employee:${input.employeeId.trim()}`;
    case "department":
      if (!input.departmentId?.trim()) {
        throw new Error("department target requires departmentId");
      }
      return `department:${input.departmentId.trim()}`;
    case "team":
      if (!input.teamRef?.trim()) {
        throw new Error("team target requires teamRef");
      }
      return `team:${input.teamRef.trim()}`;
    case "project":
      if (!input.projectRef?.trim()) {
        throw new Error("project target requires projectRef");
      }
      return `project:${input.projectRef.trim()}`;
    default:
      return `${input.targetKind}:${input.label?.trim() || "global"}`;
  }
}
