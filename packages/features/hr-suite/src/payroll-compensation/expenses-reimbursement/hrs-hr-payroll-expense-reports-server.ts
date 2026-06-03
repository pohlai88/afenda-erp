import { buildHrExpenseClaimReport } from "@afenda/db";

import { hrPayrollExpenseAuditActions } from "./hr.payroll.expense.event";
import type { HrExpenseReportFilterInput } from "./hr.payroll.expense-report.schema";

/** HRM-EXP-025 — generate expense claim report with dimensional filters. */
export async function generateExpenseReport(input: {
  organizationId: string;
  filter: HrExpenseReportFilterInput;
  canViewSensitive: boolean;
}) {
  const result = await buildHrExpenseClaimReport({
    organizationId: input.organizationId,
    filter: input.filter,
    canViewSensitive: input.canViewSensitive,
  });

  return {
    ...result,
    auditAction: hrPayrollExpenseAuditActions.report.exported,
  };
}
