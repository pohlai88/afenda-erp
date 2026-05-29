import { createHash } from "node:crypto";
import { and, count, desc, eq, ilike, isNotNull, isNull, lte, or } from "drizzle-orm";
import { runWithOrganizationContext } from "./client";
import { createEntityId } from "./ids";
import {
  hrDocumentRequirements,
  hrEmployeeDocuments,
  hrEmployees,
} from "./schema/hr";
import { listOrganizationsForCoreErpSeed } from "./erp";

const HR_DOC_DEFAULT_PAGE_SIZE = 25;
const HR_DOC_MAX_PAGE_SIZE = 100;

function clampPageSize(limit: number | undefined): number {
  if (limit === undefined || !Number.isFinite(limit)) {
    return HR_DOC_DEFAULT_PAGE_SIZE;
  }
  const size = Math.floor(limit);
  if (size < 1) return HR_DOC_DEFAULT_PAGE_SIZE;
  return Math.min(size, HR_DOC_MAX_PAGE_SIZE);
}

export type HrEmployeeDocumentRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  documentType: string;
  title: string;
  mimeType: string;
  sizeBytes: number;
  classification: (typeof hrEmployeeDocuments.$inferSelect)["classification"];
  verificationStatus: (typeof hrEmployeeDocuments.$inferSelect)["verificationStatus"];
  lifecycleStatus: (typeof hrEmployeeDocuments.$inferSelect)["lifecycleStatus"];
  effectiveFrom: Date;
  effectiveTo: Date | null;
  uploadedAt: Date;
};

export type HrEmployeeDocumentWindow = {
  rows: readonly HrEmployeeDocumentRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export function hashHrDocumentPayload(input: {
  blobUrl: string;
  title: string;
  sizeBytes: number;
}): string {
  return createHash("sha256")
    .update(`${input.blobUrl}|${input.title}|${input.sizeBytes}`)
    .digest("hex");
}

export async function listHrEmployeeDocumentsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  employeeId?: string;
  documentType?: string;
  includeArchived?: boolean;
}): Promise<HrEmployeeDocumentWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrEmployeeDocuments.organizationId, input.organizationId),
    ];

    if (!input.includeArchived) {
      conditions.push(eq(hrEmployeeDocuments.lifecycleStatus, "active"));
    }

    if (input.employeeId) {
      conditions.push(eq(hrEmployeeDocuments.employeeId, input.employeeId));
    }

    if (input.documentType?.trim()) {
      conditions.push(
        eq(hrEmployeeDocuments.documentType, input.documentType.trim()),
      );
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployeeDocuments.title, pattern),
          ilike(hrEmployeeDocuments.documentType, pattern),
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrEmployeeDocuments)
      .innerJoin(
        hrEmployees,
        eq(hrEmployeeDocuments.employeeId, hrEmployees.id),
      )
      .where(whereClause);

    const actualTotal = Number(totalRow?.total ?? 0);

    const rows = await db
      .select({
        id: hrEmployeeDocuments.id,
        employeeId: hrEmployeeDocuments.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        documentType: hrEmployeeDocuments.documentType,
        title: hrEmployeeDocuments.title,
        mimeType: hrEmployeeDocuments.mimeType,
        sizeBytes: hrEmployeeDocuments.sizeBytes,
        classification: hrEmployeeDocuments.classification,
        verificationStatus: hrEmployeeDocuments.verificationStatus,
        lifecycleStatus: hrEmployeeDocuments.lifecycleStatus,
        effectiveFrom: hrEmployeeDocuments.effectiveFrom,
        effectiveTo: hrEmployeeDocuments.effectiveTo,
        uploadedAt: hrEmployeeDocuments.createdAt,
      })
      .from(hrEmployeeDocuments)
      .innerJoin(
        hrEmployees,
        eq(hrEmployeeDocuments.employeeId, hrEmployees.id),
      )
      .where(whereClause)
      .orderBy(desc(hrEmployeeDocuments.createdAt))
      .limit(pageSize)
      .offset(offset);

    const mapped: HrEmployeeDocumentRow[] = rows.map((row) => ({
      id: row.id,
      employeeId: row.employeeId,
      employeeNumber: row.employeeNumber,
      employeeDisplayName: row.preferredName?.trim() || row.legalName,
      documentType: row.documentType,
      title: row.title,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      classification: row.classification,
      verificationStatus: row.verificationStatus,
      lifecycleStatus: row.lifecycleStatus,
      effectiveFrom: row.effectiveFrom,
      effectiveTo: row.effectiveTo,
      uploadedAt: row.uploadedAt,
    }));

    return {
      rows: mapped,
      pageSize,
      totalCount: actualTotal,
      hasNextPage: offset + mapped.length < actualTotal,
    };
  });
}

