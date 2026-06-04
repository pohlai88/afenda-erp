import {
  hrEmployees,
  hrmDevelopmentCoachAssignments,
  hrmDevelopmentMentorAssignments,
  listHrmCareerPathingDueForNotification,
  resolveAuthUserIdForHrEmployee,
  runWithOrganizationContext,
} from "@afenda/db";
import { and, eq } from "drizzle-orm";

import { hrTalentCareerPathingAuditActions } from "./hr.talent.career-pathing.event";
import { emitHrCareerPathingAuditEvent } from "./hrs-hr-talent-career-pathing-audit-server";
import {
  listHrCareerPathingNotificationIntents,
  recordHrCareerPathingNotificationIntent,
  type HrCareerPathingNotificationKind,
} from "./hr.talent.career-pathing-notification.shared";

async function resolveManagerAuthUserId(input: {
  organizationId: string;
  employeeId: string;
}): Promise<string | null> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [employee] = await db
      .select({ managerEmployeeId: hrEmployees.managerEmployeeId })
      .from(hrEmployees)
      .where(
        and(
          eq(hrEmployees.organizationId, input.organizationId),
          eq(hrEmployees.id, input.employeeId),
        ),
      )
      .limit(1);

    if (!employee?.managerEmployeeId) {
      return null;
    }

    return resolveAuthUserIdForHrEmployee({
      organizationId: input.organizationId,
      employeeId: employee.managerEmployeeId,
    });
  });
}

async function resolvePlanMentorCoachAuthUserIds(input: {
  organizationId: string;
  planId: string | null;
}): Promise<{ mentorAuthUserId: string | null; coachAuthUserId: string | null }> {
  if (!input.planId) {
    return { mentorAuthUserId: null, coachAuthUserId: null };
  }

  const planId = input.planId;

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [mentorRow] = await db
      .select({ mentorEmployeeId: hrmDevelopmentMentorAssignments.mentorEmployeeId })
      .from(hrmDevelopmentMentorAssignments)
      .where(
        and(
          eq(hrmDevelopmentMentorAssignments.organizationId, input.organizationId),
          eq(hrmDevelopmentMentorAssignments.planId, planId),
        ),
      )
      .limit(1);

    const [coachRow] = await db
      .select({ coachEmployeeId: hrmDevelopmentCoachAssignments.coachEmployeeId })
      .from(hrmDevelopmentCoachAssignments)
      .where(
        and(
          eq(hrmDevelopmentCoachAssignments.organizationId, input.organizationId),
          eq(hrmDevelopmentCoachAssignments.planId, planId),
        ),
      )
      .limit(1);

    const mentorAuthUserId = mentorRow?.mentorEmployeeId
      ? await resolveAuthUserIdForHrEmployee({
          organizationId: input.organizationId,
          employeeId: mentorRow.mentorEmployeeId,
        })
      : null;

    const coachAuthUserId = coachRow?.coachEmployeeId
      ? await resolveAuthUserIdForHrEmployee({
          organizationId: input.organizationId,
          employeeId: coachRow.coachEmployeeId,
        })
      : null;

    return { mentorAuthUserId, coachAuthUserId };
  });
}

function notificationCopy(
  kind: HrCareerPathingNotificationKind,
  input: {
    employeeName: string;
    subjectLabel: string;
    dueDate: Date | null;
  },
): { title: string; body: string } {
  const due = input.dueDate ? ` Due ${input.dueDate.toISOString().slice(0, 10)}.` : "";
  switch (kind) {
    case "overdue_milestone":
      return {
        title: "Development milestone overdue",
        body: `${input.employeeName} has an overdue milestone: ${input.subjectLabel}.${due}`,
      };
    case "upcoming_review":
      return {
        title: "Upcoming career development review",
        body: `Career review scheduled for ${input.employeeName}.${due}`,
      };
    case "completed_goal":
      return {
        title: "Development goal completed",
        body: `${input.employeeName} completed development goal: ${input.subjectLabel}.`,
      };
    default:
      return {
        title: "Career pathing update",
        body: `Update for ${input.employeeName}: ${input.subjectLabel}.`,
      };
  }
}

function auditActionForKind(kind: HrCareerPathingNotificationKind): string {
  switch (kind) {
    case "overdue_milestone":
      return hrTalentCareerPathingAuditActions.notification.overdueMilestone;
    case "upcoming_review":
      return hrTalentCareerPathingAuditActions.notification.upcomingReview;
    case "completed_goal":
      return hrTalentCareerPathingAuditActions.notification.completedGoal;
    default:
      return hrTalentCareerPathingAuditActions.notification.overdueMilestone;
  }
}

/** HRM-CAR-025 — notify employee, manager, mentor, coach, and HR operators. */
export async function syncHrCareerPathingDueNotifications(input: {
  organizationId: string;
  asOf?: Date;
  hrOperatorAuthUserIds?: readonly string[];
  actorAuthUserId?: string;
  limit?: number;
}): Promise<{ enqueuedCount: number }> {
  const dueItems = await listHrmCareerPathingDueForNotification({
    organizationId: input.organizationId,
    asOf: input.asOf,
    limit: input.limit,
  });

  let enqueuedCount = 0;

  for (const item of dueItems) {
    const copy = notificationCopy(item.kind, {
      employeeName: item.employeeName,
      subjectLabel: item.subjectLabel,
      dueDate: item.dueDate,
    });

    const recipients = new Map<string, "employee" | "manager" | "mentor" | "coach" | "hr">();

    const employeeAuthUserId = await resolveAuthUserIdForHrEmployee({
      organizationId: input.organizationId,
      employeeId: item.employeeId,
    });
    if (employeeAuthUserId) {
      recipients.set(employeeAuthUserId, "employee");
    }

    const managerAuthUserId = await resolveManagerAuthUserId({
      organizationId: input.organizationId,
      employeeId: item.employeeId,
    });
    if (managerAuthUserId) {
      recipients.set(managerAuthUserId, "manager");
    }

    const { mentorAuthUserId, coachAuthUserId } = await resolvePlanMentorCoachAuthUserIds({
      organizationId: input.organizationId,
      planId: item.planId,
    });
    if (mentorAuthUserId) {
      recipients.set(mentorAuthUserId, "mentor");
    }
    if (coachAuthUserId) {
      recipients.set(coachAuthUserId, "coach");
    }

    for (const hrAuthUserId of input.hrOperatorAuthUserIds ?? []) {
      recipients.set(hrAuthUserId, "hr");
    }

    for (const [recipientAuthUserId, recipientRole] of recipients) {
      recordHrCareerPathingNotificationIntent({
        organizationId: input.organizationId,
        kind: item.kind,
        recipientAuthUserId,
        recipientRole,
        subjectId: item.subjectId,
        subjectLabel: item.subjectLabel,
        employeeId: item.employeeId,
        employeeName: item.employeeName,
        title: copy.title,
        body: copy.body,
        dueDate: item.dueDate?.toISOString() ?? null,
      });
      enqueuedCount += 1;
    }

    await emitHrCareerPathingAuditEvent({
      organizationId: input.organizationId,
      actorAuthUserId: input.actorAuthUserId ?? null,
      action: auditActionForKind(item.kind),
      employeeId: item.employeeId,
      planId: item.planId,
      summary: copy.title,
      metadata: {
        subjectId: item.subjectId,
        recipientCount: recipients.size,
      },
    });
  }

  return { enqueuedCount };
}

export { listHrCareerPathingNotificationIntents };
