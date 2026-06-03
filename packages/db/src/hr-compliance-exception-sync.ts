import { and, eq, inArray, isNotNull, ne, or } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createHrComplianceExceptionInTx } from "./hr-compliance-exceptions";
import { activeFilingObligationKindCondition } from "./hr-compliance-filings.shared";
import {
  buildComplianceExceptionSourceReferenceId,
  classifyEmployeeRequirementExceptionGap,
  classifyFilingExceptionGap,
  classifyWorkAuthDocumentExceptionGap,
  classifyWorkEligibilityExceptionGap,
  buildAutoReopenedComplianceExceptionValues,
  HR_COMPLIANCE_EXCEPTION_AUTO_RESOLVED_NOTE,
  isAutoResolvedComplianceException,
  resolveComplianceExceptionSeverity,
  type HrComplianceExceptionGapKind,
  type HrComplianceExceptionSourceKind,
} from "./hr-compliance-exception-sync.shared";
import { HR_COMPLIANCE_SAFETY_TRAINING_REQUIREMENT_KIND } from "./hr-compliance-safety-training.shared";
import { HR_COMPLIANCE_WORKPLACE_SAFETY_REQUIREMENT_KIND } from "./hr-compliance-workplace-safety.shared";
import { activeEmployeeFilters } from "./hr-compliance.internal";
import {
  hrComplianceEmployeeRequirements,
  hrComplianceExceptions,
  hrComplianceFilings,
  hrComplianceObligations,
  hrComplianceWorkAuthorizationDocuments,
  hrComplianceWorkEligibility,
  hrEmployees,
} from "./hr";

type ExceptionGapCandidate = {
  sourceReferenceId: string;
  sourceKind: HrComplianceExceptionSourceKind;
  gapKind: HrComplianceExceptionGapKind;
  employeeId: string | null;
  complianceArea: string;
  itemType: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
};

function formatDocumentTypeLabel(documentType: string): string {
  return documentType.replaceAll("_", " ");
}

function buildExceptionTitle(input: {
  gapKind: HrComplianceExceptionGapKind;
  subject: string;
}): string {
  const gapLabel =
    input.gapKind === "failed"
      ? "Failed"
      : input.gapKind.charAt(0).toUpperCase() + input.gapKind.slice(1);
  return `${gapLabel}: ${input.subject}`;
}

