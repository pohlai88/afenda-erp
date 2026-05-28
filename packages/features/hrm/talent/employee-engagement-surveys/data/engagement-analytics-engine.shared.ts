import { computeEngagementResponseRate } from "../schemas/engagement-response.shared"
import {
  averageRatings,
  buildSegmentScoreRows,
  computeEngagementEnps,
  computeEngagementIndexFromRatings,
  computeSatisfactionIndexFromRatings,
  ENGAGEMENT_ANALYTICS_SNAPSHOT_VERSION,
  ENGAGEMENT_SEGMENT_RISK_AVERAGE_THRESHOLD,
  type EngagementAnalyticsSnapshot,
  type EngagementCategoryAverageRow,
  type EngagementOpenTextReviewRow,
  type EngagementQuestionAverageRow,
} from "../schemas/engagement-analytics.shared"
import type { HrmEngagementAnonymityMode } from "../schemas/engagement-workflow.shared"

export type EngagementAnalyticsRatingRow = {
  questionId: string
  prompt: string
  category: string
  questionType: string
  value: number
  employeeId: string
  departmentId: string | null
  departmentLabel: string
  locationKey: string
  locationLabel: string
  managerEmployeeId: string | null
  managerLabel: string
  gradeId: string | null
  gradeLabel: string
  tenureBandKey: string
  tenureBandLabel: string
  employmentType: string
  workerCategory: string
}

export type EngagementAnalyticsOpenTextRow = {
  reviewId: string
  questionId: string
  prompt: string
  excerpt: string
  employeeId: string
}

export type EngagementPriorSnapshotSummary = {
  surveyId: string
  surveyTitle: string
  cycleLabel: string | null
  engagementIndex: number | null
  enps: number | null
  responseRatePercent: number
}

