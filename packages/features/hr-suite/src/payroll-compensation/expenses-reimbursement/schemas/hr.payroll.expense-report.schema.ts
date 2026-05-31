import { z } from "zod";

import { HR_EXPENSE_CLAIM_STATUSES } from "./hr.payroll.expense-constants.shared";

export const HR_EXPENSE_REPORT_GROUP_BY_VALUES = [
  "employee",
  "department",
  "category",
  "cost_center",
  "project",
  "status",
] as const;

/** HRM-EXP-025 — report filters by employee, department, category, cost center, project, status, period. */
export const hrExpenseReportFilterSchema = z.object({
  employeeId: z.string().trim().min(1).optional(),
  departmentId: z.string().trim().min(1).optional(),
  categoryCode: z.string().trim().min(1).optional(),
  costCenterCode: z.string().trim().min(1).optional(),
  projectCode: z.string().trim().min(1).optional(),
  claimStatus: z.enum(HR_EXPENSE_CLAIM_STATUSES).optional(),
  periodStart: z.coerce.date().optional(),
  periodEnd: z.coerce.date().optional(),
  groupBy: z.enum(HR_EXPENSE_REPORT_GROUP_BY_VALUES).optional(),
});

export type HrExpenseReportFilterInput = z.infer<
  typeof hrExpenseReportFilterSchema
>;
