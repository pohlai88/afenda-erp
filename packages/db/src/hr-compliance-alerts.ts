import { and, eq, inArray, isNotNull, isNull, notInArray, or } from "drizzle-orm";
import { runWithOrganizationContext } from "./client";
import { buildWorkAuthLinkedEvidenceCountSelect } from "./hr-compliance-evidence-links";
import { activeFilingObligationKindCondition } from "./hr-compliance-filings.shared";
import { HR_COMPLIANCE_POLICY_ACKNOWLEDGEMENT_REQUIREMENT_KIND } from "./hr-compliance-policy-acknowledgement.shared";
import { HR_COMPLIANCE_SAFETY_TRAINING_REQUIREMENT_KIND } from "./hr-compliance-safety-training.shared";
import { HR_COMPLIANCE_WORKPLACE_SAFETY_REQUIREMENT_KIND } from "./hr-compliance-workplace-safety.shared";
import {
  ALERT_SEVERITY_SORT_PRIORITY,
  classifyComplianceAlert,
  HR_COMPLIANCE_ALERTS_MERGE_CAP,
  type HrComplianceAlertKind,
  type HrComplianceAlertSeverity,
  type HrComplianceAlertSourceKind,
} from "./hr-compliance-alerts.shared";
import { buildPaginatedWindow, formatHrEmployeeDisplayName } from "./hr-compliance.shared";
import { activeEmployeeFilters, clampPageSize } from "./hr-compliance.internal";
import type { HrComplianceAlertWindow } from "./hr-compliance.types";
import {
  hrComplianceEmployeeRequirements,
  hrComplianceExceptions,
  hrComplianceFilings,
  hrComplianceObligations,
  hrComplianceWorkAuthorizationDocuments,
  hrComplianceWorkEligibility,
  hrEmployees,
} from "./hr";

