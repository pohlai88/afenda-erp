import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmEngagementResponseAnswer,
  hrmEngagementSurvey,
  hrmEngagementSurveyInvitation,
  hrmEngagementSurveyQuestion,
  hrmEngagementSurveyResponse,
} from "@afenda/platform/db/schema"

import {
  engagementInvitationAcceptsResponse,
  isEngagementSurveyResponseWindowOpen,
  validateEngagementAnswerForQuestion,
  type EngagementResponseAnswerInput,
} from "../schemas/engagement-response.shared"

type MutationFailure = { ok: true; message: string } | { invitationId: string }

type InvitationContext = {
  invitationId: string
  surveyId: string
  employeeId: string
  invitationState: string
  surveyState: string
  openAt: Date | null
  closeAt: Date | null
  allowDraftResponses: boolean
  organizationId: string
}

async function loadInvitationContext(input: {
  organizationId: string
  invitationId: string
  employeeId: string
}): Promise<InvitationContext | { ok: true; message: string }> {
  const [row] = await db
    .select({
      invitationId: hrmEngagementSurveyInvitation.id,
      surveyId: hrmEngagementSurveyInvitation.surveyId,
      employeeId: hrmEngagementSurveyInvitation.employeeId,
      invitationState: hrmEngagementSurveyInvitation.state,
      surveyState: hrmEngagementSurvey.state,
      openAt: hrmEngagementSurvey.openAt,
      closeAt: hrmEngagementSurvey.closeAt,
      allowDraftResponses: hrmEngagementSurvey.allowDraftResponses,
      organizationId: hrmEngagementSurveyInvitation.organizationId,
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

  if (!row) {
    return {
      ok: true,
      message: "Invitation not found for your employee record.",
    }
  }

  return row
}

async function validateAnswersForSurvey(input: {
  organizationId: string
  surveyId: string
  answers: readonly EngagementResponseAnswerInput[]
  requireAll: boolean
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const questions = await db
    .select({
      id: hrmEngagementSurveyQuestion.id,
      questionType: hrmEngagementSurveyQuestion.questionType,
    })
    .from(hrmEngagementSurveyQuestion)
    .where(
      and(
        eq(hrmEngagementSurveyQuestion.organizationId, input.organizationId),
        eq(hrmEngagementSurveyQuestion.surveyId, input.surveyId)
      )
    )

  const answerByQuestion = new Map(
    input.answers.map((a) => [a.questionId, a.value] as const)
  )

  for (const question of questions) {
    const value = answerByQuestion.get(question.id)
    if (value === undefined) {
      if (input.requireAll) {
        return {
          ok: false,
          message: "All questions must be answered before submit.",
        }
      }
      continue
    }
    const check = validateEngagementAnswerForQuestion({
      questionType: question.questionType as Parameters<
        typeof validateEngagementAnswerForQuestion
      >[0]["questionType"],
      value,
    })
    if (!check.ok) return check
  }

  return { ok: true }
}

async function upsertResponseAnswers(input: {
  organizationId: string
  responseId: string
  answers: readonly EngagementResponseAnswerInput[]
}) {
  for (const answer of input.answers) {
    await db
      .insert(hrmEngagementResponseAnswer)
      .values({
        organizationId: input.organizationId,
        responseId: input.responseId,
        questionId: answer.questionId,
        value: answer.value,
      })
      .onConflictDoUpdate({
        target: [
          hrmEngagementResponseAnswer.responseId,
          hrmEngagementResponseAnswer.questionId,
        ],
        set: {
          value: answer.value,
          updatedAt: new Date(),
        },
      })
  }
}

export async function saveEngagementResponseDraftMutation(input: {
  organizationId: string
  employeeId: string
  invitationId: string
  answers: readonly EngagementResponseAnswerInput[]
}): Promise<MutationFailure> {
  const ctx = await loadInvitationContext({
    organizationId: input.organizationId,
    invitationId: input.invitationId,
    employeeId: input.employeeId,
  })
  if ("ok" in ctx) return ctx

  if (
    !engagementInvitationAcceptsResponse({
      invitationState: ctx.invitationState,
      surveyState: ctx.surveyState,
    })
  ) {
    return { ok: true, message: "This invitation is not open for responses." }
  }
  if (
    !isEngagementSurveyResponseWindowOpen({
      state: ctx.surveyState,
      openAt: ctx.openAt,
      closeAt: ctx.closeAt,
    })
  ) {
    return { ok: true, message: "The survey response window is closed." }
  }
  if (ctx.invitationState === "submitted") {
    return { ok: true, message: "This survey was already submitted." }
  }
  if (!ctx.allowDraftResponses) {
    return {
      ok: true,
      message: "Draft responses are disabled for this survey.",
    }
  }

  const answerCheck = await validateAnswersForSurvey({
    organizationId: input.organizationId,
    surveyId: ctx.surveyId,
    answers: input.answers,
    requireAll: false,
  })
  if (!answerCheck.ok) return { ok: true, message: answerCheck.message }

  await db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: hrmEngagementSurveyResponse.id })
      .from(hrmEngagementSurveyResponse)
      .where(
        and(
          eq(hrmEngagementSurveyResponse.organizationId, input.organizationId),
          eq(hrmEngagementSurveyResponse.invitationId, input.invitationId)
        )
      )
      .limit(1)

    let responseId = existing?.id
    if (!responseId) {
      const [inserted] = await tx
        .insert(hrmEngagementSurveyResponse)
        .values({
          organizationId: input.organizationId,
          surveyId: ctx.surveyId,
          invitationId: input.invitationId,
          employeeId: input.employeeId,
          state: "draft",
        })
        .returning({ id: hrmEngagementSurveyResponse.id })
      responseId = inserted?.id
    }

    if (!responseId) {
      throw new Error("Could not create draft response.")
    }

    await upsertResponseAnswers({
      organizationId: input.organizationId,
      responseId,
      answers: input.answers,
    })
  })

  return { invitationId: input.invitationId }
}

