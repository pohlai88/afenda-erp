import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  max,
  or,
  sql,
} from "drizzle-orm";
import {
  decodeWindowOffset,
  encodeWindowOffset,
} from "./window-pagination.shared";
import {
  getDb,
  runWithOrganizationContext,
  type AfendaTransaction,
} from "./client";
import { createEntityId } from "./ids";
import { auditLogs } from "./schema";
import { hrDocumentAuditEvents } from "./schema/hr";

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
  entityId?: string;
  query?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  sortDirection?: "asc" | "desc";
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

  if (filters?.entityId) {
    clauses.push(eq(auditLogs.entityId, filters.entityId));
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
        .orderBy(
          input.filters?.sortDirection === "asc"
            ? asc(auditLogs.createdAt)
            : desc(auditLogs.createdAt),
        )
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

export type TenantDocumentEvidenceWindowQuery = {
  cursor?: string;
};

export type TenantDocumentEvidenceWindowRow = {
  id: string;
  action: string;
  summary: string;
  actorAuthUserId: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
};

export type TenantDocumentEvidenceWindow = {
  rows: readonly TenantDocumentEvidenceWindowRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  nextCursor?: string;
};

function buildDocumentEvidenceWhere(
  organizationId: string,
  moduleId: string,
) {
  return and(
    eq(auditLogs.organizationId, organizationId),
    eq(auditLogs.entityType, "document"),
    ilike(auditLogs.action, "DOCUMENT_%"),
    sql`${auditLogs.metadata}->>'moduleId' = ${moduleId}`,
  );
}

/** Governed document activity ledger — DOCUMENT_* audit rows scoped by module. */
export async function listTenantDocumentEvidenceWindow(input: {
  organizationId: string;
  moduleId: string;
  limit?: number;
  query?: TenantDocumentEvidenceWindowQuery;
}): Promise<TenantDocumentEvidenceWindow> {
  const pageSize = input.limit ?? 8;
  const offset = decodeWindowOffset(input.query?.cursor);
  const where = buildDocumentEvidenceWhere(
    input.organizationId,
    input.moduleId,
  );

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [rows, totalRows] = await Promise.all([
      db
        .select({
          id: auditLogs.id,
          action: auditLogs.action,
          summary: auditLogs.summary,
          actorAuthUserId: auditLogs.actorAuthUserId,
          entityId: auditLogs.entityId,
          metadata: auditLogs.metadata,
          createdAt: auditLogs.createdAt,
        })
        .from(auditLogs)
        .where(where)
        .orderBy(desc(auditLogs.createdAt))
        .limit(pageSize + 1)
        .offset(offset),
      db.select({ value: count() }).from(auditLogs).where(where),
    ]);

    const visibleRows = rows.slice(0, pageSize);
    const hasNextPage = rows.length > pageSize;
    const nextCursor = hasNextPage
      ? encodeWindowOffset(offset + pageSize)
      : undefined;

    return {
      rows: visibleRows.map((row) => ({
        ...row,
        metadata: row.metadata ?? {},
      })),
      pageSize,
      totalCount: Number(totalRows[0]?.value ?? 0),
      hasNextPage,
      ...(nextCursor ? { nextCursor } : {}),
    };
  });
}

function mapHrDocumentAuditEventToEvidenceRow(row: {
  id: string;
  action: string;
  summary: string;
  actorUserId: string | null;
  documentId: string | null;
  metadata: string | null;
  occurredAt: Date;
}): TenantDocumentEvidenceWindowRow {
  let metadata: Record<string, unknown> = { moduleId: "hr", source: "hr-vault" };

  if (row.metadata) {
    try {
      metadata = {
        ...metadata,
        ...(JSON.parse(row.metadata) as Record<string, unknown>),
      };
    } catch {
      metadata = { ...metadata, rawMetadata: row.metadata };
    }
  }

  return {
    id: row.id,
    action: row.action,
    summary: row.summary,
    actorAuthUserId: row.actorUserId ?? "system",
    entityId: row.documentId ?? row.id,
    metadata,
    createdAt: row.occurredAt,
  };
}

/** Module document activity — unions platform DOCUMENT_* with HR vault audit for hr module. */
export async function listTenantModuleDocumentActivityWindow(input: {
  organizationId: string;
  moduleId: string;
  limit?: number;
  query?: TenantDocumentEvidenceWindowQuery;
}): Promise<TenantDocumentEvidenceWindow> {
  if (input.moduleId !== "hr") {
    return listTenantDocumentEvidenceWindow(input);
  }

  const pageSize = input.limit ?? 8;
  const offset = decodeWindowOffset(input.query?.cursor);
  const fetchLimit = offset + pageSize + 1;

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const platformWhere = buildDocumentEvidenceWhere(
      input.organizationId,
      input.moduleId,
    );

    const [platformRows, hrRows, platformCountRow, hrCountRow] =
      await Promise.all([
        db
          .select({
            id: auditLogs.id,
            action: auditLogs.action,
            summary: auditLogs.summary,
            actorAuthUserId: auditLogs.actorAuthUserId,
            entityId: auditLogs.entityId,
            metadata: auditLogs.metadata,
            createdAt: auditLogs.createdAt,
          })
          .from(auditLogs)
          .where(platformWhere)
          .orderBy(desc(auditLogs.createdAt))
          .limit(fetchLimit),
        db
          .select({
            id: hrDocumentAuditEvents.id,
            action: hrDocumentAuditEvents.action,
            summary: hrDocumentAuditEvents.summary,
            actorUserId: hrDocumentAuditEvents.actorUserId,
            documentId: hrDocumentAuditEvents.documentId,
            metadata: hrDocumentAuditEvents.metadata,
            occurredAt: hrDocumentAuditEvents.occurredAt,
          })
          .from(hrDocumentAuditEvents)
          .where(eq(hrDocumentAuditEvents.organizationId, input.organizationId))
          .orderBy(desc(hrDocumentAuditEvents.occurredAt))
          .limit(fetchLimit),
        db.select({ value: count() }).from(auditLogs).where(platformWhere),
        db
          .select({ value: count() })
          .from(hrDocumentAuditEvents)
          .where(eq(hrDocumentAuditEvents.organizationId, input.organizationId)),
      ]);

    const merged = [
      ...platformRows.map((row) => ({
        id: row.id,
        action: row.action,
        summary: row.summary,
        actorAuthUserId: row.actorAuthUserId,
        entityId: row.entityId,
        metadata: row.metadata ?? {},
        createdAt: row.createdAt,
      })),
      ...hrRows.map(mapHrDocumentAuditEventToEvidenceRow),
    ].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());

    const page = merged.slice(offset, offset + pageSize);
    const hasNextPage = merged.length > offset + pageSize;
    const nextCursor = hasNextPage
      ? encodeWindowOffset(offset + pageSize)
      : undefined;

    return {
      rows: page,
      pageSize,
      totalCount:
        Number(platformCountRow[0]?.value ?? 0) +
        Number(hrCountRow[0]?.value ?? 0),
      hasNextPage,
      ...(nextCursor ? { nextCursor } : {}),
    };
  });
}
