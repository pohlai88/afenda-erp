import {
  listHrOvertimePayrollEarningsForEmployeePeriod,
  recordHrOvertimePayrollExportAudit,
} from "@afenda/db";

/** HRM-OTM-023 / 024 — payroll-ready earnings only (unapproved rows excluded). */
export async function listHrTimeOtmPayrollEarningsForPeriod(
  input: Parameters<typeof listHrOvertimePayrollEarningsForEmployeePeriod>[0],
) {
  return listHrOvertimePayrollEarningsForEmployeePeriod(input);
}

export async function recordHrTimeOtmPayrollExportAudit(
  input: Parameters<typeof recordHrOvertimePayrollExportAudit>[0],
) {
  return recordHrOvertimePayrollExportAudit(input);
}
