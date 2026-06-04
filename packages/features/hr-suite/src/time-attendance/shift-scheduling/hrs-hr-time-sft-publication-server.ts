import {
  listHrShiftRosterPublicationsWindow,
  publishHrShiftRosterForPeriod,
  type HrShiftRosterPublicationWindow,
} from "@afenda/db";

import { emitHrSftAuditEvent } from "./hrs-hr-time-sft-audit-server";
import { notifyHrSftRosterPublication } from "./hrs-hr-time-sft-notification-server";
import { hrTimeSftAuditActions } from "./hr.time.sft.event";

export type { HrShiftRosterPublicationWindow };

/** List roster publication history. */
export async function listHrSftRosterPublications(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrShiftRosterPublicationWindow> {
  return listHrShiftRosterPublicationsWindow(input);
}

/** HRM-SFT-025 — publish roster for period, audit, and notify employees. */
export async function publishHrSftRoster(input: {
  organizationId: string;
  actorAuthUserId: string;
  periodStart: Date;
  periodEnd: Date;
  notes?: string | null;
}): Promise<{
  publicationId: string;
  publishedAssignmentCount: number;
  enqueuedCount: number;
}> {
  const result = await publishHrShiftRosterForPeriod({
    organizationId: input.organizationId,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    publishedByAuthUserId: input.actorAuthUserId,
    notes: input.notes,
  });

  await emitHrSftAuditEvent({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    action: hrTimeSftAuditActions.roster.published,
    storeAction: "roster_published",
    publicationId: result.publicationId,
    targetType: "hr_sft_roster_publication",
    targetId: result.publicationId,
    summary: `Roster published for ${input.periodStart.toISOString().slice(0, 10)} – ${input.periodEnd.toISOString().slice(0, 10)} (${result.publishedAssignmentCount} assignments).`,
    metadata: {
      periodStart: input.periodStart.toISOString(),
      periodEnd: input.periodEnd.toISOString(),
      publishedAssignmentCount: result.publishedAssignmentCount,
    },
  });

  const notificationResult = await notifyHrSftRosterPublication({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    publicationId: result.publicationId,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
  });

  return {
    publicationId: result.publicationId,
    publishedAssignmentCount: result.publishedAssignmentCount,
    enqueuedCount: notificationResult.enqueuedCount,
  };
}
