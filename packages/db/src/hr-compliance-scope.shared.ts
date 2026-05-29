/** Shared obligation ↔ employee scope matching (HRM-CMP-001 / HRM-CMP-002). */
export type HrComplianceObligationScope = {
  readonly countryCode: string | null;
  readonly legalEntityCode: string | null;
  readonly workLocationCode: string | null;
  readonly employmentType: string | null;
  readonly workerCategory: string | null;
  readonly departmentId?: string | null;
};

export type HrEmployeeComplianceScope = HrComplianceObligationScope;

function matchesOptionalScopeValue(
  expected: string | null | undefined,
  actual: string | null | undefined,
): boolean {
  if (!expected?.trim()) return true;
  if (!actual?.trim()) return false;
  return expected.trim().toUpperCase() === actual.trim().toUpperCase();
}

function matchesOptionalDepartmentId(
  expected: string | null | undefined,
  actual: string | null | undefined,
): boolean {
  if (!expected?.trim()) return true;
  if (!actual?.trim()) return false;
  return expected.trim() === actual.trim();
}

export function appliesComplianceObligationToEmployee(
  obligation: HrComplianceObligationScope,
  employee: HrEmployeeComplianceScope,
): boolean {
  return (
    matchesOptionalScopeValue(obligation.countryCode, employee.countryCode) &&
    matchesOptionalScopeValue(
      obligation.legalEntityCode,
      employee.legalEntityCode,
    ) &&
    matchesOptionalScopeValue(
      obligation.workLocationCode,
      employee.workLocationCode,
    ) &&
    matchesOptionalScopeValue(
      obligation.employmentType,
      employee.employmentType,
    ) &&
    matchesOptionalScopeValue(
      obligation.workerCategory,
      employee.workerCategory,
    ) &&
    matchesOptionalDepartmentId(obligation.departmentId, employee.departmentId)
  );
}
