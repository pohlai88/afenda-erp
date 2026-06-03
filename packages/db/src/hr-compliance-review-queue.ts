import { and, eq } from "drizzle-orm";
import { runWithOrganizationContext } from "./client";
import { activeFilingObligationKindCondition } from "./hr-compliance-filings.shared";
import {
  buildHrComplianceReviewQueueRowId,
  HR_COMPLIANCE_REVIEW_QUEUE_MERGE_CAP,
  type HrComplianceReviewQueueEntryKind,
} from "./hr-compliance-review-queue.shared";
import { buildPaginatedWindow, formatHrEmployeeDisplayName } from "./hr-compliance.shared";
import { activeEmployeeFilters, clampPageSize } from "./hr-compliance.internal";
import type { HrComplianceReviewQueueWindow } from "./hr-compliance.types";
import {
  hrComplianceEvidenceLinks,
  hrComplianceFilings,
  hrComplianceObligations,
  hrComplianceWorkAuthorizationDocuments,
  hrComplianceWorkEligibility,
  hrEmployeeDocuments,
  hrEmployees,
} from "./hr";

type ReviewQueueDraft = {
  id: string;
  entryKind: HrComplianceReviewQueueEntryKind;
  sourceRecordId: string;
  queuedAt: Date;
  title: string;
  subjectLabel: string | null;
  complianceArea: string | null;
  sourceStatus: string;
  employeeId: string | null;
  documentNumber?: string | null;
  documentClassification?: string | null;
  linkedEvidenceCount?: number;
  searchText: string;
};

function buildEmployeeSubjectLabel(input: {
  employeeNumber: string | null;
  preferredName: string | null;
  legalName: string | null;
}): string {
  const displayName = formatHrEmployeeDisplayName({
    preferredName: input.preferredName,
    legalName: input.legalName,
  });
  if (!input.employeeNumber) {
    return displayName;
  }
  return `${input.employeeNumber} · ${displayName}`;
}

function matchesReviewQueueSearch(entry: ReviewQueueDraft, pattern: string): boolean {
  return entry.searchText.toLowerCase().includes(pattern.toLowerCase());
}

function isSensitiveReviewQueueEntryKind(
  entryKind: HrComplianceReviewQueueEntryKind,
): boolean {
  return (
    entryKind === "work_eligibility_verification" ||
    entryKind === "work_auth_verification" ||
    entryKind === "evidence_acknowledgment"
  );
}

