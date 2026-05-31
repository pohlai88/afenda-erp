export const HR_EXPENSE_REPORT_GROUP_BY = [
  "employee",
  "department",
  "category",
  "cost_center",
  "project",
  "status",
] as const;

export type HrExpenseReportGroupBy = (typeof HR_EXPENSE_REPORT_GROUP_BY)[number];

export type HrExpenseReportFilter = {
  employeeId?: string;
  departmentId?: string;
  categoryCode?: string;
  costCenterCode?: string;
  projectCode?: string;
  claimStatus?: string;
  periodStart?: Date;
  periodEnd?: Date;
  groupBy?: HrExpenseReportGroupBy;
};
