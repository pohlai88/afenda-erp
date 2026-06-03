import { and, eq } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { HrBenefitsCommandError } from "./hr-benefits.shared";
import type { HrBenefitDocumentLinkRow } from "./hr-benefits.types";
import { hrBenefitDocumentLinks } from "./hr-benefits";
import { hrEmployeeDocuments } from "./hr";

/** HRM-BEN-021 — link supporting documents by reference ID (not storage engine). */
export async function linkHrBenefitDocumentInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    recordKind: (typeof hrBenefitDocumentLinks.$inferSelect)["recordKind"];
    recordId: string;
    employeeDocumentId?: string | null;
    externalReference?: string | null;
    documentKind: string;
    notes?: string | null;
  },
): Promise<{ documentLinkId: string }> {
  if (!input.employeeDocumentId?.trim() && !input.externalReference?.trim()) {
    throw new HrBenefitsCommandError("document_not_found");
  }

  if (input.employeeDocumentId?.trim()) {
    const [document] = await db
      .select({ id: hrEmployeeDocuments.id })
      .from(hrEmployeeDocuments)
      .where(
        and(
          eq(hrEmployeeDocuments.organizationId, input.organizationId),
          eq(hrEmployeeDocuments.id, input.employeeDocumentId.trim()),
        ),
      )
      .limit(1);

    if (!document) {
      throw new HrBenefitsCommandError("document_not_found");
    }
  }

  const documentLinkId = createEntityId("hr_ben_doc");
  await db.insert(hrBenefitDocumentLinks).values({
    id: documentLinkId,
    organizationId: input.organizationId,
    recordKind: input.recordKind,
    recordId: input.recordId,
    employeeDocumentId: input.employeeDocumentId?.trim() || null,
    externalReference: input.externalReference?.trim() || null,
    documentKind: input.documentKind.trim(),
    notes: input.notes?.trim() || null,
  });

  return { documentLinkId };
}

export async function unlinkHrBenefitDocumentInTx(
  db: AfendaTransaction,
  input: { organizationId: string; documentLinkId: string },
): Promise<{ documentLinkId: string }> {
  const [link] = await db
    .select({ id: hrBenefitDocumentLinks.id })
    .from(hrBenefitDocumentLinks)
    .where(
      and(
        eq(hrBenefitDocumentLinks.organizationId, input.organizationId),
        eq(hrBenefitDocumentLinks.id, input.documentLinkId),
      ),
    )
    .limit(1);

  if (!link) {
    throw new HrBenefitsCommandError("document_link_not_found");
  }

  await db
    .delete(hrBenefitDocumentLinks)
    .where(eq(hrBenefitDocumentLinks.id, link.id));

  return { documentLinkId: link.id };
}

export async function listHrBenefitDocumentLinksByRecord(input: {
  organizationId: string;
  recordKind: (typeof hrBenefitDocumentLinks.$inferSelect)["recordKind"];
  recordId: string;
}): Promise<readonly HrBenefitDocumentLinkRow[]> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        id: hrBenefitDocumentLinks.id,
        recordKind: hrBenefitDocumentLinks.recordKind,
        recordId: hrBenefitDocumentLinks.recordId,
        employeeDocumentId: hrBenefitDocumentLinks.employeeDocumentId,
        externalReference: hrBenefitDocumentLinks.externalReference,
        documentKind: hrBenefitDocumentLinks.documentKind,
      })
      .from(hrBenefitDocumentLinks)
      .where(
        and(
          eq(hrBenefitDocumentLinks.organizationId, input.organizationId),
          eq(hrBenefitDocumentLinks.recordKind, input.recordKind),
          eq(hrBenefitDocumentLinks.recordId, input.recordId),
        ),
      );

    return rows;
  });
}
