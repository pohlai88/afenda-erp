export const hrComplianceRoutePaths = {
  hub: "/hr",
  compliance: "/hr/compliance",
} as const;

export type HrComplianceRoutePath =
  (typeof hrComplianceRoutePaths)[keyof typeof hrComplianceRoutePaths];

/** Employee rows link to the module record detail route (ARCH-1003 / App Router). */
export function hrEmployeeDetailRoutePath(
  employeeId: string,
): `/hr/records/${string}` {
  return `/hr/records/${employeeId}`;
}
