export const hrIndustryMscRoutePaths = {
  hub: "/hr/manufacturing-safety-training-osha-compliance",
} as const;

export type HrIndustryMscRoutePath =
  (typeof hrIndustryMscRoutePaths)[keyof typeof hrIndustryMscRoutePaths];
