import { and, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";

import { createEntityId } from "./ids";
import { runWithOrganizationContext } from "./client";
import {
  hrAatAnalyticsSnapshots,
  hrAatNotifications,
  hrEmployees,
  organizationMemberships,
  userProfiles,
} from "./schema";

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

function clampPageSize(limit: number | undefined): number {
  if (!limit || limit < 1) {
    return DEFAULT_PAGE_SIZE;
  }
  return Math.min(limit, MAX_PAGE_SIZE);
}

export type HrAatAnalyticsSnapshotRow = {
  id: string;
  periodKind: string;
  periodStart: Date;
  periodEnd: Date;
  dimension: string;
  generatedByAuthUserId: string;
  createdAt: Date;
  totalsSummary: string;
};

export type HrAatNotificationRow = {
  id: string;
  recipientAuthUserId: string;
  recipientRole: string;
  kind: string;
  subjectType: string;
  subjectId: string;
  employeeId: string | null;
  riskLevel: string;
  title: string;
  body: string;
  readAt: Date | null;
  createdAt: Date;
};

function summarizeSnapshotPayload(payload: Record<string, unknown>): string {
  const totals = payload.totals;
  if (
    totals &&
    typeof totals === "object" &&
    "absenceRatePercent" in totals &&
    "employeeCount" in totals
  ) {
    const rate = (totals as { absenceRatePercent: number }).absenceRatePercent;
    const employees = (totals as { employeeCount: number }).employeeCount;
    return `${rate}% absence rate · ${employees} employees`;
  }
  return "Analytics snapshot";
}

/** HRM-AAT-028 — persist historical analytics snapshot (idempotent per period+dimension). */
export async function persistHrAatAnalyticsSnapshot(input: {
  organizationId: string;
  periodKind: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  periodStart: Date;
  periodEnd: Date;
  dimension: string;
  snapshotPayload: Record<string, unknown>;
  generatedByAuthUserId: string;
}): Promise<{ snapshotId: string; created: boolean }> {
  const snapshotId = createEntityId("hr_aat_snap");

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [existing] = await db
      .select({ id: hrAatAnalyticsSnapshots.id })
      .from(hrAatAnalyticsSnapshots)
      .where(
        and(
          eq(hrAatAnalyticsSnapshots.organizationId, input.organizationId),
          eq(hrAatAnalyticsSnapshots.periodKind, input.periodKind),
          eq(hrAatAnalyticsSnapshots.periodStart, input.periodStart),
          eq(hrAatAnalyticsSnapshots.periodEnd, input.periodEnd),
          eq(hrAatAnalyticsSnapshots.dimension, input.dimension),
        ),
      )
      .limit(1);

    if (existing) {
      return { snapshotId: existing.id, created: false };
    }

    await db.insert(hrAatAnalyticsSnapshots).values({
      id: snapshotId,
      organizationId: input.organizationId,
      periodKind: input.periodKind,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      dimension: input.dimension,
      snapshotPayload: input.snapshotPayload,
      generatedByAuthUserId: input.generatedByAuthUserId,
    });

    return { snapshotId, created: true };
  });
}

export async function listHrAatAnalyticsSnapshotsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<{
  rows: readonly HrAatAnalyticsSnapshotRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
}> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrAatAnalyticsSnapshots.organizationId, input.organizationId),
    ];

    if (input.search?.trim()) {
      const pattern = `%${input.search.trim()}%`;
      conditions.push(
        or(
          ilike(hrAatAnalyticsSnapshots.dimension, pattern),
          ilike(hrAatAnalyticsSnapshots.periodKind, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrAatAnalyticsSnapshots)
      .where(whereClause);

    const rows = await db
      .select()
      .from(hrAatAnalyticsSnapshots)
      .where(whereClause)
      .orderBy(desc(hrAatAnalyticsSnapshots.periodStart))
      .limit(pageSize)
      .offset(offset);

    const totalCount = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        periodKind: row.periodKind,
        periodStart: row.periodStart,
        periodEnd: row.periodEnd,
        dimension: row.dimension,
        generatedByAuthUserId: row.generatedByAuthUserId,
        createdAt: row.createdAt,
        totalsSummary: summarizeSnapshotPayload(row.snapshotPayload),
      })),
      pageSize,
      totalCount,
      hasNextPage: offset + rows.length < totalCount,
    };
  });
}

