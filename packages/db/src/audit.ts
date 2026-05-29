import { and, count, desc, eq, gte, ilike, inArray, lte, max, or } from "drizzle-orm";
import {
  getDb,
  runWithOrganizationContext,
  type AfendaTransaction,
} from "./client";
import { createEntityId } from "./ids";
import { auditLogs } from "./schema";

export type AuditEntityType =
  | "organization"
  | "membership"
  | "user-profile"
  | "erp-record"
  | "workflow-item"
  | "saved-view"
  | "document"
  | "system";

export type TenantAuditLog = {
  id: string;
  organizationId: string;
  actorAuthUserId: string;
  entityType: AuditEntityType;
  entityId: string;
  action: string;
  summary: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

export async function createAuditLog(input: {
  organizationId: string;
  actorAuthUserId: string;
  entityType: AuditEntityType;
  entityId: string;
  action: string;
  summary: string;
  metadata: Record<string, unknown>;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    insertAuditLog(db, input),
  );
}

export async function insertAuditLog(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorAuthUserId: string;
    entityType: AuditEntityType;
    entityId: string;
    action: string;
    summary: string;
    metadata: Record<string, unknown>;
  },
) {
  await db.insert(auditLogs).values({
    id: createEntityId("audit"),
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    entityType: input.entityType,
    entityId: input.entityId,
    action: input.action,
    summary: input.summary,
    metadata: input.metadata,
  });
}

/** Unscoped audit writes for bootstrap/migration scripts only. */
export async function createAuditLogUnscoped(input: {
  organizationId: string;
  actorAuthUserId: string;
  entityType: AuditEntityType;
  entityId: string;
  action: string;
  summary: string;
  metadata: Record<string, unknown>;
}) {
  const db = getDb();

  await db.insert(auditLogs).values({
    id: createEntityId("audit"),
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    entityType: input.entityType,
    entityId: input.entityId,
    action: input.action,
    summary: input.summary,
    metadata: input.metadata,
  });
}

export type TenantAuditLogSearchFilters = {
  actorAuthUserId?: string;
  action?: string;
  moduleKey?: string;
  entityType?: AuditEntityType;
  query?: string;
  createdAfter?: Date;
  createdBefore?: Date;
};

function buildAuditLogSearchWhere(
  organizationId: string,
  filters: TenantAuditLogSearchFilters | undefined,
) {
  const clauses = [eq(auditLogs.organizationId, organizationId)];

  if (filters?.actorAuthUserId) {
    clauses.push(eq(auditLogs.actorAuthUserId, filters.actorAuthUserId));
  }

  if (filters?.action) {
    clauses.push(ilike(auditLogs.action, `%${filters.action}%`));
  }

  if (filters?.moduleKey) {
    clauses.push(ilike(auditLogs.action, `${filters.moduleKey}.%`));
  }

  if (filters?.entityType) {
    clauses.push(eq(auditLogs.entityType, filters.entityType));
  }

  if (filters?.createdAfter) {
    clauses.push(gte(auditLogs.createdAt, filters.createdAfter));
  }

  if (filters?.createdBefore) {
    clauses.push(lte(auditLogs.createdAt, filters.createdBefore));
  }

  if (filters?.query) {
    const pattern = `%${filters.query}%`;
    clauses.push(
      or(
        ilike(auditLogs.action, pattern),
        ilike(auditLogs.summary, pattern),
        ilike(auditLogs.entityId, pattern),
        ilike(auditLogs.actorAuthUserId, pattern),
      )!,
    );
  }

  return and(...clauses);
}

export async function getTenantAuditLogById(input: {
  organizationId: string;
  auditLogId: string;
}): Promise<TenantAuditLog | null> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const row = await db.query.auditLogs.findFirst({
      where: and(
        eq(auditLogs.organizationId, input.organizationId),
        eq(auditLogs.id, input.auditLogId),
      ),
    });

    return row ?? null;
  });
}

export async function searchTenantAuditLogs(input: {
  organizationId: string;
  limit: number;
  offset: number;
  filters?: TenantAuditLogSearchFilters;
}): Promise<{ rows: TenantAuditLog[]; totalCount: number }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const where = buildAuditLogSearchWhere(
      input.organizationId,
      input.filters,
    );

    const [rows, total] = await Promise.all([
      db
        .select({
          id: auditLogs.id,
          organizationId: auditLogs.organizationId,
          actorAuthUserId: auditLogs.actorAuthUserId,
          entityType: auditLogs.entityType,
          entityId: auditLogs.entityId,
          action: auditLogs.action,
          summary: auditLogs.summary,
          metadata: auditLogs.metadata,
          createdAt: auditLogs.createdAt,
          updatedAt: auditLogs.updatedAt,
        })
        .from(auditLogs)
        .where(where)
        .orderBy(desc(auditLogs.createdAt))
        .limit(input.limit)
        .offset(input.offset),
      db
        .select({ total: count() })
        .from(auditLogs)
        .where(where)
        .then((result) => Number(result[0]?.total ?? 0)),
    ]);

    return { rows, totalCount: total };
  });
}

export async function listActorLastActivityAt(input: {
  organizationId: string;
  actorAuthUserIds: readonly string[];
}) {
  if (input.actorAuthUserIds.length === 0) {
    return new Map<string, Date>();
  }

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        actorAuthUserId: auditLogs.actorAuthUserId,
        lastActiveAt: max(auditLogs.createdAt),
      })
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.organizationId, input.organizationId),
          inArray(auditLogs.actorAuthUserId, [...input.actorAuthUserIds]),
        ),
      )
      .groupBy(auditLogs.actorAuthUserId);

    const activityByActor = new Map<string, Date>();

    for (const row of rows) {
      if (row.lastActiveAt) {
        activityByActor.set(row.actorAuthUserId, row.lastActiveAt);
      }
    }

    return activityByActor;
  });
}

export async function listAuditLogsForOrganization(input: {
  organizationId: string;
  limit?: number;
}): Promise<TenantAuditLog[]> {
  const result = await searchTenantAuditLogs({
    organizationId: input.organizationId,
    limit: input.limit ?? 20,
    offset: 0,
  });

  return result.rows;
}

export async function listAuditLogsForEntity(input: {
  organizationId: string;
  entityType: AuditEntityType;
  entityId: string;
  limit?: number;
}): Promise<TenantAuditLog[]> {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    db
      .select({
        id: auditLogs.id,
        organizationId: auditLogs.organizationId,
        actorAuthUserId: auditLogs.actorAuthUserId,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        action: auditLogs.action,
        summary: auditLogs.summary,
        metadata: auditLogs.metadata,
        createdAt: auditLogs.createdAt,
        updatedAt: auditLogs.updatedAt,
      })
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.organizationId, input.organizationId),
          eq(auditLogs.entityType, input.entityType),
          eq(auditLogs.entityId, input.entityId),
        ),
      )
      .orderBy(desc(auditLogs.createdAt))
      .limit(input.limit ?? 20),
  );
}
