export const hrIndustryGpgRoutePaths = {
  hub: "/hr/government-classification-pay-grades",
} as const;

export type HrIndustryGpgRoutePath =
  (typeof hrIndustryGpgRoutePaths)[keyof typeof hrIndustryGpgRoutePaths];
