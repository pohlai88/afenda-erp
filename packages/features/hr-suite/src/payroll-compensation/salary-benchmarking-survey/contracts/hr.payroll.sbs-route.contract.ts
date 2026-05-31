export const hrSbsRoutePaths = {
  hub: "/hr/salary-benchmarking",
  reports: "/hr/salary-benchmarking/reports",
  audit: "/hr/salary-benchmarking/audit",
} as const;

export type HrSbsRoutePath = (typeof hrSbsRoutePaths)[keyof typeof hrSbsRoutePaths];
