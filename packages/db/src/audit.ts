import { and, desc, eq } from "drizzle-orm";
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

export async function listAuditLogsForOrganization(input: {
  organizationId: string;
  limit?: number;
}): Promise<TenantAuditLog[]> {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    db.query.auditLogs.findMany({
      where: eq(auditLogs.organizationId, input.organizationId),
      limit: input.limit ?? 20,
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    }),
  );
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
