import type { LmsComplianceMandatoryCompletionRow } from "../../talent/server"

import type { HrmComplianceStatus } from "./compliance-status.shared"

const LMS_COMPLIANCE_STATUS_MAP: Readonly<Record<string, HrmComplianceStatus>> =
  {
    completed: "compliant",
    renewed: "compliant",
    waived: "waived",
    failed: "non_compliant",
    overdue: "overdue",
    expired: "expired",
    cancelled: "non_compliant",
    not_started: "pending",
    in_progress: "pending",
  }

export function deriveComplianceStatusFromLmsMandatoryRow(
  row: Pick<LmsComplianceMandatoryCompletionRow, "status">
): HrmComplianceStatus {
  return LMS_COMPLIANCE_STATUS_MAP[row.status] ?? "pending"
}

export function summarizeLmsMandatoryComplianceStatuses(
  rows: readonly Pick<LmsComplianceMandatoryCompletionRow, "status">[]
): {
  readonly count: number
  readonly overdue: number
  readonly atRisk: number
  readonly expired: number
  readonly nonCompliant: number
} {
  let overdue = 0
  let atRisk = 0
  let expired = 0
  let nonCompliant = 0

  for (const row of rows) {
    const status = deriveComplianceStatusFromLmsMandatoryRow(row)
    if (status === "overdue") overdue += 1
    if (status === "at_risk") atRisk += 1
    if (status === "expired") expired += 1
    if (status === "non_compliant") nonCompliant += 1
  }

  return {
    count: rows.length,
    overdue,
    atRisk,
    expired,
    nonCompliant,
  }
}
