import "server-only"

import {
  getOrganizationContext,
  type OrganizationSummary,
  type UserSession,
} from "@afenda/auth"

/**
 * HRM org session shape — intentionally flat for ergonomic destructuring
 * in actions and server components.
 */
export type OrgSession = {
  readonly organizationId: string
  readonly userId: string
  readonly orgSlug: string
  readonly organization: OrganizationSummary
  readonly session: UserSession
}

/**
 * Resolves the active organization from the current request session.
 * Redirects to /sign-in or /onboarding when the session is invalid.
 *
 * Use in server components and server actions that need org-scoped authority.
 */
export async function requireOrgSession(): Promise<OrgSession> {
  const ctx = await getOrganizationContext()
  return {
    organizationId: ctx.organization.id,
    userId: ctx.session.id,
    orgSlug: ctx.organization.slug,
    organization: ctx.organization,
    session: ctx.session,
  }
}

/**
 * Alias of `requireOrgSession` — preferred in route pages that read
 * both `organizationId` and `userId` in a single destructure.
 */
export const getOrgTenantContext = requireOrgSession

/**
 * Writes an IAM audit event using request headers for context.
 * No-ops gracefully when the audit infrastructure is not configured.
 */
export async function writeIamAuditEventFromNextHeaders(options: {
  organizationId: string
  userId: string
  action: string
  resourceType?: string
  resourceId?: string
  outcome?: "success" | "failure"
  metadata?: Record<string, unknown>
}): Promise<void> {
  // Lazy import to keep this shim client-graph-free.
  try {
    const { createAuditLog } = await import("@afenda/db")
    await createAuditLog({
      organizationId: options.organizationId,
      userId: options.userId,
      action: options.action,
      entityType: options.resourceType ?? "system",
      entityId: options.resourceId ?? options.organizationId,
      metadata: {
        outcome: options.outcome ?? "success",
        ...(options.metadata ?? {}),
      },
    })
  } catch {
    // Audit failures must never block operations — log and continue.
  }
}
