import "server-only"

import { and, desc, eq, inArray, sql } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmEngagementSurvey,
  hrmEngagementSurveyQuestion,
  hrmEngagementSurveyTemplate,
} from "@afenda/platform/db/schema"

import { parseEngagementAudienceSnapshot } from "../schemas/engagement-audience.shared"
import {
  engagementReminderScheduleSchema,
  type EngagementReminderSchedule,
} from "../schemas/engagement-reminder.shared"
import type { EngagementSurveyConfigurationDetail } from "../schemas/engagement-config.shared"
import type { EngagementConfigurableSurveyListRow } from "../schemas/engagement-query.shared"
import type {
  HrmEngagementAnonymityMode,
  HrmEngagementSurveyState,
  HrmEngagementSurveyType,
} from "../schemas/engagement-workflow.shared"

export type { EngagementSurveyConfigurationDetail } from "../schemas/engagement-config.shared"

function parseReminderSchedule(
  raw: unknown
): EngagementReminderSchedule | null {
  const parsed = engagementReminderScheduleSchema.safeParse(raw)
  return parsed.success ? parsed.data : null
}

export async function listEngagementConfigurableSurveysForOrganization(
  organizationId: string
): Promise<EngagementConfigurableSurveyListRow[]> {
  const surveys = await db
    .select({
      id: hrmEngagementSurvey.id,
      title: hrmEngagementSurvey.title,
      surveyType: hrmEngagementSurvey.surveyType,
      state: hrmEngagementSurvey.state,
      anonymityMode: hrmEngagementSurvey.anonymityMode,
      audienceSnapshot: hrmEngagementSurvey.audienceSnapshot,
      openAt: hrmEngagementSurvey.openAt,
      closeAt: hrmEngagementSurvey.closeAt,
      updatedAt: hrmEngagementSurvey.updatedAt,
    })
    .from(hrmEngagementSurvey)
    .where(
      and(
        eq(hrmEngagementSurvey.organizationId, organizationId),
        inArray(hrmEngagementSurvey.state, ["draft", "scheduled"])
      )
    )
    .orderBy(desc(hrmEngagementSurvey.updatedAt))

  if (surveys.length === 0) return []

  const surveyIds = surveys.map((s) => s.id)
  const questionCounts = await db
    .select({
      surveyId: hrmEngagementSurveyQuestion.surveyId,
      count: sql<number>`count(*)::int`,
    })
    .from(hrmEngagementSurveyQuestion)
    .where(
      and(
        eq(hrmEngagementSurveyQuestion.organizationId, organizationId),
        inArray(hrmEngagementSurveyQuestion.surveyId, surveyIds)
      )
    )
    .groupBy(hrmEngagementSurveyQuestion.surveyId)

  const countBySurvey = new Map(
    questionCounts.map((c) => [c.surveyId, c.count] as const)
  )

  return surveys.map((row) => {
    const snapshot = parseEngagementAudienceSnapshot(row.audienceSnapshot)
    return {
      id: row.id,
      title: row.title,
      surveyType: row.surveyType as HrmEngagementSurveyType,
      state: row.state as HrmEngagementSurveyState,
      anonymityMode: row.anonymityMode as HrmEngagementAnonymityMode,
      resolvedAudienceCount: snapshot?.resolvedCount ?? null,
      openAt: row.openAt,
      closeAt: row.closeAt,
      questionCount: countBySurvey.get(row.id) ?? 0,
      updatedAt: row.updatedAt,
    }
  })
}

export async function getEngagementSurveyConfigurationById(input: {
  organizationId: string
  surveyId: string
}): Promise<EngagementSurveyConfigurationDetail | null> {
  const [survey] = await db
    .select({
      id: hrmEngagementSurvey.id,
      title: hrmEngagementSurvey.title,
      surveyType: hrmEngagementSurvey.surveyType,
      state: hrmEngagementSurvey.state,
      anonymityMode: hrmEngagementSurvey.anonymityMode,
      minSegmentResponses: hrmEngagementSurvey.minSegmentResponses,
      audienceSnapshot: hrmEngagementSurvey.audienceSnapshot,
      openAt: hrmEngagementSurvey.openAt,
      closeAt: hrmEngagementSurvey.closeAt,
      reminderSchedule: hrmEngagementSurvey.reminderSchedule,
      allowDraftResponses: hrmEngagementSurvey.allowDraftResponses,
      cycleId: hrmEngagementSurvey.cycleId,
    })
    .from(hrmEngagementSurvey)
    .where(
      and(
        eq(hrmEngagementSurvey.organizationId, input.organizationId),
        eq(hrmEngagementSurvey.id, input.surveyId)
      )
    )
    .limit(1)

  if (!survey) return null

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(hrmEngagementSurveyQuestion)
    .where(
      and(
        eq(hrmEngagementSurveyQuestion.organizationId, input.organizationId),
        eq(hrmEngagementSurveyQuestion.surveyId, input.surveyId)
      )
    )

  const snapshot = parseEngagementAudienceSnapshot(survey.audienceSnapshot)

  return {
    id: survey.id,
    title: survey.title,
    surveyType: survey.surveyType as HrmEngagementSurveyType,
    state: survey.state as HrmEngagementSurveyState,
    anonymityMode: survey.anonymityMode as HrmEngagementAnonymityMode,
    minSegmentResponses: survey.minSegmentResponses,
    audienceFilter: snapshot?.filter ?? {},
    audienceSnapshot: snapshot,
    openAt: survey.openAt,
    closeAt: survey.closeAt,
    reminderSchedule: parseReminderSchedule(survey.reminderSchedule),
    allowDraftResponses: survey.allowDraftResponses,
    cycleId: survey.cycleId,
    questionCount: countRow?.count ?? 0,
  }
}

export async function getEngagementSurveyTemplateCode(
  organizationId: string,
  templateId: string | null
): Promise<string | null> {
  if (!templateId) return null
  const [row] = await db
    .select({ code: hrmEngagementSurveyTemplate.code })
    .from(hrmEngagementSurveyTemplate)
    .where(
      and(
        eq(hrmEngagementSurveyTemplate.organizationId, organizationId),
        eq(hrmEngagementSurveyTemplate.id, templateId)
      )
    )
    .limit(1)
  return row?.code ?? null
}
