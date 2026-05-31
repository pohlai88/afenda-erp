import {
  enqueueHrShiftNotification,
  hrShiftAssignments,
  listHrShiftNotificationsWindow,
  resolveAuthUserIdForHrEmployee,
  runWithOrganizationContext,
} from "@afenda/db";
import { and, eq, inArray } from "drizzle-orm";

import { emitHrSftAuditEvent } from "./hr.time.sft-audit.server";
import { hrTimeSftAuditActions } from "../events/hr.time.sft.event";
import {
  buildHrSftNotificationCopy,
  hrSftNotificationSubjectTypes,
  type HrSftNotificationKind,
} from "../surface/hr.time.sft-notification-templates.shared";

export type HrSftNotificationWindow = Awaited<
  ReturnType<typeof listHrShiftNotificationsWindow>
>;

function toDbNotificationKind(
  kind: HrSftNotificationKind,
): Parameters<typeof enqueueHrShiftNotification>[0]["kind"] {
  switch (kind) {
    case "roster_published":
      return "roster_published";
    case "roster_changed":
      return "roster_changed";
    case "assignment_changed":
      return "assignment_changed";
    default:
      return "roster_changed";
  }
}

/** HRM-SFT-025 — notify employees when roster is published or changed. */
export async function notifyHrSftScheduleEvent(input: {
  organizationId: string;
  actorAuthUserId: string;
  kind: HrSftNotificationKind;
  subjectType: string;
  subjectId: string;
  employeeIds: readonly string[];
  employeeDisplayName?: string;
  periodStart?: Date;
  periodEnd?: Date;
  templateCode?: string;
  shiftDate?: Date;
  detail?: string;
}): Promise<{ enqueuedCount: number }> {
  const copy = buildHrSftNotificationCopy({
    kind: input.kind,
    employeeDisplayName: input.employeeDisplayName,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    templateCode: input.templateCode,
    shiftDate: input.shiftDate,
    detail: input.detail,
  });

  let enqueuedCount = 0;

  for (const employeeId of input.employeeIds) {
    const recipientAuthUserId = await resolveAuthUserIdForHrEmployee({
      organizationId: input.organizationId,
      employeeId,
    });

    if (!recipientAuthUserId) {
      continue;
    }

    const result = await enqueueHrShiftNotification({
      organizationId: input.organizationId,
      recipientAuthUserId,
      kind: toDbNotificationKind(input.kind),
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      employeeId,
      title: copy.title,
      body: copy.body,
    });

    if (result.created) {
      enqueuedCount += 1;
      await emitHrSftAuditEvent({
        organizationId: input.organizationId,
        actorAuthUserId: input.actorAuthUserId,
        action: hrTimeSftAuditActions.notification.enqueued,
        storeAction: "notification_enqueued",
        targetType: input.subjectType,
        targetId: result.notificationId,
        employeeId,
        summary: copy.title,
        metadata: {
          kind: input.kind,
          recipientAuthUserId,
          employeeId,
        },
      });
    }
  }

  return { enqueuedCount };
}

/** HRM-SFT-025 — list schedule notifications for workbench. */
export async function listHrSftScheduleNotifications(input: {
  organizationId: string;
  recipientAuthUserId?: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrSftNotificationWindow> {
  return listHrShiftNotificationsWindow(input);
}

/** HRM-SFT-025 — notify employees with published assignments in period. */
export async function notifyHrSftRosterPublication(input: {
  organizationId: string;
  actorAuthUserId: string;
  publicationId: string;
  periodStart: Date;
  periodEnd: Date;
}): Promise<{ enqueuedCount: number }> {
  const assignedEmployeeIds = await runWithOrganizationContext(
    input.organizationId,
    async (db) => {
      const rows = await db
        .selectDistinct({ employeeId: hrShiftAssignments.employeeId })
        .from(hrShiftAssignments)
        .where(
          and(
            eq(hrShiftAssignments.organizationId, input.organizationId),
            eq(hrShiftAssignments.publicationId, input.publicationId),
            inArray(hrShiftAssignments.status, ["published"]),
          ),
        );

      return rows.map((row) => row.employeeId);
    },
  );

  if (assignedEmployeeIds.length === 0) {
    return { enqueuedCount: 0 };
  }

  return notifyHrSftScheduleEvent({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    kind: "roster_published",
    subjectType: hrSftNotificationSubjectTypes.rosterPublication,
    subjectId: input.publicationId,
    employeeIds: assignedEmployeeIds,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
  });
}

/** HRM-SFT-025 — notify employee on assignment change. */
export async function notifyHrSftAssignmentChanged(input: {
  organizationId: string;
  actorAuthUserId: string;
  assignmentId: string;
  employeeId: string;
  employeeDisplayName: string;
  templateCode?: string;
  shiftDate?: Date;
  detail?: string;
}): Promise<{ enqueuedCount: number }> {
  return notifyHrSftScheduleEvent({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    kind: "assignment_changed",
    subjectType: hrSftNotificationSubjectTypes.assignment,
    subjectId: input.assignmentId,
    employeeIds: [input.employeeId],
    employeeDisplayName: input.employeeDisplayName,
    templateCode: input.templateCode,
    shiftDate: input.shiftDate,
    detail: input.detail,
  });
}