async function collectComplianceExceptionGapCandidates(
  db: AfendaTransaction,
  input: { organizationId: string; now: Date },
): Promise<ExceptionGapCandidate[]> {
  const activeEmployeeCondition = activeEmployeeFilters(input.organizationId);
  const candidates: ExceptionGapCandidate[] = [];

  const [
    requirementRows,
    filingRows,
    workEligibilityRows,
    workAuthRows,
  ] = await Promise.all([
    db
      .select({
        id: hrComplianceEmployeeRequirements.id,
        employeeId: hrComplianceEmployeeRequirements.employeeId,
        obligationCode: hrComplianceObligations.code,
        obligationTitle: hrComplianceObligations.title,
        complianceArea: hrComplianceObligations.complianceArea,
        requirementKind: hrComplianceObligations.requirementKind,
        status: hrComplianceEmployeeRequirements.status,
        dueDate: hrComplianceEmployeeRequirements.dueDate,
      })
      .from(hrComplianceEmployeeRequirements)
      .innerJoin(
        hrComplianceObligations,
        eq(
          hrComplianceEmployeeRequirements.obligationId,
          hrComplianceObligations.id,
        ),
      )
      .innerJoin(hrEmployees, eq(hrComplianceEmployeeRequirements.employeeId, hrEmployees.id))
      .where(
        and(
          eq(hrComplianceEmployeeRequirements.organizationId, input.organizationId),
          eq(hrComplianceObligations.status, "active"),
          activeEmployeeCondition,
          or(
            and(
              ne(hrComplianceEmployeeRequirements.status, "compliant"),
              ne(hrComplianceEmployeeRequirements.status, "waived"),
            ),
            and(
              eq(hrComplianceEmployeeRequirements.status, "compliant"),
              isNotNull(hrComplianceEmployeeRequirements.dueDate),
              inArray(hrComplianceObligations.requirementKind, [
                HR_COMPLIANCE_SAFETY_TRAINING_REQUIREMENT_KIND,
                HR_COMPLIANCE_WORKPLACE_SAFETY_REQUIREMENT_KIND,
              ]),
            ),
          )!,
        ),
      ),
    db
      .select({
        id: hrComplianceFilings.id,
        obligationCode: hrComplianceObligations.code,
        obligationTitle: hrComplianceObligations.title,
        complianceArea: hrComplianceObligations.complianceArea,
        status: hrComplianceFilings.status,
        filingDeadline: hrComplianceFilings.filingDeadline,
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
          inArray(hrComplianceFilings.status, ["pending", "overdue"]),
        ),
      ),
    db
      .select({
        id: hrComplianceWorkEligibility.id,
        employeeId: hrComplianceWorkEligibility.employeeId,
        status: hrComplianceWorkEligibility.status,
        expiresAt: hrComplianceWorkEligibility.expiresAt,
      })
      .from(hrComplianceWorkEligibility)
      .innerJoin(hrEmployees, eq(hrComplianceWorkEligibility.employeeId, hrEmployees.id))
      .where(
        and(
          eq(hrComplianceWorkEligibility.organizationId, input.organizationId),
          ne(hrComplianceWorkEligibility.status, "not_applicable"),
          activeEmployeeCondition,
        ),
      ),
    db
      .select({
        id: hrComplianceWorkAuthorizationDocuments.id,
        employeeId: hrComplianceWorkAuthorizationDocuments.employeeId,
        documentType: hrComplianceWorkAuthorizationDocuments.documentType,
        status: hrComplianceWorkAuthorizationDocuments.status,
        documentNumber: hrComplianceWorkAuthorizationDocuments.documentNumber,
        expiresAt: hrComplianceWorkAuthorizationDocuments.expiresAt,
      })
      .from(hrComplianceWorkAuthorizationDocuments)
      .innerJoin(
        hrEmployees,
        eq(hrComplianceWorkAuthorizationDocuments.employeeId, hrEmployees.id),
      )
      .where(
        and(
          eq(hrComplianceWorkAuthorizationDocuments.organizationId, input.organizationId),
          activeEmployeeCondition,
        ),
      ),
  ]);

  for (const row of requirementRows) {
    const gapKind = classifyEmployeeRequirementExceptionGap({
      status: row.status,
      dueDate: row.dueDate,
      requirementKind: row.requirementKind,
      now: input.now,
    });
    if (!gapKind) {
      continue;
    }

    const sourceKind: HrComplianceExceptionSourceKind = "employee_requirement";
    const complianceArea = row.complianceArea;
    candidates.push({
      sourceReferenceId: buildComplianceExceptionSourceReferenceId({
        sourceKind,
        sourceId: row.id,
        gapKind,
      }),
      sourceKind,
      gapKind,
      employeeId: row.employeeId,
      complianceArea,
      itemType: gapKind,
      title: buildExceptionTitle({
        gapKind,
        subject: `${row.obligationCode} · ${row.obligationTitle}`,
      }),
      severity: resolveComplianceExceptionSeverity({ gapKind, complianceArea }),
    });
  }

  for (const row of filingRows) {
    const gapKind = classifyFilingExceptionGap({
      status: row.status,
      filingDeadline: row.filingDeadline,
      now: input.now,
    });
    if (!gapKind) {
      continue;
    }

    const sourceKind: HrComplianceExceptionSourceKind = "filing";
    const complianceArea = row.complianceArea;
    candidates.push({
      sourceReferenceId: buildComplianceExceptionSourceReferenceId({
        sourceKind,
        sourceId: row.id,
        gapKind,
      }),
      sourceKind,
      gapKind,
      employeeId: null,
      complianceArea,
      itemType: gapKind,
      title: buildExceptionTitle({
        gapKind,
        subject: `${row.obligationCode} · ${row.obligationTitle}`,
      }),
      severity: resolveComplianceExceptionSeverity({ gapKind, complianceArea }),
    });
  }

  for (const row of workEligibilityRows) {
    const gapKind = classifyWorkEligibilityExceptionGap({
      status: row.status,
      expiresAt: row.expiresAt,
      now: input.now,
    });
    if (!gapKind) {
      continue;
    }

    const sourceKind: HrComplianceExceptionSourceKind = "work_eligibility";
    const complianceArea = "work_eligibility";
    candidates.push({
      sourceReferenceId: buildComplianceExceptionSourceReferenceId({
        sourceKind,
        sourceId: row.id,
        gapKind,
      }),
      sourceKind,
      gapKind,
      employeeId: row.employeeId,
      complianceArea,
      itemType: gapKind,
      title: buildExceptionTitle({
        gapKind,
        subject: "Work eligibility",
      }),
      severity: resolveComplianceExceptionSeverity({ gapKind, complianceArea }),
    });
  }

  for (const row of workAuthRows) {
    const gapKind = classifyWorkAuthDocumentExceptionGap({
      status: row.status,
      documentNumber: row.documentNumber,
      expiresAt: row.expiresAt,
      now: input.now,
    });
    if (!gapKind) {
      continue;
    }

    const sourceKind: HrComplianceExceptionSourceKind = "work_authorization";
    const complianceArea = "work_authorization";
    const documentLabel = formatDocumentTypeLabel(row.documentType);
    candidates.push({
      sourceReferenceId: buildComplianceExceptionSourceReferenceId({
        sourceKind,
        sourceId: row.id,
        gapKind,
      }),
      sourceKind,
      gapKind,
      employeeId: row.employeeId,
      complianceArea,
      itemType: gapKind,
      title: buildExceptionTitle({
        gapKind,
        subject: documentLabel,
      }),
      severity: resolveComplianceExceptionSeverity({ gapKind, complianceArea }),
    });
  }

  return candidates;
}

