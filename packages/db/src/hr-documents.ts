import { createHash } from "node:crypto";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  isNotNull,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import {
  isHrEmployeeDocumentOnLegalHold,
  isOrganizationDocumentLegalHoldActive,
} from "./document-legal-hold.server";
import { createEntityId } from "./ids";
import {
  hrDocumentAcknowledgments,
  hrDocumentAuditEvents,
  hrDocumentRequirements,
  hrDocumentRetentionPolicies,
  hrEmployeeDocuments,
  hrEmployees,
} from "./schema/hr";
import { listOrganizationsForCoreErpSeed } from "./erp";
import { listHrEmployeeDirectoryWindow } from "./hr";

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
  documentGroup: string | null;
  title: string;
  blobUrl: string;
  mimeType: string;
  sizeBytes: number;
  classification: (typeof hrEmployeeDocuments.$inferSelect)["classification"];
  verificationStatus: (typeof hrEmployeeDocuments.$inferSelect)["verificationStatus"];
  lifecycleStatus: (typeof hrEmployeeDocuments.$inferSelect)["lifecycleStatus"];
  effectiveFrom: Date;
  effectiveTo: Date | null;
  rejectionReason: string | null;
  versionNumber: number;
  isLatestActive: boolean;
  supersedesDocumentId: string | null;
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
  latestOnly?: boolean;
}): Promise<HrEmployeeDocumentWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const latestOnly = input.latestOnly ?? true;

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrEmployeeDocuments.organizationId, input.organizationId),
    ];

    if (!input.includeArchived) {
      conditions.push(eq(hrEmployeeDocuments.lifecycleStatus, "active"));
    }

    if (latestOnly) {
      conditions.push(eq(hrEmployeeDocuments.isLatestActive, true));
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
      const normalized = trimmedSearch.toLowerCase();
      const now = new Date();
      const horizon = new Date(now);
      horizon.setUTCDate(horizon.getUTCDate() + 14);

      if (normalized === "expiring") {
        conditions.push(
          and(
            isNotNull(hrEmployeeDocuments.effectiveTo),
            gte(hrEmployeeDocuments.effectiveTo, now),
            lte(hrEmployeeDocuments.effectiveTo, horizon),
          )!,
        );
      } else if (normalized === "expired") {
        conditions.push(
          and(
            isNotNull(hrEmployeeDocuments.effectiveTo),
            lte(hrEmployeeDocuments.effectiveTo, now),
          )!,
        );
      } else {
        const pattern = `%${trimmedSearch}%`;
        conditions.push(
          or(
            ilike(hrEmployeeDocuments.title, pattern),
            ilike(hrEmployeeDocuments.documentType, pattern),
            ilike(hrEmployeeDocuments.documentGroup, pattern),
            ilike(sql`${hrEmployeeDocuments.verificationStatus}::text`, pattern),
            ilike(sql`${hrEmployeeDocuments.classification}::text`, pattern),
            ilike(sql`${hrEmployeeDocuments.lifecycleStatus}::text`, pattern),
            ilike(hrEmployees.employeeNumber, pattern),
            ilike(hrEmployees.legalName, pattern),
            ilike(hrEmployees.preferredName, pattern),
          )!,
        );
      }
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
        documentGroup: hrEmployeeDocuments.documentGroup,
        title: hrEmployeeDocuments.title,
        blobUrl: hrEmployeeDocuments.blobUrl,
        mimeType: hrEmployeeDocuments.mimeType,
        sizeBytes: hrEmployeeDocuments.sizeBytes,
        classification: hrEmployeeDocuments.classification,
        verificationStatus: hrEmployeeDocuments.verificationStatus,
        lifecycleStatus: hrEmployeeDocuments.lifecycleStatus,
        effectiveFrom: hrEmployeeDocuments.effectiveFrom,
        effectiveTo: hrEmployeeDocuments.effectiveTo,
        rejectionReason: hrEmployeeDocuments.rejectionReason,
        versionNumber: hrEmployeeDocuments.versionNumber,
        isLatestActive: hrEmployeeDocuments.isLatestActive,
        supersedesDocumentId: hrEmployeeDocuments.supersedesDocumentId,
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
      documentGroup: row.documentGroup,
      title: row.title,
      blobUrl: row.blobUrl,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      classification: row.classification,
      verificationStatus: row.verificationStatus,
      lifecycleStatus: row.lifecycleStatus,
      effectiveFrom: row.effectiveFrom,
      effectiveTo: row.effectiveTo,
      rejectionReason: row.rejectionReason,
      versionNumber: row.versionNumber,
      isLatestActive: row.isLatestActive,
      supersedesDocumentId: row.supersedesDocumentId,
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
  readonly code:
    | "employee_not_found"
    | "document_not_found"
    | "document_archived"
    | "document_not_archived"
    | "document_legal_hold"
    | "invalid_replacement"
    | "sensitive_access_denied";

  constructor(code: HrDocumentCommandError["code"], message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

async function insertHrDocumentAuditEventInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    documentId?: string | null;
    employeeId?: string | null;
    action: string;
    actorUserId?: string | null;
    summary: string;
    metadata?: string | null;
  },
) {
  await db.insert(hrDocumentAuditEvents).values({
    id: createEntityId("hr_doc_audit"),
    organizationId: input.organizationId,
    documentId: input.documentId ?? null,
    employeeId: input.employeeId ?? null,
    action: input.action,
    actorUserId: input.actorUserId ?? null,
    summary: input.summary,
    metadata: input.metadata ?? null,
    occurredAt: new Date(),
  });
}

