import { and, eq, inArray, ne } from "drizzle-orm";

import { createAuditLog } from "./audit";
import { runWithOrganizationContext } from "./client";
import { erpDocuments } from "./schema";
import { hrEmployeeDocuments } from "./hr";
import { retentionPolicies } from "./schema";

const DOCUMENT_LEGAL_HOLD_ENTITY_TYPES = [
  "document",
  "organization",
] as const;

/** True when org retention policy blocks document destruction sweeps and deletes. */
export async function isOrganizationDocumentLegalHoldActive(
  organizationId: string,
): Promise<boolean> {
  return runWithOrganizationContext(organizationId, async (db) => {
    const rows = await db
      .select({ legalHold: retentionPolicies.legalHold })
      .from(retentionPolicies)
      .where(
        and(
          eq(retentionPolicies.organizationId, organizationId),
          inArray(retentionPolicies.entityType, [
            ...DOCUMENT_LEGAL_HOLD_ENTITY_TYPES,
          ]),
          eq(retentionPolicies.legalHold, true),
        ),
      )
      .limit(1);

    return rows.length > 0;
  });
}

export function isErpDocumentRowOnLegalHold(retentionClass: string): boolean {
  return retentionClass === "legal-hold";
}

export function isHrEmployeeDocumentOnLegalHold(legalHold: boolean): boolean {
  return legalHold;
}

/** Marks all ERP and HR registry rows when org policy legal hold activates. */
export async function cascadeOrganizationLegalHoldToDocuments(input: {
  organizationId: string;
  actorAuthUserId: string;
}): Promise<{ erpUpdatedCount: number; hrUpdatedCount: number }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const erpRows = await db
      .update(erpDocuments)
      .set({
        retentionClass: "legal-hold",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(erpDocuments.organizationId, input.organizationId),
          ne(erpDocuments.retentionClass, "legal-hold"),
        ),
      )
      .returning({ id: erpDocuments.id });

    const hrRows = await db
      .update(hrEmployeeDocuments)
      .set({
        legalHold: true,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(hrEmployeeDocuments.organizationId, input.organizationId),
          eq(hrEmployeeDocuments.legalHold, false),
        ),
      )
      .returning({ id: hrEmployeeDocuments.id });

    if (erpRows.length > 0 || hrRows.length > 0) {
      await createAuditLog({
        organizationId: input.organizationId,
        actorAuthUserId: input.actorAuthUserId,
        entityType: "organization",
        entityId: input.organizationId,
        action: "tenant.document.legal-hold-cascaded",
        summary: "Organization legal hold cascaded to document registries.",
        metadata: {
          erpUpdatedCount: erpRows.length,
          hrUpdatedCount: hrRows.length,
        },
      });
    }

    return {
      erpUpdatedCount: erpRows.length,
      hrUpdatedCount: hrRows.length,
    };
  });
}
