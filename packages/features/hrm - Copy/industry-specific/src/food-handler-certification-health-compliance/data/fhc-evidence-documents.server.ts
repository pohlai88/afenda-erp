import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import { hrmDocument } from "@afenda/platform/db/schema"

import {
  listHrmDocumentsForEmployee,
  hrmDocumentTypeLabelKey,
  isHrmDocumentType,
  type HrmDocumentType,
} from "@afenda/feature-hrm-employee-management/server"

export type FhcEvidenceDocumentChoice = {
  readonly id: string
  readonly title: string
  readonly documentType: HrmDocumentType
  readonly documentTypeLabelKey: `documentTypes.${HrmDocumentType}`
}

export async function listFhcEvidenceDocumentChoicesForEmployee(input: {
  organizationId: string
  employeeId: string
}): Promise<readonly FhcEvidenceDocumentChoice[]> {
  const documents: readonly {
    readonly id: string
    readonly title: string
    readonly documentType: unknown
  }[] = await listHrmDocumentsForEmployee(
    input.organizationId,
    input.employeeId
  )
  return documents.flatMap((doc) => {
    if (
      typeof doc.documentType !== "string" ||
      !isHrmDocumentType(doc.documentType)
    ) {
      return []
    }
    const documentType = doc.documentType as HrmDocumentType
    return [
      {
        id: doc.id,
        title: doc.title,
        documentType,
        documentTypeLabelKey: hrmDocumentTypeLabelKey(documentType),
      },
    ]
  })
}

export async function assertFhcEvidenceDocumentForEmployee(input: {
  organizationId: string
  employeeId: string
  documentId: string
}): Promise<{ ok: true } | { ok: false; form: string }> {
  const documentId = input.documentId.trim()
  if (!documentId) {
    return { ok: false, form: "Select a document from Document Management." }
  }

  const [row] = await db
    .select({ id: hrmDocument.id })
    .from(hrmDocument)
    .where(
      and(
        eq(hrmDocument.id, documentId),
        eq(hrmDocument.organizationId, input.organizationId),
        eq(hrmDocument.employeeId, input.employeeId),
        eq(hrmDocument.isLatestVersion, true)
      )
    )
    .limit(1)

  if (!row) {
    return {
      ok: false,
      form: "Document was not found for this employee in Document Management.",
    }
  }

  return { ok: true }
}
