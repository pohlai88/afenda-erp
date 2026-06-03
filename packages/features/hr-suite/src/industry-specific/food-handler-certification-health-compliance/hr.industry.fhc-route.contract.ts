export const hrIndustryFhcRoutePaths = {
  hub: "/hr/food-handler-certification-health-compliance",
} as const;

export type HrIndustryFhcRoutePath =
  (typeof hrIndustryFhcRoutePaths)[keyof typeof hrIndustryFhcRoutePaths];
