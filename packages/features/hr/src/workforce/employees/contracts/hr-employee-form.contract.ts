export type HrEmployeeFormOption = {
  id: string;
  label: string;
};

export type HrEmployeeFormOptions = {
  departments: readonly HrEmployeeFormOption[];
  positions: readonly HrEmployeeFormOption[];
  managers: readonly HrEmployeeFormOption[];
};

export type HrEmployeeFormValues = {
  employeeNumber: string;
  legalName: string;
  preferredName: string | null;
  email: string | null;
  currentDepartmentId: string | null;
  currentPositionId: string | null;
  managerEmployeeId: string | null;
};
