export const hrTalentRonReadPermission = {
  module: "hr",
  object: "recruitment_onboarding",
  function: "read",
} as const;

export const hrTalentRonWritePermission = {
  module: "hr",
  object: "recruitment_onboarding",
  function: "write",
} as const;

export const hrTalentRonApprovePermission = {
  module: "hr",
  object: "recruitment_onboarding",
  function: "approve",
} as const;

export type HrRonRequisitionListRow = {
  id: string;
  title: string;
  departmentName: string;
  hiringManagerDisplayName: string;
  requisitionType: string;
  headcount: string;
  status: string;
};

export type HrRonApplicationListRow = {
  id: string;
  candidateDisplayName: string;
  requisitionTitle: string;
  source: string;
  stage: string;
  status: string;
};

export type HrRonReadinessReference = {
  employeeReferenceId: string;
  employeeRecordsReady: boolean;
  payrollReady: boolean;
  iamReady: boolean;
  documentManagementReady: boolean;
  employeeLifecycleReady: boolean;
};
