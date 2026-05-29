import { z } from "zod"

import { applyAnonymousSegmentSuppression } from "./engagement-anonymity.shared"
import type { HrmEngagementAnonymityMode } from "./engagement-workflow.shared"

export const ENGAGEMENT_ANALYTICS_SNAPSHOT_VERSION = 2 as const

/** Rating average below this (1–10 scale) flags a segment as at-risk (HRM-ENG-022). */
export const ENGAGEMENT_SEGMENT_RISK_AVERAGE_THRESHOLD = 5

const segmentScoreRowSchema = z.object({
  segmentKey: z.string(),
  label: z.string(),
  average: z.number().nullable(),
  responseCount: z.number().int().nonnegative(),
  suppressed: z.boolean(),
  riskFlag: z.boolean(),
})

export type EngagementSegmentScoreRow = z.infer<typeof segmentScoreRowSchema>

const questionAverageRowSchema = z.object({
  questionId: z.string().uuid(),
  prompt: z.string(),
  category: z.string(),
  average: z.number().nullable(),
  responseCount: z.number().int().nonnegative(),
  suppressed: z.boolean(),
})

export type EngagementQuestionAverageRow = z.infer<
  typeof questionAverageRowSchema
>

const categoryAverageRowSchema = z.object({
  category: z.string(),
  average: z.number().nullable(),
  responseCount: z.number().int().nonnegative(),
  suppressed: z.boolean(),
})

export type EngagementCategoryAverageRow = z.infer<
  typeof categoryAverageRowSchema
>

const openTextReviewRowSchema = z.object({
  reviewId: z.string().uuid(),
  questionId: z.string().uuid(),
  prompt: z.string(),
  excerpt: z.string(),
  tags: z.array(z.string().max(64)),
})

export type EngagementOpenTextReviewRow = z.infer<
  typeof openTextReviewRowSchema
>

export const engagementAnalyticsSnapshotSchema = z.object({
  version: z.literal(ENGAGEMENT_ANALYTICS_SNAPSHOT_VERSION),
  generatedAt: z.string().datetime(),
  surveyId: z.string().uuid(),
  surveyTitle: z.string(),
  cycleId: z.string().uuid().nullable(),
  cycleLabel: z.string().nullable(),
  anonymityMode: z.enum(["anonymous", "named"]),
  invitedCount: z.number().int().nonnegative(),
  submittedCount: z.number().int().nonnegative(),
  responseRatePercent: z.number().int().min(0).max(100),
  engagementIndex: z.number().nullable(),
  satisfactionIndex: z.number().nullable(),
  enps: z.number().nullable(),
  enpsPromoters: z.number().int().nonnegative(),
  enpsPassives: z.number().int().nonnegative(),
  enpsDetractors: z.number().int().nonnegative(),
  trend: z
    .object({
      priorSurveyId: z.string().uuid().nullable(),
      priorSurveyTitle: z.string().nullable(),
      priorCycleLabel: z.string().nullable(),
      engagementIndexDelta: z.number().nullable(),
      enpsDelta: z.number().nullable(),
      responseRateDelta: z.number().nullable(),
    })
    .nullable(),
  questionAverages: z.array(questionAverageRowSchema),
  categoryAverages: z.array(categoryAverageRowSchema),
  segmentScores: z.object({
    department: z.array(segmentScoreRowSchema),
    location: z.array(segmentScoreRowSchema),
    manager: z.array(segmentScoreRowSchema),
    grade: z.array(segmentScoreRowSchema).default([]),
    tenure: z.array(segmentScoreRowSchema).default([]),
    employmentType: z.array(segmentScoreRowSchema).default([]),
    workerCategory: z.array(segmentScoreRowSchema).default([]),
  }),
  riskSegments: z.array(
    z.object({
      dimension: z.enum([
        "department",
        "location",
        "manager",
        "category",
        "grade",
        "tenure",
        "employmentType",
        "workerCategory",
      ]),
      segmentKey: z.string(),
      label: z.string(),
      average: z.number(),
      responseCount: z.number().int().nonnegative(),
    })
  ),
  openText: z.object({
    namedReviews: z.array(openTextReviewRowSchema),
    anonymousSummaries: z.array(
      z.object({
        questionId: z.string().uuid(),
        prompt: z.string(),
        responseCount: z.number().int().nonnegative(),
      })
    ),
  }),
  benchmark: z.object({
    priorSurveyId: z.string().uuid().nullable(),
    priorSurveyTitle: z.string().nullable(),
    priorEngagementIndex: z.number().nullable(),
    priorEnps: z.number().nullable(),
    externalReference: z.string().nullable(),
  }),
})

export type EngagementAnalyticsSnapshot = z.infer<
  typeof engagementAnalyticsSnapshotSchema
>

