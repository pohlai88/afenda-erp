import "server-only"

import { and, eq, inArray, lt } from "drizzle-orm"

import { writeIamAuditEvent } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmEngagementImprovementAction,
  iamAuditEvent,
} from "@afenda/platform/db/schema"
import type {
  CronTickInput,
  CronTickScannedEmittedSummary,
} from "@afenda/platform/erp/cron-tick.shared"

import { HRM_EMPLOYEE_ENGAGEMENT_AUDIT } from "../employee-engagement.contract"
import { isEngagementImprovementActionOverdue } from "../schemas/engagement-improvement.shared"
import { notifyEngagementImprovementActionOverdue } from "./engagement-notification.server"

const OVERDUE_BATCH_LIMIT = 200

export type EngagementImprovementOverdueWatchTickSummary =
  CronTickScannedEmittedSummary & {
    readonly skippedAlreadyAudited: number
    readonly notificationsSent: number
  }

export async function runEngagementImprovementOverdueTick(
  input?: CronTickInput
): Promise<EngagementImprovementOverdueWatchTickSummary> {
  const now = input?.now ?? new Date()
  const today = now.toISOString().slice(0, 10)

  const rows = await db
    .select({
      actionId: hrmEngagementImprovementAction.id,
      organizationId: hrmEngagementImprovementAction.organizationId,
      surveyId: hrmEngagementImprovementAction.surveyId,
      title: hrmEngagementImprovementAction.title,
      dueDate: hrmEngagementImprovementAction.dueDate,
      status: hrmEngagementImprovementAction.status,
      ownerEmployeeId: hrmEngagementImprovementAction.ownerEmployeeId,
      linkedUserId: hrmEmployee.linkedUserId,
    })
    .from(hrmEngagementImprovementAction)
    .leftJoin(
      hrmEmployee,
      eq(hrmEngagementImprovementAction.ownerEmployeeId, hrmEmployee.id)
    )
    .where(
      and(
        inArray(hrmEngagementImprovementAction.status, ["open", "in_progress"]),
        lt(hrmEngagementImprovementAction.dueDate, today)
      )
    )
    .limit(input?.batchLimit ?? OVERDUE_BATCH_LIMIT)

  const candidates = rows.filter((row) =>
    isEngagementImprovementActionOverdue({
      status: row.status as "open" | "in_progress" | "completed" | "cancelled",
      dueDate: row.dueDate,
      reference: now,
    })
  )

  if (candidates.length === 0) {
    return {
      scanned: 0,
      emitted: 0,
      skippedAlreadyAudited: 0,
      notificationsSent: 0,
    }
  }

  const actionIds = candidates.map((c) => c.actionId)
  const emittedRows = await db
    .selectDistinct({ resourceId: iamAuditEvent.resourceId })
    .from(iamAuditEvent)
    .where(
      and(
        eq(
          iamAuditEvent.action,
          HRM_EMPLOYEE_ENGAGEMENT_AUDIT.improvementAction.overdueNotify
        ),
        inArray(iamAuditEvent.resourceId, actionIds)
      )
    )

  const alreadyAudited = new Set(emittedRows.map((r) => r.resourceId))
  let emitted = 0
  let skippedAlreadyAudited = 0
  let notificationsSent = 0

  for (const candidate of candidates) {
    if (alreadyAudited.has(candidate.actionId)) {
      skippedAlreadyAudited += 1
      continue
    }

    await writeIamAuditEvent({
      action: HRM_EMPLOYEE_ENGAGEMENT_AUDIT.improvementAction.overdueNotify,
      actorUserId: null,
      actorSessionId: null,
      organizationId: candidate.organizationId,
      resourceType: "employee_engagement_improvement_action",
      resourceId: candidate.actionId,
      metadata: {
        dueDate: candidate.dueDate,
        ownerEmployeeId: candidate.ownerEmployeeId,
      },
    })

    emitted += 1

    await notifyEngagementImprovementActionOverdue({
      organizationId: candidate.organizationId,
      actionId: candidate.actionId,
      surveyId: candidate.surveyId,
      title: candidate.title,
      targetUserId: candidate.linkedUserId,
      ownerEmployeeId: candidate.ownerEmployeeId,
      dueDate: candidate.dueDate,
    })

    if (candidate.linkedUserId) notificationsSent += 1
  }

  return {
    scanned: candidates.length,
    emitted,
    skippedAlreadyAudited,
    notificationsSent,
  }
}
