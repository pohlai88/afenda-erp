import { listHrLeaveRequestsWindow } from "@afenda/db";
import type {
  HrLeaveRequestRow,
  HrLeaveRequestWindow,
} from "../contracts/hr-leave.contract";

export async function listHrLeaveRequests(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  status?: HrLeaveRequestRow["status"];
  employeeId?: string;
  pendingOnly?: boolean;
}): Promise<HrLeaveRequestWindow> {
  const window = await listHrLeaveRequestsWindow(input);

  return {
    rows: window.rows.map((row) => ({
      id: row.id,
      employeeId: row.employeeId,
      employeeNumber: row.employeeNumber,
      employeeDisplayName: row.employeeDisplayName,
      leaveType: row.leaveType,
      status: row.status,
      startAt: row.startAt,
      endAt: row.endAt,
      durationDays: row.durationDays,
      reason: row.reason,
      decisionNote: row.decisionNote,
      submittedAt: row.submittedAt,
      decidedAt: row.decidedAt,
    })),
    pageSize: window.pageSize,
    totalCount: window.totalCount,
    hasNextPage: window.hasNextPage,
  };
}
