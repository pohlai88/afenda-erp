import "server-only"

import { and, asc, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import { hrmFhcEvidenceLink } from "@afenda/platform/db/schema"

export type FhcEvidenceLinkRow = {
  readonly id: string
  readonly subjectKind: string
  readonly subjectId: string
  readonly documentId: string
  readonly createdAt: Date
}

export { linkFhcEvidenceDocument } from "./fhc-records.server"

export async function listFhcEvidenceLinksForSubject(input: {
  organizationId: string
  subjectKind: string
  subjectId: string
}): Promise<readonly FhcEvidenceLinkRow[]> {
  const rows = await db.query.hrmFhcEvidenceLink.findMany({
    where: and(
      eq(hrmFhcEvidenceLink.organizationId, input.organizationId),
      eq(hrmFhcEvidenceLink.subjectKind, input.subjectKind),
      eq(hrmFhcEvidenceLink.subjectId, input.subjectId)
    ),
    orderBy: [asc(hrmFhcEvidenceLink.createdAt)],
  })
  return rows.map((row) => ({
    id: row.id,
    subjectKind: row.subjectKind,
    subjectId: row.subjectId,
    documentId: row.documentId,
    createdAt: row.createdAt,
  }))
}
