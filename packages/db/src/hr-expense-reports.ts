import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { runWithOrganizationContext } from "./client";
import { formatEmployeeLabel } from "./hr-benefits.shared";
import { HR_EXPENSE_REPORT_EXPORT_ROW_CAP } from "./hr-expense.shared";
import type { HrExpenseReportFilter } from "./hr-expense-reports.shared";
import { hrExpenseClaims } from "./schema/hr-expense";
import { hrDepartments, hrEmployees } from "./schema/hr";

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

function formatAmount(value: string | null, canViewSensitive: boolean) {
  if (value === null) {
    return "";
  }
  if (!canViewSensitive) {
    return "Restricted";
  }
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return "";
  }
  return amount.toFixed(2);
}

export type HrExpenseReportResult = {
  content: string;
  rowCount: number;
  groupBy: string;
};

/** HRM-EXP-025 / AC 21 — expense claim report with dimensional filters. */
export async function buildHrExpenseClaimReport(input: {
  organizationId: string;
  filter: HrExpenseReportFilter;
  canViewSensitive: boolean;
}): Promise<HrExpenseReportResult> {
  const limit = HR_EXPENSE_REPORT_EXPORT_ROW_CAP;

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrExpenseClaims.organizationId, input.organizationId),
    ];

    if (input.filter.employeeId) {
      conditions.push(eq(hrExpenseClaims.employeeId, input.filter.employeeId));
    }
    if (input.filter.departmentId) {
      conditions.push(eq(hrExpenseClaims.departmentId, input.filter.departmentId));
    }
    if (input.filter.categoryCode) {
      conditions.push(eq(hrExpenseClaims.categoryCode, input.filter.categoryCode));
    }
    if (input.filter.costCenterCode) {
      conditions.push(
        eq(hrExpenseClaims.costCenterCode, input.filter.costCenterCode),
      );
    }
    if (input.filter.projectCode) {
      conditions.push(eq(hrExpenseClaims.projectCode, input.filter.projectCode));
    }
    if (input.filter.claimStatus) {
      conditions.push(
        eq(
          hrExpenseClaims.claimStatus,
          input.filter.claimStatus as (typeof hrExpenseClaims.$inferSelect)["claimStatus"],
        ),
      );
    }
    if (input.filter.periodStart) {
      conditions.push(gte(hrExpenseClaims.submittedAt, input.filter.periodStart));
    }
    if (input.filter.periodEnd) {
      conditions.push(lte(hrExpenseClaims.submittedAt, input.filter.periodEnd));
    }

    const whereClause = and(...conditions);
    const groupBy = input.filter.groupBy ?? "status";

    const rows = await db
      .select({
        claimId: hrExpenseClaims.id,
        claimStatus: hrExpenseClaims.claimStatus,
        categoryCode: hrExpenseClaims.categoryCode,
        claimAmount: hrExpenseClaims.claimAmount,
        claimCurrencyCode: hrExpenseClaims.claimCurrencyCode,
        legalEntityCode: hrExpenseClaims.legalEntityCode,
        costCenterCode: hrExpenseClaims.costCenterCode,
        projectCode: hrExpenseClaims.projectCode,
        glReference: hrExpenseClaims.glReference,
        submittedAt: hrExpenseClaims.submittedAt,
        paidAt: hrExpenseClaims.paidAt,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        departmentName: hrDepartments.name,
      })
      .from(hrExpenseClaims)
      .innerJoin(hrEmployees, eq(hrExpenseClaims.employeeId, hrEmployees.id))
      .leftJoin(
        hrDepartments,
        eq(hrExpenseClaims.departmentId, hrDepartments.id),
      )
      .where(whereClause)
      .orderBy(desc(hrExpenseClaims.submittedAt))
      .limit(limit);

    const content = buildCsv(
      [
        "claim_id",
        "claim_status",
        "category",
        "employee_number",
        "employee_name",
        "department",
        "legal_entity",
        "cost_center",
        "project",
        "gl_reference",
        "claim_amount",
        "currency",
        "submitted_at",
        "paid_at",
        "report_group_by",
      ],
      rows.map((row) => [
        row.claimId,
        row.claimStatus,
        row.categoryCode,
        row.employeeNumber ?? "",
        formatEmployeeLabel(row),
        row.departmentName ?? "",
        row.legalEntityCode ?? "",
        row.costCenterCode ?? "",
        row.projectCode ?? "",
        row.glReference ?? "",
        formatAmount(row.claimAmount, input.canViewSensitive),
        row.claimCurrencyCode,
        row.submittedAt?.toISOString() ?? "",
        row.paidAt?.toISOString() ?? "",
        groupBy,
      ]),
    );

    if (groupBy !== "status" && rows.length > 0) {
      await db
        .select({
          groupKey:
            groupBy === "employee"
              ? hrExpenseClaims.employeeId
              : groupBy === "department"
                ? hrExpenseClaims.departmentId
                : groupBy === "category"
                  ? hrExpenseClaims.categoryCode
                  : groupBy === "cost_center"
                    ? hrExpenseClaims.costCenterCode
                    : groupBy === "project"
                      ? hrExpenseClaims.projectCode
                      : hrExpenseClaims.claimStatus,
          claimCount: sql<number>`count(*)::int`,
        })
        .from(hrExpenseClaims)
        .where(whereClause)
        .groupBy(
          groupBy === "employee"
            ? hrExpenseClaims.employeeId
            : groupBy === "department"
              ? hrExpenseClaims.departmentId
              : groupBy === "category"
                ? hrExpenseClaims.categoryCode
                : groupBy === "cost_center"
                  ? hrExpenseClaims.costCenterCode
                  : groupBy === "project"
                    ? hrExpenseClaims.projectCode
                    : hrExpenseClaims.claimStatus,
        );
    }

    return {
      content,
      rowCount: rows.length,
      groupBy,
    };
  });
}
