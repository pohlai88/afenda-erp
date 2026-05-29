import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import {
  type HrComplianceEvidenceRecordKind,
  type HrComplianceEvidenceSubmissionState,
  isHrComplianceEvidenceRecordKind,
  isHrComplianceEvidenceSubmissionState,
} from "./hr-compliance-evidence-links.shared";
import { buildPaginatedWindow, formatHrEmployeeDisplayName } from "./hr-compliance.shared";
import { clampPageSize } from "./hr-compliance.internal";
import { HrComplianceCommandError } from "./hr-compliance.types";
import type { HrComplianceEvidenceLinkWindow } from "./hr-compliance.types";
import {
  hrComplianceEmployeeRequirements,
  hrComplianceEvidenceLinks,
  hrComplianceExceptions,
  hrComplianceFilings,
  hrComplianceObligations,
  hrComplianceWorkAuthorizationDocuments,
  hrComplianceWorkEligibility,
  hrEmployeeDocuments,
  hrEmployees,
} from "./schema/hr";

type ResolvedComplianceEvidenceRecord = {
  recordLabel: string;
  employeeId: string | null;
};

async function resolveComplianceEvidenceRecordInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    recordKind: HrComplianceEvidenceRecordKind;
    recordId: string;
  },
): Promise<ResolvedComplianceEvidenceRecord> {
  const { organizationId, recordKind, recordId } = input;

  if (recordKind === "filing") {
    const [row] = await db
      .select({
        obligationCode: hrComplianceObligations.code,
        obligationTitle: hrComplianceObligations.title,
      })
      .from(hrComplianceFilings)
      .innerJoin(
        hrComplianceObligations,
        eq(hrComplianceFilings.obligationId, hrComplianceObligations.id),
      )
      .where(
        and(
          eq(hrComplianceFilings.organizationId, organizationId),
          eq(hrComplianceFilings.id, recordId),
        ),
      )
      .limit(1);

    if (!row) {
      throw new HrComplianceCommandError("evidence_source_not_found");
    }

    return {
      recordLabel: `${row.obligationCode} — ${row.obligationTitle}`,
      employeeId: null,
    };
  }

  if (recordKind === "employee_requirement") {
    const [row] = await db
      .select({
        employeeId: hrComplianceEmployeeRequirements.employeeId,
        obligationCode: hrComplianceObligations.code,
        obligationTitle: hrComplianceObligations.title,
      })
      .from(hrComplianceEmployeeRequirements)
      .innerJoin(
        hrComplianceObligations,
        eq(
          hrComplianceEmployeeRequirements.obligationId,
          hrComplianceObligations.id,
        ),
      )
      .where(
        and(
          eq(hrComplianceEmployeeRequirements.organizationId, organizationId),
          eq(hrComplianceEmployeeRequirements.id, recordId),
        ),
      )
      .limit(1);

    if (!row) {
      throw new HrComplianceCommandError("evidence_source_not_found");
    }

    return {
      recordLabel: `${row.obligationCode} — ${row.obligationTitle}`,
      employeeId: row.employeeId,
    };
  }

  if (recordKind === "work_auth_document") {
    const [row] = await db
      .select({
        employeeId: hrComplianceWorkAuthorizationDocuments.employeeId,
        documentType: hrComplianceWorkAuthorizationDocuments.documentType,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
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
            organizationId,
          ),
          eq(hrComplianceWorkAuthorizationDocuments.id, recordId),
        ),
      )
      .limit(1);

    if (!row) {
      throw new HrComplianceCommandError("evidence_source_not_found");
    }

    const employeeLabel = formatHrEmployeeDisplayName({
      legalName: row.legalName,
      preferredName: row.preferredName,
    });

    return {
      recordLabel: `${employeeLabel} — ${row.documentType.replace(/_/g, " ")}`,
      employeeId: row.employeeId,
    };
  }

  if (recordKind === "work_eligibility") {
    const [row] = await db
      .select({
        employeeId: hrComplianceWorkEligibility.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
      })
      .from(hrComplianceWorkEligibility)
      .innerJoin(
        hrEmployees,
        eq(hrComplianceWorkEligibility.employeeId, hrEmployees.id),
      )
      .where(
        and(
          eq(hrComplianceWorkEligibility.organizationId, organizationId),
          eq(hrComplianceWorkEligibility.id, recordId),
        ),
      )
      .limit(1);

    if (!row) {
      throw new HrComplianceCommandError("evidence_source_not_found");
    }

    return {
      recordLabel: `${formatHrEmployeeDisplayName({
        legalName: row.legalName,
        preferredName: row.preferredName,
      })} — work eligibility`,
      employeeId: row.employeeId,
    };
  }

  const [row] = await db
    .select({
      employeeId: hrComplianceExceptions.employeeId,
      title: hrComplianceExceptions.title,
    })
    .from(hrComplianceExceptions)
    .where(
      and(
        eq(hrComplianceExceptions.organizationId, organizationId),
        eq(hrComplianceExceptions.id, recordId),
      ),
    )
    .limit(1);

  if (!row) {
    throw new HrComplianceCommandError("evidence_source_not_found");
  }

  return {
    recordLabel: row.title,
    employeeId: row.employeeId,
  };
}

async function loadActiveEmployeeDocumentInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeDocumentId: string;
  },
) {
  const [document] = await db
    .select({
      id: hrEmployeeDocuments.id,
      employeeId: hrEmployeeDocuments.employeeId,
      lifecycleStatus: hrEmployeeDocuments.lifecycleStatus,
      classification: hrEmployeeDocuments.classification,
    })
    .from(hrEmployeeDocuments)
    .where(
      and(
        eq(hrEmployeeDocuments.organizationId, input.organizationId),
        eq(hrEmployeeDocuments.id, input.employeeDocumentId),
      ),
    )
    .limit(1);

  if (!document) {
    throw new HrComplianceCommandError("evidence_document_not_found");
  }
  if (document.lifecycleStatus !== "active") {
    throw new HrComplianceCommandError("evidence_document_not_found");
  }

  return document;
}

export async function loadHrEmployeeDocumentClassificationInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeDocumentId: string;
  },
): Promise<string | null> {
  const document = await loadActiveEmployeeDocumentInTx(db, input);
  return document.classification;
}

export async function loadHrComplianceEvidenceLinkAccessScopeInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    evidenceLinkId: string;
  },
): Promise<{
  recordKind: HrComplianceEvidenceRecordKind;
  documentClassification: string;
} | null> {
  const [row] = await db
    .select({
      recordKind: hrComplianceEvidenceLinks.recordKind,
      documentClassification: hrEmployeeDocuments.classification,
    })
    .from(hrComplianceEvidenceLinks)
    .innerJoin(
      hrEmployeeDocuments,
      eq(
        hrComplianceEvidenceLinks.employeeDocumentId,
        hrEmployeeDocuments.id,
      ),
    )
    .where(
      and(
        eq(hrComplianceEvidenceLinks.organizationId, input.organizationId),
        eq(hrComplianceEvidenceLinks.id, input.evidenceLinkId.trim()),
      ),
    )
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    recordKind: row.recordKind,
    documentClassification: row.documentClassification,
  };
}

export async function listHrComplianceEvidenceLinksWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  recordKind?: HrComplianceEvidenceRecordKind;
  recordId?: string;
  submissionState?: HrComplianceEvidenceSubmissionState;
}): Promise<HrComplianceEvidenceLinkWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrComplianceEvidenceLinks.organizationId, input.organizationId),
    ];

    if (input.recordKind) {
      conditions.push(eq(hrComplianceEvidenceLinks.recordKind, input.recordKind));
    }

    if (input.recordId) {
      conditions.push(eq(hrComplianceEvidenceLinks.recordId, input.recordId.trim()));
    }

    if (input.submissionState) {
      conditions.push(
        eq(hrComplianceEvidenceLinks.submissionState, input.submissionState),
      );
    }

    conditions.push(eq(hrEmployeeDocuments.lifecycleStatus, "active"));

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrComplianceEvidenceLinks.recordLabel, pattern),
          ilike(sql`${hrComplianceEvidenceLinks.recordKind}::text`, pattern),
          ilike(
            sql`${hrComplianceEvidenceLinks.submissionState}::text`,
            pattern,
          ),
          ilike(hrEmployeeDocuments.title, pattern),
          ilike(hrEmployeeDocuments.documentType, pattern),
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrComplianceEvidenceLinks)
      .innerJoin(
        hrEmployeeDocuments,
        eq(
          hrComplianceEvidenceLinks.employeeDocumentId,
          hrEmployeeDocuments.id,
        ),
      )
      .leftJoin(
        hrEmployees,
        eq(hrComplianceEvidenceLinks.employeeId, hrEmployees.id),
      )
      .where(whereClause);

    const rows = await db
      .select({
        id: hrComplianceEvidenceLinks.id,
        recordKind: hrComplianceEvidenceLinks.recordKind,
        recordId: hrComplianceEvidenceLinks.recordId,
        recordLabel: hrComplianceEvidenceLinks.recordLabel,
        employeeId: hrComplianceEvidenceLinks.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        employeeDocumentId: hrComplianceEvidenceLinks.employeeDocumentId,
        documentTitle: hrEmployeeDocuments.title,
        documentType: hrEmployeeDocuments.documentType,
        documentClassification: hrEmployeeDocuments.classification,
        submissionState: hrComplianceEvidenceLinks.submissionState,
        notes: hrComplianceEvidenceLinks.notes,
        submittedAt: hrComplianceEvidenceLinks.submittedAt,
        acknowledgedAt: hrComplianceEvidenceLinks.acknowledgedAt,
        createdAt: hrComplianceEvidenceLinks.createdAt,
      })
      .from(hrComplianceEvidenceLinks)
      .innerJoin(
        hrEmployeeDocuments,
        eq(
          hrComplianceEvidenceLinks.employeeDocumentId,
          hrEmployeeDocuments.id,
        ),
      )
      .leftJoin(
        hrEmployees,
        eq(hrComplianceEvidenceLinks.employeeId, hrEmployees.id),
      )
      .where(whereClause)
      .orderBy(desc(hrComplianceEvidenceLinks.createdAt))
      .limit(pageSize)
      .offset(offset);

    return buildPaginatedWindow({
      offset,
      rows: rows.map((row) => ({
        id: row.id,
        recordKind: row.recordKind,
        recordId: row.recordId,
        recordLabel: row.recordLabel,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName:
          row.employeeNumber === null
            ? null
            : formatHrEmployeeDisplayName({
                legalName: row.legalName,
                preferredName: row.preferredName,
              }),
        employeeDocumentId: row.employeeDocumentId,
        documentTitle: row.documentTitle,
        documentType: row.documentType,
        documentClassification: row.documentClassification,
        submissionState: row.submissionState,
        notes: row.notes,
        submittedAt: row.submittedAt,
        acknowledgedAt: row.acknowledgedAt,
        createdAt: row.createdAt,
      })),
      pageSize,
      totalCount: Number(totalRow?.total ?? 0),
    });
  });
}

export async function linkHrComplianceEvidenceInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    recordKind: string;
    recordId: string;
    employeeDocumentId: string;
    notes?: string | null;
  },
): Promise<{ evidenceLinkId: string }> {
  if (!isHrComplianceEvidenceRecordKind(input.recordKind)) {
    throw new HrComplianceCommandError("invalid_evidence_record_kind");
  }

  const record = await resolveComplianceEvidenceRecordInTx(db, {
    organizationId: input.organizationId,
    recordKind: input.recordKind,
    recordId: input.recordId.trim(),
  });

  const document = await loadActiveEmployeeDocumentInTx(db, {
    organizationId: input.organizationId,
    employeeDocumentId: input.employeeDocumentId.trim(),
  });

  if (
    record.employeeId &&
    record.employeeId !== document.employeeId
  ) {
    throw new HrComplianceCommandError("evidence_document_employee_mismatch");
  }

  const existing = await db
    .select({ id: hrComplianceEvidenceLinks.id })
    .from(hrComplianceEvidenceLinks)
    .where(
      and(
        eq(hrComplianceEvidenceLinks.organizationId, input.organizationId),
        eq(hrComplianceEvidenceLinks.recordKind, input.recordKind),
        eq(hrComplianceEvidenceLinks.recordId, input.recordId.trim()),
        eq(
          hrComplianceEvidenceLinks.employeeDocumentId,
          document.id,
        ),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    throw new HrComplianceCommandError("evidence_link_already_exists");
  }

  const evidenceLinkId = createEntityId("hr_cmp_ev");
  await db.insert(hrComplianceEvidenceLinks).values({
    id: evidenceLinkId,
    organizationId: input.organizationId,
    recordKind: input.recordKind,
    recordId: input.recordId.trim(),
    recordLabel: record.recordLabel,
    employeeId: document.employeeId,
    employeeDocumentId: document.id,
    submissionState: "draft",
    notes: input.notes?.trim() || null,
  });

  return { evidenceLinkId };
}

export async function linkHrComplianceEvidence(input: {
  organizationId: string;
  recordKind: string;
  recordId: string;
  employeeDocumentId: string;
  notes?: string | null;
}): Promise<{ evidenceLinkId: string }> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    linkHrComplianceEvidenceInTx(db, input),
  );
}

