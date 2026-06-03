import {
  listHrShiftAttendanceReconcileWindow,
  type HrShiftAttendanceReconcileWindow,
} from "@afenda/db";

export type { HrShiftAttendanceReconcileWindow };

/** HRM-SFT-026 — compare scheduled shift with LAM attendance records. */
export async function listHrSftAttendanceReconcile(input: {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  limit?: number;
  offset?: number;
  search?: string;
  employeeId?: string;
  visibleEmployeeIds?: readonly string[] | null;
}): Promise<HrShiftAttendanceReconcileWindow> {
  return listHrShiftAttendanceReconcileWindow(input);
}