export function buildEngagementAnalyticsSnapshot(input: {
  surveyId: string
  surveyTitle: string
  cycleId: string | null
  cycleLabel: string | null
  anonymityMode: HrmEngagementAnonymityMode
  minSegmentResponses: number
  invitedCount: number
  submittedCount: number
  ratingRows: readonly EngagementAnalyticsRatingRow[]
  openTextRows: readonly EngagementAnalyticsOpenTextRow[]
  prior: EngagementPriorSnapshotSummary | null
  existingNamedReviews?: readonly EngagementOpenTextReviewRow[]
  externalReference?: string | null
  generatedAt?: Date
}): EngagementAnalyticsSnapshot {
  const generatedAt = (input.generatedAt ?? new Date()).toISOString()
  const minSegment = Math.max(1, input.minSegmentResponses)
  const allRatings = input.ratingRows.map((row) => row.value)

  const enpsResult = computeEngagementEnps(allRatings)
  const engagementIndex = computeEngagementIndexFromRatings(allRatings)
  const satisfactionIndex = computeSatisfactionIndexFromRatings({
    ratings: input.ratingRows.map((row) => ({
      category: row.category,
      value: row.value,
    })),
  })

  const responseRatePercent = computeEngagementResponseRate({
    invitedCount: input.invitedCount,
    submittedCount: input.submittedCount,
  })

  const questionBuckets = new Map<
    string,
    {
      prompt: string
      category: string
      ratings: number[]
      responseCount: number
    }
  >()
  for (const row of input.ratingRows) {
    const bucket = questionBuckets.get(row.questionId) ?? {
      prompt: row.prompt,
      category: row.category,
      ratings: [],
      responseCount: 0,
    }
    bucket.ratings.push(row.value)
    bucket.responseCount += 1
    questionBuckets.set(row.questionId, bucket)
  }

  const questionAverages: EngagementQuestionAverageRow[] = [
    ...questionBuckets.entries(),
  ].map(([questionId, bucket]) => {
    const responseCount = bucket.responseCount
    const suppressed = responseCount < minSegment
    return {
      questionId,
      prompt: bucket.prompt,
      category: bucket.category,
      average: suppressed ? null : averageRatings(bucket.ratings),
      responseCount,
      suppressed,
    }
  })

  const categoryBuckets = new Map<
    string,
    { ratings: number[]; responseCount: number }
  >()
  for (const row of input.ratingRows) {
    const bucket = categoryBuckets.get(row.category) ?? {
      ratings: [],
      responseCount: 0,
    }
    bucket.ratings.push(row.value)
    bucket.responseCount += 1
    categoryBuckets.set(row.category, bucket)
  }

  const categoryAverages: EngagementCategoryAverageRow[] = [
    ...categoryBuckets.entries(),
  ].map(([category, bucket]) => {
    const responseCount = bucket.responseCount
    const suppressed = responseCount < minSegment
    return {
      category,
      average: suppressed ? null : averageRatings(bucket.ratings),
      responseCount,
      suppressed,
    }
  })

  const departmentBuckets = new Map<
    string,
    { label: string; ratings: number[]; responseCount: number }
  >()
  const locationBuckets = new Map<
    string,
    { label: string; ratings: number[]; responseCount: number }
  >()
  const managerBuckets = new Map<
    string,
    { label: string; ratings: number[]; responseCount: number }
  >()
  const gradeBuckets = new Map<
    string,
    { label: string; ratings: number[]; responseCount: number }
  >()
  const tenureBuckets = new Map<
    string,
    { label: string; ratings: number[]; responseCount: number }
  >()
  const employmentTypeBuckets = new Map<
    string,
    { label: string; ratings: number[]; responseCount: number }
  >()
  const workerCategoryBuckets = new Map<
    string,
    { label: string; ratings: number[]; responseCount: number }
  >()

  for (const row of input.ratingRows) {
    const deptKey = row.departmentId ?? "unassigned"
    const dept = departmentBuckets.get(deptKey) ?? {
      label: row.departmentLabel,
      ratings: [],
      responseCount: 0,
    }
    dept.ratings.push(row.value)
    dept.responseCount += 1
    departmentBuckets.set(deptKey, dept)

    const loc = locationBuckets.get(row.locationKey) ?? {
      label: row.locationLabel,
      ratings: [],
      responseCount: 0,
    }
    loc.ratings.push(row.value)
    loc.responseCount += 1
    locationBuckets.set(row.locationKey, loc)

    const mgrKey = row.managerEmployeeId ?? "unassigned"
    const mgr = managerBuckets.get(mgrKey) ?? {
      label: row.managerLabel,
      ratings: [],
      responseCount: 0,
    }
    mgr.ratings.push(row.value)
    mgr.responseCount += 1
    managerBuckets.set(mgrKey, mgr)

    const gradeKey = row.gradeId ?? "unassigned"
    const grade = gradeBuckets.get(gradeKey) ?? {
      label: row.gradeLabel,
      ratings: [],
      responseCount: 0,
    }
    grade.ratings.push(row.value)
    grade.responseCount += 1
    gradeBuckets.set(gradeKey, grade)

    const tenure = tenureBuckets.get(row.tenureBandKey) ?? {
      label: row.tenureBandLabel,
      ratings: [],
      responseCount: 0,
    }
    tenure.ratings.push(row.value)
    tenure.responseCount += 1
    tenureBuckets.set(row.tenureBandKey, tenure)

    const empTypeKey = row.employmentType || "unknown"
    const empType = employmentTypeBuckets.get(empTypeKey) ?? {
      label: row.employmentType,
      ratings: [],
      responseCount: 0,
    }
    empType.ratings.push(row.value)
    empType.responseCount += 1
    employmentTypeBuckets.set(empTypeKey, empType)

    const workerKey = row.workerCategory || "unknown"
    const worker = workerCategoryBuckets.get(workerKey) ?? {
      label: row.workerCategory,
      ratings: [],
      responseCount: 0,
    }
    worker.ratings.push(row.value)
    worker.responseCount += 1
    workerCategoryBuckets.set(workerKey, worker)
  }

  const segmentScores = {
    department: buildSegmentScoreRows({
      buckets: departmentBuckets,
      minSegmentResponses: minSegment,
    }),
    location: buildSegmentScoreRows({
      buckets: locationBuckets,
      minSegmentResponses: minSegment,
    }),
    manager: buildSegmentScoreRows({
      buckets: managerBuckets,
      minSegmentResponses: minSegment,
    }),
    grade: buildSegmentScoreRows({
      buckets: gradeBuckets,
      minSegmentResponses: minSegment,
    }),
    tenure: buildSegmentScoreRows({
      buckets: tenureBuckets,
      minSegmentResponses: minSegment,
    }),
    employmentType: buildSegmentScoreRows({
      buckets: employmentTypeBuckets,
      minSegmentResponses: minSegment,
    }),
    workerCategory: buildSegmentScoreRows({
      buckets: workerCategoryBuckets,
      minSegmentResponses: minSegment,
    }),
  }

  const riskSegments = [
    ...segmentScores.department
      .filter((row) => row.riskFlag && row.average != null)
      .map((row) => ({
        dimension: "department" as const,
        segmentKey: row.segmentKey,
        label: row.label,
        average: row.average as number,
        responseCount: row.responseCount,
      })),
    ...segmentScores.location
      .filter((row) => row.riskFlag && row.average != null)
      .map((row) => ({
        dimension: "location" as const,
        segmentKey: row.segmentKey,
        label: row.label,
        average: row.average as number,
        responseCount: row.responseCount,
      })),
    ...segmentScores.manager
      .filter((row) => row.riskFlag && row.average != null)
      .map((row) => ({
        dimension: "manager" as const,
        segmentKey: row.segmentKey,
        label: row.label,
        average: row.average as number,
        responseCount: row.responseCount,
      })),
    ...segmentScores.grade
      .filter((row) => row.riskFlag && row.average != null)
      .map((row) => ({
        dimension: "grade" as const,
        segmentKey: row.segmentKey,
        label: row.label,
        average: row.average as number,
        responseCount: row.responseCount,
      })),
    ...segmentScores.tenure
      .filter((row) => row.riskFlag && row.average != null)
      .map((row) => ({
        dimension: "tenure" as const,
        segmentKey: row.segmentKey,
        label: row.label,
        average: row.average as number,
        responseCount: row.responseCount,
      })),
    ...segmentScores.employmentType
      .filter((row) => row.riskFlag && row.average != null)
      .map((row) => ({
        dimension: "employmentType" as const,
        segmentKey: row.segmentKey,
        label: row.label,
        average: row.average as number,
        responseCount: row.responseCount,
      })),
    ...segmentScores.workerCategory
      .filter((row) => row.riskFlag && row.average != null)
      .map((row) => ({
        dimension: "workerCategory" as const,
        segmentKey: row.segmentKey,
        label: row.label,
        average: row.average as number,
        responseCount: row.responseCount,
      })),
    ...categoryAverages
      .filter(
        (row) =>
          !row.suppressed &&
          row.average != null &&
          row.average < ENGAGEMENT_SEGMENT_RISK_AVERAGE_THRESHOLD
      )
      .map((row) => ({
        dimension: "category" as const,
        segmentKey: row.category,
        label: row.category,
        average: row.average as number,
        responseCount: row.responseCount,
      })),
  ]

  const existingTags = new Map(
    (input.existingNamedReviews ?? []).map(
      (review) => [review.reviewId, review.tags] as const
    )
  )

  const namedReviews: EngagementOpenTextReviewRow[] =
    input.anonymityMode === "named"
      ? input.openTextRows.map((row) => ({
          reviewId: row.reviewId,
          questionId: row.questionId,
          prompt: row.prompt,
          excerpt: row.excerpt,
          tags: existingTags.get(row.reviewId) ?? [],
        }))
      : []

  const anonymousQuestionCounts = new Map<
    string,
    { prompt: string; count: number }
  >()
  for (const row of input.openTextRows) {
    const bucket = anonymousQuestionCounts.get(row.questionId) ?? {
      prompt: row.prompt,
      count: 0,
    }
    bucket.count += 1
    anonymousQuestionCounts.set(row.questionId, bucket)
  }

  const anonymousSummaries = [...anonymousQuestionCounts.entries()].map(
    ([questionId, bucket]) => ({
      questionId,
      prompt: bucket.prompt,
      responseCount: bucket.count,
    })
  )

  const trend =
    input.prior == null
      ? null
      : {
          priorSurveyId: input.prior.surveyId,
          priorSurveyTitle: input.prior.surveyTitle,
          priorCycleLabel: input.prior.cycleLabel,
          engagementIndexDelta:
            engagementIndex != null && input.prior.engagementIndex != null
              ? engagementIndex - input.prior.engagementIndex
              : null,
          enpsDelta:
            enpsResult.score != null && input.prior.enps != null
              ? enpsResult.score - input.prior.enps
              : null,
          responseRateDelta:
            responseRatePercent - input.prior.responseRatePercent,
        }

  return {
    version: ENGAGEMENT_ANALYTICS_SNAPSHOT_VERSION,
    generatedAt,
    surveyId: input.surveyId,
    surveyTitle: input.surveyTitle,
    cycleId: input.cycleId,
    cycleLabel: input.cycleLabel,
    anonymityMode: input.anonymityMode,
    invitedCount: input.invitedCount,
    submittedCount: input.submittedCount,
    responseRatePercent,
    engagementIndex,
    satisfactionIndex,
    enps: enpsResult.score,
    enpsPromoters: enpsResult.promoters,
    enpsPassives: enpsResult.passives,
    enpsDetractors: enpsResult.detractors,
    trend,
    questionAverages,
    categoryAverages,
    segmentScores,
    riskSegments,
    openText: {
      namedReviews,
      anonymousSummaries,
    },
    benchmark: {
      priorSurveyId: input.prior?.surveyId ?? null,
      priorSurveyTitle: input.prior?.surveyTitle ?? null,
      priorEngagementIndex: input.prior?.engagementIndex ?? null,
      priorEnps: input.prior?.enps ?? null,
      externalReference: input.externalReference ?? null,
    },
  }
}
