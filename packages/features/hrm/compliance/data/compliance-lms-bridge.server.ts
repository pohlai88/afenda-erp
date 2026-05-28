import "server-only"

import { getLmsComplianceCompletionSnapshot } from "../../talent/server"

import {
  deriveComplianceStatusFromLmsMandatoryRow,
  summarizeLmsMandatoryComplianceStatuses,
} from "./compliance-lms-bridge.shared"
import type { HrmComplianceStatus } from "./compliance-status.shared"

/** HRM-LMS-021 consumer — mandatory LMS training posture for compliance summaries. */
export async function listLmsMandatoryComplianceRowsForEmployee(input: {
  readonly organizationId: string
  readonly employeeId: string
}) {
  return getLmsComplianceCompletionSnapshot({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
  })
}

export async function listLmsMandatoryComplianceRowsForOrg(input: {
  readonly organizationId: string
}) {
  return getLmsComplianceCompletionSnapshot({
    organizationId: input.organizationId,
  })
}

export async function listLmsMandatoryComplianceStatusesForEmployee(input: {
  readonly organizationId: string
  readonly employeeId: string
}): Promise<readonly HrmComplianceStatus[]> {
  const rows = await listLmsMandatoryComplianceRowsForEmployee(input)
  return rows.map((row) => deriveComplianceStatusFromLmsMandatoryRow(row))
}

export function groupLmsMandatoryComplianceRowsByEmployee<
  T extends { readonly employeeId: string },
>(rows: readonly T[]): Map<string, T[]> {
  const grouped = new Map<string, T[]>()
  for (const row of rows) {
    const bucket = grouped.get(row.employeeId) ?? []
    bucket.push(row)
    grouped.set(row.employeeId, bucket)
  }
  return grouped
}

export { summarizeLmsMandatoryComplianceStatuses }
