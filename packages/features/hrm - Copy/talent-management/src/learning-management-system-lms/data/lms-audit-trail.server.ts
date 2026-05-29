import "server-only"

import { and, desc, eq, like } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import { iamAuditEvent } from "@afenda/platform/db/schema"
import { neonAuthUser } from "@afenda/platform/db/schema-neon-auth"
import { AUDIT_ORIGIN } from "@afenda/platform/auth/audit-origin.shared"

import { LMS_AUDIT_ACTION_PREFIX } from "../lms-audit-trail.shared"

export const LMS_AUDIT_TRAIL_LIST_LIMIT = 50 as const

export type LmsAuditTrailRow = {
  readonly id: string
  readonly createdAt: Date
  readonly action: string
  readonly actorUserId: string | null
  readonly actorEmail: string | null
  readonly resourceType: string | null
  readonly resourceId: string | null
  readonly metadataSummary: string | null
  readonly auditOrigin: string
}

function truncateMetadata(raw: string | null, max = 200): string | null {
  if (raw == null || raw.length === 0) return null
  if (raw.length <= max) return raw
  return `${raw.slice(0, max)}…`
}

export async function listLmsAuditTrailForOrg(
  organizationId: string,
  options?: { limit?: number }
): Promise<readonly LmsAuditTrailRow[]> {
  const limit = options?.limit ?? LMS_AUDIT_TRAIL_LIST_LIMIT

  const rows = await db
    .select({
      id: iamAuditEvent.id,
      createdAt: iamAuditEvent.createdAt,
      action: iamAuditEvent.action,
      actorUserId: iamAuditEvent.actorUserId,
      actorEmail: neonAuthUser.email,
      resourceType: iamAuditEvent.resourceType,
      resourceId: iamAuditEvent.resourceId,
      metadata: iamAuditEvent.metadata,
      auditOrigin: iamAuditEvent.auditOrigin,
    })
    .from(iamAuditEvent)
    .leftJoin(neonAuthUser, eq(iamAuditEvent.actorUserId, neonAuthUser.id))
    .where(
      and(
        eq(iamAuditEvent.organizationId, organizationId),
        like(iamAuditEvent.action, `${LMS_AUDIT_ACTION_PREFIX}%`),
        eq(iamAuditEvent.auditOrigin, AUDIT_ORIGIN.production)
      )
    )
    .orderBy(desc(iamAuditEvent.createdAt))
    .limit(limit)

  return rows.map((row) => ({
    id: row.id,
    createdAt: row.createdAt,
    action: row.action,
    actorUserId: row.actorUserId,
    actorEmail: row.actorEmail,
    resourceType: row.resourceType,
    resourceId: row.resourceId,
    metadataSummary: truncateMetadata(
      row.metadata == null ? null : JSON.stringify(row.metadata)
    ),
    auditOrigin: row.auditOrigin,
  }))
}
