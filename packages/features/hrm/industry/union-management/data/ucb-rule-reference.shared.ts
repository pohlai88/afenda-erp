import type { HrmUcbRuleDomain } from "../schemas/ucb-workflow-state.shared"
import type { UcbRuleRefExportRow } from "./ucb.types.shared"

export const UCB_PAYROLL_RULE_DOMAINS = [
  "pay",
  "allowance",
  "benefit",
] as const satisfies readonly HrmUcbRuleDomain[]

export const UCB_OVERTIME_RULE_DOMAINS = [
  "overtime",
  "work_hours",
] as const satisfies readonly HrmUcbRuleDomain[]

export const UCB_LEAVE_RULE_DOMAINS = [
  "leave",
  "holiday",
  "rest",
] as const satisfies readonly HrmUcbRuleDomain[]

export const UCB_SCHEDULING_RULE_DOMAINS = [
  "schedule",
  "work_hours",
] as const satisfies readonly HrmUcbRuleDomain[]

export function filterUcbRuleRefsByDomains(
  rows: readonly UcbRuleRefExportRow[],
  domains: readonly HrmUcbRuleDomain[]
): UcbRuleRefExportRow[] {
  const domainSet = new Set(domains)
  return rows.filter((row) => domainSet.has(row.ruleDomain))
}

export function mapCbaRuleToExportRow(input: {
  id: string
  collectiveAgreementId: string
  ruleDomain: string
  externalRuleCode: string
  summary: string
}): UcbRuleRefExportRow {
  return {
    ruleId: input.id,
    collectiveAgreementId: input.collectiveAgreementId,
    externalRuleCode: input.externalRuleCode,
    summary: input.summary,
    ruleDomain: input.ruleDomain as HrmUcbRuleDomain,
  }
}
