export const hrIndustryUcbRoutePaths = {
  hub: "/hr/union-management",
} as const;

export type HrIndustryUcbRoutePath =
  (typeof hrIndustryUcbRoutePaths)[keyof typeof hrIndustryUcbRoutePaths];
