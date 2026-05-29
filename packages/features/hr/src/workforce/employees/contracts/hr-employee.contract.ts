export const HR_EMPLOYMENT_STATUSES = [
  "onboarding",
  "active",
  "probation",
  "confirmed",
  "suspended",
  "notice_period",
  "offboarding",
  "terminated",
  "separated",
  "retired",
  "archived",
] as const;

export type HrEmploymentStatus = (typeof HR_EMPLOYMENT_STATUSES)[number];

export type HrEmployeeDirectoryRow = {
  id: string;
  employeeNumber: string;
  displayName: string;
  email: string | null;
  employmentStatus: HrEmploymentStatus;
  departmentName: string | null;
  positionTitle: string | null;
  managerDisplayName: string | null;
  updatedAt: Date;
};

export type HrEmployeeDirectoryWindow = {
  rows: readonly HrEmployeeDirectoryRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};
