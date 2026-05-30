import { and, count, eq, ilike, inArray, isNull, or, sql } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { buildWorkAuthLinkedEvidenceCountSelect } from "./hr-compliance-evidence-links";
import {
  buildPaginatedWindow,
  buildWorkAuthDocumentExpiredSearchCondition,
  buildWorkAuthDocumentExpiringSearchCondition,
  buildWorkAuthDocumentFlaggedFirstOrderBy,
  buildWorkAuthDocumentMissingSearchCondition,
  formatHrEmployeeDisplayName,
  HR_COMPLIANCE_WORK_AUTH_DOCUMENT_TYPES,
  normalizeWorkAuthDocumentStatus,
  parseEffectiveWorkAuthDocumentStatusSearchToken,
  resolveWorkAuthDocumentVerifiedAt,
} from "./hr-compliance.shared";
import { activeEmployeeFilters, clampPageSize } from "./hr-compliance.internal";
import { HrComplianceCommandError } from "./hr-compliance.types";
import type { HrWorkAuthorizationDocumentWindow } from "./hr-compliance.types";
import {
  hrComplianceWorkAuthorizationDocuments,
  hrEmployees,
} from "./schema/hr";

function normalizeWorkAuthDocumentTypeSearch(search: string): string {
  return search.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

async function reconcileEvidenceMissingWorkAuthDocumentsInTx(
  db: AfendaTransaction,
  organizationId: string,
): Promise<number> {
  const staleRows = await db
    .select({ id: hrComplianceWorkAuthorizationDocuments.id })
    .from(hrComplianceWorkAuthorizationDocuments)
    .innerJoin(
      hrEmployees,
      eq(hrComplianceWorkAuthorizationDocuments.employeeId, hrEmployees.id),
    )
    .where(
      and(
        eq(hrComplianceWorkAuthorizationDocuments.organizationId, organizationId),
        activeEmployeeFilters(organizationId),
        inArray(hrComplianceWorkAuthorizationDocuments.status, [
          "pending_verification",
          "verified",
        ]),
        or(
          isNull(hrComplianceWorkAuthorizationDocuments.documentNumber),
          eq(sql`btrim(${hrComplianceWorkAuthorizationDocuments.documentNumber})`, ""),
        ),
      ),
    );

  if (staleRows.length === 0) {
    return 0;
  }

  const staleIds = staleRows.map((row) => row.id);
  await db
    .update(hrComplianceWorkAuthorizationDocuments)
    .set({
      status: "missing",
      verifiedAt: null,
    })
    .where(
      and(
        eq(hrComplianceWorkAuthorizationDocuments.organizationId, organizationId),
        inArray(hrComplianceWorkAuthorizationDocuments.id, staleIds),
      ),
    );

  return staleRows.length;
}

export async function ensureHrWorkAuthorizationDocumentsInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
  },
): Promise<{
  createdCount: number;
  reconciledCount: number;
  totalTracked: number;
}> {
  const [employees, trackedRows] = await Promise.all([
    db
      .select({ id: hrEmployees.id })
      .from(hrEmployees)
      .where(activeEmployeeFilters(input.organizationId)),
    db
      .select({
        employeeId: hrComplianceWorkAuthorizationDocuments.employeeId,
        documentType: hrComplianceWorkAuthorizationDocuments.documentType,
      })
      .from(hrComplianceWorkAuthorizationDocuments)
      .where(
        eq(
          hrComplianceWorkAuthorizationDocuments.organizationId,
          input.organizationId,
        ),
      ),
  ]);

  const trackedKeys = new Set(
    trackedRows.map((row) => `${row.employeeId}:${row.documentType}`),
  );

  const inserts: (typeof hrComplianceWorkAuthorizationDocuments.$inferInsert)[] =
    [];
  for (const employee of employees) {
    for (const documentType of HR_COMPLIANCE_WORK_AUTH_DOCUMENT_TYPES) {
      const key = `${employee.id}:${documentType}`;
      if (!trackedKeys.has(key)) {
        inserts.push({
          id: createEntityId("hr_cmp_wad"),
          organizationId: input.organizationId,
          employeeId: employee.id,
          documentType,
          status: "missing",
        });
      }
    }
  }

  if (inserts.length > 0) {
    await db.insert(hrComplianceWorkAuthorizationDocuments).values(inserts);
  }

  const reconciledCount = await reconcileEvidenceMissingWorkAuthDocumentsInTx(
    db,
    input.organizationId,
  );

  return {
    createdCount: inserts.length,
    reconciledCount,
    totalTracked: employees.length * HR_COMPLIANCE_WORK_AUTH_DOCUMENT_TYPES.length,
  };
}

