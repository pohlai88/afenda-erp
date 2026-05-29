export type HrAttendancePunchType = "clock_in" | "clock_out";

export type HrAttendancePunchStatus = "active" | "voided";

export type HrAttendanceSource = "manual" | "time_clock" | "import";

export type HrAttendanceRecordRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  punchType: HrAttendancePunchType;
  status: HrAttendancePunchStatus;
  source: HrAttendanceSource;
  punchedAt: Date;
  notes: string | null;
};

export type HrAttendanceRecordWindow = {
  rows: readonly HrAttendanceRecordRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};
