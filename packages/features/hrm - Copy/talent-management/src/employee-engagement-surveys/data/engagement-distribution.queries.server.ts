import "server-only"

import { and, asc, eq, sql } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmEngagementSurvey,
  hrmEngagementSurveyInvitation,
  hrmEngagementSurveyQuestion,
  hrmEngagementSurveyResponse,
} from "@afenda/platform/db/schema"

import { computeEngagementResponseRate } from "../schemas/engagement-response.shared"
import type {
  EngagementCompletionTrackingRow,
  EngagementDistributionSummary,
} from "../schemas/engagement-query.shared"
import type { EngagementSurveyConfigurationDetail } from "../schemas/engagement-config.shared"
import type {
  HrmEngagementAnonymityMode,
  HrmEngagementSurveyState,
  HrmEngagementSurveyType,
} from "../schemas/engagement-workflow.shared"
import {
  engagementReminderScheduleSchema,
  type EngagementReminderSchedule,
} from "../schemas/engagement-reminder.shared"
import { parseEngagementAudienceSnapshot } from "../schemas/engagement-audience.shared"

function parseReminderSchedule(
  raw: unknown
): EngagementReminderSchedule | null {
  const parsed = engagementReminderScheduleSchema.safeParse(raw)
  return parsed.success ? parsed.data : null
}

export async function getEngagementSurveyDetailById(input: {
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

  const snapshot = parseEngagementAudienceSnapshot(survey.audienceSnapshot)

  const [questionCountRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(hrmEngagementSurveyQuestion)
    .where(
      and(
        eq(hrmEngagementSurveyQuestion.organizationId, input.organizationId),
        eq(hrmEngagementSurveyQuestion.surveyId, input.surveyId)
      )
    )

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
    questionCount: questionCountRow?.count ?? 0,
  }
}

export async function listEngagementCompletionTrackingForSurvey(input: {
  organizationId: string
  surveyId: string
  anonymityMode: HrmEngagementAnonymityMode
}): Promise<readonly EngagementCompletionTrackingRow[]> {
  const rows = await db
    .select({
      invitationId: hrmEngagementSurveyInvitation.id,
      employeeId: hrmEngagementSurveyInvitation.employeeId,
      invitationState: hrmEngagementSurveyInvitation.state,
      invitedAt: hrmEngagementSurveyInvitation.invitedAt,
      invitationSubmittedAt: hrmEngagementSurveyInvitation.submittedAt,
      employeeNumber: hrmEmployee.employeeNumber,
      legalName: hrmEmployee.legalName,
      responseState: hrmEngagementSurveyResponse.state,
      responseSubmittedAt: hrmEngagementSurveyResponse.submittedAt,
    })
    .from(hrmEngagementSurveyInvitation)
    .innerJoin(
      hrmEmployee,
      eq(hrmEngagementSurveyInvitation.employeeId, hrmEmployee.id)
    )
    .leftJoin(
      hrmEngagementSurveyResponse,
      eq(
        hrmEngagementSurveyResponse.invitationId,
        hrmEngagementSurveyInvitation.id
      )
    )
    .where(
      and(
        eq(hrmEngagementSurveyInvitation.organizationId, input.organizationId),
        eq(hrmEngagementSurveyInvitation.surveyId, input.surveyId)
      )
    )
    .orderBy(asc(hrmEmployee.employeeNumber))

  return rows.map((row) => {
    const participantLabel =
      input.anonymityMode === "named"
        ? `${row.employeeNumber} — ${row.legalName}`
        : row.employeeNumber

    return {
      invitationId: row.invitationId,
      employeeId: row.employeeId,
      participantLabel,
      invitationState:
        row.invitationState as EngagementCompletionTrackingRow["invitationState"],
      responseState:
        row.responseState as EngagementCompletionTrackingRow["responseState"],
      invitedAt: row.invitedAt,
      submittedAt: row.invitationSubmittedAt ?? row.responseSubmittedAt,
    }
  })
}

export async function loadEngagementDistributionSummary(input: {
  organizationId: string
  surveyId: string
}): Promise<EngagementDistributionSummary> {
  const [counts] = await db
    .select({
      invitedCount: sql<number>`count(*)::int`,
      submittedCount: sql<number>`count(*) filter (where ${hrmEngagementSurveyInvitation.state} = 'submitted')::int`,
      pendingCount: sql<number>`count(*) filter (where ${hrmEngagementSurveyInvitation.state} = 'pending')::int`,
    })
    .from(hrmEngagementSurveyInvitation)
    .where(
      and(
        eq(hrmEngagementSurveyInvitation.organizationId, input.organizationId),
        eq(hrmEngagementSurveyInvitation.surveyId, input.surveyId)
      )
    )

  const [draftRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(hrmEngagementSurveyResponse)
    .where(
      and(
        eq(hrmEngagementSurveyResponse.organizationId, input.organizationId),
        eq(hrmEngagementSurveyResponse.surveyId, input.surveyId),
        eq(hrmEngagementSurveyResponse.state, "draft")
      )
    )

  const invitedCount = counts?.invitedCount ?? 0
  const submittedCount = counts?.submittedCount ?? 0
  const pendingCount = counts?.pendingCount ?? 0
  const draftCount = draftRow?.count ?? 0

  return {
    invitedCount,
    submittedCount,
    draftCount,
    pendingCount,
    responseRatePercent: computeEngagementResponseRate({
      invitedCount,
      submittedCount,
    }),
  }
}
