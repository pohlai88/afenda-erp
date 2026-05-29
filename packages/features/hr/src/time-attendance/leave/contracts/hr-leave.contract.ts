export type HrLeaveType =
  | "annual"
  | "sick"
  | "unpaid"
  | "compassionate"
  | "other";

export type HrLeaveRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export type HrLeaveRequestRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  leaveType: HrLeaveType;
  status: HrLeaveRequestStatus;
  startAt: Date;
  endAt: Date;
  durationDays: string;
  reason: string | null;
  decisionNote: string | null;
  submittedAt: Date;
  decidedAt: Date | null;
};

export type HrLeaveRequestWindow = {
  rows: readonly HrLeaveRequestRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};