export class HrDocumentCommandError extends Error {
  readonly code: "employee_not_found" | "document_not_found" | "document_archived";

  constructor(code: HrDocumentCommandError["code"], message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

export async function registerHrEmployeeDocument(input: {
  organizationId: string;
  employeeId: string;
  documentType: string;
  title: string;
  blobUrl: string;
  mimeType: string;
  sizeBytes: number;
  classification?: (typeof hrEmployeeDocuments.$inferInsert)["classification"];
  effectiveFrom?: Date;
  effectiveTo?: Date | null;
}): Promise<{ documentId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [employee] = await db
      .select({ id: hrEmployees.id })
      .from(hrEmployees)
      .where(
        and(
          eq(hrEmployees.organizationId, input.organizationId),
          eq(hrEmployees.id, input.employeeId),
          isNull(hrEmployees.archivedAt),
        ),
      )
      .limit(1);

    if (!employee) {
      throw new HrDocumentCommandError("employee_not_found");
    }

    const documentId = createEntityId("hr_doc");
    const effectiveFrom = input.effectiveFrom ?? new Date();
    const payloadHash = hashHrDocumentPayload({
      blobUrl: input.blobUrl,
      title: input.title.trim(),
      sizeBytes: input.sizeBytes,
    });

    await db.insert(hrEmployeeDocuments).values({
      id: documentId,
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      documentType: input.documentType.trim(),
      title: input.title.trim(),
      blobUrl: input.blobUrl.trim(),
      payloadHash,
      mimeType: input.mimeType.trim(),
      sizeBytes: input.sizeBytes,
      classification: input.classification ?? "internal",
      effectiveFrom,
      effectiveTo: input.effectiveTo ?? null,
    });

    return { documentId };
  });
}

export async function archiveHrEmployeeDocument(input: {
  organizationId: string;
  documentId: string;
}): Promise<{ documentId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [document] = await db
      .select({
        id: hrEmployeeDocuments.id,
        lifecycleStatus: hrEmployeeDocuments.lifecycleStatus,
      })
      .from(hrEmployeeDocuments)
      .where(
        and(
          eq(hrEmployeeDocuments.organizationId, input.organizationId),
          eq(hrEmployeeDocuments.id, input.documentId),
        ),
      )
      .limit(1);

    if (!document) {
      throw new HrDocumentCommandError("document_not_found");
    }
    if (document.lifecycleStatus === "archived") {
      throw new HrDocumentCommandError("document_archived");
    }

    const archivedAt = new Date();
    await db
      .update(hrEmployeeDocuments)
      .set({
        lifecycleStatus: "archived",
        archivedAt,
      })
      .where(eq(hrEmployeeDocuments.id, input.documentId));

    return { documentId: input.documentId };
  });
}

export async function verifyHrEmployeeDocument(input: {
  organizationId: string;
  documentId: string;
}): Promise<{ documentId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [document] = await db
      .select({ id: hrEmployeeDocuments.id })
      .from(hrEmployeeDocuments)
      .where(
        and(
          eq(hrEmployeeDocuments.organizationId, input.organizationId),
          eq(hrEmployeeDocuments.id, input.documentId),
          eq(hrEmployeeDocuments.lifecycleStatus, "active"),
        ),
      )
      .limit(1);

    if (!document) {
      throw new HrDocumentCommandError("document_not_found");
    }

    await db
      .update(hrEmployeeDocuments)
      .set({ verificationStatus: "verified" })
      .where(eq(hrEmployeeDocuments.id, input.documentId));

    return { documentId: input.documentId };
  });
}

export async function rejectHrEmployeeDocument(input: {
  organizationId: string;
  documentId: string;
  rejectionReason: string;
}): Promise<{ documentId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [document] = await db
      .select({ id: hrEmployeeDocuments.id })
      .from(hrEmployeeDocuments)
      .where(
        and(
          eq(hrEmployeeDocuments.organizationId, input.organizationId),
          eq(hrEmployeeDocuments.id, input.documentId),
          eq(hrEmployeeDocuments.lifecycleStatus, "active"),
        ),
      )
      .limit(1);

    if (!document) {
      throw new HrDocumentCommandError("document_not_found");
    }

    await db
      .update(hrEmployeeDocuments)
      .set({
        verificationStatus: "rejected",
        rejectionReason: input.rejectionReason.trim(),
      })
      .where(eq(hrEmployeeDocuments.id, input.documentId));

    return { documentId: input.documentId };
  });
}

