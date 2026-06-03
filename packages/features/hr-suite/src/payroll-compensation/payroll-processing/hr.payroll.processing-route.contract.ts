export const hrPayrollProcessingRoutePaths = {
  hub: "/hr/payroll-processing",
  payrollProcessing: "/hr/payroll-processing",
  audit: "/hr/payroll-processing/audit",
} as const;

export type HrPayrollProcessingRoutePath =
  (typeof hrPayrollProcessingRoutePaths)[keyof typeof hrPayrollProcessingRoutePaths];

export function hrPayrollRunDetailRoutePath(
  payrollRunId: string,
): `/hr/payroll-processing/runs/${string}` {
  return `/hr/payroll-processing/runs/${payrollRunId}`;
}
