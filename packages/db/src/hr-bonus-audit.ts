import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { clampPageSize } from "./hr-benefits.shared";
import type { HrBonusAuditTrailWindow } from "./hr-bonus.types";
import { hrBonusPayoutAuditEvents } from "./dbx-hr-bonus";

export async function appendHrBonusPayoutAuditEventInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    action: string;
    summary: string;
    payoutId?: string | null;
    planId?: string | null;
    cycleId?: string | null;
    employeeId?: string | null;
    actorUserId?: string | null;
    metadata?: Record<string, unknown>;
    occurredAt?: Date;
  },
): Promise<{ auditEventId: string }> {
  const auditEventId = createEntityId("hr_bon_audit");
  await db.insert(hrBonusPayoutAuditEvents).values({
    id: auditEventId,
    organizationId: input.organizationId,
    payoutId: input.payoutId ?? null,
    planId: input.planId ?? null,
    cycleId: input.cycleId ?? null,
    employeeId: input.employeeId ?? null,
    action: input.action,
    actorUserId: input.actorUserId ?? null,
    summary: input.summary,
    metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    occurredAt: input.occurredAt ?? new Date(),
  });
  return { auditEventId };
}

export async function listHrBonusPayoutAuditTrailWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrBonusAuditTrailWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrBonusPayoutAuditEvents.organizationId, input.organizationId),
    ];

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrBonusPayoutAuditEvents.action, pattern),
          ilike(hrBonusPayoutAuditEvents.summary, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrBonusPayoutAuditEvents)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrBonusPayoutAuditEvents.id,
        action: hrBonusPayoutAuditEvents.action,
        summary: hrBonusPayoutAuditEvents.summary,
        occurredAt: hrBonusPayoutAuditEvents.occurredAt,
      })
      .from(hrBonusPayoutAuditEvents)
      .where(whereClause)
      .orderBy(desc(hrBonusPayoutAuditEvents.occurredAt))
      .limit(pageSize)
      .offset(offset);

    return {
      rows,
      total: Number(totalRow?.total ?? 0),
      limit: pageSize,
      offset,
    };
  });
}

