import { and, eq, inArray, isNotNull, notInArray } from "drizzle-orm";
import { runWithOrganizationContext } from "./client";
import { activeFilingObligationKindCondition } from "./hr-compliance-filings.shared";
import {
  HR_COMPLIANCE_REGULATORY_CALENDAR_MERGE_CAP,
  type HrComplianceRegulatoryCalendarEntryKind,
} from "./hr-compliance-regulatory-calendar.shared";
import { buildPaginatedWindow, formatHrEmployeeDisplayName } from "./hr-compliance.shared";
import { activeEmployeeFilters, clampPageSize } from "./hr-compliance.internal";
import type { HrComplianceRegulatoryCalendarWindow } from "./hr-compliance.types";
import {
  hrComplianceEmployeeRequirements,
  hrComplianceExceptions,
  hrComplianceFilings,
  hrComplianceObligations,
  hrComplianceWorkAuthorizationDocuments,
  hrComplianceWorkEligibility,
  hrEmployees,
} from "./schema/hr";

type CalendarEntryDraft = {
  id: string;
  entryKind: HrComplianceRegulatoryCalendarEntryKind;
  deadlineAt: Date;
  title: string;
  subjectLabel: string | null;
  complianceArea: string | null;
  sourceStatus: string;
  requirementKind: string | null;
  employeeId: string | null;
  documentNumber?: string | null;
  searchText: string;
};

function matchesCalendarSearch(entry: CalendarEntryDraft, pattern: string): boolean {
  const normalized = pattern.toLowerCase();
  return entry.searchText.toLowerCase().includes(normalized);
}

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

export async function listHrComplianceRegulatoryCalendarWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrComplianceRegulatoryCalendarWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const trimmedSearch = input.search?.trim();

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const activeEmployeeCondition = activeEmployeeFilters(input.organizationId);

    const [
      filingRows,
      requirementRows,
      workEligibilityRows,
      workAuthRows,
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

    const merged: CalendarEntryDraft[] = [];

    for (const row of filingRows) {
      if (!row.filingDeadline) continue;
      const title = `${row.obligationCode} · ${row.obligationTitle}`;
      merged.push({
        id: `filing:${row.id}`,
        entryKind: "filing",
        deadlineAt: row.filingDeadline,
        title,
        subjectLabel: null,
        complianceArea: row.complianceArea,
        sourceStatus: row.status,
        requirementKind: "filing",
        employeeId: null,
        searchText: `${title} ${row.complianceArea} filing`,
      });
    }

    for (const row of requirementRows) {
      if (!row.dueDate) continue;
      const title = `${row.obligationCode} · ${row.obligationTitle}`;
      const subjectLabel = buildEmployeeSubjectLabel(row);
      merged.push({
        id: `requirement:${row.id}`,
        entryKind: "employee_requirement",
        deadlineAt: row.dueDate,
        title,
        subjectLabel,
        complianceArea: row.complianceArea,
        sourceStatus: row.status,
        requirementKind: row.requirementKind,
        employeeId: row.employeeId,
        searchText: `${title} ${subjectLabel} ${row.complianceArea} ${row.requirementKind}`,
      });
    }

    for (const row of workEligibilityRows) {
      if (!row.expiresAt) continue;
      const subjectLabel = buildEmployeeSubjectLabel(row);
      const title = "Work eligibility renewal";
      merged.push({
        id: `work_eligibility:${row.id}`,
        entryKind: "work_eligibility_renewal",
        deadlineAt: row.expiresAt,
        title,
        subjectLabel,
        complianceArea: "work_eligibility",
        sourceStatus: row.status,
        requirementKind: null,
        employeeId: row.employeeId,
        searchText: `${title} ${subjectLabel} work eligibility`,
      });
    }

    for (const row of workAuthRows) {
      if (!row.expiresAt) continue;
      const subjectLabel = buildEmployeeSubjectLabel(row);
      const title = `${row.documentType.replaceAll("_", " ")} renewal`;
      merged.push({
        id: `work_auth:${row.id}`,
        entryKind: "work_auth_renewal",
        deadlineAt: row.expiresAt,
        title,
        subjectLabel,
        complianceArea: "work_authorization",
        sourceStatus: row.status,
        requirementKind: null,
        employeeId: row.employeeId,
        documentNumber: row.documentNumber,
        searchText: `${title} ${subjectLabel} ${row.documentType}`,
      });
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
      merged.push({
        id: `exception:${row.id}`,
        entryKind: "corrective_action",
        deadlineAt: row.correctiveActionDueDate,
        title: row.title,
        subjectLabel,
        complianceArea: row.complianceArea,
        sourceStatus: row.status,
        requirementKind: null,
        employeeId: row.employeeId,
        searchText: `${row.title} ${subjectLabel ?? ""} ${row.complianceArea} corrective`,
      });
    }

    merged.sort((left, right) => left.deadlineAt.getTime() - right.deadlineAt.getTime());

    const mergeTruncated = merged.length > HR_COMPLIANCE_REGULATORY_CALENDAR_MERGE_CAP;
    const capped = merged.slice(0, HR_COMPLIANCE_REGULATORY_CALENDAR_MERGE_CAP);
    const filtered = trimmedSearch
      ? capped.filter((entry) => matchesCalendarSearch(entry, trimmedSearch))
      : capped;

    const totalCount = filtered.length;
    const pageRows = filtered.slice(offset, offset + pageSize).map((entry) => ({
      id: entry.id,
      entryKind: entry.entryKind,
      deadlineAt: entry.deadlineAt,
      title: entry.title,
      subjectLabel: entry.subjectLabel,
      complianceArea: entry.complianceArea,
      sourceStatus: entry.sourceStatus,
      requirementKind: entry.requirementKind,
      employeeId: entry.employeeId,
      ...(entry.documentNumber !== undefined
        ? { documentNumber: entry.documentNumber }
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
