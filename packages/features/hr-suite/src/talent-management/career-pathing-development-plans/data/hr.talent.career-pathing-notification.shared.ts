/** HRM-CAR-025 — notification event kinds for career pathing lifecycle. */
export const HR_CAREER_PATHING_NOTIFICATION_KINDS = [
  "overdue_milestone",
  "upcoming_review",
  "completed_goal",
] as const;

export type HrCareerPathingNotificationKind =
  (typeof HR_CAREER_PATHING_NOTIFICATION_KINDS)[number];

export type HrCareerPathingNotificationRecipientRole =
  | "employee"
  | "manager"
  | "mentor"
  | "coach"
  | "hr";

export type HrCareerPathingNotificationIntent = {
  organizationId: string;
  kind: HrCareerPathingNotificationKind;
  recipientAuthUserId: string;
  recipientRole: HrCareerPathingNotificationRecipientRole;
  subjectId: string;
  subjectLabel: string;
  employeeId: string;
  employeeName: string;
  title: string;
  body: string;
  dueDate: string | null;
};

/**
 * Cron hook integration point for `@afenda/workflows`.
 * Production delivery should enqueue via org notification transport; this store
 * captures intents for audit and cron replay verification.
 */
const notificationIntents: HrCareerPathingNotificationIntent[] = [];

export function recordHrCareerPathingNotificationIntent(
  intent: HrCareerPathingNotificationIntent,
): void {
  notificationIntents.unshift(intent);
}

export function listHrCareerPathingNotificationIntents(input: {
  organizationId: string;
  limit?: number;
}): readonly HrCareerPathingNotificationIntent[] {
  const limit = Math.min(Math.max(input.limit ?? 50, 1), 200);
  return notificationIntents
    .filter((row) => row.organizationId === input.organizationId)
    .slice(0, limit);
}

export function resetHrCareerPathingNotificationIntents(): void {
  notificationIntents.length = 0;
}