export async function upsertHrDocumentRequirement(input: {
  organizationId: string;
  documentType: string;
  title: string;
  requiredForStatus?: (typeof hrEmployees.$inferSelect)["employmentStatus"] | null;
  graceDaysBeforeDue?: number;
}): Promise<{ requirementId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const documentType = input.documentType.trim();
    const requiredForStatus = input.requiredForStatus ?? null;

    const [existing] = await db
      .select({ id: hrDocumentRequirements.id })
      .from(hrDocumentRequirements)
      .where(
        and(
          eq(hrDocumentRequirements.organizationId, input.organizationId),
          eq(hrDocumentRequirements.documentType, documentType),
          requiredForStatus
            ? eq(hrDocumentRequirements.requiredForStatus, requiredForStatus)
            : isNull(hrDocumentRequirements.requiredForStatus),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(hrDocumentRequirements)
        .set({
          title: input.title.trim(),
          graceDaysBeforeDue: input.graceDaysBeforeDue ?? 0,
          active: true,
        })
        .where(eq(hrDocumentRequirements.id, existing.id));
      return { requirementId: existing.id };
    }

    const requirementId = createEntityId("hr_doc_req");
    await db.insert(hrDocumentRequirements).values({
      id: requirementId,
      organizationId: input.organizationId,
      documentType,
      title: input.title.trim(),
      requiredForStatus,
      graceDaysBeforeDue: input.graceDaysBeforeDue ?? 0,
    });

    return { requirementId };
  });
}

export async function listHrDocumentRequirements(input: {
  organizationId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    return db
      .select({
        id: hrDocumentRequirements.id,
        documentType: hrDocumentRequirements.documentType,
        title: hrDocumentRequirements.title,
        requiredForStatus: hrDocumentRequirements.requiredForStatus,
        graceDaysBeforeDue: hrDocumentRequirements.graceDaysBeforeDue,
      })
      .from(hrDocumentRequirements)
      .where(
        and(
          eq(hrDocumentRequirements.organizationId, input.organizationId),
          eq(hrDocumentRequirements.active, true),
        ),
      )
      .orderBy(hrDocumentRequirements.documentType);
  });
}

export async function runHrDocumentExpirySweep(input?: { withinDays?: number }) {
  const organizations = await listOrganizationsForCoreErpSeed();
  let expiredArchivedCount = 0;
  let expiringSoonCount = 0;
  const withinDays = Math.max(0, input?.withinDays ?? 30);
  const now = new Date();
  const horizon = new Date(now);
  horizon.setUTCDate(horizon.getUTCDate() + withinDays);

  for (const organization of organizations) {
    await runWithOrganizationContext(organization.id, async (db) => {
      const expired = await db
        .select({ id: hrEmployeeDocuments.id })
        .from(hrEmployeeDocuments)
        .where(
          and(
            eq(hrEmployeeDocuments.organizationId, organization.id),
            eq(hrEmployeeDocuments.lifecycleStatus, "active"),
            isNotNull(hrEmployeeDocuments.effectiveTo),
            lte(hrEmployeeDocuments.effectiveTo, now),
          ),
        );

      for (const document of expired) {
        await db
          .update(hrEmployeeDocuments)
          .set({
            lifecycleStatus: "archived",
            archivedAt: now,
          })
          .where(eq(hrEmployeeDocuments.id, document.id));
        expiredArchivedCount += 1;
      }

      const expiringSoon = await db
        .select({ id: hrEmployeeDocuments.id })
        .from(hrEmployeeDocuments)
        .where(
          and(
            eq(hrEmployeeDocuments.organizationId, organization.id),
            eq(hrEmployeeDocuments.lifecycleStatus, "active"),
            isNotNull(hrEmployeeDocuments.effectiveTo),
            lte(hrEmployeeDocuments.effectiveTo, horizon),
          ),
        );

      expiringSoonCount += expiringSoon.length;
    });
  }

  return {
    organizationCount: organizations.length,
    expiredArchivedCount,
    expiringSoonCount,
    withinDays,
  };
}
