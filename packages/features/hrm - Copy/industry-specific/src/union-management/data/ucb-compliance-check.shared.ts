export type UcbComplianceCheckInput = {
  employeeId: string
  actionKind: string
  scheduledHours?: number
  maxHoursPerWeek?: number
  hasActiveCba: boolean
  hasSeniorityCoverage: boolean
}

export type UcbComplianceFindingDraft = {
  findingCode: string
  severity: "info" | "warning" | "critical"
  message: string
}

export function evaluateUcbCompliance(
  input: UcbComplianceCheckInput
): UcbComplianceFindingDraft[] {
  const findings: UcbComplianceFindingDraft[] = []

  if (!input.hasActiveCba) {
    findings.push({
      findingCode: "UCB_NO_ACTIVE_CBA",
      severity: "warning",
      message: "No active collective agreement covers this employee.",
    })
  }

  if (
    input.maxHoursPerWeek != null &&
    input.scheduledHours != null &&
    input.scheduledHours > input.maxHoursPerWeek
  ) {
    findings.push({
      findingCode: "UCB_HOURS_EXCEED_CBA",
      severity: "critical",
      message: "Scheduled hours exceed applicable CBA work-hour reference.",
    })
  }

  if (!input.hasSeniorityCoverage && input.actionKind === "layoff_order") {
    findings.push({
      findingCode: "UCB_SENIORITY_MISSING",
      severity: "warning",
      message: "Seniority profile missing for seniority-governed action.",
    })
  }

  return findings
}
