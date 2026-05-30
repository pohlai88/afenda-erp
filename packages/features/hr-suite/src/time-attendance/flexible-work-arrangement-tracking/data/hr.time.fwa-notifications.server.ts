import {
  enqueueHrFwaNotification,
  getHrFwaArrangementById,
  hrEmployees,
  listHrFwaArrangementsDueForLifecycleAction,
  resolveAuthUserIdForHrEmployee,
  runWithOrganizationContext,
} from "@afenda/db";
import { and, eq } from "drizzle-orm";

const FWA_SUBJECT_ARRANGEMENT = "hr_fwa_arrangement" as const;
const FWA_SUBJECT_REQUEST = "hr_fwa_request" as const;

type HrFwaNotificationEvent =
  | "request_submitted"
  | "request_approved"
  | "request_rejected"
  | "request_returned"
  | "arrangement_expiring"
  | "arrangement_renewed"
  | "arrangement_suspended"
  | "arrangement_terminated"
  | "compliance_breach"
  | "review_due";

function eventToKind(
  event: HrFwaNotificationEvent,
): Parameters<typeof enqueueHrFwaNotification>[0]["kind"] {
  return event;
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
  recipientAuthUserId: string;
  kind: HrFwaNotificationEvent;
  subjectType: string;
  subjectId: string;
  title: string;
  body: string;
}): Promise<void> {
  await enqueueHrFwaNotification({
    organizationId: input.organizationId,
    recipientAuthUserId: input.recipientAuthUserId,
    kind: eventToKind(input.kind),
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    title: input.title,
    body: input.body,
  });
}

/** HRM-FWA-029 — notify employee, manager, and HR operators on lifecycle transitions. */
export async function syncHrFwaLifecycleNotifications(input: {
  organizationId: string;
  event: HrFwaNotificationEvent;
  arrangementId?: string;
  requestId?: string;
  employeeId?: string;
  actorAuthUserId?: string;
  detail?: string;
}): Promise<{ enqueuedCount: number }> {
  let employeeId = input.employeeId;
  let subjectType: typeof FWA_SUBJECT_REQUEST | typeof FWA_SUBJECT_ARRANGEMENT =
    FWA_SUBJECT_REQUEST;
  let subjectId = input.requestId ?? input.arrangementId ?? "unknown";
  let employeeDisplayName = "Employee";

  if (input.arrangementId) {
    const arrangement = await getHrFwaArrangementById({
      organizationId: input.organizationId,
      arrangementId: input.arrangementId,
    });
    employeeId = arrangement.employeeId;
    employeeDisplayName = arrangement.employeeDisplayName;
    subjectType = FWA_SUBJECT_ARRANGEMENT;
    subjectId = arrangement.id;
  }

  if (!employeeId) {
    return { enqueuedCount: 0 };
  }

  const copy = buildNotificationCopy({
    event: input.event,
    employeeDisplayName,
    detail: input.detail,
  });

  const recipients = new Set<string>();
  const employeeAuthUserId = await resolveAuthUserIdForHrEmployee({
    organizationId: input.organizationId,
    employeeId,
  });
  if (employeeAuthUserId) {
    recipients.add(employeeAuthUserId);
  }

  const managerAuthUserId = await resolveManagerAuthUserId({
    organizationId: input.organizationId,
    employeeId,
  });
  if (managerAuthUserId) {
    recipients.add(managerAuthUserId);
  }

  if (input.actorAuthUserId) {
    recipients.add(input.actorAuthUserId);
  }

  let enqueuedCount = 0;
  for (const recipientAuthUserId of recipients) {
    await notifyRecipient({
      organizationId: input.organizationId,
      recipientAuthUserId,
      kind: input.event,
      subjectType,
      subjectId,
      title: copy.title,
      body: copy.body,
    });
    enqueuedCount += 1;
  }

  return { enqueuedCount };
}

function buildNotificationCopy(input: {
  event: HrFwaNotificationEvent;
  employeeDisplayName: string;
  detail?: string;
}): { title: string; body: string } {
  const detail = input.detail ? ` ${input.detail}` : "";
  switch (input.event) {
    case "request_submitted":
      return {
        title: "Flexible work request submitted",
        body: `${input.employeeDisplayName} submitted a flexible work arrangement request.${detail}`,
      };
    case "request_approved":
      return {
        title: "Flexible work request approved",
        body: `The flexible work request for ${input.employeeDisplayName} was approved.${detail}`,
      };
    case "request_rejected":
      return {
        title: "Flexible work request rejected",
        body: `The flexible work request for ${input.employeeDisplayName} was rejected.${detail}`,
      };
    case "request_returned":
      return {
        title: "Flexible work request returned",
        body: `The flexible work request for ${input.employeeDisplayName} was returned for revision.${detail}`,
      };
    case "arrangement_expiring":
      return {
        title: "Flexible work arrangement expiring",
        body: `The arrangement for ${input.employeeDisplayName} is approaching its end date.${detail}`,
      };
    case "arrangement_renewed":
      return {
        title: "Flexible work arrangement renewed",
        body: `The arrangement for ${input.employeeDisplayName} was renewed.${detail}`,
      };
    case "arrangement_suspended":
      return {
        title: "Flexible work arrangement suspended",
        body: `The arrangement for ${input.employeeDisplayName} was suspended.${detail}`,
      };
    case "arrangement_terminated":
      return {
        title: "Flexible work arrangement terminated",
        body: `The arrangement for ${input.employeeDisplayName} was terminated.${detail}`,
      };
    case "compliance_breach":
      return {
        title: "Flexible work compliance breach",
        body: `A policy breach was detected for ${input.employeeDisplayName}.${detail}`,
      };
    case "review_due":
      return {
        title: "Flexible work review due",
        body: `A periodic manager review is due for ${input.employeeDisplayName}.${detail}`,
      };
    default:
      return {
        title: "Flexible work update",
        body: `There is an update for ${input.employeeDisplayName}.${detail}`,
      };
  }
}

/** HRM-FWA-029 — enqueue reminders for review, renewal, and expiry due items. */
export async function syncHrFwaDueLifecycleNotifications(input: {
  organizationId: string;
  asOf?: Date;
  limit?: number;
}): Promise<{ enqueuedCount: number }> {
  const dueItems = await listHrFwaArrangementsDueForLifecycleAction(input);
  let enqueuedCount = 0;

  for (const item of dueItems) {
    const event: HrFwaNotificationEvent =
      item.kind === "expired"
        ? "arrangement_expiring"
        : item.kind === "renewal_due"
          ? "arrangement_expiring"
          : "review_due";

    const result = await syncHrFwaLifecycleNotifications({
      organizationId: input.organizationId,
      event,
      arrangementId: item.arrangementId,
      employeeId: item.employeeId,
      detail: `Due ${item.dueDate.toISOString().slice(0, 10)}.`,
    });
    enqueuedCount += result.enqueuedCount;
  }

  return { enqueuedCount };
}
