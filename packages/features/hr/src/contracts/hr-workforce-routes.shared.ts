import { HR_MODULE_ID } from "./module";

export const hrWorkforceRoutes = {
  hub: `/${HR_MODULE_ID}`,
  employees: `/${HR_MODULE_ID}/employees`,
  documents: `/${HR_MODULE_ID}/documents`,
  lifecycle: `/${HR_MODULE_ID}/lifecycle`,
  employeeCreate: `/${HR_MODULE_ID}/employees/new`,
  employeeDetail: (employeeId: string) =>
    `/${HR_MODULE_ID}/employees/${employeeId}`,
} as const;
