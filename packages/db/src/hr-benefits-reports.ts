import { desc, eq } from "drizzle-orm";
import { runWithOrganizationContext } from "./client";
import { formatEmployeeLabel } from "./hr-benefits.shared";
import {
  HR_BENEFIT_REPORT_EXPORT_ROW_CAP,
  type HrBenefitReportCsvResult,
  type HrBenefitReportKind,
} from "./hr-benefits-reports.shared";
import {
  hrBenefitDeductionReferences,
  hrBenefitEnrollmentContributions,
  hrBenefitEnrollments,
  hrBenefitPlans,
  hrBenefitProviders,
} from "./dbx-hr-benefits";
import { hrDepartments, hrEmployees } from "./hr";

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

export async function buildHrBenefitReportCsv(input: {
  organizationId: string;
  reportKind: HrBenefitReportKind;
  canViewSensitive: boolean;
}): Promise<HrBenefitReportCsvResult> {
  const limit = HR_BENEFIT_REPORT_EXPORT_ROW_CAP;
  const maskAmount = (value: string | null | undefined) =>
    input.canViewSensitive ? (value ?? "") : value ? "Restricted" : "";

  return runWithOrganizationContext(input.organizationId, async (db) => {
    switch (input.reportKind) {
      case "cost": {
        const rows = await db
          .select({
            employeeNumber: hrEmployees.employeeNumber,
            legalName: hrEmployees.legalName,
            preferredName: hrEmployees.preferredName,
            departmentName: hrDepartments.name,
            legalEntityCode: hrEmployees.legalEntityCode,
            countryCode: hrEmployees.countryCode,
            providerName: hrBenefitProviders.name,
            planCode: hrBenefitPlans.code,
            planName: hrBenefitPlans.name,
            payer: hrBenefitEnrollmentContributions.payer,
            amount: hrBenefitEnrollmentContributions.amount,
            currencyCode: hrBenefitEnrollmentContributions.currencyCode,
            coverageStatus: hrBenefitEnrollments.coverageStatus,
          })
          .from(hrBenefitEnrollmentContributions)
          .innerJoin(
            hrBenefitEnrollments,
            eq(
              hrBenefitEnrollmentContributions.enrollmentId,
              hrBenefitEnrollments.id,
            ),
          )
          .innerJoin(hrEmployees, eq(hrBenefitEnrollments.employeeId, hrEmployees.id))
          .leftJoin(
            hrDepartments,
            eq(hrEmployees.currentDepartmentId, hrDepartments.id),
          )
          .innerJoin(hrBenefitPlans, eq(hrBenefitEnrollments.planId, hrBenefitPlans.id))
          .leftJoin(
            hrBenefitProviders,
            eq(hrBenefitPlans.providerId, hrBenefitProviders.id),
          )
          .where(
            eq(hrBenefitEnrollmentContributions.organizationId, input.organizationId),
          )
          .orderBy(desc(hrBenefitEnrollments.updatedAt))
          .limit(limit);

        const content = buildCsv(
          [
            "employee_number",
            "employee_name",
            "department",
            "legal_entity",
            "country",
            "provider",
            "plan_code",
            "plan_name",
            "payer",
            "amount",
            "currency",
            "coverage_status",
          ],
          rows.map((row) => [
            row.employeeNumber,
            formatEmployeeLabel({
              employeeNumber: row.employeeNumber,
              legalName: row.legalName,
              preferredName: row.preferredName,
            }),
            row.departmentName ?? "",
            row.legalEntityCode ?? "",
            row.countryCode ?? "",
            row.providerName ?? "",
            row.planCode,
            row.planName,
            row.payer,
            maskAmount(row.amount),
            row.currencyCode,
            row.coverageStatus,
          ]),
        );

        return {
          content,
          mimeType: "text/csv;charset=utf-8",
          fileExtension: "csv",
          encoding: "utf8",
          rowCount: rows.length,
          reportKind: input.reportKind,
        };
      }
      case "enrollment": {
        const rows = await db
          .select({
            employeeNumber: hrEmployees.employeeNumber,
            legalName: hrEmployees.legalName,
            preferredName: hrEmployees.preferredName,
            departmentName: hrDepartments.name,
            legalEntityCode: hrEmployees.legalEntityCode,
            countryCode: hrEmployees.countryCode,
            providerName: hrBenefitProviders.name,
            planCode: hrBenefitPlans.code,
            planName: hrBenefitPlans.name,
            coverageLevel: hrBenefitEnrollments.coverageLevel,
            coverageStatus: hrBenefitEnrollments.coverageStatus,
            enrollmentChannel: hrBenefitEnrollments.enrollmentChannel,
            coverageStartDate: hrBenefitEnrollments.coverageStartDate,
            coverageEndDate: hrBenefitEnrollments.coverageEndDate,
            enrollmentDate: hrBenefitEnrollments.enrollmentDate,
          })
          .from(hrBenefitEnrollments)
          .innerJoin(hrEmployees, eq(hrBenefitEnrollments.employeeId, hrEmployees.id))
          .leftJoin(
            hrDepartments,
            eq(hrEmployees.currentDepartmentId, hrDepartments.id),
          )
          .innerJoin(hrBenefitPlans, eq(hrBenefitEnrollments.planId, hrBenefitPlans.id))
          .leftJoin(
            hrBenefitProviders,
            eq(hrBenefitPlans.providerId, hrBenefitProviders.id),
          )
          .where(eq(hrBenefitEnrollments.organizationId, input.organizationId))
          .orderBy(desc(hrBenefitEnrollments.enrollmentDate))
          .limit(limit);

        const content = buildCsv(
          [
            "employee_number",
            "employee_name",
            "department",
            "legal_entity",
            "country",
            "provider",
            "plan_code",
            "plan_name",
            "coverage_level",
            "coverage_status",
            "enrollment_channel",
            "coverage_start",
            "coverage_end",
            "enrollment_date",
          ],
          rows.map((row) => [
            row.employeeNumber,
            formatEmployeeLabel({
              employeeNumber: row.employeeNumber,
              legalName: row.legalName,
              preferredName: row.preferredName,
            }),
            row.departmentName ?? "",
            row.legalEntityCode ?? "",
            row.countryCode ?? "",
            row.providerName ?? "",
            row.planCode,
            row.planName,
            row.coverageLevel,
            row.coverageStatus,
            row.enrollmentChannel,
            formatCsvDate(row.coverageStartDate),
            formatCsvDate(row.coverageEndDate),
            formatCsvDate(row.enrollmentDate),
          ]),
        );

        return {
          content,
          mimeType: "text/csv;charset=utf-8",
          fileExtension: "csv",
          encoding: "utf8",
          rowCount: rows.length,
          reportKind: input.reportKind,
        };
      }
      case "payroll_deduction": {
        const rows = await db
          .select({
            employeeNumber: hrEmployees.employeeNumber,
            legalName: hrEmployees.legalName,
            preferredName: hrEmployees.preferredName,
            departmentName: hrDepartments.name,
            legalEntityCode: hrEmployees.legalEntityCode,
            countryCode: hrEmployees.countryCode,
            providerName: hrBenefitProviders.name,
            planCode: hrBenefitPlans.code,
            planName: hrBenefitPlans.name,
            deductionCode: hrBenefitDeductionReferences.deductionCode,
            amount: hrBenefitDeductionReferences.amount,
            frequency: hrBenefitDeductionReferences.frequency,
            active: hrBenefitDeductionReferences.active,
            payrollDeductionReference:
              hrBenefitDeductionReferences.payrollDeductionReference,
            effectiveFrom: hrBenefitDeductionReferences.effectiveFrom,
            syncedAt: hrBenefitDeductionReferences.syncedAt,
          })
          .from(hrBenefitDeductionReferences)
          .innerJoin(
            hrBenefitEnrollments,
            eq(hrBenefitDeductionReferences.enrollmentId, hrBenefitEnrollments.id),
          )
          .innerJoin(hrEmployees, eq(hrBenefitEnrollments.employeeId, hrEmployees.id))
          .leftJoin(
            hrDepartments,
            eq(hrEmployees.currentDepartmentId, hrDepartments.id),
          )
          .innerJoin(hrBenefitPlans, eq(hrBenefitEnrollments.planId, hrBenefitPlans.id))
          .leftJoin(
            hrBenefitProviders,
            eq(hrBenefitPlans.providerId, hrBenefitProviders.id),
          )
          .where(
            eq(hrBenefitDeductionReferences.organizationId, input.organizationId),
          )
          .orderBy(desc(hrBenefitDeductionReferences.updatedAt))
          .limit(limit);

        const content = buildCsv(
          [
            "employee_number",
            "employee_name",
            "department",
            "legal_entity",
            "country",
            "provider",
            "plan_code",
            "plan_name",
            "deduction_code",
            "amount",
            "frequency",
            "active",
            "payroll_deduction_reference",
            "effective_from",
            "synced_at",
          ],
          rows.map((row) => [
            row.employeeNumber,
            formatEmployeeLabel({
              employeeNumber: row.employeeNumber,
              legalName: row.legalName,
              preferredName: row.preferredName,
            }),
            row.departmentName ?? "",
            row.legalEntityCode ?? "",
            row.countryCode ?? "",
            row.providerName ?? "",
            row.planCode,
            row.planName,
            row.deductionCode,
            maskAmount(row.amount),
            row.frequency,
            row.active ? "true" : "false",
            row.payrollDeductionReference,
            formatCsvDate(row.effectiveFrom),
            formatCsvDate(row.syncedAt),
          ]),
        );

        return {
          content,
          mimeType: "text/csv;charset=utf-8",
          fileExtension: "csv",
          encoding: "utf8",
          rowCount: rows.length,
          reportKind: input.reportKind,
        };
      }
      default: {
        const _exhaustive: never = input.reportKind;
        throw new Error(`Unsupported report kind: ${_exhaustive}`);
      }
    }
  });
}

