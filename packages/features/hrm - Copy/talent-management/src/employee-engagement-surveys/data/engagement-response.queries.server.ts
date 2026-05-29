import "server-only"

import { and, asc, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmEngagementResponseAnswer,
  hrmEngagementSurvey,
  hrmEngagementSurveyInvitation,
  hrmEngagementSurveyQuestion,
  hrmEngagementSurveyResponse,
} from "@afenda/platform/db/schema"

import { isEngagementSurveyResponseWindowOpen } from "../schemas/engagement-response.shared"
import type { EngagementAnswerValue } from "../schemas/engagement-response.shared"
import type { EngagementSurveyQuestionRow } from "../schemas/engagement-query.shared"
import type { EngagementRespondPageData } from "../schemas/engagement-respond.shared"
import type {
  HrmEngagementAnonymityMode,
  HrmEngagementSurveyState,
} from "../schemas/engagement-workflow.shared"

export type { EngagementRespondPageData } from "../schemas/engagement-respond.shared"

export async function resolveEngagementEmployeeIdForUser(input: {
  organizationId: string
  userId: string
}): Promise<string | null> {
  const [row] = await db
    .select({ id: hrmEmployee.id })
    .from(hrmEmployee)
    .where(
      and(
        eq(hrmEmployee.organizationId, input.organizationId),
        eq(hrmEmployee.linkedUserId, input.userId),
        eq(hrmEmployee.employmentStatus, "active")
      )
    )
    .limit(1)

  return row?.id ?? null
}

export async function loadEngagementRespondPageData(input: {
  organizationId: string
  employeeId: string
  invitationId: string
}): Promise<EngagementRespondPageData | null> {
  const [invitation] = await db
    .select({
      invitationId: hrmEngagementSurveyInvitation.id,
      surveyId: hrmEngagementSurveyInvitation.surveyId,
      invitationState: hrmEngagementSurveyInvitation.state,
      surveyTitle: hrmEngagementSurvey.title,
      surveyState: hrmEngagementSurvey.state,
      anonymityMode: hrmEngagementSurvey.anonymityMode,
      openAt: hrmEngagementSurvey.openAt,
      closeAt: hrmEngagementSurvey.closeAt,
      allowDraftResponses: hrmEngagementSurvey.allowDraftResponses,
    })
    .from(hrmEngagementSurveyInvitation)
    .innerJoin(
      hrmEngagementSurvey,
      eq(hrmEngagementSurveyInvitation.surveyId, hrmEngagementSurvey.id)
    )
    .where(
      and(
        eq(hrmEngagementSurveyInvitation.organizationId, input.organizationId),
        eq(hrmEngagementSurveyInvitation.id, input.invitationId),
        eq(hrmEngagementSurveyInvitation.employeeId, input.employeeId)
      )
    )
    .limit(1)

  if (!invitation) return null

  const questions = await db
    .select({
      id: hrmEngagementSurveyQuestion.id,
      sortOrder: hrmEngagementSurveyQuestion.sortOrder,
      questionType: hrmEngagementSurveyQuestion.questionType,
      category: hrmEngagementSurveyQuestion.category,
      prompt: hrmEngagementSurveyQuestion.prompt,
      config: hrmEngagementSurveyQuestion.config,
    })
    .from(hrmEngagementSurveyQuestion)
    .where(
      and(
        eq(hrmEngagementSurveyQuestion.organizationId, input.organizationId),
        eq(hrmEngagementSurveyQuestion.surveyId, invitation.surveyId)
      )
    )
    .orderBy(asc(hrmEngagementSurveyQuestion.sortOrder))

  const [response] = await db
    .select({
      id: hrmEngagementSurveyResponse.id,
      state: hrmEngagementSurveyResponse.state,
    })
    .from(hrmEngagementSurveyResponse)
    .where(
      and(
        eq(hrmEngagementSurveyResponse.organizationId, input.organizationId),
        eq(hrmEngagementSurveyResponse.invitationId, input.invitationId)
      )
    )
    .limit(1)

  const answersByQuestionId: Record<string, EngagementAnswerValue> = {}
  if (response) {
    const answers = await db
      .select({
        questionId: hrmEngagementResponseAnswer.questionId,
        value: hrmEngagementResponseAnswer.value,
      })
      .from(hrmEngagementResponseAnswer)
      .where(eq(hrmEngagementResponseAnswer.responseId, response.id))

    for (const answer of answers) {
      if (answer.value != null) {
        answersByQuestionId[answer.questionId] =
          answer.value as EngagementAnswerValue
      }
    }
  }

  const surveyState = invitation.surveyState as HrmEngagementSurveyState

  return {
    invitationId: invitation.invitationId,
    surveyId: invitation.surveyId,
    surveyTitle: invitation.surveyTitle,
    surveyState,
    anonymityMode: invitation.anonymityMode as HrmEngagementAnonymityMode,
    openAt: invitation.openAt?.toISOString() ?? null,
    closeAt: invitation.closeAt?.toISOString() ?? null,
    invitationState: invitation.invitationState,
    responseState:
      (response?.state as "draft" | "submitted" | undefined) ?? null,
    questions: questions.map((q) => ({
      id: q.id,
      sortOrder: q.sortOrder,
      questionType:
        q.questionType as EngagementSurveyQuestionRow["questionType"],
      category: q.category as EngagementSurveyQuestionRow["category"],
      prompt: q.prompt,
      config: q.config,
    })),
    answersByQuestionId,
    windowOpen: isEngagementSurveyResponseWindowOpen({
      state: surveyState,
      openAt: invitation.openAt,
      closeAt: invitation.closeAt,
    }),
    allowDraftResponses: invitation.allowDraftResponses,
  }
}
