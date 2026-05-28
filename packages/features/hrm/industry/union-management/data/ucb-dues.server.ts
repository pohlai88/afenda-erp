import "server-only"

import { and, asc, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { hrmUcbDuesReference, hrmUcbMembership } from "@afenda/platform/db/schema"

import { HRM_UCB_AUDIT } from "../ucb.contract"
import { employeeLabel } from "./ucb-db-helpers.server"
import { revalidateUcbSurfaces } from "./ucb-revalidate.server"
import type { UcbDuesReferenceRow } from "./ucb.types.shared"

export async function listUcbDuesReferencesForOrg(
  organizationId: string
): Promise<UcbDuesReferenceRow[]> {
  const rows = await db.query.hrmUcbDuesReference.findMany({
    where: eq(hrmUcbDuesReference.organizationId, organizationId),
    orderBy: [asc(hrmUcbDuesReference.approvalState)],
  })

  const result: UcbDuesReferenceRow[] = []
  for (const row of rows) {
    const membership = await db.query.hrmUcbMembership.findFirst({
      where: eq(hrmUcbMembership.id, row.membershipId),
      columns: { employeeId: true },
    })
    const label = membership
      ? await employeeLabel(organizationId, membership.employeeId)
      : null
    result.push({
      id: row.id,
      membershipId: row.membershipId,
      employeeId: membership?.employeeId ?? row.membershipId,
      employeeLabel: label ?? row.membershipId,
      amountRef: row.amountRef,
      currencyCode: row.currencyCode,
      approvalState: row.approvalState,
      effectiveFrom: row.effectiveFrom
        ? row.effectiveFrom.toISOString().slice(0, 10)
        : null,
    })
  }
  return result
}

export async function createUcbDuesReference(input: {
  organizationId: string
  userId: string
  membershipId: string
  amountRef: string
  currencyCode: string
  effectiveFrom: string | null
}): Promise<{ ok: true; duesReferenceId: string } | { ok: false; form?: string }> {
  const membership = await db.query.hrmUcbMembership.findFirst({
    where: and(
      eq(hrmUcbMembership.organizationId, input.organizationId),
      eq(hrmUcbMembership.id, input.membershipId)
    ),
    columns: { id: true },
  })
  if (!membership) return { ok: false, form: "Membership not found." }

  const id = crypto.randomUUID()
  await db.insert(hrmUcbDuesReference).values({
    id,
    organizationId: input.organizationId,
    membershipId: input.membershipId,
    amountRef: input.amountRef.trim(),
    currencyCode: input.currencyCode.trim().toUpperCase(),
    approvalState: "draft",
    effectiveFrom: input.effectiveFrom ? new Date(input.effectiveFrom) : null,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_UCB_AUDIT.duesReferenceCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_ucb_dues_reference",
    resourceId: id,
    metadata: { amountRef: input.amountRef },
  })

  revalidateUcbSurfaces()
  return { ok: true, duesReferenceId: id }
}

export async function updateUcbDuesApprovalState(input: {
  organizationId: string
  userId: string
  duesReferenceId: string
  approvalState: string
}): Promise<{ ok: true } | { ok: false; form?: string }> {
  const row = await db.query.hrmUcbDuesReference.findFirst({
    where: and(
      eq(hrmUcbDuesReference.organizationId, input.organizationId),
      eq(hrmUcbDuesReference.id, input.duesReferenceId)
    ),
    columns: { id: true },
  })
  if (!row) return { ok: false, form: "Dues reference not found." }

  await db
    .update(hrmUcbDuesReference)
    .set({
      approvalState: input.approvalState,
      payrollExportedAt:
        input.approvalState === "exported" ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(hrmUcbDuesReference.id, input.duesReferenceId))

  await writeIamAuditEventFromNextHeaders({
    action: HRM_UCB_AUDIT.duesReferenceUpdate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_ucb_dues_reference",
    resourceId: input.duesReferenceId,
    metadata: { approvalState: input.approvalState },
  })

  revalidateUcbSurfaces()
  return { ok: true }
}
