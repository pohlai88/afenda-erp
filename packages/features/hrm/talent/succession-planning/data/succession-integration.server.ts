import "server-only"

import { and, desc, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import { hrmReview, hrmReviewCycle } from "@afenda/platform/db/schema"

import type {
  SuccessionCompetencyGapStubRow,
  SuccessionPerformanceRefRow,
} from "./succession.types.shared"

export async function listSuccessionPerformanceRefs(input: {
  organizationId: string
  employeeId: string
}): Promise<SuccessionPerformanceRefRow[]> {
  const rows = await db
    .select({
      reviewId: hrmReview.id,
      employeeId: hrmReview.employeeId,
      cycleName: hrmReviewCycle.name,
      rating: hrmReview.rating,
      state: hrmReview.state,
      finalizedAt: hrmReview.closedAt,
    })
    .from(hrmReview)
    .innerJoin(hrmReviewCycle, eq(hrmReviewCycle.id, hrmReview.cycleId))
    .where(
      and(
        eq(hrmReview.organizationId, input.organizationId),
        eq(hrmReview.employeeId, input.employeeId)
      )
    )
    .orderBy(desc(hrmReview.updatedAt))
    .limit(5)

  return rows.map((row) => ({
    employeeId: row.employeeId,
    reviewId: row.reviewId,
    cycleName: row.cycleName,
    rating: row.rating,
    state: row.state,
    finalizedAt: row.finalizedAt,
  }))
}

export async function listSuccessionCompetencyGapStubs(input: {
  organizationId: string
  employeeId: string
  targetRoleTitle?: string
}): Promise<SuccessionCompetencyGapStubRow[]> {
  void input.organizationId
  const roleLabel = input.targetRoleTitle ?? "target role"
  return [
    {
      employeeId: input.employeeId,
      competencyRef: "leadership_influence",
      gapSeverity: "medium",
      note: `Competency gap vs ${roleLabel} — wire competency-skills-framework read API in a follow-up.`,
    },
  ]
}

export { getApprovedSuccessionRecommendationForLifecycle } from "./succession-bench.server"