export async function registerHrEmployeeDocument(input: {
  organizationId: string;
  employeeId: string;
  documentType: string;
  title: string;
  blobUrl: string;
  pathname: string;
  mimeType: string;
  sizeBytes: number;
  classification?: (typeof hrEmployeeDocuments.$inferInsert)["classification"];
  effectiveFrom?: Date;
  effectiveTo?: Date | null;
  actorUserId?: string | null;
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
    let effectiveTo = input.effectiveTo ?? null;

    if (input.effectiveTo === undefined) {
      const policy = await resolveHrDocumentRetentionPolicyInTx(db, {
        organizationId: input.organizationId,
        documentType: input.documentType.trim(),
      });

      const retentionDays = policy?.retentionDays ?? 2555;
      effectiveTo = resolveEffectiveToFromRetentionDays(
        effectiveFrom,
        retentionDays,
      );
    }

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
      pathname: input.pathname.trim(),
      payloadHash,
      mimeType: input.mimeType.trim(),
      sizeBytes: input.sizeBytes,
      classification: input.classification ?? "internal",
      effectiveFrom,
      effectiveTo,
      versionNumber: 1,
      isLatestActive: true,
    });

    await insertHrDocumentAuditEventInTx(db, {
      organizationId: input.organizationId,
      documentId,
      employeeId: input.employeeId,
      action: "hr.document.upload",
      actorUserId: input.actorUserId ?? null,
      summary: `Uploaded document ${input.title.trim()}`,
    });

    return { documentId };
  });
}

export async function archiveHrEmployeeDocument(input: {
  organizationId: string;
  documentId: string;
  actorUserId?: string | null;
}): Promise<{ documentId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const archived = await archiveHrEmployeeDocumentInTx(db, input);

    if (!archived) {
      const [document] = await db
        .select({ lifecycleStatus: hrEmployeeDocuments.lifecycleStatus })
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

      throw new HrDocumentCommandError("document_archived");
    }

    return archived;
  });
}

export async function verifyHrEmployeeDocument(input: {
  organizationId: string;
  documentId: string;
  actorUserId?: string | null;
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

    await insertHrDocumentAuditEventInTx(db, {
      organizationId: input.organizationId,
      documentId: input.documentId,
      action: "hr.document.verify",
      actorUserId: input.actorUserId ?? null,
      summary: "Document verified",
    });

    return { documentId: input.documentId };
  });
}

export async function rejectHrEmployeeDocument(input: {
  organizationId: string;
  documentId: string;
  rejectionReason: string;
  actorUserId?: string | null;
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

    await insertHrDocumentAuditEventInTx(db, {
      organizationId: input.organizationId,
      documentId: input.documentId,
      action: "hr.document.reject",
      actorUserId: input.actorUserId ?? null,
      summary: `Document rejected: ${input.rejectionReason.trim()}`,
    });

    return { documentId: input.documentId };
  });
}

export type HrEmployeeDocumentDownloadPayload = {
  documentId: string;
  employeeId: string;
  title: string;
  blobUrl: string;
  mimeType: string;
  sizeBytes: number;
  classification: (typeof hrEmployeeDocuments.$inferSelect)["classification"];
};

