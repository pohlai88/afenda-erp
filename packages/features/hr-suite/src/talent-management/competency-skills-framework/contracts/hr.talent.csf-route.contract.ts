export const hrCsfRoutePaths = {
  hub: "/hr/competency-skills",
  reports: "/hr/competency-skills/reports",
  audit: "/hr/competency-skills/audit",
  matching: "/hr/competency-skills/matching",
} as const;

export type HrCsfRoutePath = (typeof hrCsfRoutePaths)[keyof typeof hrCsfRoutePaths];