export async function submitEngagementResponseMutation(input: {
  organizationId: string
  employeeId: string
  invitationId: string
  answers: readonly EngagementResponseAnswerInput[]
}): Promise<MutationFailure> {
  const ctx = await loadInvitationContext({
    organizationId: input.organizationId,
    invitationId: input.invitationId,
    employeeId: input.employeeId,
  })
  if ("ok" in ctx) return ctx

  if (
    !engagementInvitationAcceptsResponse({
      invitationState: ctx.invitationState,
      surveyState: ctx.surveyState,
    })
  ) {
    return { ok: true, message: "This invitation is not open for responses." }
  }
  if (
    !isEngagementSurveyResponseWindowOpen({
      state: ctx.surveyState,
      openAt: ctx.openAt,
      closeAt: ctx.closeAt,
    })
  ) {
    return { ok: true, message: "The survey response window is closed." }
  }
  if (ctx.invitationState === "submitted") {
    return { ok: true, message: "This survey was already submitted." }
  }

  const answerCheck = await validateAnswersForSurvey({
    organizationId: input.organizationId,
    surveyId: ctx.surveyId,
    answers: input.answers,
    requireAll: true,
  })
  if (!answerCheck.ok) return { ok: true, message: answerCheck.message }

  const now = new Date()

  await db.transaction(async (tx) => {
    const [existing] = await tx
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

    if (existing?.state === "submitted") {
      throw new Error("Response already submitted.")
    }

    let responseId = existing?.id
    if (!responseId) {
      const [inserted] = await tx
        .insert(hrmEngagementSurveyResponse)
        .values({
          organizationId: input.organizationId,
          surveyId: ctx.surveyId,
          invitationId: input.invitationId,
          employeeId: input.employeeId,
          state: "submitted",
          submittedAt: now,
        })
        .returning({ id: hrmEngagementSurveyResponse.id })
      responseId = inserted?.id
    } else {
      await tx
        .update(hrmEngagementSurveyResponse)
        .set({
          state: "submitted",
          submittedAt: now,
          updatedAt: now,
        })
        .where(eq(hrmEngagementSurveyResponse.id, responseId))
    }

    if (!responseId) {
      throw new Error("Could not persist response.")
    }

    await upsertResponseAnswers({
      organizationId: input.organizationId,
      responseId,
      answers: input.answers,
    })

    await tx
      .update(hrmEngagementSurveyInvitation)
      .set({
        state: "submitted",
        submittedAt: now,
        updatedAt: now,
      })
      .where(
        and(
          eq(
            hrmEngagementSurveyInvitation.organizationId,
            input.organizationId
          ),
          eq(hrmEngagementSurveyInvitation.id, input.invitationId),
          eq(hrmEngagementSurveyInvitation.state, "pending")
        )
      )
  })

  return { invitationId: input.invitationId }
}
