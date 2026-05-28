export type MscRequirementRuleCriteria = {
  readonly countryCode: string | null
  readonly legalEntityRef: string | null
  readonly roleRef: string | null
  readonly departmentRef: string | null
  readonly riskCategory: string | null
}

export type MscEmployeeMatchFacts = {
  readonly countryCode: string | null
  readonly legalEntityRef: string | null
  readonly positionId: string | null
  readonly departmentId: string | null
  readonly riskCategory: string | null
}

function criteriaMatches(
  ruleValue: string | null,
  employeeValue: string | null
): boolean {
  if (!ruleValue) return true
  if (!employeeValue) return false
  return ruleValue === employeeValue
}

/** HRM-MSC-002 — rule scope matches employee assignment facts (null criterion = any). */
export function mscRequirementRuleMatchesEmployeeFacts(
  rule: MscRequirementRuleCriteria,
  facts: MscEmployeeMatchFacts
): boolean {
  return (
    criteriaMatches(rule.countryCode, facts.countryCode) &&
    criteriaMatches(rule.legalEntityRef, facts.legalEntityRef) &&
    criteriaMatches(rule.roleRef, facts.positionId) &&
    criteriaMatches(rule.departmentRef, facts.departmentId) &&
    criteriaMatches(rule.riskCategory, facts.riskCategory)
  )
}
