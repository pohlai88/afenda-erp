import {
  deriveFilingEffectiveStatus,
  deriveRequirementEffectiveStatus,
  HR_COMPLIANCE_REPORT_EXPORT_ROW_CAP,
  listHrComplianceExceptionsWindow,
  listHrComplianceFilingsWindow,
  listHrComplianceRegulatoryCalendarWindow,
  listHrEmployeePolicyAcknowledgementsWindow,
  listHrEmployeeSafetyTrainingRequirementsWindow,
  listHrWorkEligibilityWindow,
  type HrComplianceReportKind,
} from "@afenda/db";

import {
  deriveRegulatoryCalendarEffectiveSourceStatus,
  deriveRegulatoryCalendarPosture,
} from "./hr.workforce.compliance-regulatory-calendar.shared";
import { maskComplianceSensitiveStoredValue } from "./hr.workforce.compliance-sensitive-access.shared";
import { formatComplianceEnumLabel } from "./hr.workforce.compliance-form.shared";
import type { HrComplianceReportCsvResult } from "./hr.workforce.compliance.reports.shared";

export type { HrComplianceReportCsvResult } from "./hr.workforce.compliance.reports.shared";

function escapeCsvCell(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function formatCsvDate(value: Date | null | undefined) {
  return value ? value.toISOString() : "";
}

function buildCsv(headers: readonly string[], rows: readonly string[][]) {
  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => row.map(escapeCsvCell).join(",")),
  ];

  return lines.join("\n");
}

const EXPIRY_ENTRY_KINDS = new Set([
  "work_eligibility_renewal",
  "work_auth_renewal",
  "employee_requirement",
]);