export async function authorizeHrEmployeeDocumentDownload(input: {
  organizationId: string;
  documentId: string;
  actorUserId?: string | null;
  canViewSensitive: boolean;
}): Promise<HrEmployeeDocumentDownloadPayload> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [document] = await db
      .select({
        id: hrEmployeeDocuments.id,
        employeeId: hrEmployeeDocuments.employeeId,
        title: hrEmployeeDocuments.title,
        blobUrl: hrEmployeeDocuments.blobUrl,
        mimeType: hrEmployeeDocuments.mimeType,
        sizeBytes: hrEmployeeDocuments.sizeBytes,
        classification: hrEmployeeDocuments.classification,
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

    if (
      !input.canViewSensitive &&
      (document.classification === "confidential" ||
        document.classification === "restricted")
    ) {
      throw new HrDocumentCommandError("sensitive_access_denied");
    }

    await insertHrDocumentAuditEventInTx(db, {
      organizationId: input.organizationId,
      documentId: document.id,
      employeeId: document.employeeId,
      action: "hr.document.download",
      actorUserId: input.actorUserId ?? null,
      summary: `Authorized download for document ${document.title}`,
    });

    return {
      documentId: document.id,
      employeeId: document.employeeId,
      title: document.title,
      blobUrl: document.blobUrl,
      mimeType: document.mimeType,
      sizeBytes: document.sizeBytes,
      classification: document.classification,
    };
  });
}

export type HrEmployeeDocumentDownloadRecord = {
  id: string;
  title: string;
  pathname: string;
  classification: (typeof hrEmployeeDocuments.$inferSelect)["classification"];
  verificationStatus: (typeof hrEmployeeDocuments.$inferSelect)["verificationStatus"];
};

export async function getHrEmployeeDocumentForDownload(input: {
  organizationId: string;
  documentId: string;
}): Promise<HrEmployeeDocumentDownloadRecord | null> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [document] = await db
      .select({
        id: hrEmployeeDocuments.id,
        title: hrEmployeeDocuments.title,
        pathname: hrEmployeeDocuments.pathname,
        blobUrl: hrEmployeeDocuments.blobUrl,
        classification: hrEmployeeDocuments.classification,
        verificationStatus: hrEmployeeDocuments.verificationStatus,
        lifecycleStatus: hrEmployeeDocuments.lifecycleStatus,
      })
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
      return null;
    }

    const pathname =
      document.pathname?.trim() ||
      extractPathnameFromBlobUrl(document.blobUrl);

    if (!pathname) {
      return null;
    }

    return {
      id: document.id,
      title: document.title,
      pathname,
      classification: document.classification,
      verificationStatus: document.verificationStatus,
    };
  });
}

type HrDocumentRetentionPolicyRow =
  typeof hrDocumentRetentionPolicies.$inferSelect;

async function resolveHrDocumentRetentionPolicyInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    documentType: string;
    documentGroup?: string | null;
  },
): Promise<HrDocumentRetentionPolicyRow | null> {
  const documentType = input.documentType.trim();
  const documentGroup = input.documentGroup?.trim() || null;

  if (documentGroup) {
    const [typeAndGroup] = await db
      .select()
      .from(hrDocumentRetentionPolicies)
      .where(
        and(
          eq(hrDocumentRetentionPolicies.organizationId, input.organizationId),
          eq(hrDocumentRetentionPolicies.active, true),
          eq(hrDocumentRetentionPolicies.documentType, documentType),
          eq(hrDocumentRetentionPolicies.documentGroup, documentGroup),
        ),
      )
      .limit(1);

    if (typeAndGroup) {
      return typeAndGroup;
    }
  }

  const [typeOnly] = await db
    .select()
    .from(hrDocumentRetentionPolicies)
    .where(
      and(
        eq(hrDocumentRetentionPolicies.organizationId, input.organizationId),
        eq(hrDocumentRetentionPolicies.active, true),
        eq(hrDocumentRetentionPolicies.documentType, documentType),
        isNull(hrDocumentRetentionPolicies.documentGroup),
      ),
    )
    .limit(1);

  if (typeOnly) {
    return typeOnly;
  }

  const [orgDefault] = await db
    .select()
    .from(hrDocumentRetentionPolicies)
    .where(
      and(
        eq(hrDocumentRetentionPolicies.organizationId, input.organizationId),
        eq(hrDocumentRetentionPolicies.active, true),
        isNull(hrDocumentRetentionPolicies.documentType),
        isNull(hrDocumentRetentionPolicies.documentGroup),
      ),
    )
    .limit(1);

  return orgDefault ?? null;
}

function resolveEffectiveToFromRetentionDays(
  effectiveFrom: Date,
  retentionDays: number,
): Date {
  const effectiveTo = new Date(effectiveFrom);
  effectiveTo.setUTCDate(effectiveTo.getUTCDate() + Math.max(0, retentionDays));
  return effectiveTo;
}

async function archiveHrEmployeeDocumentInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    documentId: string;
    actorUserId?: string | null;
    summarySuffix?: string;
  },
): Promise<{ documentId: string } | null> {
  const [document] = await db
    .select({
      id: hrEmployeeDocuments.id,
      employeeId: hrEmployeeDocuments.employeeId,
      title: hrEmployeeDocuments.title,
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

  if (!document || document.lifecycleStatus === "archived") {
    return null;
  }

  const archivedAt = new Date();
  await db
    .update(hrEmployeeDocuments)
    .set({
      lifecycleStatus: "archived",
      archivedAt,
    })
    .where(eq(hrEmployeeDocuments.id, input.documentId));

  await insertHrDocumentAuditEventInTx(db, {
    organizationId: input.organizationId,
    documentId: input.documentId,
    employeeId: document.employeeId,
    action: "hr.document.archive",
    actorUserId: input.actorUserId ?? null,
    summary: `Archived document ${document.title}${input.summarySuffix ?? ""}`,
  });

  return { documentId: input.documentId };
}

/** Archives active employee documents when retention policy requires separation archive. */
export async function archiveHrEmployeeDocumentsOnSeparationInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
    actorUserId?: string | null;
  },
): Promise<{ archivedCount: number }> {
  const activeDocuments = await db
    .select({
      id: hrEmployeeDocuments.id,
      documentType: hrEmployeeDocuments.documentType,
      documentGroup: hrEmployeeDocuments.documentGroup,
      legalHold: hrEmployeeDocuments.legalHold,
    })
    .from(hrEmployeeDocuments)
    .where(
      and(
        eq(hrEmployeeDocuments.organizationId, input.organizationId),
        eq(hrEmployeeDocuments.employeeId, input.employeeId),
        eq(hrEmployeeDocuments.lifecycleStatus, "active"),
        eq(hrEmployeeDocuments.isLatestActive, true),
        eq(hrEmployeeDocuments.legalHold, false),
      ),
    );

  let archivedCount = 0;

  for (const document of activeDocuments) {
    const policy = await resolveHrDocumentRetentionPolicyInTx(db, {
      organizationId: input.organizationId,
      documentType: document.documentType,
      documentGroup: document.documentGroup,
    });

    if (policy && !policy.archiveOnSeparation) {
      continue;
    }

    const archived = await archiveHrEmployeeDocumentInTx(db, {
      organizationId: input.organizationId,
      documentId: document.id,
      actorUserId: input.actorUserId ?? null,
      summarySuffix: " (employee separation)",
    });

    if (archived) {
      archivedCount += 1;
    }
  }

  return { archivedCount };
}

function extractPathnameFromBlobUrl(blobUrl: string): string | null {
  try {
    const objectPath = new URL(blobUrl).pathname.replace(/^\/+/, "");
    if (objectPath.startsWith("tenants/")) {
      return objectPath;
    }
  } catch {
    return null;
  }

  return null;
}

