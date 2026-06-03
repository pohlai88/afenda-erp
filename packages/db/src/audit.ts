import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNull,
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
import { hrDocumentAuditEvents } from "./hr";

export const auditEntityTypes = [
  "organization",
  "membership",
  "user-profile",
  "erp-record",
  "workflow-item",
  "saved-view",
  "document",
  "system",
] as const;

export type AuditEntityType = (typeof auditEntityTypes)[number];

function isAuditEntityType(value: string): value is AuditEntityType {
  return auditEntityTypes.some((entityType) => entityType === value);
}

export type TenantAuditLog = {
  id: string;
  organizationId: string;
  actorAuthUserId: string;
  actorType?: string | null;
  actorRole?: string | null;
  subjectType?: string | null;
  subjectId?: string | null;
  entityType: AuditEntityType;
  entityId: string;
  action: string;
  summary: string;
  outcome?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  targetDisplayName?: string | null;
  module?: string | null;
  surface?: string | null;
  route?: string | null;
  channel?: string | null;
  reason?: string | null;
  policyReference?: string | null;
  approvalId?: string | null;
  requestId?: string | null;
  operationId?: string | null;
  beforeJson?: Record<string, unknown> | null;
  afterJson?: Record<string, unknown> | null;
  diffJson?: Record<string, unknown>[] | null;
  metadata: Record<string, unknown>;
  occurredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

type AuditLogWriteInput = {
  organizationId: string;
  actorAuthUserId: string;
  entityType: AuditEntityType;
  entityId: string;
  action: string;
  summary: string;
  metadata: Record<string, unknown>;
  actorType?: string | null;
  actorRole?: string | null;
  subjectType?: string | null;
  subjectId?: string | null;
  outcome?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  targetDisplayName?: string | null;
  module?: string | null;
  surface?: string | null;
  route?: string | null;
  channel?: string | null;
  reason?: string | null;
  policyReference?: string | null;
  approvalId?: string | null;
  requestId?: string | null;
  operationId?: string | null;
  beforeJson?: Record<string, unknown> | null;
  afterJson?: Record<string, unknown> | null;
  diffJson?: Record<string, unknown>[] | null;
  occurredAt?: Date;
};

const auditLogSelectFields = {
  id: auditLogs.id,
  organizationId: auditLogs.organizationId,
  actorAuthUserId: auditLogs.actorAuthUserId,
  actorType: auditLogs.actorType,
  actorRole: auditLogs.actorRole,
  subjectType: auditLogs.subjectType,
  subjectId: auditLogs.subjectId,
  entityType: auditLogs.entityType,
  entityId: auditLogs.entityId,
  action: auditLogs.action,
  summary: auditLogs.summary,
  outcome: auditLogs.outcome,
  targetType: auditLogs.targetType,
  targetId: auditLogs.targetId,
  targetDisplayName: auditLogs.targetDisplayName,
  module: auditLogs.module,
  surface: auditLogs.surface,
  route: auditLogs.route,
  channel: auditLogs.channel,
  reason: auditLogs.reason,
  policyReference: auditLogs.policyReference,
  approvalId: auditLogs.approvalId,
  requestId: auditLogs.requestId,
  operationId: auditLogs.operationId,
  beforeJson: auditLogs.beforeJson,
  afterJson: auditLogs.afterJson,
  diffJson: auditLogs.diffJson,
  metadata: auditLogs.metadata,
  occurredAt: auditLogs.occurredAt,
  createdAt: auditLogs.createdAt,
  updatedAt: auditLogs.updatedAt,
} as const;

function buildAuditLogValues(input: AuditLogWriteInput) {
  return {
    id: createEntityId("audit"),
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    actorType: input.actorType ?? null,
    actorRole: input.actorRole ?? null,
    subjectType: input.subjectType ?? null,
    subjectId: input.subjectId ?? null,
    entityType: input.entityType,
    entityId: input.entityId,
    action: input.action,
    summary: input.summary,
    outcome: input.outcome ?? null,
    targetType: input.targetType ?? null,
    targetId: input.targetId ?? null,
    targetDisplayName: input.targetDisplayName ?? null,
    module: input.module ?? null,
    surface: input.surface ?? null,
    route: input.route ?? null,
    channel: input.channel ?? null,
    reason: input.reason ?? null,
    policyReference: input.policyReference ?? null,
    approvalId: input.approvalId ?? null,
    requestId: input.requestId ?? null,
    operationId: input.operationId ?? null,
    beforeJson: input.beforeJson ?? null,
    afterJson: input.afterJson ?? null,
    diffJson: input.diffJson ?? null,
    metadata: input.metadata,
    occurredAt: input.occurredAt ?? new Date(),
  };
}

export async function createAuditLog(input: AuditLogWriteInput) {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    insertAuditLog(db, input),
  );
}

