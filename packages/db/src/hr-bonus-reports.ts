import { and, desc, eq, inArray } from "drizzle-orm";
import { runWithOrganizationContext } from "./client";
import { formatEmployeeLabel } from "./hr-benefits.shared";
import {
  HR_BONUS_BONUS_PLAN_TYPES,
  HR_BONUS_COMMISSION_PLAN_TYPES,
  HR_BONUS_INCENTIVE_PLAN_TYPES,
  HR_BONUS_REPORT_EXPORT_ROW_CAP,
  type HrBonusReportKind,
} from "./hr-bonus-reports.shared";
import type { HrBonusReportCsvResult } from "./hr-bonus.types";
import { hrBonusCycles, hrBonusPayouts, hrBonusPlans } from "./hr-bonus";
import { hrDepartments, hrEmployees } from "./hr";

function escapeCsvCell(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildCsv(headers: readonly string[], rows: readonly string[][]) {
  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => row.map(escapeCsvCell).join(",")),
  ];
  return lines.join("\n");
}

function planTypesForReportKind(kind: HrBonusReportKind) {
  switch (kind) {
    case "commission":
      return [...HR_BONUS_COMMISSION_PLAN_TYPES];
    case "incentive":
      return [...HR_BONUS_INCENTIVE_PLAN_TYPES];
    case "bonus":
      return [...HR_BONUS_BONUS_PLAN_TYPES];
    default:
      return null;
  }
}

