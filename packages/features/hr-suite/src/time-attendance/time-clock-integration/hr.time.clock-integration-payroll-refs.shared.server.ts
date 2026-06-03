import { listHrAttendanceDaysWindow } from "@afenda/db";

export type HrTimeClockPayrollRefRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  workDate: Date;
  attendanceStatus: string;
  payrollReference: string | null;
  source: string;
};

/** HRM-TCI-023 — approved attendance outcomes via LAM for payroll readiness. */
export async function listHrTimeClockPayrollReferenceRows(input: {
  organizationId: string;
  limit?: number;
  search?: string;
}): Promise<readonly HrTimeClockPayrollRefRow[]> {
  const periodEnd = new Date();
  const periodStart = new Date(periodEnd);
  periodStart.setUTCMonth(periodStart.getUTCMonth() - 1);

  const window = await listHrAttendanceDaysWindow({
    organizationId: input.organizationId,
    limit: input.limit ?? 100,
    search: input.search,
    workDateFrom: periodStart,
    workDateTo: periodEnd,
  });

  return window.rows
    .filter((row) => row.dayState === "computed" || row.dayState === "locked")
    .map((row) => ({
      id: row.id,
      employeeId: row.employeeId,
      employeeNumber: row.employeeNumber,
      employeeDisplayName: row.employeeDisplayName,
      workDate: row.workDate,
      attendanceStatus: row.status,
      payrollReference: row.notes?.includes("payroll") ? row.notes : row.id,
      source: "lam_approved_day",
    }));
}
