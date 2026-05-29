export const hrComplianceRoutePaths = {
  hub: "/hr",
  compliance: "/hr/compliance",
} as const;

export type HrComplianceRoutePath =
  (typeof hrComplianceRoutePaths)[keyof typeof hrComplianceRoutePaths];