/** HRM-BON-028 / AC 23 — CSV reports by plan type, employee, department, status, period. */
export async function buildHrBonusReportCsv(input: {
  organizationId: string;
  reportKind: HrBonusReportKind;
  canViewSensitive: boolean;
}): Promise<HrBonusReportCsvResult> {
  const limit = HR_BONUS_REPORT_EXPORT_ROW_CAP;
  const maskAmount = (value: string | null | undefined) =>
    input.canViewSensitive ? (value ?? "") : value ? "Restricted" : "";

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const planTypes = planTypesForReportKind(input.reportKind);

    switch (input.reportKind) {
      case "eligibility": {
        const rows = await db
          .select({
            employeeNumber: hrEmployees.employeeNumber,
            legalName: hrEmployees.legalName,
            preferredName: hrEmployees.preferredName,
            departmentName: hrDepartments.name,
            legalEntityCode: hrEmployees.legalEntityCode,
            planCode: hrBonusPlans.code,
            planName: hrBonusPlans.name,
            planType: hrBonusPlans.planType,
            cycleCode: hrBonusCycles.code,
            eligible: hrBonusPayouts.eligible,
            eligibilityNotes: hrBonusPayouts.eligibilityNotes,
            payoutStatus: hrBonusPayouts.payoutStatus,
          })
          .from(hrBonusPayouts)
          .innerJoin(hrEmployees, eq(hrBonusPayouts.employeeId, hrEmployees.id))
          .leftJoin(
            hrDepartments,
            eq(hrEmployees.currentDepartmentId, hrDepartments.id),
          )
          .innerJoin(hrBonusPlans, eq(hrBonusPayouts.planId, hrBonusPlans.id))
          .innerJoin(hrBonusCycles, eq(hrBonusPayouts.cycleId, hrBonusCycles.id))
          .where(eq(hrBonusPayouts.organizationId, input.organizationId))
          .orderBy(desc(hrBonusPayouts.updatedAt))
          .limit(limit);

        const content = buildCsv(
          [
            "employee_number",
            "employee_name",
            "department",
            "legal_entity",
            "plan_code",
            "plan_name",
            "plan_type",
            "cycle_code",
            "eligible",
            "eligibility_notes",
            "payout_status",
          ],
          rows.map((row) => [
            row.employeeNumber ?? "",
            formatEmployeeLabel(row),
            row.departmentName ?? "",
            row.legalEntityCode ?? "",
            row.planCode,
            row.planName,
            row.planType,
            row.cycleCode,
            row.eligible ? "yes" : "no",
            row.eligibilityNotes ?? "",
            row.payoutStatus,
          ]),
        );

        return {
          filename: `bonus-eligibility-report.csv`,
          contentType: "text/csv",
          content,
          rowCount: rows.length,
        };
      }

      case "payout_variance": {
        const rows = await db
          .select({
            employeeNumber: hrEmployees.employeeNumber,
            legalName: hrEmployees.legalName,
            preferredName: hrEmployees.preferredName,
            departmentName: hrDepartments.name,
            planCode: hrBonusPlans.code,
            planType: hrBonusPlans.planType,
            cycleCode: hrBonusCycles.code,
            targetAmount: hrBonusPayouts.targetAmount,
            finalAmount: hrBonusPayouts.finalAmount,
            varianceAmount: hrBonusPayouts.varianceAmount,
            currencyCode: hrBonusPayouts.currencyCode,
            payoutStatus: hrBonusPayouts.payoutStatus,
          })
          .from(hrBonusPayouts)
          .innerJoin(hrEmployees, eq(hrBonusPayouts.employeeId, hrEmployees.id))
          .leftJoin(
            hrDepartments,
            eq(hrEmployees.currentDepartmentId, hrDepartments.id),
          )
          .innerJoin(hrBonusPlans, eq(hrBonusPayouts.planId, hrBonusPlans.id))
          .innerJoin(hrBonusCycles, eq(hrBonusPayouts.cycleId, hrBonusCycles.id))
          .where(eq(hrBonusPayouts.organizationId, input.organizationId))
          .orderBy(desc(hrBonusPayouts.updatedAt))
          .limit(limit);

        const content = buildCsv(
          [
            "employee_number",
            "employee_name",
            "department",
            "plan_code",
            "plan_type",
            "cycle_code",
            "target_amount",
            "final_amount",
            "variance_amount",
            "currency",
            "payout_status",
          ],
          rows.map((row) => [
            row.employeeNumber ?? "",
            formatEmployeeLabel(row),
            row.departmentName ?? "",
            row.planCode,
            row.planType,
            row.cycleCode,
            maskAmount(row.targetAmount),
            maskAmount(row.finalAmount),
            maskAmount(row.varianceAmount),
            row.currencyCode,
            row.payoutStatus,
          ]),
        );

        return {
          filename: `bonus-payout-variance-report.csv`,
          contentType: "text/csv",
          content,
          rowCount: rows.length,
        };
      }

      default: {
        const conditions = [
          eq(hrBonusPayouts.organizationId, input.organizationId),
        ];
        if (planTypes?.length) {
          conditions.push(inArray(hrBonusPlans.planType, planTypes));
        }

        const rows = await db
          .select({
            employeeNumber: hrEmployees.employeeNumber,
            legalName: hrEmployees.legalName,
            preferredName: hrEmployees.preferredName,
            departmentName: hrDepartments.name,
            legalEntityCode: hrEmployees.legalEntityCode,
            planCode: hrBonusPlans.code,
            planName: hrBonusPlans.name,
            planType: hrBonusPlans.planType,
            cycleCode: hrBonusCycles.code,
            calculatedAmount: hrBonusPayouts.calculatedAmount,
            adjustedAmount: hrBonusPayouts.adjustedAmount,
            finalAmount: hrBonusPayouts.finalAmount,
            currencyCode: hrBonusPayouts.currencyCode,
            payoutStatus: hrBonusPayouts.payoutStatus,
            costCenterCode: hrBonusPayouts.costCenterCode,
            glReference: hrBonusPayouts.glReference,
          })
          .from(hrBonusPayouts)
          .innerJoin(hrEmployees, eq(hrBonusPayouts.employeeId, hrEmployees.id))
          .leftJoin(
            hrDepartments,
            eq(hrEmployees.currentDepartmentId, hrDepartments.id),
          )
          .innerJoin(hrBonusPlans, eq(hrBonusPayouts.planId, hrBonusPlans.id))
          .innerJoin(hrBonusCycles, eq(hrBonusPayouts.cycleId, hrBonusCycles.id))
          .where(and(...conditions))
          .orderBy(desc(hrBonusPayouts.updatedAt))
          .limit(limit);

        const content = buildCsv(
          [
            "employee_number",
            "employee_name",
            "department",
            "legal_entity",
            "plan_code",
            "plan_name",
            "plan_type",
            "cycle_code",
            "calculated_amount",
            "adjusted_amount",
            "final_amount",
            "currency",
            "payout_status",
            "cost_center",
            "gl_reference",
          ],
          rows.map((row) => [
            row.employeeNumber ?? "",
            formatEmployeeLabel(row),
            row.departmentName ?? "",
            row.legalEntityCode ?? "",
            row.planCode,
            row.planName,
            row.planType,
            row.cycleCode,
            maskAmount(row.calculatedAmount),
            maskAmount(row.adjustedAmount),
            maskAmount(row.finalAmount),
            row.currencyCode,
            row.payoutStatus,
            row.costCenterCode ?? "",
            row.glReference ?? "",
          ]),
        );

        return {
          filename: `bonus-${input.reportKind}-report.csv`,
          contentType: "text/csv",
          content,
          rowCount: rows.length,
        };
      }
    }
  });
}
