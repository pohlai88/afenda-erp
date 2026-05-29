import { listHrAttendanceRecordsWindow } from "@afenda/db";
import type {
  HrAttendanceRecordRow,
  HrAttendanceRecordWindow,
} from "../contracts/hr-attendance.contract";

export async function listHrAttendanceRecords(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  employeeId?: string;
  punchType?: HrAttendanceRecordRow["punchType"];
  activeOnly?: boolean;
}): Promise<HrAttendanceRecordWindow> {
  const window = await listHrAttendanceRecordsWindow(input);

  return {
    rows: window.rows.map((row) => ({
      id: row.id,
      employeeId: row.employeeId,
      employeeNumber: row.employeeNumber,
      employeeDisplayName: row.employeeDisplayName,
      punchType: row.punchType,
      status: row.status,
      source: row.source,
      punchedAt: row.punchedAt,
      notes: row.notes,
    })),
    pageSize: window.pageSize,
    totalCount: window.totalCount,
    hasNextPage: window.hasNextPage,
  };
}
