import {
  enqueueHrOvertimeNotification,
  hrEmployees,
  listHrOvertimeNotificationsWindow,
  resolveAuthUserIdForHrEmployee,
  runWithOrganizationContext,
} from "@afenda/db";
import { and, eq } from "drizzle-orm";

import { deliverHrTimeOtmOrgNotification } from "./hrs-hr-time-otm-notification-delivery-server";
import {
  buildHrTimeOtmModulePath,
  buildHrTimeOtmNotificationCopy,
  hrTimeOtmNotificationSubjectTypes,
  type HrTimeOtmNotificationKind,
} from "./hr.time.otm-notification-templates.shared";

export type HrTimeOtmNotificationWindow = Awaited<
  ReturnType<typeof listHrOvertimeNotificationsWindow>
>;

function toDbNotificationKind(
  kind: HrTimeOtmNotificationKind,
): Parameters<typeof enqueueHrOvertimeNotification>[0]["kind"] {
  return kind;
}

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

async function notifyRecipient(input: {
  organizationId: string;
  orgSlug: string;
  locale: string;
  recipientAuthUserId: string;
  kind: HrTimeOtmNotificationKind;
  requestId: string;
  employeeId?: string | null;
  title: string;
  body: string;
}): Promise<boolean> {
  const result = await enqueueHrOvertimeNotification({
    organizationId: input.organizationId,
    recipientAuthUserId: input.recipientAuthUserId,
    kind: toDbNotificationKind(input.kind),
    subjectType: hrTimeOtmNotificationSubjectTypes.request,
    subjectId: input.requestId,
    employeeId: input.employeeId ?? null,
    title: input.title,
    body: input.body,
  });

  if (result.created) {
    await deliverHrTimeOtmOrgNotification({
      organizationId: input.organizationId,
      recipientAuthUserId: input.recipientAuthUserId,
      title: input.title,
      body: input.body,
      actionUrl: buildHrTimeOtmModulePath(input.orgSlug, input.locale),
      ablyPayload: {
        requestId: input.requestId,
        kind: input.kind,
      },
    });
  }

  return result.created;
}

/** HRM-OTM-026 — notify employees and approvers on overtime lifecycle transitions. */
export async function syncHrTimeOtmLifecycleNotifications(input: {
  organizationId: string;
  orgSlug: string;
  locale: string;
  kind: HrTimeOtmNotificationKind;
  requestId: string;
  employeeId: string;
  employeeDisplayName?: string;
  workDate?: Date;
  approverAuthUserIds?: readonly string[];
  detail?: string;
}): Promise<{ enqueuedCount: number }> {
  const copy = buildHrTimeOtmNotificationCopy({
    kind: input.kind,
    employeeDisplayName: input.employeeDisplayName,
    workDate: input.workDate,
    detail: input.detail,
  });

  const recipients = new Set<string>();

  const employeeAuthUserId = await resolveAuthUserIdForHrEmployee({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
  });
  if (employeeAuthUserId) {
    recipients.add(employeeAuthUserId);
  }

  const managerAuthUserId = await resolveManagerAuthUserId({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
  });
  if (managerAuthUserId) {
    recipients.add(managerAuthUserId);
  }

  for (const approverAuthUserId of input.approverAuthUserIds ?? []) {
    recipients.add(approverAuthUserId);
  }

  let enqueuedCount = 0;
  for (const recipientAuthUserId of recipients) {
    const created = await notifyRecipient({
      organizationId: input.organizationId,
      orgSlug: input.orgSlug,
      locale: input.locale,
      recipientAuthUserId,
      kind: input.kind,
      requestId: input.requestId,
      employeeId: input.employeeId,
      title: copy.title,
      body: copy.body,
    });
    if (created) {
      enqueuedCount += 1;
    }
  }

  return { enqueuedCount };
}

/** HRM-OTM-026 — list overtime notifications for authorized recipient. */
export async function listHrTimeOtmNotifications(input: {
  organizationId: string;
  recipientAuthUserId?: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrTimeOtmNotificationWindow> {
  return listHrOvertimeNotificationsWindow(input);
}
