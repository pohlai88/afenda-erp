export const hrTimeOtmRoutePaths = {
  hub: "/apps/hrm/overtime",
} as const;

export type HrTimeOtmRoutePath =
  (typeof hrTimeOtmRoutePaths)[keyof typeof hrTimeOtmRoutePaths];
