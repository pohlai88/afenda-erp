export type HrOffboardingCaseStatus = "in_progress" | "completed" | "cancelled";

export type HrOffboardingCaseRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  status: HrOffboardingCaseStatus;
  priorEmploymentStatus: string;
  reason: string | null;
  lastWorkingDate: Date | null;
  startedAt: Date;
  completedAt: Date | null;
  cancelledAt: Date | null;
};

export type HrOffboardingCaseWindow = {
  rows: readonly HrOffboardingCaseRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};
