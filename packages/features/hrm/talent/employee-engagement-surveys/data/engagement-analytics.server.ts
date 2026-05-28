import "server-only"

import { alias } from "drizzle-orm/pg-core"
import { and, desc, eq, inArray, sql } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmDepartment,
  hrmEmployee,
  hrmJobGrade,
  hrmEngagementResponseAnswer,
  hrmEngagementSurvey,
  hrmEngagementSurveyCycle,
  hrmEngagementSurveyQuestion,
  hrmEngagementSurveyResponse,
} from "@afenda/platform/db/schema"

import { resolveEffectiveMinSegmentResponses } from "../schemas/engagement-anonymity.shared"
import {
  mergeOpenTextTags,
  parseEngagementAnalyticsSnapshot,
  type EngagementAnalyticsSnapshot,
} from "../schemas/engagement-analytics.shared"
import type { HrmEngagementAnonymityMode } from "../schemas/engagement-workflow.shared"
import { resolveEngagementTenureBand } from "../schemas/engagement-tenure.shared"
import {
  buildEngagementAnalyticsSnapshot,
  type EngagementAnalyticsOpenTextRow,
  type EngagementAnalyticsRatingRow,
  type EngagementPriorSnapshotSummary,
} from "./engagement-analytics-engine.shared"
import { loadEngagementDistributionSummary } from "./engagement-distribution.queries.server"

export type EngagementCycleHistoryRow = {
  surveyId: string
  title: string
  state: string
  cycleKey: string | null
  cycleLabel: string | null
  closedAt: Date | null
  analyticsGeneratedAt: Date | null
  engagementIndex: number | null
  enps: number | null
}

function parseRatingValue(value: unknown): number | null {
  if (typeof value !== "number" || value < 1 || value > 10) return null
  return value
}

function parseOpenTextExcerpt(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.length > 240 ? `${trimmed.slice(0, 237)}…` : trimmed
}

const hrmManagerEmployee = alias(hrmEmployee, "mgr")

