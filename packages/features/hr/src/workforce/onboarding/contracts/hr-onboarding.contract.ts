import type { HrEmploymentStatus } from "../../employees/contracts/hr-employee.contract";

export type HrOnboardingCaseStatus = "in_progress" | "completed" | "cancelled";

export type HrOnboardingCaseRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  status: HrOnboardingCaseStatus;
  priorEmploymentStatus: HrEmploymentStatus;
  targetStatus: HrEmploymentStatus;
  reason: string | null;
  startedAt: Date;
  completedAt: Date | null;
  cancelledAt: Date | null;
};

export type HrOnboardingCaseWindow = {
  rows: readonly HrOnboardingCaseRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrOnboardingChecklistItemRow = {
  id: string;
  caseId: string;
  code: string;
  title: string;
  status: "pending" | "done" | "waived";
  completedAt: Date | null;
  sortOrder: number;
};
