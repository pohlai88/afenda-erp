import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { buildPaginatedWindow, clampPageSize } from "./hr-benefits.shared";
import { hrCompensationAuditEvents } from "./dbx-hr-compensation-planning";

export async function appendHrCompensationAuditEventInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    action: string;
    summary?: string;
    metadata?: Record<string, unknown>;
    cycleId?: string | null;
    recommendationId?: string | null;
    employeeId?: string | null;
    occurredAt?: Date;
  },
): Promise<{ auditEventId: string }> {
  const auditEventId = createEntityId("hr_cpm_audit");

  await db.insert(hrCompensationAuditEvents).values({
    id: auditEventId,
    organizationId: input.organizationId,
    cycleId: input.cycleId ?? null,
    recommendationId: input.recommendationId ?? null,
    employeeId: input.employeeId ?? null,
    actorUserId: input.actorUserId,
    action: input.action,
    summary: input.summary ?? null,
    metadata: input.metadata ?? null,
    occurredAt: input.occurredAt ?? new Date(),
  });

  return { auditEventId };
}

export async function listHrCompensationAuditTrailWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  cycleId?: string | null;
  recommendationId?: string | null;
  employeeId?: string | null;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrCompensationAuditEvents.organizationId, input.organizationId),
    ];

    if (input.cycleId) {
      conditions.push(eq(hrCompensationAuditEvents.cycleId, input.cycleId));
    }
    if (input.recommendationId) {
      conditions.push(
        eq(hrCompensationAuditEvents.recommendationId, input.recommendationId),
      );
    }
    if (input.employeeId) {
      conditions.push(eq(hrCompensationAuditEvents.employeeId, input.employeeId));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrCompensationAuditEvents.action, pattern),
          ilike(hrCompensationAuditEvents.summary, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrCompensationAuditEvents)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrCompensationAuditEvents.id,
        action: hrCompensationAuditEvents.action,
        summary: hrCompensationAuditEvents.summary,
        occurredAt: hrCompensationAuditEvents.occurredAt,
        actorUserId: hrCompensationAuditEvents.actorUserId,
        cycleId: hrCompensationAuditEvents.cycleId,
        recommendationId: hrCompensationAuditEvents.recommendationId,
        employeeId: hrCompensationAuditEvents.employeeId,
      })
      .from(hrCompensationAuditEvents)
      .where(whereClause)
      .orderBy(desc(hrCompensationAuditEvents.occurredAt))
      .limit(pageSize)
      .offset(offset);

    return buildPaginatedWindow({
      rows,
      pageSize,
      offset,
      totalCount: Number(totalRow?.total ?? 0),
    });
  });
}