async function loadSubmittedAnswerRows(input: {
  organizationId: string
  surveyId: string
}): Promise<{
  ratingRows: EngagementAnalyticsRatingRow[]
  openTextRows: EngagementAnalyticsOpenTextRow[]
}> {
  const rows = await db
    .select({
      answerId: hrmEngagementResponseAnswer.id,
      questionId: hrmEngagementResponseAnswer.questionId,
      value: hrmEngagementResponseAnswer.value,
      questionType: hrmEngagementSurveyQuestion.questionType,
      category: hrmEngagementSurveyQuestion.category,
      prompt: hrmEngagementSurveyQuestion.prompt,
      employeeId: hrmEngagementSurveyResponse.employeeId,
      departmentId: hrmEmployee.currentDepartmentId,
      departmentName: hrmDepartment.name,
      workStateCode: hrmEmployee.workStateCode,
      countryCode: hrmEmployee.countryCode,
      employmentStartDate: hrmEmployee.employmentStartDate,
      employmentType: hrmEmployee.employmentType,
      workerCategory: hrmEmployee.workerCategory,
      currentJobGradeId: hrmEmployee.currentJobGradeId,
      gradeCode: hrmJobGrade.code,
      gradeName: hrmJobGrade.name,
      managerEmployeeId: hrmEmployee.managerEmployeeId,
      managerNumber: hrmManagerEmployee.employeeNumber,
      managerName: hrmManagerEmployee.legalName,
    })
    .from(hrmEngagementResponseAnswer)
    .innerJoin(
      hrmEngagementSurveyResponse,
      eq(hrmEngagementResponseAnswer.responseId, hrmEngagementSurveyResponse.id)
    )
    .innerJoin(
      hrmEngagementSurveyQuestion,
      eq(hrmEngagementResponseAnswer.questionId, hrmEngagementSurveyQuestion.id)
    )
    .innerJoin(
      hrmEmployee,
      eq(hrmEngagementSurveyResponse.employeeId, hrmEmployee.id)
    )
    .leftJoin(
      hrmDepartment,
      eq(hrmEmployee.currentDepartmentId, hrmDepartment.id)
    )
    .leftJoin(hrmJobGrade, eq(hrmEmployee.currentJobGradeId, hrmJobGrade.id))
    .leftJoin(
      hrmManagerEmployee,
      eq(hrmEmployee.managerEmployeeId, hrmManagerEmployee.id)
    )
    .where(
      and(
        eq(hrmEngagementResponseAnswer.organizationId, input.organizationId),
        eq(hrmEngagementSurveyResponse.surveyId, input.surveyId),
        eq(hrmEngagementSurveyResponse.state, "submitted")
      )
    )

  const ratingRows: EngagementAnalyticsRatingRow[] = []
  const openTextRows: EngagementAnalyticsOpenTextRow[] = []

  for (const row of rows) {
    if (row.questionType === "rating") {
      const value = parseRatingValue(row.value)
      if (value == null) continue
      const locationKey = row.workStateCode ?? row.countryCode ?? "unknown"
      const locationLabel =
        row.workStateCode ?? row.countryCode ?? "Unknown location"
      const tenureBand = resolveEngagementTenureBand({
        employmentStartDate: row.employmentStartDate,
      })
      const gradeLabel =
        row.gradeCode && row.gradeName
          ? `${row.gradeCode} — ${row.gradeName}`
          : "Unassigned"
      ratingRows.push({
        questionId: row.questionId,
        prompt: row.prompt,
        category: row.category,
        questionType: row.questionType,
        value,
        employeeId: row.employeeId,
        departmentId: row.departmentId,
        departmentLabel: row.departmentName ?? "Unassigned",
        locationKey,
        locationLabel,
        managerEmployeeId: row.managerEmployeeId,
        managerLabel:
          row.managerNumber && row.managerName
            ? `${row.managerNumber} — ${row.managerName}`
            : "Unassigned",
        gradeId: row.currentJobGradeId,
        gradeLabel,
        tenureBandKey: tenureBand.key,
        tenureBandLabel: tenureBand.label,
        employmentType: row.employmentType?.trim() || "Unknown",
        workerCategory: row.workerCategory?.trim() || "Unknown",
      })
      continue
    }

    if (row.questionType === "open_text" || row.questionType === "comment") {
      const excerpt = parseOpenTextExcerpt(row.value)
      if (!excerpt) continue
      openTextRows.push({
        reviewId: row.answerId,
        questionId: row.questionId,
        prompt: row.prompt,
        excerpt,
        employeeId: row.employeeId,
      })
    }
  }

  return { ratingRows, openTextRows }
}

async function findPriorEngagementSnapshotSummary(input: {
  organizationId: string
  surveyId: string
  cycleId: string | null
  surveyType: string
}): Promise<EngagementPriorSnapshotSummary | null> {
  const conditions = [
    eq(hrmEngagementSurvey.organizationId, input.organizationId),
    eq(hrmEngagementSurvey.state, "closed"),
    sql`${hrmEngagementSurvey.id} <> ${input.surveyId}`,
    sql`${hrmEngagementSurvey.analyticsSnapshot} IS NOT NULL`,
  ]

  if (input.cycleId) {
    conditions.push(eq(hrmEngagementSurvey.cycleId, input.cycleId))
  } else {
    conditions.push(eq(hrmEngagementSurvey.surveyType, input.surveyType))
  }

  const [prior] = await db
    .select({
      id: hrmEngagementSurvey.id,
      title: hrmEngagementSurvey.title,
      analyticsSnapshot: hrmEngagementSurvey.analyticsSnapshot,
      cycleLabel: hrmEngagementSurveyCycle.label,
    })
    .from(hrmEngagementSurvey)
    .leftJoin(
      hrmEngagementSurveyCycle,
      eq(hrmEngagementSurvey.cycleId, hrmEngagementSurveyCycle.id)
    )
    .where(and(...conditions))
    .orderBy(desc(hrmEngagementSurvey.analyticsGeneratedAt))
    .limit(1)

  if (!prior) return null

  const snapshot = parseEngagementAnalyticsSnapshot(prior.analyticsSnapshot)
  if (!snapshot) return null

  return {
    surveyId: prior.id,
    surveyTitle: prior.title,
    cycleLabel: prior.cycleLabel,
    engagementIndex: snapshot.engagementIndex,
    enps: snapshot.enps,
    responseRatePercent: snapshot.responseRatePercent,
  }
}

