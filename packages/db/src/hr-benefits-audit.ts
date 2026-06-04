import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { buildPaginatedWindow, clampPageSize } from "./hr-benefits.shared";
import type { HrBenefitAuditTrailWindow } from "./hr-benefits.types";
import { hrBenefitAuditEvents } from "./dbx-hr-benefits";

export async function appendHrBenefitAuditEventInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    action: string;
    summary: string;
    enrollmentId?: string | null;
    planId?: string | null;
    employeeId?: string | null;
    actorUserId?: string | null;
    metadata?: Record<string, unknown>;
    occurredAt?: Date;
  },
): Promise<{ auditEventId: string }> {
  const auditEventId = createEntityId("hr_ben_audit");
  await db.insert(hrBenefitAuditEvents).values({
    id: auditEventId,
    organizationId: input.organizationId,
    enrollmentId: input.enrollmentId ?? null,
    planId: input.planId ?? null,
    employeeId: input.employeeId ?? null,
    action: input.action,
    actorUserId: input.actorUserId ?? null,
    summary: input.summary,
    metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    occurredAt: input.occurredAt ?? new Date(),
  });
  return { auditEventId };
}

export async function listHrBenefitAuditTrailWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrBenefitAuditTrailWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrBenefitAuditEvents.organizationId, input.organizationId),
    ];

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrBenefitAuditEvents.action, pattern),
          ilike(hrBenefitAuditEvents.summary, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrBenefitAuditEvents)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrBenefitAuditEvents.id,
        action: hrBenefitAuditEvents.action,
        summary: hrBenefitAuditEvents.summary,
        occurredAt: hrBenefitAuditEvents.occurredAt,
      })
      .from(hrBenefitAuditEvents)
      .where(whereClause)
      .orderBy(desc(hrBenefitAuditEvents.occurredAt))
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

