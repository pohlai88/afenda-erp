import {
  persistHrAatAnalyticsSnapshot,
  listHrAatAnalyticsSnapshotsWindow,
  type HrAatAnalyticsSnapshotRow,
} from "@afenda/db";

import type { HrAatAnalyticsSnapshot } from "./hr.time.aat-analytics.schema";
import type { HrAatAnalyticsPeriodKind } from "./hr.time.aat-analytics.schema";
import { emitHrAatAuditEvent } from "./hrs-hr-time-aat-audit-server";
import { hrTimeAatAuditActions } from "./hr.time.aat.event";

export type { HrAatAnalyticsSnapshotRow };

export type HrAatAnalyticsSnapshotWindow = Awaited<
  ReturnType<typeof listHrAatAnalyticsSnapshotsWindow>
>;

/** HRM-AAT-028 — persist analytics snapshot by period (idempotent). */
export async function persistHrAatAnalyticsSnapshotFromResult(input: {
  organizationId: string;
  periodKind: HrAatAnalyticsPeriodKind;
  snapshot: HrAatAnalyticsSnapshot;
  generatedByAuthUserId: string;
}): Promise<{ snapshotId: string; created: boolean }> {
  const result = await persistHrAatAnalyticsSnapshot({
    organizationId: input.organizationId,
    periodKind: input.periodKind,
    periodStart: input.snapshot.periodStart,
    periodEnd: input.snapshot.periodEnd,
    dimension: input.snapshot.dimension,
    snapshotPayload: input.snapshot as unknown as Record<string, unknown>,
    generatedByAuthUserId: input.generatedByAuthUserId,
  });

  if (result.created) {
    await emitHrAatAuditEvent({
      organizationId: input.organizationId,
      actorAuthUserId: input.generatedByAuthUserId,
      action: hrTimeAatAuditActions.analytics.snapshotPersisted,
      targetType: "hr_aat_snapshot",
      targetId: result.snapshotId,
      summary: `Absence analytics snapshot persisted for ${input.snapshot.dimension}.`,
      metadata: {
        periodKind: input.periodKind,
        periodStart: input.snapshot.periodStart.toISOString(),
        periodEnd: input.snapshot.periodEnd.toISOString(),
        dimension: input.snapshot.dimension,
      },
    });
  }

  return result;
}

/** HRM-AAT-028 — list preserved historical snapshots. */
export async function listHrAatAnalyticsSnapshots(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrAatAnalyticsSnapshotWindow> {
  return listHrAatAnalyticsSnapshotsWindow(input);
}

export async function recordHrAatAnalyticsGeneration(input: {
  organizationId: string;
  actorAuthUserId: string;
  dimension: string;
  periodStart: Date;
  periodEnd: Date;
  employeeCount: number;
  absenceRatePercent: number;
}): Promise<void> {
  await emitHrAatAuditEvent({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    action: hrTimeAatAuditActions.analytics.generated,
    targetType: "hr_aat_analytics",
    targetId: input.organizationId,
    summary: `Absence analytics generated for ${input.dimension}.`,
    metadata: {
      dimension: input.dimension,
      periodStart: input.periodStart.toISOString(),
      periodEnd: input.periodEnd.toISOString(),
      employeeCount: input.employeeCount,
      absenceRatePercent: input.absenceRatePercent,
    },
  });
}
