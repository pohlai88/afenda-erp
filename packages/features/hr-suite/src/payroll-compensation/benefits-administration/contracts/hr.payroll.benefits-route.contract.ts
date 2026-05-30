export const hrBenefitsRoutePaths = {
  hub: "/hr",
  benefits: "/hr/benefits",
} as const;

export type HrBenefitsRoutePath =
  (typeof hrBenefitsRoutePaths)[keyof typeof hrBenefitsRoutePaths];
