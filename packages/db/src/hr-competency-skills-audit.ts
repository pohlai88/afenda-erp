import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { buildPaginatedWindow, clampPageSize } from "./hr-benefits.shared";
import { hrCsfAuditEvents } from "./hr-competency-skills";

export async function appendHrCsfAuditEventInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    action: string;
    summary?: string;
    metadata?: Record<string, unknown>;
    competencyId?: string | null;
    skillId?: string | null;
    proficiencyScaleId?: string | null;
    requirementId?: string | null;
    occurredAt?: Date;
  },
): Promise<{ auditEventId: string }> {
  const auditEventId = createEntityId("hr_csf_audit");

  await db.insert(hrCsfAuditEvents).values({
    id: auditEventId,
    organizationId: input.organizationId,
    competencyId: input.competencyId ?? null,
    skillId: input.skillId ?? null,
    proficiencyScaleId: input.proficiencyScaleId ?? null,
    requirementId: input.requirementId ?? null,
    actorUserId: input.actorUserId,
    action: input.action,
    summary: input.summary ?? null,
    metadata: input.metadata ?? null,
    occurredAt: input.occurredAt ?? new Date(),
  });

  return { auditEventId };
}

export async function listHrCsfAuditTrailWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  competencyId?: string | null;
  skillId?: string | null;
  proficiencyScaleId?: string | null;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrCsfAuditEvents.organizationId, input.organizationId),
    ];

    if (input.competencyId) {
      conditions.push(eq(hrCsfAuditEvents.competencyId, input.competencyId));
    }
    if (input.skillId) {
      conditions.push(eq(hrCsfAuditEvents.skillId, input.skillId));
    }
    if (input.proficiencyScaleId) {
      conditions.push(
        eq(hrCsfAuditEvents.proficiencyScaleId, input.proficiencyScaleId),
      );
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrCsfAuditEvents.action, pattern),
          ilike(hrCsfAuditEvents.summary, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrCsfAuditEvents)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrCsfAuditEvents.id,
        action: hrCsfAuditEvents.action,
        summary: hrCsfAuditEvents.summary,
        occurredAt: hrCsfAuditEvents.occurredAt,
        actorUserId: hrCsfAuditEvents.actorUserId,
        competencyId: hrCsfAuditEvents.competencyId,
        skillId: hrCsfAuditEvents.skillId,
        proficiencyScaleId: hrCsfAuditEvents.proficiencyScaleId,
        requirementId: hrCsfAuditEvents.requirementId,
      })
      .from(hrCsfAuditEvents)
      .where(whereClause)
      .orderBy(desc(hrCsfAuditEvents.occurredAt))
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