type AlertCandidateDraft = {
  id: string;
  sourceKind: HrComplianceAlertSourceKind;
  triggerAt: Date | null;
  title: string;
  subjectLabel: string | null;
  complianceArea: string | null;
  sourceStatus: string;
  requirementKind: string | null;
  employeeId: string | null;
  documentNumber?: string | null;
  linkedEvidenceCount?: number;
  alertKind: HrComplianceAlertKind;
  severity: HrComplianceAlertSeverity;
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

function matchesAlertSearch(entry: AlertCandidateDraft, pattern: string): boolean {
  const normalized = pattern.toLowerCase();
  return entry.searchText.toLowerCase().includes(normalized);
}

function pushAlertCandidate(
  merged: AlertCandidateDraft[],
  draft: Omit<AlertCandidateDraft, "alertKind" | "severity" | "searchText"> & {
    searchText: string;
  },
  now: Date,
) {
  const classification = classifyComplianceAlert({
    sourceKind: draft.sourceKind,
    sourceStatus: draft.sourceStatus,
    triggerAt: draft.triggerAt,
    requirementKind: draft.requirementKind,
    documentNumber: draft.documentNumber,
    linkedEvidenceCount: draft.linkedEvidenceCount,
    now,
  });

  if (!classification) {
    return;
  }

  merged.push({
    ...draft,
    alertKind: classification.alertKind,
    severity: classification.severity,
    searchText: `${draft.searchText} ${classification.alertKind} ${classification.severity}`,
  });
}

const undatedOverdueActionRequirementKindCondition = or(
  eq(
    hrComplianceObligations.requirementKind,
    HR_COMPLIANCE_POLICY_ACKNOWLEDGEMENT_REQUIREMENT_KIND,
  ),
  eq(
    hrComplianceObligations.requirementKind,
    HR_COMPLIANCE_SAFETY_TRAINING_REQUIREMENT_KIND,
  ),
  eq(
    hrComplianceObligations.requirementKind,
    HR_COMPLIANCE_WORKPLACE_SAFETY_REQUIREMENT_KIND,
  ),
)!;

/** HRM-CMP-016 — derived compliance alerts for deadlines, renewals, expiries, and overdue actions. */
export async function listHrComplianceAlertsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrComplianceAlertWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const trimmedSearch = input.search?.trim();
  const now = new Date();

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const activeEmployeeCondition = activeEmployeeFilters(input.organizationId);

    const [
      filingRows,
      requirementRows,
      workEligibilityRows,
      workAuthRows,
      workAuthMissingRows,
      undatedRequirementRows,
      exceptionRows,
    ] = await Promise.all([
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
            isNotNull(hrComplianceFilings.filingDeadline),
          ),
        ),
      db
        .select({
          id: hrComplianceEmployeeRequirements.id,
          employeeId: hrComplianceEmployeeRequirements.employeeId,
          employeeNumber: hrEmployees.employeeNumber,
          preferredName: hrEmployees.preferredName,
          legalName: hrEmployees.legalName,
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
            notInArray(hrComplianceEmployeeRequirements.status, ["compliant", "waived"]),
            isNotNull(hrComplianceEmployeeRequirements.dueDate),
            activeEmployeeCondition,
          ),
        ),
      db
        .select({
          id: hrComplianceWorkEligibility.id,
          employeeId: hrComplianceWorkEligibility.employeeId,
          employeeNumber: hrEmployees.employeeNumber,
          preferredName: hrEmployees.preferredName,
          legalName: hrEmployees.legalName,
          status: hrComplianceWorkEligibility.status,
          expiresAt: hrComplianceWorkEligibility.expiresAt,
        })
        .from(hrComplianceWorkEligibility)
        .innerJoin(hrEmployees, eq(hrComplianceWorkEligibility.employeeId, hrEmployees.id))
        .where(
          and(
            eq(hrComplianceWorkEligibility.organizationId, input.organizationId),
            inArray(hrComplianceWorkEligibility.status, [
              "pending_verification",
              "eligible",
              "conditional",
            ]),
            isNotNull(hrComplianceWorkEligibility.expiresAt),
            activeEmployeeCondition,
          ),
        ),
      db
        .select({
          id: hrComplianceWorkAuthorizationDocuments.id,
          employeeId: hrComplianceWorkAuthorizationDocuments.employeeId,
          employeeNumber: hrEmployees.employeeNumber,
          preferredName: hrEmployees.preferredName,
          legalName: hrEmployees.legalName,
          documentType: hrComplianceWorkAuthorizationDocuments.documentType,
          status: hrComplianceWorkAuthorizationDocuments.status,
          documentNumber: hrComplianceWorkAuthorizationDocuments.documentNumber,
          expiresAt: hrComplianceWorkAuthorizationDocuments.expiresAt,
          linkedEvidenceCount: buildWorkAuthLinkedEvidenceCountSelect(
            input.organizationId,
          ),
        })
        .from(hrComplianceWorkAuthorizationDocuments)
        .innerJoin(
          hrEmployees,
          eq(hrComplianceWorkAuthorizationDocuments.employeeId, hrEmployees.id),
        )
        .where(
          and(
            eq(hrComplianceWorkAuthorizationDocuments.organizationId, input.organizationId),
            inArray(hrComplianceWorkAuthorizationDocuments.status, [
              "pending_verification",
              "verified",
              "rejected",
            ]),
            isNotNull(hrComplianceWorkAuthorizationDocuments.expiresAt),
            activeEmployeeCondition,
          ),
        ),
      db
        .select({
          id: hrComplianceWorkAuthorizationDocuments.id,
          employeeId: hrComplianceWorkAuthorizationDocuments.employeeId,
          employeeNumber: hrEmployees.employeeNumber,
          preferredName: hrEmployees.preferredName,
          legalName: hrEmployees.legalName,
          documentType: hrComplianceWorkAuthorizationDocuments.documentType,
          status: hrComplianceWorkAuthorizationDocuments.status,
          documentNumber: hrComplianceWorkAuthorizationDocuments.documentNumber,
          linkedEvidenceCount: buildWorkAuthLinkedEvidenceCountSelect(
            input.organizationId,
          ),
        })
        .from(hrComplianceWorkAuthorizationDocuments)
        .innerJoin(
          hrEmployees,
          eq(hrComplianceWorkAuthorizationDocuments.employeeId, hrEmployees.id),
        )
        .where(
          and(
            eq(hrComplianceWorkAuthorizationDocuments.organizationId, input.organizationId),
            eq(hrComplianceWorkAuthorizationDocuments.status, "missing"),
            activeEmployeeCondition,
          ),
        ),
      db
        .select({
          id: hrComplianceEmployeeRequirements.id,
          employeeId: hrComplianceEmployeeRequirements.employeeId,
          employeeNumber: hrEmployees.employeeNumber,
          preferredName: hrEmployees.preferredName,
          legalName: hrEmployees.legalName,
          obligationCode: hrComplianceObligations.code,
          obligationTitle: hrComplianceObligations.title,
          complianceArea: hrComplianceObligations.complianceArea,
          requirementKind: hrComplianceObligations.requirementKind,
          status: hrComplianceEmployeeRequirements.status,
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
            eq(hrComplianceEmployeeRequirements.status, "pending"),
            isNull(hrComplianceEmployeeRequirements.dueDate),
            undatedOverdueActionRequirementKindCondition,
            activeEmployeeCondition,
          ),
        ),
      db
        .select({
          id: hrComplianceExceptions.id,
          employeeId: hrComplianceExceptions.employeeId,
          title: hrComplianceExceptions.title,
          complianceArea: hrComplianceExceptions.complianceArea,
          status: hrComplianceExceptions.status,
          correctiveActionDueDate: hrComplianceExceptions.correctiveActionDueDate,
          employeeNumber: hrEmployees.employeeNumber,
          preferredName: hrEmployees.preferredName,
          legalName: hrEmployees.legalName,
        })
        .from(hrComplianceExceptions)
        .leftJoin(hrEmployees, eq(hrComplianceExceptions.employeeId, hrEmployees.id))
        .where(
          and(
            eq(hrComplianceExceptions.organizationId, input.organizationId),
            inArray(hrComplianceExceptions.status, ["open", "in_progress"]),
            isNotNull(hrComplianceExceptions.correctiveActionDueDate),
          ),
        ),
    ]);

    const merged: AlertCandidateDraft[] = [];

    for (const row of filingRows) {
      if (!row.filingDeadline) continue;
      const title = `${row.obligationCode} · ${row.obligationTitle}`;
      pushAlertCandidate(
        merged,
        {
          id: `filing:${row.id}`,
          sourceKind: "filing",
          triggerAt: row.filingDeadline,
          title,
          subjectLabel: null,
          complianceArea: row.complianceArea,
          sourceStatus: row.status,
          requirementKind: "filing",
          employeeId: null,
          searchText: `${title} ${row.complianceArea} filing deadline`,
        },
        now,
      );
    }

    for (const row of requirementRows) {
      if (!row.dueDate) continue;
      const title = `${row.obligationCode} · ${row.obligationTitle}`;
      const subjectLabel = buildEmployeeSubjectLabel(row);
      pushAlertCandidate(
        merged,
        {
          id: `requirement:${row.id}`,
          sourceKind: "employee_requirement",
          triggerAt: row.dueDate,
          title,
          subjectLabel,
          complianceArea: row.complianceArea,
          sourceStatus: row.status,
          requirementKind: row.requirementKind,
          employeeId: row.employeeId,
          searchText: `${title} ${subjectLabel} ${row.complianceArea} ${row.requirementKind}`,
        },
        now,
      );
    }

    for (const row of workEligibilityRows) {
      if (!row.expiresAt) continue;
      const subjectLabel = buildEmployeeSubjectLabel(row);
      const title = "Work eligibility renewal";
      pushAlertCandidate(
        merged,
        {
          id: `work_eligibility:${row.id}`,
          sourceKind: "work_eligibility_renewal",
          triggerAt: row.expiresAt,
          title,
          subjectLabel,
          complianceArea: "work_eligibility",
          sourceStatus: row.status,
          requirementKind: null,
          employeeId: row.employeeId,
          searchText: `${title} ${subjectLabel} work eligibility renewal expiry`,
        },
        now,
      );
    }

    for (const row of workAuthRows) {
      if (!row.expiresAt) continue;
      const subjectLabel = buildEmployeeSubjectLabel(row);
      const title = `${row.documentType.replaceAll("_", " ")} renewal`;
      pushAlertCandidate(
        merged,
        {
          id: `work_auth:${row.id}`,
          sourceKind: "work_auth_renewal",
          triggerAt: row.expiresAt,
          title,
          subjectLabel,
          complianceArea: "work_authorization",
          sourceStatus: row.status,
          requirementKind: null,
          employeeId: row.employeeId,
          documentNumber: row.documentNumber,
          linkedEvidenceCount: Number(row.linkedEvidenceCount ?? 0),
          searchText: `${title} ${subjectLabel} ${row.documentType} renewal expiry`,
        },
        now,
      );
    }

    for (const row of undatedRequirementRows) {
      const title = `${row.obligationCode} · ${row.obligationTitle}`;
      const subjectLabel = buildEmployeeSubjectLabel(row);
      pushAlertCandidate(
        merged,
        {
          id: `requirement:${row.id}`,
          sourceKind: "employee_requirement",
          triggerAt: null,
          title,
          subjectLabel,
          complianceArea: row.complianceArea,
          sourceStatus: row.status,
          requirementKind: row.requirementKind,
          employeeId: row.employeeId,
          searchText: `${title} ${subjectLabel} ${row.complianceArea} ${row.requirementKind} missing overdue`,
        },
        now,
      );
    }

    for (const row of workAuthMissingRows) {
      const subjectLabel = buildEmployeeSubjectLabel(row);
      const title = `Missing ${row.documentType.replaceAll("_", " ")}`;
      pushAlertCandidate(
        merged,
        {
          id: `work_auth_missing:${row.id}`,
          sourceKind: "work_auth_missing",
          triggerAt: null,
          title,
          subjectLabel,
          complianceArea: "work_authorization",
          sourceStatus: row.status,
          requirementKind: null,
          employeeId: row.employeeId,
          documentNumber: row.documentNumber,
          linkedEvidenceCount: Number(row.linkedEvidenceCount ?? 0),
          searchText: `${title} ${subjectLabel} ${row.documentType} missing`,
        },
        now,
      );
    }

    for (const row of exceptionRows) {
      if (!row.correctiveActionDueDate) continue;
      const subjectLabel = row.employeeNumber
        ? buildEmployeeSubjectLabel({
            employeeNumber: row.employeeNumber,
            preferredName: row.preferredName,
            legalName: row.legalName,
          })
        : null;
      pushAlertCandidate(
        merged,
        {
          id: `exception:${row.id}`,
          sourceKind: "corrective_action",
          triggerAt: row.correctiveActionDueDate,
          title: row.title,
          subjectLabel,
          complianceArea: row.complianceArea,
          sourceStatus: row.status,
          requirementKind: null,
          employeeId: row.employeeId,
          searchText: `${row.title} ${subjectLabel ?? ""} ${row.complianceArea} corrective overdue`,
        },
        now,
      );
    }

    merged.sort((left, right) => {
      const severityDelta =
        ALERT_SEVERITY_SORT_PRIORITY[left.severity] -
        ALERT_SEVERITY_SORT_PRIORITY[right.severity];
      if (severityDelta !== 0) {
        return severityDelta;
      }

      const leftTrigger = left.triggerAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const rightTrigger = right.triggerAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
      if (leftTrigger !== rightTrigger) {
        return leftTrigger - rightTrigger;
      }

      return left.title.localeCompare(right.title);
    });

    const mergeTruncated = merged.length > HR_COMPLIANCE_ALERTS_MERGE_CAP;
    const capped = merged.slice(0, HR_COMPLIANCE_ALERTS_MERGE_CAP);
    const filtered = trimmedSearch
      ? capped.filter((entry) => matchesAlertSearch(entry, trimmedSearch))
      : capped;

    const totalCount = filtered.length;
    const pageRows = filtered.slice(offset, offset + pageSize).map((entry) => ({
      id: entry.id,
      alertKind: entry.alertKind,
      severity: entry.severity,
      sourceKind: entry.sourceKind,
      triggerAt: entry.triggerAt,
      title: entry.title,
      subjectLabel: entry.subjectLabel,
      complianceArea: entry.complianceArea,
      sourceStatus: entry.sourceStatus,
      requirementKind: entry.requirementKind,
      employeeId: entry.employeeId,
      ...(entry.documentNumber !== undefined
        ? { documentNumber: entry.documentNumber }
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
