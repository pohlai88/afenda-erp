export const hrIndustryRwsRoutePaths = {
  hub: "/hr/retail-seasonal-hourly-workforce-scheduling",
} as const;

export type HrIndustryRwsRoutePath =
  (typeof hrIndustryRwsRoutePaths)[keyof typeof hrIndustryRwsRoutePaths];