export async function insertAuditLog(
  db: AfendaTransaction,
  input: AuditLogWriteInput,
) {
  await db.insert(auditLogs).values(buildAuditLogValues(input));
}

/** Unscoped audit writes for bootstrap/migration scripts only. */
export async function createAuditLogUnscoped(input: AuditLogWriteInput) {
  const db = getDb();

  await db.insert(auditLogs).values(buildAuditLogValues(input));
}

export type TenantAuditLogSearchFilters = {
  actorAuthUserId?: string;
  subjectType?: string;
  subjectId?: string;
  action?: string;
  moduleKey?: string;
  targetType?: string;
  targetId?: string;
  outcome?: string;
  surface?: string;
  route?: string;
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

  if (filters?.subjectType) {
    clauses.push(eq(auditLogs.subjectType, filters.subjectType));
  }

  if (filters?.subjectId) {
    clauses.push(eq(auditLogs.subjectId, filters.subjectId));
  }

  if (filters?.action) {
    clauses.push(ilike(auditLogs.action, `%${filters.action}%`));
  }

  if (filters?.moduleKey) {
    clauses.push(
      or(
        ilike(auditLogs.action, `${filters.moduleKey}.%`),
        eq(auditLogs.module, filters.moduleKey),
      )!,
    );
  }

  if (filters?.targetType) {
    const targetTypeClause = isAuditEntityType(filters.targetType)
      ? or(
          eq(auditLogs.targetType, filters.targetType),
          and(
            isNull(auditLogs.targetType),
            eq(auditLogs.entityType, filters.targetType),
          ),
        )
      : eq(auditLogs.targetType, filters.targetType);

    clauses.push(targetTypeClause!);
  }

  if (filters?.targetId) {
    clauses.push(
      or(
        eq(auditLogs.targetId, filters.targetId),
        and(isNull(auditLogs.targetId), eq(auditLogs.entityId, filters.targetId)),
      )!,
    );
  }

  if (filters?.outcome) {
    clauses.push(eq(auditLogs.outcome, filters.outcome));
  }

  if (filters?.surface) {
    clauses.push(eq(auditLogs.surface, filters.surface));
  }

  if (filters?.route) {
    clauses.push(eq(auditLogs.route, filters.route));
  }

  if (filters?.entityType) {
    clauses.push(eq(auditLogs.entityType, filters.entityType));
  }

  if (filters?.entityId) {
    clauses.push(eq(auditLogs.entityId, filters.entityId));
  }

  if (filters?.createdAfter) {
    clauses.push(gte(auditLogs.occurredAt, filters.createdAfter));
  }

  if (filters?.createdBefore) {
    clauses.push(lte(auditLogs.occurredAt, filters.createdBefore));
  }

  if (filters?.query) {
    const pattern = `%${filters.query}%`;
    clauses.push(
      or(
        ilike(auditLogs.action, pattern),
        ilike(auditLogs.summary, pattern),
        ilike(auditLogs.entityId, pattern),
        ilike(auditLogs.actorAuthUserId, pattern),
        ilike(auditLogs.subjectType, pattern),
        ilike(auditLogs.subjectId, pattern),
        ilike(auditLogs.targetId, pattern),
        ilike(auditLogs.targetType, pattern),
        ilike(auditLogs.targetDisplayName, pattern),
        ilike(auditLogs.module, pattern),
        ilike(auditLogs.surface, pattern),
        ilike(auditLogs.route, pattern),
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
    const where = buildAuditLogSearchWhere(input.organizationId, input.filters);

    const [rows, total] = await Promise.all([
      db
        .select(auditLogSelectFields)
        .from(auditLogs)
        .where(where)
        .orderBy(
          input.filters?.sortDirection === "asc"
            ? asc(auditLogs.occurredAt)
            : desc(auditLogs.occurredAt),
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
        lastActiveAt: max(auditLogs.occurredAt),
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
      .select(auditLogSelectFields)
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.organizationId, input.organizationId),
          eq(auditLogs.entityType, input.entityType),
          eq(auditLogs.entityId, input.entityId),
        ),
      )
      .orderBy(desc(auditLogs.occurredAt))
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
  const where = buildDocumentEvidenceWhere(input.organizationId, input.moduleId);

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
          createdAt: auditLogs.occurredAt,
        })
        .from(auditLogs)
        .where(where)
        .orderBy(desc(auditLogs.occurredAt))
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
            createdAt: auditLogs.occurredAt,
          })
          .from(auditLogs)
          .where(platformWhere)
          .orderBy(desc(auditLogs.occurredAt))
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
