export const hrComplianceRoutePaths = {
  hub: "/hr",
  compliance: "/hr/compliance",
} as const;

export type HrComplianceRoutePath =
  (typeof hrComplianceRoutePaths)[keyof typeof hrComplianceRoutePaths];

export function hrEmployeeDetailRoutePath(employeeId: string): `/hr/employees/${string}` {
  return `/hr/employees/${employeeId}`;
}