export async function updateHrComplianceEvidenceSubmissionStateInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    evidenceLinkId: string;
    submissionState: string;
    notes?: string | null;
  },
): Promise<{ evidenceLinkId: string }> {
  if (!isHrComplianceEvidenceSubmissionState(input.submissionState)) {
    throw new HrComplianceCommandError("invalid_evidence_submission_state");
  }

  const [link] = await db
    .select({
      id: hrComplianceEvidenceLinks.id,
      submissionState: hrComplianceEvidenceLinks.submissionState,
    })
    .from(hrComplianceEvidenceLinks)
    .where(
      and(
        eq(hrComplianceEvidenceLinks.organizationId, input.organizationId),
        eq(hrComplianceEvidenceLinks.id, input.evidenceLinkId.trim()),
      ),
    )
    .limit(1);

  if (!link) {
    throw new HrComplianceCommandError("evidence_link_not_found");
  }

  const now = new Date();
  const patch: Partial<typeof hrComplianceEvidenceLinks.$inferInsert> = {
    submissionState: input.submissionState,
    notes:
      input.notes === undefined
        ? undefined
        : input.notes?.trim() || null,
  };

  if (input.submissionState === "submitted" && link.submissionState === "draft") {
    patch.submittedAt = now;
  }
  if (
    input.submissionState === "acknowledged" &&
    (link.submissionState === "submitted" || link.submissionState === "draft")
  ) {
    patch.acknowledgedAt = now;
    if (!patch.submittedAt && link.submissionState === "draft") {
      patch.submittedAt = now;
    }
  }

  await db
    .update(hrComplianceEvidenceLinks)
    .set(patch)
    .where(eq(hrComplianceEvidenceLinks.id, link.id));

  return { evidenceLinkId: link.id };
}

export async function unlinkHrComplianceEvidenceInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    evidenceLinkId: string;
  },
): Promise<{ evidenceLinkId: string }> {
  const [link] = await db
    .select({ id: hrComplianceEvidenceLinks.id })
    .from(hrComplianceEvidenceLinks)
    .where(
      and(
        eq(hrComplianceEvidenceLinks.organizationId, input.organizationId),
        eq(hrComplianceEvidenceLinks.id, input.evidenceLinkId.trim()),
      ),
    )
    .limit(1);

  if (!link) {
    throw new HrComplianceCommandError("evidence_link_not_found");
  }

  await db
    .delete(hrComplianceEvidenceLinks)
    .where(eq(hrComplianceEvidenceLinks.id, link.id));

  return { evidenceLinkId: link.id };
}

export async function countHrComplianceEvidenceLinksForRecordInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    recordKind: HrComplianceEvidenceRecordKind;
    recordId: string;
  },
): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(hrComplianceEvidenceLinks)
    .innerJoin(
      hrEmployeeDocuments,
      eq(
        hrComplianceEvidenceLinks.employeeDocumentId,
        hrEmployeeDocuments.id,
      ),
    )
    .where(
      and(
        eq(hrComplianceEvidenceLinks.organizationId, input.organizationId),
        eq(hrComplianceEvidenceLinks.recordKind, input.recordKind),
        eq(hrComplianceEvidenceLinks.recordId, input.recordId),
        eq(hrEmployeeDocuments.lifecycleStatus, "active"),
      ),
    );

  return Number(row?.total ?? 0);
}

export async function updateHrComplianceEvidenceSubmissionState(input: {
  organizationId: string;
  evidenceLinkId: string;
  submissionState: string;
  notes?: string | null;
}): Promise<{ evidenceLinkId: string }> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    updateHrComplianceEvidenceSubmissionStateInTx(db, input),
  );
}

export async function unlinkHrComplianceEvidence(input: {
  organizationId: string;
  evidenceLinkId: string;
}): Promise<{ evidenceLinkId: string }> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    unlinkHrComplianceEvidenceInTx(db, input),
  );
}

export async function countHrComplianceEvidenceLinksForRecord(input: {
  organizationId: string;
  recordKind: HrComplianceEvidenceRecordKind;
  recordId: string;
}): Promise<number> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    countHrComplianceEvidenceLinksForRecordInTx(db, input),
  );
}

/** Active linked employee documents for a work-auth row (HRM-CMP-020 / HRM-CMP-011). */
export function buildWorkAuthLinkedEvidenceCountSelect(organizationId: string) {
  return sql<number>`(
    select count(*)::int
    from ${hrComplianceEvidenceLinks}
    inner join ${hrEmployeeDocuments}
      on ${hrComplianceEvidenceLinks.employeeDocumentId} = ${hrEmployeeDocuments.id}
    where ${hrComplianceEvidenceLinks.organizationId} = ${organizationId}
      and ${hrComplianceEvidenceLinks.recordKind} = 'work_auth_document'
      and ${hrComplianceEvidenceLinks.recordId} = ${hrComplianceWorkAuthorizationDocuments.id}
      and ${hrEmployeeDocuments.lifecycleStatus} = 'active'
  )`.as("linked_evidence_count");
}