export async function computeAndPersistEngagementAnalytics(input: {
  organizationId: string
  surveyId: string
  actorUserId: string
  externalReference?: string | null
}): Promise<
  | { ok: true; snapshot: EngagementAnalyticsSnapshot }
  | { ok: false; message: string }
> {
  const [survey] = await db
    .select({
      id: hrmEngagementSurvey.id,
      title: hrmEngagementSurvey.title,
      state: hrmEngagementSurvey.state,
      surveyType: hrmEngagementSurvey.surveyType,
      anonymityMode: hrmEngagementSurvey.anonymityMode,
      minSegmentResponses: hrmEngagementSurvey.minSegmentResponses,
      cycleId: hrmEngagementSurvey.cycleId,
      cycleLabel: hrmEngagementSurveyCycle.label,
      analyticsSnapshot: hrmEngagementSurvey.analyticsSnapshot,
    })
    .from(hrmEngagementSurvey)
    .leftJoin(
      hrmEngagementSurveyCycle,
      eq(hrmEngagementSurvey.cycleId, hrmEngagementSurveyCycle.id)
    )
    .where(
      and(
        eq(hrmEngagementSurvey.organizationId, input.organizationId),
        eq(hrmEngagementSurvey.id, input.surveyId)
      )
    )
    .limit(1)

  if (!survey) {
    return { ok: false, message: "Survey not found." }
  }

  if (survey.state !== "published" && survey.state !== "closed") {
    return {
      ok: false,
      message: "Analytics are available after publish or close.",
    }
  }

  const summary = await loadEngagementDistributionSummary({
    organizationId: input.organizationId,
    surveyId: input.surveyId,
  })

  if (summary.submittedCount < 1) {
    return {
      ok: false,
      message: "At least one submitted response is required for analytics.",
    }
  }

  const anonymityMode = survey.anonymityMode as HrmEngagementAnonymityMode
  const minSegment = resolveEffectiveMinSegmentResponses(
    anonymityMode,
    survey.minSegmentResponses
  )

  const { ratingRows, openTextRows } = await loadSubmittedAnswerRows({
    organizationId: input.organizationId,
    surveyId: input.surveyId,
  })

  const existing = parseEngagementAnalyticsSnapshot(survey.analyticsSnapshot)

  const prior = await findPriorEngagementSnapshotSummary({
    organizationId: input.organizationId,
    surveyId: input.surveyId,
    cycleId: survey.cycleId,
    surveyType: survey.surveyType,
  })

  const snapshot = buildEngagementAnalyticsSnapshot({
    surveyId: survey.id,
    surveyTitle: survey.title,
    cycleId: survey.cycleId,
    cycleLabel: survey.cycleLabel,
    anonymityMode,
    minSegmentResponses: minSegment ?? 5,
    invitedCount: summary.invitedCount,
    submittedCount: summary.submittedCount,
    ratingRows,
    openTextRows,
    prior,
    existingNamedReviews: existing?.openText.namedReviews,
    externalReference:
      input.externalReference ?? existing?.benchmark.externalReference ?? null,
  })

  await db
    .update(hrmEngagementSurvey)
    .set({
      analyticsSnapshot: snapshot,
      analyticsGeneratedAt: new Date(),
      updatedAt: new Date(),
      updatedByUserId: input.actorUserId,
    })
    .where(
      and(
        eq(hrmEngagementSurvey.organizationId, input.organizationId),
        eq(hrmEngagementSurvey.id, input.surveyId)
      )
    )

  if (survey.cycleId) {
    await db
      .update(hrmEngagementSurveyCycle)
      .set({
        closedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(hrmEngagementSurveyCycle.organizationId, input.organizationId),
          eq(hrmEngagementSurveyCycle.id, survey.cycleId)
        )
      )
  }

  return { ok: true, snapshot }
}

