import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { buildPaginatedWindow, clampPageSize } from "./hr-benefits.shared";
import { hrPayrollAuditEvents } from "./hr-payroll-processing";

export async function appendHrPayrollAuditEventInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    action: string;
    summary?: string;
    metadata?: Record<string, unknown>;
    cycleId?: string | null;
    runId?: string | null;
    employeeId?: string | null;
    occurredAt?: Date;
  },
): Promise<{ auditEventId: string }> {
  const auditEventId = createEntityId("hr_pay_audit");

  await db.insert(hrPayrollAuditEvents).values({
    id: auditEventId,
    organizationId: input.organizationId,
    cycleId: input.cycleId ?? null,
    runId: input.runId ?? null,
    employeeId: input.employeeId ?? null,
    actorUserId: input.actorUserId,
    action: input.action,
    summary: input.summary ?? null,
    metadata: input.metadata ?? null,
    occurredAt: input.occurredAt ?? new Date(),
  });

  return { auditEventId };
}

export async function listHrPayrollAuditTrailWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  cycleId?: string | null;
  runId?: string | null;
  employeeId?: string | null;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrPayrollAuditEvents.organizationId, input.organizationId),
    ];

    if (input.cycleId) {
      conditions.push(eq(hrPayrollAuditEvents.cycleId, input.cycleId));
    }
    if (input.runId) {
      conditions.push(eq(hrPayrollAuditEvents.runId, input.runId));
    }
    if (input.employeeId) {
      conditions.push(eq(hrPayrollAuditEvents.employeeId, input.employeeId));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrPayrollAuditEvents.action, pattern),
          ilike(hrPayrollAuditEvents.summary, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrPayrollAuditEvents)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrPayrollAuditEvents.id,
        action: hrPayrollAuditEvents.action,
        summary: hrPayrollAuditEvents.summary,
        occurredAt: hrPayrollAuditEvents.occurredAt,
        actorUserId: hrPayrollAuditEvents.actorUserId,
        cycleId: hrPayrollAuditEvents.cycleId,
        runId: hrPayrollAuditEvents.runId,
        employeeId: hrPayrollAuditEvents.employeeId,
      })
      .from(hrPayrollAuditEvents)
      .where(whereClause)
      .orderBy(desc(hrPayrollAuditEvents.occurredAt))
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
