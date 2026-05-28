import "server-only"

import { after } from "next/server"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"

export function writeEngagementIamAuditAfterCommit(input: {
  readonly action: string
  readonly actorUserId: string
  readonly actorSessionId: string | null
  readonly organizationId: string
  readonly resourceType: string
  readonly resourceId: string
  readonly metadata?: Record<string, unknown>
}) {
  after(() =>
    writeIamAuditEventFromNextHeaders({
      action: input.action,
      actorUserId: input.actorUserId,
      actorSessionId: input.actorSessionId,
      organizationId: input.organizationId,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      metadata: input.metadata,
    })
  )
}
