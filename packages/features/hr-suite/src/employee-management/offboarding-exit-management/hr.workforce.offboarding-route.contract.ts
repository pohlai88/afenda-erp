export const hrOffboardingRoutePaths = {
  offboarding: "/hr/offboarding",
} as const;

export type HrOffboardingRoutePath =
  (typeof hrOffboardingRoutePaths)[keyof typeof hrOffboardingRoutePaths];
