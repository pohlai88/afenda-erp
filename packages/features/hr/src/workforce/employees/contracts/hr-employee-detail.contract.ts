import type { HrEmploymentStatus } from "./hr-employee.contract";

export type HrEmployeeDetail = {
  id: string;
  employeeNumber: string;
  legalName: string;
  preferredName: string | null;
  displayName: string;
  email: string | null;
  employmentStatus: HrEmploymentStatus;
  currentDepartmentId: string | null;
  currentPositionId: string | null;
  departmentName: string | null;
  positionTitle: string | null;
  managerDisplayName: string | null;
  managerEmployeeId: string | null;
  archivedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
};