export async function buildHrComplianceReportCsv(input: {
  reportKind: HrComplianceReportKind;
  organizationId: string;
  canViewSensitive: boolean;
}): Promise<HrComplianceReportCsvResult> {
  const limit = HR_COMPLIANCE_REPORT_EXPORT_ROW_CAP;
  const now = new Date();

  switch (input.reportKind) {
    case "filings": {
      const window = await listHrComplianceFilingsWindow({
        organizationId: input.organizationId,
        limit,
      });

      const content = buildCsv(
        [
          "filing_code",
          "filing_title",
          "compliance_area",
          "status",
          "effective_status",
          "filing_deadline",
          "submitted_at",
          "confirmed_at",
          "legal_entity_code",
          "country_code",
          "work_location_code",
          "department",
        ],
        window.rows.map((row) => [
          row.obligationCode,
          row.obligationTitle,
          formatComplianceEnumLabel(row.complianceArea),
          row.status,
          deriveFilingEffectiveStatus({
            status: row.status,
            filingDeadline: row.filingDeadline,
            now,
          }),
          formatCsvDate(row.filingDeadline),
          formatCsvDate(row.submittedAt),
          formatCsvDate(row.confirmedAt),
          row.legalEntityCode ?? "",
          row.countryCode ?? "",
          row.workLocationCode ?? "",
          row.departmentName ?? "",
        ]),
      );

      return {
        content,
        mimeType: "text/csv;charset=utf-8",
        fileExtension: "csv",
        encoding: "utf8",
        rowCount: window.rows.length,
        reportKind: input.reportKind,
      };
    }
    case "expiry": {
      const window = await listHrComplianceRegulatoryCalendarWindow({
        organizationId: input.organizationId,
        limit,
      });

      const expiryRows = window.rows.filter((row) =>
        EXPIRY_ENTRY_KINDS.has(row.entryKind),
      );

      const content = buildCsv(
        [
          "deadline_at",
          "entry_kind",
          "title",
          "subject",
          "compliance_area",
          "source_status",
          "effective_status",
          "posture",
        ],
        expiryRows.map((row) => [
          formatCsvDate(row.deadlineAt),
          row.entryKind,
          row.title,
          row.subjectLabel ?? "",
          row.complianceArea
            ? formatComplianceEnumLabel(row.complianceArea)
            : "",
          row.sourceStatus,
          deriveRegulatoryCalendarEffectiveSourceStatus({
            entryKind: row.entryKind,
            sourceStatus: row.sourceStatus,
            deadlineAt: row.deadlineAt,
            requirementKind: row.requirementKind,
            documentNumber: row.documentNumber,
            linkedEvidenceCount: row.linkedEvidenceCount,
            now,
          }),
          deriveRegulatoryCalendarPosture({
            deadlineAt: row.deadlineAt,
            now,
          }),
        ]),
      );

      return {
        content,
        mimeType: "text/csv;charset=utf-8",
        fileExtension: "csv",
        encoding: "utf8",
        rowCount: expiryRows.length,
        reportKind: input.reportKind,
      };
    }
    case "exceptions": {
      const window = await listHrComplianceExceptionsWindow({
        organizationId: input.organizationId,
        openOnly: true,
        limit,
      });

      const content = buildCsv(
        [
          "title",
          "employee_number",
          "employee_name",
          "compliance_area",
          "item_type",
          "gap_kind",
          "severity",
          "status",
          "corrective_owner",
          "corrective_due_date",
          "created_at",
        ],
        window.rows.map((row) => [
          row.title,
          row.employeeNumber ?? "",
          row.employeeDisplayName ?? "",
          formatComplianceEnumLabel(row.complianceArea),
          formatComplianceEnumLabel(row.itemType),
          row.gapKind ? formatComplianceEnumLabel(row.gapKind) : "",
          row.severity,
          row.status,
          row.correctiveActionOwnerDisplayName ?? "",
          formatCsvDate(row.correctiveActionDueDate),
          formatCsvDate(row.createdAt),
        ]),
      );

      return {
        content,
        mimeType: "text/csv;charset=utf-8",
        fileExtension: "csv",
        encoding: "utf8",
        rowCount: window.rows.length,
        reportKind: input.reportKind,
      };
    }
    case "training": {
      const window = await listHrEmployeeSafetyTrainingRequirementsWindow({
        organizationId: input.organizationId,
        limit,
      });

      const content = buildCsv(
        [
          "employee_number",
          "employee_name",
          "requirement_code",
          "requirement_title",
          "compliance_area",
          "status",
          "effective_status",
          "certification_expiry",
          "completed_at",
        ],
        window.rows.map((row) => [
          row.employeeNumber,
          row.employeeDisplayName,
          row.obligationCode,
          row.obligationTitle,
          formatComplianceEnumLabel(row.complianceArea),
          row.status,
          deriveRequirementEffectiveStatus({
            status: row.status,
            dueDate: row.dueDate,
            requirementKind: row.requirementKind,
            now,
          }),
          formatCsvDate(row.dueDate),
          formatCsvDate(row.completedAt),
        ]),
      );

      return {
        content,
        mimeType: "text/csv;charset=utf-8",
        fileExtension: "csv",
        encoding: "utf8",
        rowCount: window.rows.length,
        reportKind: input.reportKind,
      };
    }
    case "acknowledgments": {
      const window = await listHrEmployeePolicyAcknowledgementsWindow({
        organizationId: input.organizationId,
        limit,
      });

      const content = buildCsv(
        [
          "employee_number",
          "employee_name",
          "policy_code",
          "policy_title",
          "compliance_area",
          "status",
          "effective_status",
          "acknowledgment_due",
          "acknowledged_at",
        ],
        window.rows.map((row) => [
          row.employeeNumber,
          row.employeeDisplayName,
          row.obligationCode,
          row.obligationTitle,
          formatComplianceEnumLabel(row.complianceArea),
          row.status,
          deriveRequirementEffectiveStatus({
            status: row.status,
            dueDate: row.dueDate,
            requirementKind: null,
            now,
          }),
          formatCsvDate(row.dueDate),
          formatCsvDate(row.completedAt),
        ]),
      );

      return {
        content,
        mimeType: "text/csv;charset=utf-8",
        fileExtension: "csv",
        encoding: "utf8",
        rowCount: window.rows.length,
        reportKind: input.reportKind,
      };
    }
    case "work_eligibility": {
      const window = await listHrWorkEligibilityWindow({
        organizationId: input.organizationId,
        limit,
      });

      const content = buildCsv(
        [
          "employee_number",
          "employee_name",
          "status",
          "verified_at",
          "expires_at",
          "review_notes",
        ],
        window.rows.map((row) => [
          row.employeeNumber,
          row.employeeDisplayName,
          row.status,
          formatCsvDate(row.verifiedAt),
          formatCsvDate(row.expiresAt),
          maskComplianceSensitiveStoredValue(
            row.reviewNotes,
            input.canViewSensitive,
          ),
        ]),
      );

      return {
        content,
        mimeType: "text/csv;charset=utf-8",
        fileExtension: "csv",
        encoding: "utf8",
        rowCount: window.rows.length,
        reportKind: input.reportKind,
      };
    }
    default: {
      const exhaustive: never = input.reportKind;
      throw new Error(`Unsupported compliance report kind: ${exhaustive}`);
    }
  }
}
