export const hrTalentSuccessionReadPermission = {
  module: "hr",
  object: "succession_planning",
  function: "read",
} as const;

export const hrTalentSuccessionWritePermission = {
  module: "hr",
  object: "succession_planning",
  function: "write",
} as const;

export const hrTalentSuccessionApprovePermission = {
  module: "hr",
  object: "succession_planning",
  function: "approve",
} as const;

export type HrSuccessionCriticalRoleListRow = {
  id: string;
  roleTitle: string;
  departmentName: string;
  jobFamily: string;
  grade: string;
  incumbentDisplayName: string;
  businessImpact: string;
  vacancyRisk: string;
  replacementDifficulty: string;
};

export type HrSuccessionSuccessorListRow = {
  id: string;
  employeeDisplayName: string;
  targetRoleTitle: string;
  successorType: string;
  readinessLevel: string;
  potentialLevel: string;
  gridCell: string;
};
