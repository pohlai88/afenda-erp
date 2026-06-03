export const hrTalentLmsReadPermission = {
  module: "hr",
  object: "lms",
  function: "read",
} as const;

export const hrTalentLmsWritePermission = {
  module: "hr",
  object: "lms",
  function: "write",
} as const;

export type HrLmsCourseListRow = {
  id: string;
  code: string;
  title: string;
  category: string;
  provider: string;
  courseType: string;
  courseStatus: string;
};

export type HrLmsEmployeeOverviewRow = {
  employeeId: string;
  employeeDisplayName: string;
  courseCode: string;
  courseTitle: string;
  progressStatus: string;
  completionPercent: number;
  overdue: boolean;
};

export type HrLmsTeamOverviewRow = {
  managerEmployeeId: string;
  employeeId: string;
  employeeDisplayName: string;
  mandatoryIncompleteCount: number;
  completionPercent: number;
};

export type HrLmsAdminOverviewRow = {
  departmentName: string;
  completionPercent: number;
  overdueCount: number;
  complianceRiskCount: number;
};
