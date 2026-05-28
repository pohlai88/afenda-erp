import "server-only"

import { and, eq, inArray } from "drizzle-orm"

import { writeIamAuditEvent } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmEngagementSurvey,
  hrmEngagementSurveyInvitation,
  iamAuditEvent,
} from "@afenda/platform/db/schema"
import type {
  CronTickInput,
  CronTickScannedEmittedSummary,
} from "@afenda/platform/erp/cron-tick.shared"

import { HRM_EMPLOYEE_ENGAGEMENT_AUDIT } from "../employee-engagement.contract"
import { engagementReminderScheduleSchema } from "../schemas/engagement-reminder.shared"
import { notifyEngagementSurveyReminder } from "./engagement-notification.server"

const REMINDER_BATCH_LIMIT = 100

export type EngagementReminderWatchTickSummary =
  CronTickScannedEmittedSummary & {
    readonly notificationsSent: number
  }

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )
}

function daysBetweenUtc(start: Date, end: Date): number {
  const ms = startOfUtcDay(end).getTime() - startOfUtcDay(start).getTime()
  return Math.round(ms / (24 * 60 * 60 * 1000))
}

export async function runEngagementSurveyReminderTick(
  input?: CronTickInput
): Promise<EngagementReminderWatchTickSummary> {
  const now = input?.now ?? new Date()

  const surveys = await db
    .select({
      id: hrmEngagementSurvey.id,
      organizationId: hrmEngagementSurvey.organizationId,
      title: hrmEngagementSurvey.title,
      closeAt: hrmEngagementSurvey.closeAt,
      reminderSchedule: hrmEngagementSurvey.reminderSchedule,
    })
    .from(hrmEngagementSurvey)
    .where(eq(hrmEngagementSurvey.state, "published"))
    .limit(input?.batchLimit ?? REMINDER_BATCH_LIMIT)

  let scanned = 0
  let emitted = 0
  let notificationsSent = 0

  for (const survey of surveys) {
    if (!survey.closeAt || survey.closeAt.getTime() <= now.getTime()) continue

    const scheduleParsed = engagementReminderScheduleSchema.safeParse(
      survey.reminderSchedule
    )
    if (!scheduleParsed.success || !scheduleParsed.data.enabled) continue

    const daysUntilClose = daysBetweenUtc(now, survey.closeAt)
    if (!scheduleParsed.data.daysBeforeClose.includes(daysUntilClose)) continue

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
          eq(
            hrmEngagementSurveyInvitation.organizationId,
            survey.organizationId
          ),
          eq(hrmEngagementSurveyInvitation.surveyId, survey.id),
          eq(hrmEngagementSurveyInvitation.state, "pending")
        )
      )
      .limit(REMINDER_BATCH_LIMIT)

    const dedupeIds = invitations.map(
      (inv) => `${inv.invitationId}:reminder:${daysUntilClose}`
    )
    const alreadyAudited =
      dedupeIds.length === 0
        ? new Set<string>()
        : new Set(
            (
              await db
                .selectDistinct({ resourceId: iamAuditEvent.resourceId })
                .from(iamAuditEvent)
                .where(
                  and(
                    eq(
                      iamAuditEvent.action,
                      HRM_EMPLOYEE_ENGAGEMENT_AUDIT.invitation.remind
                    ),
                    inArray(iamAuditEvent.resourceId, dedupeIds)
                  )
                )
            ).map((row) => row.resourceId)
          )

    for (const invitation of invitations) {
      scanned += 1
      const dedupeId = `${invitation.invitationId}:reminder:${daysUntilClose}`
      if (alreadyAudited.has(dedupeId)) continue

      await notifyEngagementSurveyReminder({
        organizationId: survey.organizationId,
        invitationId: invitation.invitationId,
        surveyTitle: survey.title,
        targetUserId: invitation.linkedUserId,
        employeeId: invitation.employeeId,
        daysBeforeClose: daysUntilClose,
      })

      await writeIamAuditEvent({
        action: HRM_EMPLOYEE_ENGAGEMENT_AUDIT.invitation.remind,
        actorUserId: null,
        actorSessionId: null,
        organizationId: survey.organizationId,
        resourceType: "employee_engagement_invitation",
        resourceId: dedupeId,
        metadata: {
          surveyId: survey.id,
          invitationId: invitation.invitationId,
          daysBeforeClose: daysUntilClose,
        },
      })

      emitted += 1
      if (invitation.linkedUserId) notificationsSent += 1
    }
  }

  return { scanned, emitted, notificationsSent }
}
