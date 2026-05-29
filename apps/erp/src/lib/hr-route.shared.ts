export const HR_MODULE_ID = "hr" as const;

export const hrRoutePaths = {
  hub: "/hr",
  employees: "/hr/employees",
  departments: "/hr/departments",
  positions: "/hr/positions",
  orgChart: "/hr/org-chart",
  documents: "/hr/documents",
  lifecycle: "/hr/lifecycle",
  offboarding: "/hr/offboarding",
  compliance: "/hr/compliance",
  leave: "/hr/leave",
  onboarding: "/hr/onboarding",
  attendance: "/hr/attendance",
  overtime: "/hr/overtime",
  shifts: "/hr/shifts",
} as const;

export type HrSectionSlug =
  | "employees"
  | "departments"
  | "positions"
  | "org-chart"
  | "documents"
  | "lifecycle"
  | "offboarding"
  | "compliance"
  | "leave"
  | "onboarding"
  | "attendance"
  | "overtime"
  | "shifts";

export function hrEmployeeDetailPath(employeeId: string) {
  return `${hrRoutePaths.employees}/${employeeId}`;
}

export type HrSectionRoute =
  | { kind: "section"; slug: HrSectionSlug }
  | { kind: "employee-create" }
  | { kind: "employee-detail"; employeeId: string };

export function hrEmployeeCreatePath() {
  return `${hrRoutePaths.employees}/new`;
}

export function assertHrModuleId(moduleId: string): asserts moduleId is typeof HR_MODULE_ID {
  if (moduleId !== HR_MODULE_ID) {
    throw new Error(`Expected HR module route, received "${moduleId}".`);
  }
}
