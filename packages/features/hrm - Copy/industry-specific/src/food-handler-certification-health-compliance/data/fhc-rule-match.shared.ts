export type FhcRequirementRuleCriteria = {
  readonly countryCode: string | null
  readonly legalEntityRef: string | null
  readonly roleRef: string | null
  readonly departmentRef: string | null
  readonly employeeCategoryRef: string | null
}

export type FhcEmployeeMatchFacts = {
  readonly countryCode: string | null
  readonly legalEntityRef: string | null
  readonly positionId: string | null
  readonly departmentId: string | null
  readonly workerCategory: string | null
}

function criteriaMatches(
  ruleValue: string | null,
  employeeValue: string | null
): boolean {
  if (!ruleValue) return true
  if (!employeeValue) return false
  return ruleValue === employeeValue
}

/** HRM-FHC-002 — rule scope matches employee assignment facts (null criterion = any). */
export function fhcRequirementRuleMatchesEmployeeFacts(
  rule: FhcRequirementRuleCriteria,
  facts: FhcEmployeeMatchFacts
): boolean {
  return (
    criteriaMatches(rule.countryCode, facts.countryCode) &&
    criteriaMatches(rule.legalEntityRef, facts.legalEntityRef) &&
    criteriaMatches(rule.roleRef, facts.positionId) &&
    criteriaMatches(rule.departmentRef, facts.departmentId) &&
    criteriaMatches(rule.employeeCategoryRef, facts.workerCategory)
  )
}