export function parseEngagementAnalyticsSnapshot(
  raw: unknown
): EngagementAnalyticsSnapshot | null {
  const parsed = engagementAnalyticsSnapshotSchema.safeParse(raw)
  if (parsed.success) {
    return normalizeEngagementAnalyticsSnapshot(parsed.data)
  }

  if (!raw || typeof raw !== "object") return null
  const record = raw as Record<string, unknown>
  if (record.version !== 1 && record.version !== 2) return null

  const reparsed = engagementAnalyticsSnapshotSchema.safeParse({
    ...record,
    version: ENGAGEMENT_ANALYTICS_SNAPSHOT_VERSION,
    segmentScores: {
      department:
        (record.segmentScores as { department?: unknown })?.department ?? [],
      location:
        (record.segmentScores as { location?: unknown })?.location ?? [],
      manager: (record.segmentScores as { manager?: unknown })?.manager ?? [],
      grade: (record.segmentScores as { grade?: unknown })?.grade ?? [],
      tenure: (record.segmentScores as { tenure?: unknown })?.tenure ?? [],
      employmentType:
        (record.segmentScores as { employmentType?: unknown })
          ?.employmentType ?? [],
      workerCategory:
        (record.segmentScores as { workerCategory?: unknown })
          ?.workerCategory ?? [],
    },
  })
  return reparsed.success
    ? normalizeEngagementAnalyticsSnapshot(reparsed.data)
    : null
}

function normalizeEngagementAnalyticsSnapshot(
  snapshot: EngagementAnalyticsSnapshot
): EngagementAnalyticsSnapshot {
  return {
    ...snapshot,
    segmentScores: {
      department: snapshot.segmentScores.department,
      location: snapshot.segmentScores.location,
      manager: snapshot.segmentScores.manager,
      grade: snapshot.segmentScores.grade ?? [],
      tenure: snapshot.segmentScores.tenure ?? [],
      employmentType: snapshot.segmentScores.employmentType ?? [],
      workerCategory: snapshot.segmentScores.workerCategory ?? [],
    },
  }
}

/** HRM-ENG-020 — standard eNPS on 1–10 rating scale. */
export function computeEngagementEnps(scores: readonly number[]): {
  score: number | null
  promoters: number
  passives: number
  detractors: number
} {
  const valid = scores.filter((value) => value >= 1 && value <= 10)
  if (valid.length === 0) {
    return { score: null, promoters: 0, passives: 0, detractors: 0 }
  }

  let promoters = 0
  let passives = 0
  let detractors = 0
  for (const value of valid) {
    if (value >= 9) promoters += 1
    else if (value <= 6) detractors += 1
    else passives += 1
  }

  const score = Math.round(((promoters - detractors) / valid.length) * 100)
  return { score, promoters, passives, detractors }
}

/** HRM-ENG-019 — mean rating scaled to 0–100. */
export function computeEngagementIndexFromRatings(
  ratings: readonly number[]
): number | null {
  const valid = ratings.filter((value) => value >= 1 && value <= 10)
  if (valid.length === 0) return null
  const mean = valid.reduce((sum, value) => sum + value, 0) / valid.length
  return Math.round(mean * 10)
}

const SATISFACTION_CATEGORIES = new Set([
  "wellbeing",
  "culture",
  "recognition",
  "communication",
])

export function computeSatisfactionIndexFromRatings(input: {
  ratings: readonly { category: string; value: number }[]
}): number | null {
  const values = input.ratings
    .filter(
      (row) =>
        SATISFACTION_CATEGORIES.has(row.category) &&
        row.value >= 1 &&
        row.value <= 10
    )
    .map((row) => row.value)
  return computeEngagementIndexFromRatings(values)
}

export function averageRatings(values: readonly number[]): number | null {
  const valid = values.filter((value) => value >= 1 && value <= 10)
  if (valid.length === 0) return null
  const sum = valid.reduce((acc, value) => acc + value, 0)
  return Math.round((sum / valid.length) * 10) / 10
}

export function buildSegmentScoreRows(input: {
  buckets: ReadonlyMap<
    string,
    { label: string; ratings: number[]; responseCount: number }
  >
  minSegmentResponses: number
}): EngagementSegmentScoreRow[] {
  const rows = [...input.buckets.entries()].map(([segmentKey, bucket]) => {
    const average = averageRatings(bucket.ratings)
    const responseCount = bucket.responseCount
    const suppressed = responseCount < input.minSegmentResponses
    const riskFlag =
      !suppressed &&
      average != null &&
      average < ENGAGEMENT_SEGMENT_RISK_AVERAGE_THRESHOLD
    return {
      segmentKey,
      label: bucket.label,
      average: suppressed ? null : average,
      responseCount,
      suppressed,
      riskFlag,
    }
  })

  return applyAnonymousSegmentSuppression(rows, input.minSegmentResponses)
}

export function mergeOpenTextTags(
  snapshot: EngagementAnalyticsSnapshot,
  reviewId: string,
  tags: readonly string[]
): EngagementAnalyticsSnapshot | null {
  const normalized = tags
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
    .slice(0, 12)

  const namedReviews = snapshot.openText.namedReviews.map((review) =>
    review.reviewId === reviewId ? { ...review, tags: [...normalized] } : review
  )

  if (!namedReviews.some((review) => review.reviewId === reviewId)) {
    return null
  }

  return {
    ...snapshot,
    openText: {
      ...snapshot.openText,
      namedReviews,
    },
  }
}

export function adminMayViewEngagementOpenTextContent(
  anonymityMode: HrmEngagementAnonymityMode
): boolean {
  return anonymityMode === "named"
}
