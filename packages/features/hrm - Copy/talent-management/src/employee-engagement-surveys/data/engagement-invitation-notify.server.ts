import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmEngagementSurvey,
  hrmEngagementSurveyInvitation,
} from "@afenda/platform/db/schema"

import {
  notifyEngagementSurveyInvitation,
  notifyEngagementSurveyResend,
} from "./engagement-notification.server"

export async function deliverEngagementSurveyInvitationNotices(input: {
  organizationId: string
  surveyId: string
}): Promise<{ notificationsSent: number }> {
  const [survey] = await db
    .select({ title: hrmEngagementSurvey.title })
    .from(hrmEngagementSurvey)
    .where(
      and(
        eq(hrmEngagementSurvey.organizationId, input.organizationId),
        eq(hrmEngagementSurvey.id, input.surveyId)
      )
    )
    .limit(1)

  if (!survey) return { notificationsSent: 0 }

  const invitations = await db
    .select({
      invitationId: hrmEngagementSurveyInvitation.id,
      employeeId: hrmEngagementSurveyInvitation.employeeId,
      linkedUserId: hrmEmployee.linkedUserId,
    })
    .from(hrmEngagementSurveyInvitation)
    .innerJoin(
      hrmEmployee,
      eq(hrmEngagementSurveyInvitation.employeeId, hrmEmployee.id)
    )
    .where(
      and(
        eq(hrmEngagementSurveyInvitation.organizationId, input.organizationId),
        eq(hrmEngagementSurveyInvitation.surveyId, input.surveyId),
        eq(hrmEngagementSurveyInvitation.state, "pending")
      )
    )

  let notificationsSent = 0
  for (const row of invitations) {
    await notifyEngagementSurveyInvitation({
      organizationId: input.organizationId,
      invitationId: row.invitationId,
      surveyTitle: survey.title,
      targetUserId: row.linkedUserId,
      employeeId: row.employeeId,
    })
    if (row.linkedUserId) notificationsSent += 1
  }

  return { notificationsSent }
}

export async function deliverEngagementInvitationResendNotice(input: {
  organizationId: string
  invitationId: string
}): Promise<void> {
  const [row] = await db
    .select({
      surveyTitle: hrmEngagementSurvey.title,
      employeeId: hrmEngagementSurveyInvitation.employeeId,
      linkedUserId: hrmEmployee.linkedUserId,
    })
    .from(hrmEngagementSurveyInvitation)
    .innerJoin(
      hrmEngagementSurvey,
      eq(hrmEngagementSurveyInvitation.surveyId, hrmEngagementSurvey.id)
    )
    .innerJoin(
      hrmEmployee,
      eq(hrmEngagementSurveyInvitation.employeeId, hrmEmployee.id)
    )
    .where(
      and(
        eq(hrmEngagementSurveyInvitation.organizationId, input.organizationId),
        eq(hrmEngagementSurveyInvitation.id, input.invitationId)
      )
    )
    .limit(1)

  if (!row) return

  await notifyEngagementSurveyResend({
    organizationId: input.organizationId,
    invitationId: input.invitationId,
    surveyTitle: row.surveyTitle,
    targetUserId: row.linkedUserId,
    employeeId: row.employeeId,
  })
}