export async function upsertHrDocumentRequirement(input: {
  organizationId: string;
  documentType: string;
  title: string;
  requiredForStatus?: (typeof hrEmployees.$inferSelect)["employmentStatus"] | null;
  graceDaysBeforeDue?: number;
  actorUserId?: string | null;
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
      await insertHrDocumentAuditEventInTx(db, {
        organizationId: input.organizationId,
        action: "hr.document.requirement.upsert",
        actorUserId: input.actorUserId ?? null,
        summary: `Updated document requirement ${input.title.trim()}`,
        metadata: JSON.stringify({ requirementId: existing.id, documentType }),
      });
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

    await insertHrDocumentAuditEventInTx(db, {
      organizationId: input.organizationId,
      action: "hr.document.requirement.upsert",
      actorUserId: input.actorUserId ?? null,
      summary: `Created document requirement ${input.title.trim()}`,
      metadata: JSON.stringify({ requirementId, documentType }),
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
    if (await isOrganizationDocumentLegalHoldActive(organization.id)) {
      continue;
    }

    await runWithOrganizationContext(organization.id, async (db) => {
      const expired = await db
        .select({
          id: hrEmployeeDocuments.id,
          employeeId: hrEmployeeDocuments.employeeId,
          title: hrEmployeeDocuments.title,
          legalHold: hrEmployeeDocuments.legalHold,
        })
        .from(hrEmployeeDocuments)
        .where(
          and(
            eq(hrEmployeeDocuments.organizationId, organization.id),
            eq(hrEmployeeDocuments.lifecycleStatus, "active"),
            eq(hrEmployeeDocuments.legalHold, false),
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
        await insertHrDocumentAuditEventInTx(db, {
          organizationId: organization.id,
          documentId: document.id,
          employeeId: document.employeeId,
          action: "hr.document.archive",
          summary: `Archived expired document ${document.title}`,
        });
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

const HR_ARCHIVED_DESTRUCTION_GRACE_DAYS = 30;

export async function listHrEmployeeDocumentsEligibleForDestruction(input: {
  organizationId: string;
  limit?: number;
  before?: Date;
}) {
  const limit = Math.min(Math.max(input.limit ?? 100, 1), 500);
  const before = input.before ?? new Date();
  const archivedBefore = new Date(before);
  archivedBefore.setUTCDate(
    archivedBefore.getUTCDate() - HR_ARCHIVED_DESTRUCTION_GRACE_DAYS,
  );

  return runWithOrganizationContext(input.organizationId, async (db) =>
    db
      .select({
        id: hrEmployeeDocuments.id,
        title: hrEmployeeDocuments.title,
        employeeId: hrEmployeeDocuments.employeeId,
        documentType: hrEmployeeDocuments.documentType,
        archivedAt: hrEmployeeDocuments.archivedAt,
      })
      .from(hrEmployeeDocuments)
      .where(
        and(
          eq(hrEmployeeDocuments.organizationId, input.organizationId),
          eq(hrEmployeeDocuments.lifecycleStatus, "archived"),
          eq(hrEmployeeDocuments.legalHold, false),
          isNotNull(hrEmployeeDocuments.archivedAt),
          lte(hrEmployeeDocuments.archivedAt, archivedBefore),
        ),
      )
      .orderBy(asc(hrEmployeeDocuments.archivedAt))
      .limit(limit),
  );
}

export async function getHrEmployeeDocumentStorageRef(input: {
  organizationId: string;
  documentId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [document] = await db
      .select({
        id: hrEmployeeDocuments.id,
        title: hrEmployeeDocuments.title,
        pathname: hrEmployeeDocuments.pathname,
        blobUrl: hrEmployeeDocuments.blobUrl,
        classification: hrEmployeeDocuments.classification,
        lifecycleStatus: hrEmployeeDocuments.lifecycleStatus,
        legalHold: hrEmployeeDocuments.legalHold,
        employeeId: hrEmployeeDocuments.employeeId,
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
      return null;
    }

    const pathname =
      document.pathname?.trim() ||
      extractPathnameFromBlobUrl(document.blobUrl);

    if (!pathname) {
      return null;
    }

    return {
      ...document,
      pathname,
    };
  });
}

export async function deleteHrEmployeeDocument(input: {
  organizationId: string;
  documentId: string;
  actorAuthUserId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [document] = await db
      .select({
        id: hrEmployeeDocuments.id,
        title: hrEmployeeDocuments.title,
        pathname: hrEmployeeDocuments.pathname,
        blobUrl: hrEmployeeDocuments.blobUrl,
        classification: hrEmployeeDocuments.classification,
        lifecycleStatus: hrEmployeeDocuments.lifecycleStatus,
        legalHold: hrEmployeeDocuments.legalHold,
        employeeId: hrEmployeeDocuments.employeeId,
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

    if (document.lifecycleStatus !== "archived") {
      throw new HrDocumentCommandError("document_not_archived");
    }

    if (
      isHrEmployeeDocumentOnLegalHold(document.legalHold) ||
      (await isOrganizationDocumentLegalHoldActive(input.organizationId))
    ) {
      throw new HrDocumentCommandError("document_legal_hold");
    }

    const pathname =
      document.pathname?.trim() ||
      extractPathnameFromBlobUrl(document.blobUrl);

    if (!pathname) {
      throw new HrDocumentCommandError("document_not_found");
    }

    await db
      .delete(hrEmployeeDocuments)
      .where(
        and(
          eq(hrEmployeeDocuments.organizationId, input.organizationId),
          eq(hrEmployeeDocuments.id, input.documentId),
        ),
      );

    await insertHrDocumentAuditEventInTx(db, {
      organizationId: input.organizationId,
      documentId: document.id,
      employeeId: document.employeeId,
      action: "hr.document.delete",
      actorUserId: input.actorAuthUserId,
      summary: `Destroyed archived document ${document.title}`,
    });

    return {
      id: document.id,
      title: document.title,
      pathname,
      blobUrl: document.blobUrl,
      classification: document.classification,
    };
  });
}

export async function applyHrEmployeeDocumentLegalHold(input: {
  organizationId: string;
  documentId: string;
  actorAuthUserId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [document] = await db
      .select({
        id: hrEmployeeDocuments.id,
        title: hrEmployeeDocuments.title,
        legalHold: hrEmployeeDocuments.legalHold,
        employeeId: hrEmployeeDocuments.employeeId,
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

    if (document.legalHold) {
      return document;
    }

    await db
      .update(hrEmployeeDocuments)
      .set({ legalHold: true })
      .where(eq(hrEmployeeDocuments.id, input.documentId));

    await insertHrDocumentAuditEventInTx(db, {
      organizationId: input.organizationId,
      documentId: document.id,
      employeeId: document.employeeId,
      action: "hr.document.legal-hold",
      actorUserId: input.actorAuthUserId,
      summary: `Applied legal hold to document ${document.title}.`,
    });

    return document;
  });
}

export async function replaceHrEmployeeDocument(input: {
  organizationId: string;
  documentId: string;
  title: string;
  blobUrl: string;
  pathname: string;
  mimeType: string;
  sizeBytes: number;
  effectiveTo?: Date | null;
  actorUserId?: string | null;
}): Promise<{ documentId: string; previousDocumentId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [existing] = await db
      .select()
      .from(hrEmployeeDocuments)
      .where(
        and(
          eq(hrEmployeeDocuments.organizationId, input.organizationId),
          eq(hrEmployeeDocuments.id, input.documentId),
          eq(hrEmployeeDocuments.lifecycleStatus, "active"),
        ),
      )
      .limit(1);

    if (!existing) {
      throw new HrDocumentCommandError("document_not_found");
    }

    const newDocumentId = createEntityId("hr_doc");
    const effectiveFrom = new Date();
    let effectiveTo = input.effectiveTo ?? existing.effectiveTo ?? null;

    if (input.effectiveTo === undefined && existing.effectiveTo == null) {
      const policy = await resolveHrDocumentRetentionPolicyInTx(db, {
        organizationId: input.organizationId,
        documentType: existing.documentType,
        documentGroup: existing.documentGroup,
      });

      effectiveTo = resolveEffectiveToFromRetentionDays(
        effectiveFrom,
        policy?.retentionDays ?? 2555,
      );
    }

    const payloadHash = hashHrDocumentPayload({
      blobUrl: input.blobUrl,
      title: input.title.trim(),
      sizeBytes: input.sizeBytes,
    });

    await db
      .update(hrEmployeeDocuments)
      .set({ isLatestActive: false })
      .where(eq(hrEmployeeDocuments.id, existing.id));

    await db.insert(hrEmployeeDocuments).values({
      id: newDocumentId,
      organizationId: existing.organizationId,
      employeeId: existing.employeeId,
      documentType: existing.documentType,
      documentGroup: existing.documentGroup,
      title: input.title.trim(),
      blobUrl: input.blobUrl.trim(),
      pathname: input.pathname.trim(),
      payloadHash,
      mimeType: input.mimeType.trim(),
      sizeBytes: input.sizeBytes,
      classification: existing.classification,
      verificationStatus: "pending",
      lifecycleStatus: "active",
      effectiveFrom,
      effectiveTo,
      supersedesDocumentId: existing.id,
      versionNumber: existing.versionNumber + 1,
      isLatestActive: true,
    });

    await insertHrDocumentAuditEventInTx(db, {
      organizationId: input.organizationId,
      documentId: newDocumentId,
      employeeId: existing.employeeId,
      action: "hr.document.replace",
      actorUserId: input.actorUserId ?? null,
      summary: `Replaced document ${existing.title} with version ${existing.versionNumber + 1}`,
      metadata: JSON.stringify({ previousDocumentId: existing.id }),
    });

    return { documentId: newDocumentId, previousDocumentId: existing.id };
  });
}

export type HrDocumentMissingMandatoryRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  documentType: string;
  requirementTitle: string;
  posture: "missing";
};

export type HrDocumentMissingMandatoryWindow = {
  rows: readonly HrDocumentMissingMandatoryRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export async function listHrDocumentMissingMandatoryWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrDocumentMissingMandatoryWindow> {
  const [requirements, employees, documents] = await Promise.all([
    listHrDocumentRequirements({ organizationId: input.organizationId }),
    listHrEmployeeDirectoryWindow({
      organizationId: input.organizationId,
      limit: HR_DOC_MAX_PAGE_SIZE,
    }),
    listHrEmployeeDocumentsWindow({
      organizationId: input.organizationId,
      limit: HR_DOC_MAX_PAGE_SIZE,
      latestOnly: true,
    }),
  ]);

  const verifiedByEmployeeType = new Set(
    documents.rows
      .filter((row) => row.verificationStatus === "verified")
      .map((row) => `${row.employeeId}:${row.documentType}`),
  );

  const activeEmployees = employees.rows.filter(
    (employee) => employee.employmentStatus === "active",
  );

  const rows: HrDocumentMissingMandatoryRow[] = [];
  for (const employee of activeEmployees) {
    for (const req of requirements) {
      if (
        req.requiredForStatus &&
        req.requiredForStatus !== employee.employmentStatus
      ) {
        continue;
      }
      const key = `${employee.id}:${req.documentType}`;
      if (verifiedByEmployeeType.has(key)) {
        continue;
      }
      rows.push({
        id: key,
        employeeId: employee.id,
        employeeNumber: employee.employeeNumber,
        employeeDisplayName: employee.displayName,
        documentType: req.documentType,
        requirementTitle: req.title,
        posture: "missing",
      });
    }
  }

  const trimmedSearch = input.search?.trim().toLowerCase();
  const filtered = trimmedSearch
    ? rows.filter(
        (row) =>
          row.employeeDisplayName.toLowerCase().includes(trimmedSearch) ||
          row.documentType.toLowerCase().includes(trimmedSearch) ||
          row.requirementTitle.toLowerCase().includes(trimmedSearch),
      )
    : rows;

  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const page = filtered.slice(offset, offset + pageSize);

  return {
    rows: page,
    pageSize,
    totalCount: filtered.length,
    hasNextPage: offset + page.length < filtered.length,
  };
}

export async function listHrDocumentAuditTrailWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrDocumentAuditEvents.organizationId, input.organizationId),
    ];
    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrDocumentAuditEvents.action, pattern),
          ilike(hrDocumentAuditEvents.summary, pattern),
          ilike(hrDocumentAuditEvents.actorUserId, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);
    const [totalRow] = await db
      .select({ total: count() })
      .from(hrDocumentAuditEvents)
      .where(whereClause);

    const rows = await db
      .select()
      .from(hrDocumentAuditEvents)
      .where(whereClause)
      .orderBy(desc(hrDocumentAuditEvents.occurredAt))
      .limit(pageSize)
      .offset(offset);

    return {
      rows,
      pageSize,
      totalCount: Number(totalRow?.total ?? 0),
      hasNextPage: offset + rows.length < Number(totalRow?.total ?? 0),
    };
  });
}

export async function upsertHrDocumentRetentionPolicy(input: {
  organizationId: string;
  documentType?: string | null;
  documentGroup?: string | null;
  retentionDays: number;
  archiveOnSeparation?: boolean;
  actorUserId?: string | null;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const documentType = input.documentType?.trim() || null;
    const documentGroup = input.documentGroup?.trim() || null;

    const [existing] = await db
      .select({ id: hrDocumentRetentionPolicies.id })
      .from(hrDocumentRetentionPolicies)
      .where(
        and(
          eq(hrDocumentRetentionPolicies.organizationId, input.organizationId),
          eq(hrDocumentRetentionPolicies.active, true),
          documentType
            ? eq(hrDocumentRetentionPolicies.documentType, documentType)
            : isNull(hrDocumentRetentionPolicies.documentType),
          documentGroup
            ? eq(hrDocumentRetentionPolicies.documentGroup, documentGroup)
            : isNull(hrDocumentRetentionPolicies.documentGroup),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(hrDocumentRetentionPolicies)
        .set({
          retentionDays: input.retentionDays,
          archiveOnSeparation: input.archiveOnSeparation ?? true,
        })
        .where(eq(hrDocumentRetentionPolicies.id, existing.id));
      await insertHrDocumentAuditEventInTx(db, {
        organizationId: input.organizationId,
        action: "hr.document.retention.upsert",
        actorUserId: input.actorUserId ?? null,
        summary: "Updated document retention policy",
        metadata: JSON.stringify({
          policyId: existing.id,
          documentType,
          documentGroup,
        }),
      });
      return { policyId: existing.id };
    }

    const policyId = createEntityId("hr_doc_ret");
    await db.insert(hrDocumentRetentionPolicies).values({
      id: policyId,
      organizationId: input.organizationId,
      documentType,
      documentGroup,
      retentionDays: input.retentionDays,
      archiveOnSeparation: input.archiveOnSeparation ?? true,
    });
    await insertHrDocumentAuditEventInTx(db, {
      organizationId: input.organizationId,
      action: "hr.document.retention.upsert",
      actorUserId: input.actorUserId ?? null,
      summary: "Created document retention policy",
      metadata: JSON.stringify({ policyId, documentType, documentGroup }),
    });
    return { policyId };
  });
}

export async function listHrDocumentRetentionPolicies(input: {
  organizationId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    db
      .select()
      .from(hrDocumentRetentionPolicies)
      .where(
        and(
          eq(hrDocumentRetentionPolicies.organizationId, input.organizationId),
          eq(hrDocumentRetentionPolicies.active, true),
        ),
      )
      .orderBy(hrDocumentRetentionPolicies.documentType),
  );
}

export async function recordHrDocumentAcknowledgment(input: {
  organizationId: string;
  employeeId: string;
  policyKey: string;
  policyVersion: string;
  acknowledgmentMethod: string;
  employeeDocumentId?: string | null;
  actorUserId?: string | null;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const id = createEntityId("hr_doc_ack");
    await db.insert(hrDocumentAcknowledgments).values({
      id,
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      employeeDocumentId: input.employeeDocumentId ?? null,
      policyKey: input.policyKey.trim(),
      policyVersion: input.policyVersion.trim(),
      acknowledgmentMethod: input.acknowledgmentMethod.trim(),
      acknowledgedAt: new Date(),
    });
    await insertHrDocumentAuditEventInTx(db, {
      organizationId: input.organizationId,
      documentId: input.employeeDocumentId ?? null,
      employeeId: input.employeeId,
      action: "hr.document.acknowledgment.record",
      actorUserId: input.actorUserId ?? null,
      summary: `Recorded acknowledgment for ${input.policyKey.trim()} ${input.policyVersion.trim()}`,
      metadata: JSON.stringify({ acknowledgmentId: id }),
    });
    return { acknowledgmentId: id };
  });
}

export async function listHrDocumentAcknowledgmentsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrDocumentAcknowledgments.organizationId, input.organizationId),
    ];
    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrDocumentAcknowledgments.policyKey, pattern),
          ilike(hrDocumentAcknowledgments.policyVersion, pattern),
          ilike(hrDocumentAcknowledgments.acknowledgmentMethod, pattern),
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);
    const [totalRow] = await db
      .select({ total: count() })
      .from(hrDocumentAcknowledgments)
      .innerJoin(
        hrEmployees,
        eq(hrDocumentAcknowledgments.employeeId, hrEmployees.id),
      )
      .where(whereClause);

    const rows = await db
      .select({
        id: hrDocumentAcknowledgments.id,
        employeeId: hrDocumentAcknowledgments.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        policyKey: hrDocumentAcknowledgments.policyKey,
        policyVersion: hrDocumentAcknowledgments.policyVersion,
        acknowledgmentMethod: hrDocumentAcknowledgments.acknowledgmentMethod,
        acknowledgedAt: hrDocumentAcknowledgments.acknowledgedAt,
      })
      .from(hrDocumentAcknowledgments)
      .innerJoin(
        hrEmployees,
        eq(hrDocumentAcknowledgments.employeeId, hrEmployees.id),
      )
      .where(whereClause)
      .orderBy(desc(hrDocumentAcknowledgments.acknowledgedAt))
      .limit(pageSize)
      .offset(offset);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName?.trim() || row.legalName,
        policyKey: row.policyKey,
        policyVersion: row.policyVersion,
        acknowledgmentMethod: row.acknowledgmentMethod,
        acknowledgedAt: row.acknowledgedAt,
      })),
      pageSize,
      totalCount: Number(totalRow?.total ?? 0),
      hasNextPage: offset + rows.length < Number(totalRow?.total ?? 0),
    };
  });
}

export async function getHrEmployeeDocumentReadiness(input: {
  organizationId: string;
  employeeId: string;
}) {
  const [documents, requirements] = await Promise.all([
    listHrEmployeeDocumentsWindow({
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      limit: HR_DOC_MAX_PAGE_SIZE,
      latestOnly: true,
    }),
    listHrDocumentRequirements({ organizationId: input.organizationId }),
  ]);

  const verifiedTypes = new Set(
    documents.rows
      .filter((row) => row.verificationStatus === "verified")
      .map((row) => row.documentType),
  );

  const missingMandatoryCount = requirements.filter(
    (req) => !verifiedTypes.has(req.documentType),
  ).length;

  return {
    employeeId: input.employeeId,
    activeDocumentCount: documents.rows.length,
    pendingVerificationCount: documents.rows.filter(
      (row) => row.verificationStatus === "pending",
    ).length,
    missingMandatoryCount,
    verifiedDocumentCount: verifiedTypes.size,
  };
}
