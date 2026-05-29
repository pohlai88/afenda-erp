import "server-only"

import { and, desc, eq, inArray } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import { hrmReview } from "@afenda/platform/db/schema"

import { HRM_REVIEW_ROW_STATE } from "@afenda/feature-hrm-talent-management/schemas"

export type GpgEmployeePerformanceReference = {
  readonly reviewId: string
  readonly managerRating: string | null
  readonly closedAt: Date | null
}

/**
 * Latest closed performance review manager rating per employee (HRM-GPG-014).
 */
export async function mapLatestClosedManagerRatingsForEmployees(input: {
  organizationId: string
  employeeIds: readonly string[]
}): Promise<Map<string, GpgEmployeePerformanceReference>> {
  if (input.employeeIds.length === 0) return new Map()

  const rows = await db
    .select({
      id: hrmReview.id,
      employeeId: hrmReview.employeeId,
      managerRating: hrmReview.managerRating,
      closedAt: hrmReview.closedAt,
    })
    .from(hrmReview)
    .where(
      and(
        eq(hrmReview.organizationId, input.organizationId),
        inArray(hrmReview.employeeId, [...input.employeeIds]),
        eq(hrmReview.state, HRM_REVIEW_ROW_STATE.closed)
      )
    )
    .orderBy(desc(hrmReview.closedAt))

  const map = new Map<string, GpgEmployeePerformanceReference>()
  for (const row of rows) {
    if (map.has(row.employeeId)) continue
    map.set(row.employeeId, {
      reviewId: row.id,
      managerRating: row.managerRating,
      closedAt: row.closedAt,
    })
  }
  return map
}
