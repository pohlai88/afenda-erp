import {
  getHrFwaArrangementById,
  listHrFwaArrangementsDueForLifecycleAction,
  recordHrFwaManagerPeriodicReview,
  renewHrFwaArrangement,
  type HrFwaArrangementRow,
} from "@afenda/db";

import { emitHrFwaAuditTrailEvent } from "./hr.time.fwa-audit-trail.server";
import { syncHrFwaLifecycleNotifications } from "./hr.time.fwa-notifications.server";

export type HrFwaLifecycleDueItem = Awaited<
  ReturnType<typeof listHrFwaArrangementsDueForLifecycleAction>
>[number];

/** HRM-FWA-028 — arrangements due for review, renewal, or expiry handling. */
export async function listHrFwaLifecycleDueItems(input: {
  organizationId: string;
  asOf?: Date;
  limit?: number;
}): Promise<readonly HrFwaLifecycleDueItem[]> {
  return listHrFwaArrangementsDueForLifecycleAction(input);
}

/** HRM-FWA-028 — manager completes periodic review and schedules the next cycle. */
export async function completeHrFwaManagerPeriodicReview(input: {
  organizationId: string;
  arrangementId: string;
  actorAuthUserId: string;
  reviewNote?: string | null;
}): Promise<{ arrangementId: string; nextReviewDate: Date }> {
  const result = await recordHrFwaManagerPeriodicReview(input);

  await emitHrFwaAuditTrailEvent({
    organizationId: input.organizationId,
    arrangementId: input.arrangementId,
    employeeId: (
      await getHrFwaArrangementById({
        organizationId: input.organizationId,
        arrangementId: input.arrangementId,
      })
    ).employeeId,
    actorAuthUserId: input.actorAuthUserId,
    action: "schedule_updated",
    summary: input.reviewNote?.trim() || "Periodic manager review completed",
    metadata: { nextReviewDate: result.nextReviewDate.toISOString() },
  });

  return result;
}

/** HRM-FWA-028 — renew arrangement end date and refresh lifecycle reminders. */
export async function renewHrFwaArrangementWithReview(input: {
  organizationId: string;
  arrangementId: string;
  actorAuthUserId: string;
  newEffectiveTo: Date;
  renewalReason?: string | null;
}): Promise<{ arrangementId: string }> {
  const renewed = await renewHrFwaArrangement(input);

  await syncHrFwaLifecycleNotifications({
    organizationId: input.organizationId,
    arrangementId: input.arrangementId,
    event: "arrangement_renewed",
    actorAuthUserId: input.actorAuthUserId,
  });

  return renewed;
}

export function describeHrFwaArrangementLifecycle(row: HrFwaArrangementRow): {
  expiryLabel: string;
  reviewLabel: string;
  renewalLabel: string;
} {
  return {
    expiryLabel: row.effectiveTo
      ? row.effectiveTo.toISOString().slice(0, 10)
      : "Open-ended",
    reviewLabel: row.reviewDate
      ? row.reviewDate.toISOString().slice(0, 10)
      : "Not scheduled",
    renewalLabel: row.renewalDate
      ? row.renewalDate.toISOString().slice(0, 10)
      : "Not scheduled",
  };
}
