import { and, eq } from "drizzle-orm";
import { runWithOrganizationContext } from "./client";
import { createEntityId } from "./ids";
import { resolveAuthUserIdForHrEmployee } from "./hr-aat-advanced";
import { hrExpenseNotifications } from "./hr-expense";

export async function enqueueHrExpenseNotification(input: {
  organizationId: string;
  recipientAuthUserId: string;
  kind: (typeof hrExpenseNotifications.$inferInsert)["kind"];
  subjectType: string;
  subjectId: string;
  employeeId?: string | null;
  title: string;
  body: string;
}): Promise<{ notificationId: string; created: boolean }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [existing] = await db
      .select({ id: hrExpenseNotifications.id })
      .from(hrExpenseNotifications)
      .where(
        and(
          eq(hrExpenseNotifications.organizationId, input.organizationId),
          eq(
            hrExpenseNotifications.recipientAuthUserId,
            input.recipientAuthUserId,
          ),
          eq(hrExpenseNotifications.kind, input.kind),
          eq(hrExpenseNotifications.subjectType, input.subjectType),
          eq(hrExpenseNotifications.subjectId, input.subjectId),
        ),
      )
      .limit(1);

    if (existing) {
      return { notificationId: existing.id, created: false };
    }

    const notificationId = createEntityId("hr_exp_notif");
    await db.insert(hrExpenseNotifications).values({
      id: notificationId,
      organizationId: input.organizationId,
      recipientAuthUserId: input.recipientAuthUserId,
      kind: input.kind,
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      employeeId: input.employeeId ?? null,
      title: input.title,
      body: input.body,
    });

    return { notificationId, created: true };
  });
}

export async function notifyHrExpenseClaimEvent(input: {
  organizationId: string;
  kind: (typeof hrExpenseNotifications.$inferInsert)["kind"];
  subjectType: string;
  subjectId: string;
  employeeId: string;
  title: string;
  body: string;
  additionalRecipientAuthUserIds?: readonly string[];
}): Promise<{ enqueuedCount: number }> {
  const recipientIds = new Set<string>();

  const employeeAuthUserId = await resolveAuthUserIdForHrEmployee({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
  });

  if (employeeAuthUserId) {
    recipientIds.add(employeeAuthUserId);
  }

  for (const authUserId of input.additionalRecipientAuthUserIds ?? []) {
    recipientIds.add(authUserId);
  }

  let enqueuedCount = 0;

  for (const recipientAuthUserId of recipientIds) {
    const result = await enqueueHrExpenseNotification({
      organizationId: input.organizationId,
      recipientAuthUserId,
      kind: input.kind,
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      employeeId: input.employeeId,
      title: input.title,
      body: input.body,
    });

    if (result.created) {
      enqueuedCount += 1;
    }
  }

  return { enqueuedCount };
}
