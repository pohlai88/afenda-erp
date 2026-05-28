import "server-only"

import { and, eq, sql } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmEngagementSurvey,
  hrmEngagementSurveyInvitation,
  hrmEngagementSurveyQuestion,
} from "@afenda/platform/db/schema"

import { parseEngagementAudienceSnapshot } from "../schemas/engagement-audience.shared"
import { tryGenerateEngagementAnalyticsOnClose } from "./engagement-analytics.server"

type MutationFailure = { ok: true; message: string } | { surveyId: string }

export async function publishEngagementSurveyMutation(input: {
  organizationId: string
  actorUserId: string
  surveyId: string
}): Promise<MutationFailure> {
  const [survey] = await db
    .select({
      state: hrmEngagementSurvey.state,
      audienceSnapshot: hrmEngagementSurvey.audienceSnapshot,
      openAt: hrmEngagementSurvey.openAt,
      closeAt: hrmEngagementSurvey.closeAt,
    })
    .from(hrmEngagementSurvey)
    .where(
      and(
        eq(hrmEngagementSurvey.organizationId, input.organizationId),
        eq(hrmEngagementSurvey.id, input.surveyId)
      )
    )
    .limit(1)

  if (!survey) return { ok: true, message: "Survey not found." }
  if (survey.state !== "scheduled") {
    return {
      ok: true,
      message: "Only scheduled surveys can be published.",
    }
  }
  if (!survey.openAt || !survey.closeAt) {
    return {
      ok: true,
      message: "Set open and close dates before publishing.",
    }
  }
  if (survey.closeAt.getTime() <= survey.openAt.getTime()) {
    return { ok: true, message: "Close date must be after open date." }
  }

  const snapshot = parseEngagementAudienceSnapshot(survey.audienceSnapshot)
  if (!snapshot || snapshot.employeeIds.length < 1) {
    return {
      ok: true,
      message: "Audience must include at least one employee before publishing.",
    }
  }

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(hrmEngagementSurveyQuestion)
    .where(
      and(
        eq(hrmEngagementSurveyQuestion.organizationId, input.organizationId),
        eq(hrmEngagementSurveyQuestion.surveyId, input.surveyId)
      )
    )

  if ((countRow?.count ?? 0) < 1) {
    return {
      ok: true,
      message: "Add at least one question before publishing.",
    }
  }

  const employeeIds = [...snapshot.employeeIds]

  await db.transaction(async (tx) => {
    const updated = await tx
      .update(hrmEngagementSurvey)
      .set({
        state: "published",
        updatedAt: new Date(),
        updatedByUserId: input.actorUserId,
      })
      .where(
        and(
          eq(hrmEngagementSurvey.organizationId, input.organizationId),
          eq(hrmEngagementSurvey.id, input.surveyId),
          eq(hrmEngagementSurvey.state, "scheduled")
        )
      )
      .returning({ id: hrmEngagementSurvey.id })

    if (updated.length === 0) {
      throw new Error("Survey is no longer scheduled.")
    }

    if (employeeIds.length > 0) {
      await tx
        .insert(hrmEngagementSurveyInvitation)
        .values(
          employeeIds.map((employeeId) => ({
            organizationId: input.organizationId,
            surveyId: input.surveyId,
            employeeId,
            state: "pending" as const,
          }))
        )
        .onConflictDoNothing()
    }
  })

  return { surveyId: input.surveyId }
}

export async function closeEngagementSurveyMutation(input: {
  organizationId: string
  actorUserId: string
  surveyId: string
}): Promise<MutationFailure> {
  const [survey] = await db
    .select({ state: hrmEngagementSurvey.state })
    .from(hrmEngagementSurvey)
    .where(
      and(
        eq(hrmEngagementSurvey.organizationId, input.organizationId),
        eq(hrmEngagementSurvey.id, input.surveyId)
      )
    )
    .limit(1)

  if (!survey) return { ok: true, message: "Survey not found." }
  if (survey.state !== "published") {
    return { ok: true, message: "Only published surveys can be closed." }
  }

  await db.transaction(async (tx) => {
    await tx
      .update(hrmEngagementSurvey)
      .set({
        state: "closed",
        updatedAt: new Date(),
        updatedByUserId: input.actorUserId,
      })
      .where(
        and(
          eq(hrmEngagementSurvey.organizationId, input.organizationId),
          eq(hrmEngagementSurvey.id, input.surveyId),
          eq(hrmEngagementSurvey.state, "published")
        )
      )

    await tx
      .update(hrmEngagementSurveyInvitation)
      .set({
        state: "expired",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(
            hrmEngagementSurveyInvitation.organizationId,
            input.organizationId
          ),
          eq(hrmEngagementSurveyInvitation.surveyId, input.surveyId),
          eq(hrmEngagementSurveyInvitation.state, "pending")
        )
      )
  })

  await tryGenerateEngagementAnalyticsOnClose({
    organizationId: input.organizationId,
    surveyId: input.surveyId,
    actorUserId: input.actorUserId,
  })

  return { surveyId: input.surveyId }
}

export async function resendEngagementInvitationMutation(input: {
  organizationId: string
  invitationId: string
}): Promise<{ ok: true; message: string } | { invitationId: string }> {
  const [row] = await db
    .select({
      invitationState: hrmEngagementSurveyInvitation.state,
      surveyState: hrmEngagementSurvey.state,
    })
    .from(hrmEngagementSurveyInvitation)
    .innerJoin(
      hrmEngagementSurvey,
      eq(hrmEngagementSurveyInvitation.surveyId, hrmEngagementSurvey.id)
    )
    .where(
      and(
        eq(hrmEngagementSurveyInvitation.organizationId, input.organizationId),
        eq(hrmEngagementSurveyInvitation.id, input.invitationId)
      )
    )
    .limit(1)

  if (!row) return { ok: true, message: "Invitation not found." }
  if (row.surveyState !== "published") {
    return {
      ok: true,
      message: "Survey must be published to resend invitations.",
    }
  }
  if (row.invitationState !== "pending") {
    return {
      ok: true,
      message: "Only pending invitations can be resent.",
    }
  }

  await db
    .update(hrmEngagementSurveyInvitation)
    .set({
      invitedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(hrmEngagementSurveyInvitation.organizationId, input.organizationId),
        eq(hrmEngagementSurveyInvitation.id, input.invitationId),
        eq(hrmEngagementSurveyInvitation.state, "pending")
      )
    )

  return { invitationId: input.invitationId }
}
