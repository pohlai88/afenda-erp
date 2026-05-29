import "server-only"

import { asc, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { hrmMscEvidenceLink } from "@afenda/platform/db/schema"

import { HRM_MSC_AUDIT } from "../msc.contract"
import { revalidateMscSurfaces } from "./msc-revalidate.server"

export type MscEvidenceLinkRow = {
  readonly id: string
  readonly subjectKind: string
  readonly subjectId: string
  readonly documentId: string
  readonly employeeId: string | null
  readonly createdAt: Date
}

export async function listMscEvidenceLinksForOrg(
  organizationId: string
): Promise<readonly MscEvidenceLinkRow[]> {
  const rows = await db.query.hrmMscEvidenceLink.findMany({
    where: eq(hrmMscEvidenceLink.organizationId, organizationId),
    orderBy: [asc(hrmMscEvidenceLink.createdAt)],
  })
  return rows.map((row) => ({
    id: row.id,
    subjectKind: row.subjectKind,
    subjectId: row.subjectId,
    documentId: row.documentId,
    employeeId: row.employeeId,
    createdAt: row.createdAt,
  }))
}

export async function linkMscEvidenceDocument(input: {
  organizationId: string
  userId: string
  employeeId: string | null
  subjectKind: string
  subjectId: string
  documentId: string
}): Promise<{ ok: true; linkId: string } | { ok: false; form?: string }> {
  const documentId = input.documentId.trim()
  if (!documentId) {
    return { ok: false, form: "Document ID is required." }
  }

  const linkId = crypto.randomUUID()
  await db.insert(hrmMscEvidenceLink).values({
    id: linkId,
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    subjectKind: input.subjectKind,
    subjectId: input.subjectId,
    documentId,
    createdByUserId: input.userId,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_MSC_AUDIT.evidenceLink,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "manufacturing_safety_evidence",
    resourceId: linkId,
    metadata: { documentId, subjectKind: input.subjectKind },
  })

  revalidateMscSurfaces()
  return { ok: true, linkId }
}