/** HRM-CMP-021 — derived compliance review and approval inbox. */
export async function listHrComplianceReviewQueueWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  canViewSensitive?: boolean;
}): Promise<HrComplianceReviewQueueWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const trimmedSearch = input.search?.trim();
  const canViewSensitive = input.canViewSensitive ?? false;

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const activeEmployeeCondition = activeEmployeeFilters(input.organizationId);
    const merged: ReviewQueueDraft[] = [];

    const [filingRows, workEligibilityRows, workAuthRows, evidenceRows] =
      await Promise.all([
        db
          .select({
            id: hrComplianceFilings.id,
            obligationCode: hrComplianceObligations.code,
            obligationTitle: hrComplianceObligations.title,
            complianceArea: hrComplianceObligations.complianceArea,
            status: hrComplianceFilings.status,
            submittedAt: hrComplianceFilings.submittedAt,
            updatedAt: hrComplianceFilings.updatedAt,
          })
          .from(hrComplianceFilings)
          .innerJoin(
            hrComplianceObligations,
            eq(hrComplianceFilings.obligationId, hrComplianceObligations.id),
          )
          .where(
            and(
              eq(hrComplianceFilings.organizationId, input.organizationId),
              eq(hrComplianceObligations.status, "active"),
              activeFilingObligationKindCondition,
              eq(hrComplianceFilings.status, "submitted"),
            ),
          ),
        canViewSensitive
          ? db
              .select({
                id: hrComplianceWorkEligibility.id,
                employeeId: hrComplianceWorkEligibility.employeeId,
                employeeNumber: hrEmployees.employeeNumber,
                preferredName: hrEmployees.preferredName,
                legalName: hrEmployees.legalName,
                status: hrComplianceWorkEligibility.status,
                updatedAt: hrComplianceWorkEligibility.updatedAt,
              })
              .from(hrComplianceWorkEligibility)
              .innerJoin(
                hrEmployees,
                eq(hrComplianceWorkEligibility.employeeId, hrEmployees.id),
              )
              .where(
                and(
                  eq(hrComplianceWorkEligibility.organizationId, input.organizationId),
                  eq(hrComplianceWorkEligibility.status, "pending_verification"),
                  activeEmployeeCondition,
                ),
              )
          : Promise.resolve([]),
        canViewSensitive
          ? db
              .select({
                id: hrComplianceWorkAuthorizationDocuments.id,
                employeeId: hrComplianceWorkAuthorizationDocuments.employeeId,
                employeeNumber: hrEmployees.employeeNumber,
                preferredName: hrEmployees.preferredName,
                legalName: hrEmployees.legalName,
                documentType: hrComplianceWorkAuthorizationDocuments.documentType,
                status: hrComplianceWorkAuthorizationDocuments.status,
                documentNumber: hrComplianceWorkAuthorizationDocuments.documentNumber,
                updatedAt: hrComplianceWorkAuthorizationDocuments.updatedAt,
              })
              .from(hrComplianceWorkAuthorizationDocuments)
              .innerJoin(
                hrEmployees,
                eq(
                  hrComplianceWorkAuthorizationDocuments.employeeId,
                  hrEmployees.id,
                ),
              )
              .where(
                and(
                  eq(
                    hrComplianceWorkAuthorizationDocuments.organizationId,
                    input.organizationId,
                  ),
                  eq(
                    hrComplianceWorkAuthorizationDocuments.status,
                    "pending_verification",
                  ),
                  activeEmployeeCondition,
                ),
              )
          : Promise.resolve([]),
        canViewSensitive
          ? db
              .select({
                id: hrComplianceEvidenceLinks.id,
                recordKind: hrComplianceEvidenceLinks.recordKind,
                recordId: hrComplianceEvidenceLinks.recordId,
                employeeId: hrComplianceEvidenceLinks.employeeId,
                employeeNumber: hrEmployees.employeeNumber,
                preferredName: hrEmployees.preferredName,
                legalName: hrEmployees.legalName,
                documentTitle: hrEmployeeDocuments.title,
                documentClassification: hrEmployeeDocuments.classification,
                submissionState: hrComplianceEvidenceLinks.submissionState,
                submittedAt: hrComplianceEvidenceLinks.submittedAt,
                updatedAt: hrComplianceEvidenceLinks.updatedAt,
              })
              .from(hrComplianceEvidenceLinks)
              .leftJoin(
                hrEmployees,
                eq(hrComplianceEvidenceLinks.employeeId, hrEmployees.id),
              )
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
                  eq(hrComplianceEvidenceLinks.submissionState, "submitted"),
                  eq(hrEmployeeDocuments.lifecycleStatus, "active"),
                ),
              )
          : Promise.resolve([]),
      ]);

    for (const row of filingRows) {
      const entryKind = "filing_confirmation" as const;
      const sourceRecordId = row.id;
      const subjectLabel = row.obligationCode;
      const searchText = `${entryKind} ${row.obligationCode} ${row.obligationTitle} ${row.complianceArea} ${row.status}`;
      merged.push({
        id: buildHrComplianceReviewQueueRowId({ entryKind, sourceRecordId }),
        entryKind,
        sourceRecordId,
        queuedAt: row.submittedAt ?? row.updatedAt,
        title: row.obligationTitle,
        subjectLabel,
        complianceArea: row.complianceArea,
        sourceStatus: row.status,
        employeeId: null,
        searchText,
      });
    }

    for (const row of workEligibilityRows) {
      const entryKind = "work_eligibility_verification" as const;
      const sourceRecordId = row.id;
      const subjectLabel = buildEmployeeSubjectLabel(row);
      const searchText = `${entryKind} ${subjectLabel} ${row.status}`;
      merged.push({
        id: buildHrComplianceReviewQueueRowId({ entryKind, sourceRecordId }),
        entryKind,
        sourceRecordId,
        queuedAt: row.updatedAt,
        title: "Work eligibility verification",
        subjectLabel,
        complianceArea: "work_eligibility",
        sourceStatus: row.status,
        employeeId: row.employeeId,
        searchText,
      });
    }

    for (const row of workAuthRows) {
      const entryKind = "work_auth_verification" as const;
      const sourceRecordId = row.id;
      const subjectLabel = buildEmployeeSubjectLabel(row);
      const searchText = `${entryKind} ${subjectLabel} ${row.documentType} ${row.status}`;
      merged.push({
        id: buildHrComplianceReviewQueueRowId({ entryKind, sourceRecordId }),
        entryKind,
        sourceRecordId,
        queuedAt: row.updatedAt,
        title: `${row.documentType.replaceAll("_", " ")} verification`,
        subjectLabel,
        complianceArea: "work_authorization",
        sourceStatus: row.status,
        employeeId: row.employeeId,
        documentNumber: row.documentNumber,
        searchText,
      });
    }

    for (const row of evidenceRows) {
      const entryKind = "evidence_acknowledgment" as const;
      const sourceRecordId = row.id;
      const subjectLabel = row.employeeId
        ? buildEmployeeSubjectLabel({
            employeeNumber: row.employeeNumber,
            preferredName: row.preferredName,
            legalName: row.legalName,
          })
        : null;
      const searchText = `${entryKind} ${row.recordKind} ${row.documentTitle} ${row.submissionState}`;
      merged.push({
        id: buildHrComplianceReviewQueueRowId({ entryKind, sourceRecordId }),
        entryKind,
        sourceRecordId,
        queuedAt: row.submittedAt ?? row.updatedAt,
        title: row.documentTitle,
        subjectLabel,
        complianceArea: row.recordKind,
        sourceStatus: row.submissionState,
        employeeId: row.employeeId,
        documentClassification: row.documentClassification,
        searchText,
      });
    }

    merged.sort((left, right) => left.queuedAt.getTime() - right.queuedAt.getTime());

    const mergeTruncated = merged.length > HR_COMPLIANCE_REVIEW_QUEUE_MERGE_CAP;
    const capped = mergeTruncated
      ? merged.slice(0, HR_COMPLIANCE_REVIEW_QUEUE_MERGE_CAP)
      : merged;

    const filtered = trimmedSearch
      ? capped.filter((entry) => matchesReviewQueueSearch(entry, trimmedSearch))
      : capped;

    const totalCount = filtered.length;
    const pageRows = filtered.slice(offset, offset + pageSize).map((entry) => ({
      id: entry.id,
      entryKind: entry.entryKind,
      sourceRecordId: entry.sourceRecordId,
      queuedAt: entry.queuedAt,
      title: entry.title,
      subjectLabel: entry.subjectLabel,
      complianceArea: entry.complianceArea,
      sourceStatus: entry.sourceStatus,
      employeeId: entry.employeeId,
      ...(entry.documentNumber !== undefined
        ? { documentNumber: entry.documentNumber }
        : undefined),
      ...(entry.documentClassification !== undefined
        ? { documentClassification: entry.documentClassification }
        : undefined),
      ...(entry.linkedEvidenceCount !== undefined
        ? { linkedEvidenceCount: entry.linkedEvidenceCount }
        : undefined),
    }));

    return {
      ...buildPaginatedWindow({
        rows: pageRows,
        pageSize,
        offset,
        totalCount,
      }),
      mergeTruncated,
    };
  });
}

export { isSensitiveReviewQueueEntryKind };