/** HRM-CMP-017 — materialize exceptions for missing, expired, overdue, or failed items. */
export async function syncHrComplianceExceptionsInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    now?: Date;
  },
): Promise<{
  createdCount: number;
  reopenedCount: number;
  resolvedCount: number;
  totalOpen: number;
}> {
  const now = input.now ?? new Date();
  const candidates = await collectComplianceExceptionGapCandidates(db, {
    organizationId: input.organizationId,
    now,
  });

  const candidateBySourceRef = new Map(
    candidates.map((candidate) => [candidate.sourceReferenceId, candidate]),
  );

  const trackedExceptions = await db
    .select({
      id: hrComplianceExceptions.id,
      employeeId: hrComplianceExceptions.employeeId,
      sourceReferenceId: hrComplianceExceptions.sourceReferenceId,
      status: hrComplianceExceptions.status,
      title: hrComplianceExceptions.title,
      severity: hrComplianceExceptions.severity,
      gapKind: hrComplianceExceptions.gapKind,
      resolutionNote: hrComplianceExceptions.resolutionNote,
    })
    .from(hrComplianceExceptions)
    .where(
      and(
        eq(hrComplianceExceptions.organizationId, input.organizationId),
        isNotNull(hrComplianceExceptions.sourceReferenceId),
      ),
    );

  const trackedBySourceRef = new Map(
    trackedExceptions
      .filter((row) => row.sourceReferenceId)
      .map((row) => [row.sourceReferenceId!, row]),
  );

  let createdCount = 0;
  let resolvedCount = 0;
  let reopenedCount = 0;

  for (const candidate of candidates) {
    const existing = trackedBySourceRef.get(candidate.sourceReferenceId);

    if (!existing) {
      await createHrComplianceExceptionInTx(db, {
        organizationId: input.organizationId,
        employeeId: candidate.employeeId,
        title: candidate.title,
        complianceArea: candidate.complianceArea,
        itemType: candidate.itemType,
        severity: candidate.severity,
        sourceReferenceId: candidate.sourceReferenceId,
        gapKind: candidate.gapKind,
      });
      createdCount += 1;
      continue;
    }

    if (
      existing.status === "resolved" &&
      isAutoResolvedComplianceException(existing)
    ) {
      await db
        .update(hrComplianceExceptions)
        .set(buildAutoReopenedComplianceExceptionValues(candidate))
        .where(eq(hrComplianceExceptions.id, existing.id));
      reopenedCount += 1;
      continue;
    }

    if (existing.status !== "open" && existing.status !== "in_progress") {
      continue;
    }

    if (
      existing.title !== candidate.title ||
      existing.severity !== candidate.severity ||
      existing.gapKind !== candidate.gapKind ||
      existing.employeeId !== candidate.employeeId
    ) {
      await db
        .update(hrComplianceExceptions)
        .set({
          employeeId: candidate.employeeId,
          title: candidate.title,
          severity: candidate.severity,
          gapKind: candidate.gapKind,
          itemType: candidate.itemType,
          complianceArea: candidate.complianceArea,
        })
        .where(eq(hrComplianceExceptions.id, existing.id));
    }
  }

  for (const tracked of trackedExceptions) {
    if (!tracked.sourceReferenceId) {
      continue;
    }

    if (candidateBySourceRef.has(tracked.sourceReferenceId)) {
      continue;
    }

    if (tracked.status !== "open" && tracked.status !== "in_progress") {
      continue;
    }

    await db
      .update(hrComplianceExceptions)
      .set({
        status: "resolved",
        resolutionNote: HR_COMPLIANCE_EXCEPTION_AUTO_RESOLVED_NOTE,
        resolvedAt: now,
      })
      .where(eq(hrComplianceExceptions.id, tracked.id));

    resolvedCount += 1;
  }

  const openRows = await db
    .select({ id: hrComplianceExceptions.id })
    .from(hrComplianceExceptions)
    .where(
      and(
        eq(hrComplianceExceptions.organizationId, input.organizationId),
        inArray(hrComplianceExceptions.status, ["open", "in_progress"]),
      ),
    );

  return {
    createdCount,
    reopenedCount,
    resolvedCount,
    totalOpen: openRows.length,
  };
}

export async function syncHrComplianceExceptions(input: {
  organizationId: string;
  now?: Date;
}): Promise<{
  createdCount: number;
  reopenedCount: number;
  resolvedCount: number;
  totalOpen: number;
}> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    syncHrComplianceExceptionsInTx(db, input),
  );
}