/** Resolve auth user id for an employee via normalized work email. */
export async function resolveAuthUserIdForHrEmployee(input: {
  organizationId: string;
  employeeId: string;
}): Promise<string | null> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [employee] = await db
      .select({ email: hrEmployees.email })
      .from(hrEmployees)
      .where(
        and(
          eq(hrEmployees.organizationId, input.organizationId),
          eq(hrEmployees.id, input.employeeId),
        ),
      )
      .limit(1);

    const normalizedEmail = employee?.email?.trim().toLowerCase();
    if (!normalizedEmail) {
      return null;
    }

    const [membership] = await db
      .select({ authUserId: organizationMemberships.authUserId })
      .from(organizationMemberships)
      .innerJoin(
        userProfiles,
        eq(organizationMemberships.authUserId, userProfiles.authUserId),
      )
      .where(
        and(
          eq(organizationMemberships.organizationId, input.organizationId),
          eq(organizationMemberships.status, "active"),
          sql`lower(${userProfiles.email}) = ${normalizedEmail}`,
        ),
      )
      .limit(1);

    return membership?.authUserId ?? null;
  });
}

/** Owner/admin memberships — treated as HR operators for AAT-027. */
export async function listHrAatHrOperatorAuthUserIds(input: {
  organizationId: string;
}): Promise<readonly string[]> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({ authUserId: organizationMemberships.authUserId })
      .from(organizationMemberships)
      .where(
        and(
          eq(organizationMemberships.organizationId, input.organizationId),
          eq(organizationMemberships.status, "active"),
          inArray(organizationMemberships.role, ["owner", "admin"]),
        ),
      );

    return [...new Set(rows.map((row) => row.authUserId))];
  });
}

/** HRM-AAT-027 — enqueue absence risk notification (deduped by subject). */
export async function enqueueHrAatNotification(input: {
  organizationId: string;
  recipientAuthUserId: string;
  recipientRole: "hr" | "manager";
  kind: (typeof hrAatNotifications.$inferInsert)["kind"];
  subjectType: string;
  subjectId: string;
  employeeId?: string | null;
  riskLevel: (typeof hrAatNotifications.$inferInsert)["riskLevel"];
  title: string;
  body: string;
}): Promise<{ notificationId: string; created: boolean }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [existing] = await db
      .select({ id: hrAatNotifications.id })
      .from(hrAatNotifications)
      .where(
        and(
          eq(hrAatNotifications.organizationId, input.organizationId),
          eq(
            hrAatNotifications.recipientAuthUserId,
            input.recipientAuthUserId,
          ),
          eq(hrAatNotifications.kind, input.kind),
          eq(hrAatNotifications.subjectType, input.subjectType),
          eq(hrAatNotifications.subjectId, input.subjectId),
        ),
      )
      .limit(1);

    if (existing) {
      return { notificationId: existing.id, created: false };
    }

    const notificationId = createEntityId("hr_aat_ntf");
    await db.insert(hrAatNotifications).values({
      id: notificationId,
      organizationId: input.organizationId,
      recipientAuthUserId: input.recipientAuthUserId,
      recipientRole: input.recipientRole,
      kind: input.kind,
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      employeeId: input.employeeId ?? null,
      riskLevel: input.riskLevel,
      title: input.title.trim(),
      body: input.body.trim(),
    });

    return { notificationId, created: true };
  });
}

export async function listHrAatNotificationsWindow(input: {
  organizationId: string;
  recipientAuthUserId?: string;
  limit?: number;
  offset?: number;
  search?: string;
  unreadOnly?: boolean;
}): Promise<{
  rows: readonly HrAatNotificationRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
}> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrAatNotifications.organizationId, input.organizationId),
    ];

    if (input.recipientAuthUserId) {
      conditions.push(
        eq(hrAatNotifications.recipientAuthUserId, input.recipientAuthUserId),
      );
    }
    if (input.unreadOnly) {
      conditions.push(sql`${hrAatNotifications.readAt} IS NULL`);
    }
    if (input.search?.trim()) {
      const pattern = `%${input.search.trim()}%`;
      conditions.push(
        or(
          ilike(hrAatNotifications.title, pattern),
          ilike(hrAatNotifications.body, pattern),
          ilike(hrAatNotifications.riskLevel, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrAatNotifications)
      .where(whereClause);

    const rows = await db
      .select()
      .from(hrAatNotifications)
      .where(whereClause)
      .orderBy(desc(hrAatNotifications.createdAt))
      .limit(pageSize)
      .offset(offset);

    const totalCount = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        recipientAuthUserId: row.recipientAuthUserId,
        recipientRole: row.recipientRole,
        kind: row.kind,
        subjectType: row.subjectType,
        subjectId: row.subjectId,
        employeeId: row.employeeId,
        riskLevel: row.riskLevel,
        title: row.title,
        body: row.body,
        readAt: row.readAt,
        createdAt: row.createdAt,
      })),
      pageSize,
      totalCount,
      hasNextPage: offset + rows.length < totalCount,
    };
  });
}
