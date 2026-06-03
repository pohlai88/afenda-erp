export const hrTalentPerformanceReadPermission = {
  module: "hr",
  object: "performance",
  function: "read",
} as const;

export const hrTalentPerformanceWritePermission = {
  module: "hr",
  object: "performance",
  function: "write",
} as const;

export const hrTalentPerformanceApprovePermission = {
  module: "hr",
  object: "performance",
  function: "approve",
} as const;

export type HrPerformanceCycleListRow = {
  id: string;
  name: string;
  reviewType: string;
  period: string;
  submissionDeadline: string;
  approvalDeadline: string;
  eligiblePopulation: string;
  status: string;
};

export type HrPerformanceReviewListRow = {
  id: string;
  cycleName: string;
  employeeDisplayName: string;
  managerDisplayName: string;
  departmentName: string;
  status: string;
  finalRating: string;
};

export type HrPerformanceGoalListRow = {
  id: string;
  employeeDisplayName: string;
  title: string;
  target: string;
  weight: string;
  progress: string;
  status: string;
};

export type HrPerformanceOutcomeReference = {
  reviewId: string;
  employeeId: string;
  cycleId: string;
  finalRating: number;
  performanceCategory: string;
  outcomeReference: string;
};