export async function getEngagementAnalyticsSnapshotForSurvey(input: {
  organizationId: string
  surveyId: string
}): Promise<EngagementAnalyticsSnapshot | null> {
  const [row] = await db
    .select({ analyticsSnapshot: hrmEngagementSurvey.analyticsSnapshot })
    .from(hrmEngagementSurvey)
    .where(
      and(
        eq(hrmEngagementSurvey.organizationId, input.organizationId),
        eq(hrmEngagementSurvey.id, input.surveyId)
      )
    )
    .limit(1)

  if (!row) return null
  return parseEngagementAnalyticsSnapshot(row.analyticsSnapshot)
}

export async function persistEngagementOpenTextTags(input: {
  organizationId: string
  surveyId: string
  reviewId: string
  tags: readonly string[]
  actorUserId: string
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const snapshot = await getEngagementAnalyticsSnapshotForSurvey({
    organizationId: input.organizationId,
    surveyId: input.surveyId,
  })

  if (!snapshot) {
    return {
      ok: false,
      message: "Generate analytics before tagging open-text responses.",
    }
  }

  if (snapshot.anonymityMode !== "named") {
    return {
      ok: false,
      message: "Open-text tagging is only available for named surveys.",
    }
  }

  const next = mergeOpenTextTags(snapshot, input.reviewId, input.tags)
  if (!next) {
    return { ok: false, message: "Review not found in analytics snapshot." }
  }

  await db
    .update(hrmEngagementSurvey)
    .set({
      analyticsSnapshot: next,
      updatedAt: new Date(),
      updatedByUserId: input.actorUserId,
    })
    .where(
      and(
        eq(hrmEngagementSurvey.organizationId, input.organizationId),
        eq(hrmEngagementSurvey.id, input.surveyId)
      )
    )

  return { ok: true }
}

export async function listEngagementCycleHistoryForOrganization(input: {
  organizationId: string
  cycleId?: string | null
}): Promise<readonly EngagementCycleHistoryRow[]> {
  const conditions = [
    eq(hrmEngagementSurvey.organizationId, input.organizationId),
    inArray(hrmEngagementSurvey.state, ["published", "closed"]),
  ]

  if (input.cycleId) {
    conditions.push(eq(hrmEngagementSurvey.cycleId, input.cycleId))
  }

  const rows = await db
    .select({
      surveyId: hrmEngagementSurvey.id,
      title: hrmEngagementSurvey.title,
      state: hrmEngagementSurvey.state,
      cycleKey: hrmEngagementSurveyCycle.cycleKey,
      cycleLabel: hrmEngagementSurveyCycle.label,
      closeAt: hrmEngagementSurvey.closeAt,
      analyticsGeneratedAt: hrmEngagementSurvey.analyticsGeneratedAt,
      analyticsSnapshot: hrmEngagementSurvey.analyticsSnapshot,
    })
    .from(hrmEngagementSurvey)
    .leftJoin(
      hrmEngagementSurveyCycle,
      eq(hrmEngagementSurvey.cycleId, hrmEngagementSurveyCycle.id)
    )
    .where(and(...conditions))
    .orderBy(
      desc(hrmEngagementSurvey.closeAt),
      desc(hrmEngagementSurvey.updatedAt)
    )

  return rows.map((row) => {
    const snapshot = parseEngagementAnalyticsSnapshot(row.analyticsSnapshot)
    return {
      surveyId: row.surveyId,
      title: row.title,
      state: row.state,
      cycleKey: row.cycleKey,
      cycleLabel: row.cycleLabel,
      closedAt: row.closeAt,
      analyticsGeneratedAt: row.analyticsGeneratedAt,
      engagementIndex: snapshot?.engagementIndex ?? null,
      enps: snapshot?.enps ?? null,
    }
  })
}

/** Ensures close path can refresh analytics without surfacing errors to the user. */
export async function tryGenerateEngagementAnalyticsOnClose(input: {
  organizationId: string
  surveyId: string
  actorUserId: string
}) {
  const result = await computeAndPersistEngagementAnalytics({
    organizationId: input.organizationId,
    surveyId: input.surveyId,
    actorUserId: input.actorUserId,
  })
  return result.ok ? result.snapshot : null
}