export async function ensureHrWorkAuthorizationDocuments(input: {
  organizationId: string;
}): Promise<{
  createdCount: number;
  reconciledCount: number;
  totalTracked: number;
}> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    ensureHrWorkAuthorizationDocumentsInTx(db, input),
  );
}

export async function listHrWorkAuthorizationDocumentsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  documentType?: (typeof hrComplianceWorkAuthorizationDocuments.$inferSelect)["documentType"];
  status?: (typeof hrComplianceWorkAuthorizationDocuments.$inferSelect)["status"];
}): Promise<HrWorkAuthorizationDocumentWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(
        hrComplianceWorkAuthorizationDocuments.organizationId,
        input.organizationId,
      ),
      activeEmployeeFilters(input.organizationId),
    ];

    if (input.documentType) {
      conditions.push(
        eq(
          hrComplianceWorkAuthorizationDocuments.documentType,
          input.documentType,
        ),
      );
    }

    if (input.status) {
      conditions.push(
        eq(hrComplianceWorkAuthorizationDocuments.status, input.status),
      );
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const derivedStatusToken =
        parseEffectiveWorkAuthDocumentStatusSearchToken(trimmedSearch);
      if (derivedStatusToken === "missing") {
        conditions.push(
          buildWorkAuthDocumentMissingSearchCondition({
            statusColumn: hrComplianceWorkAuthorizationDocuments.status,
            documentNumberColumn: hrComplianceWorkAuthorizationDocuments.documentNumber,
          }),
        );
      } else if (derivedStatusToken === "expired") {
        conditions.push(
          buildWorkAuthDocumentExpiredSearchCondition({
            statusColumn: hrComplianceWorkAuthorizationDocuments.status,
            documentNumberColumn: hrComplianceWorkAuthorizationDocuments.documentNumber,
            expiresAtColumn: hrComplianceWorkAuthorizationDocuments.expiresAt,
          }),
        );
      } else if (derivedStatusToken === "expiring") {
        conditions.push(
          buildWorkAuthDocumentExpiringSearchCondition({
            statusColumn: hrComplianceWorkAuthorizationDocuments.status,
            documentNumberColumn: hrComplianceWorkAuthorizationDocuments.documentNumber,
            expiresAtColumn: hrComplianceWorkAuthorizationDocuments.expiresAt,
          }),
        );
      } else {
        const pattern = `%${trimmedSearch}%`;
        const documentTypePattern = `%${normalizeWorkAuthDocumentTypeSearch(trimmedSearch)}%`;
        conditions.push(
          or(
            ilike(hrEmployees.employeeNumber, pattern),
            ilike(hrEmployees.legalName, pattern),
            ilike(hrEmployees.preferredName, pattern),
            ilike(hrComplianceWorkAuthorizationDocuments.documentNumber, pattern),
            ilike(
              sql`${hrComplianceWorkAuthorizationDocuments.documentType}::text`,
              documentTypePattern,
            ),
            ilike(
              sql`${hrComplianceWorkAuthorizationDocuments.status}::text`,
              pattern,
            ),
          )!,
        );
      }
    }

    const whereClause = and(...conditions);

    const [totalRow, rows] = await Promise.all([
      db
        .select({ total: count() })
        .from(hrComplianceWorkAuthorizationDocuments)
        .innerJoin(
          hrEmployees,
          eq(hrComplianceWorkAuthorizationDocuments.employeeId, hrEmployees.id),
        )
        .where(whereClause),
      db
        .select({
          id: hrComplianceWorkAuthorizationDocuments.id,
          employeeId: hrComplianceWorkAuthorizationDocuments.employeeId,
          employeeNumber: hrEmployees.employeeNumber,
          legalName: hrEmployees.legalName,
          preferredName: hrEmployees.preferredName,
          documentType: hrComplianceWorkAuthorizationDocuments.documentType,
          status: hrComplianceWorkAuthorizationDocuments.status,
          documentNumber: hrComplianceWorkAuthorizationDocuments.documentNumber,
          issuedAt: hrComplianceWorkAuthorizationDocuments.issuedAt,
          expiresAt: hrComplianceWorkAuthorizationDocuments.expiresAt,
          verifiedAt: hrComplianceWorkAuthorizationDocuments.verifiedAt,
          reviewNotes: hrComplianceWorkAuthorizationDocuments.reviewNotes,
          linkedEvidenceCount: buildWorkAuthLinkedEvidenceCountSelect(input.organizationId),
        })
        .from(hrComplianceWorkAuthorizationDocuments)
        .innerJoin(
          hrEmployees,
          eq(hrComplianceWorkAuthorizationDocuments.employeeId, hrEmployees.id),
        )
        .where(whereClause)
        .orderBy(
          ...buildWorkAuthDocumentFlaggedFirstOrderBy({
            statusColumn: hrComplianceWorkAuthorizationDocuments.status,
            documentNumberColumn: hrComplianceWorkAuthorizationDocuments.documentNumber,
            expiresAtColumn: hrComplianceWorkAuthorizationDocuments.expiresAt,
            updatedAtColumn: hrComplianceWorkAuthorizationDocuments.updatedAt,
          }),
        )
        .limit(pageSize)
        .offset(offset),
    ]);

    const actualTotal = Number(totalRow[0]?.total ?? 0);

    return buildPaginatedWindow({
      rows: rows.map((row) => ({
        id: row.id,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: formatHrEmployeeDisplayName({
          preferredName: row.preferredName,
          legalName: row.legalName,
        }),
        documentType: row.documentType,
        status: row.status,
        documentNumber: row.documentNumber,
        issuedAt: row.issuedAt,
        expiresAt: row.expiresAt,
        verifiedAt: row.verifiedAt,
        reviewNotes: row.reviewNotes,
        linkedEvidenceCount: Number(row.linkedEvidenceCount ?? 0),
      })),
      pageSize,
      offset,
      totalCount: actualTotal,
    });
  });
}

export async function updateHrWorkAuthorizationDocumentInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    workAuthDocumentId: string;
    status: (typeof hrComplianceWorkAuthorizationDocuments.$inferSelect)["status"];
    documentNumber?: string | null;
    issuedAt?: Date | null;
    verifiedAt?: Date | null;
    expiresAt?: Date | null;
    reviewNotes?: string | null;
  },
): Promise<{ workAuthDocumentId: string; status: (typeof hrComplianceWorkAuthorizationDocuments.$inferSelect)["status"] }> {
  const [record] = await db
    .select({
      id: hrComplianceWorkAuthorizationDocuments.id,
      status: hrComplianceWorkAuthorizationDocuments.status,
      verifiedAt: hrComplianceWorkAuthorizationDocuments.verifiedAt,
    })
    .from(hrComplianceWorkAuthorizationDocuments)
    .innerJoin(
      hrEmployees,
      eq(hrComplianceWorkAuthorizationDocuments.employeeId, hrEmployees.id),
    )
    .where(
      and(
        eq(
          hrComplianceWorkAuthorizationDocuments.organizationId,
          input.organizationId,
        ),
        eq(hrComplianceWorkAuthorizationDocuments.id, input.workAuthDocumentId),
        activeEmployeeFilters(input.organizationId),
      ),
    )
    .limit(1);

  if (!record) {
    throw new HrComplianceCommandError("work_auth_document_not_found");
  }

  const documentNumber = input.documentNumber?.trim() || null;
  const status = normalizeWorkAuthDocumentStatus({
    status: input.status,
    documentNumber,
  });

  const verifiedAt = resolveWorkAuthDocumentVerifiedAt({
    status,
    verifiedAt: input.verifiedAt,
    existingVerifiedAt: record.verifiedAt,
  });

  await db
    .update(hrComplianceWorkAuthorizationDocuments)
    .set({
      status,
      documentNumber,
      issuedAt: input.issuedAt ?? null,
      verifiedAt,
      expiresAt: input.expiresAt ?? null,
      reviewNotes: input.reviewNotes?.trim() || null,
    })
    .where(
      and(
        eq(
          hrComplianceWorkAuthorizationDocuments.organizationId,
          input.organizationId,
        ),
        eq(hrComplianceWorkAuthorizationDocuments.id, input.workAuthDocumentId),
      ),
    );

  return { workAuthDocumentId: input.workAuthDocumentId, status };
}

export async function updateHrWorkAuthorizationDocument(input: {
  organizationId: string;
  workAuthDocumentId: string;
  status: (typeof hrComplianceWorkAuthorizationDocuments.$inferSelect)["status"];
  documentNumber?: string | null;
  issuedAt?: Date | null;
  verifiedAt?: Date | null;
  expiresAt?: Date | null;
  reviewNotes?: string | null;
}): Promise<{ workAuthDocumentId: string; status: (typeof hrComplianceWorkAuthorizationDocuments.$inferSelect)["status"] }> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    updateHrWorkAuthorizationDocumentInTx(db, input),
  );
}
