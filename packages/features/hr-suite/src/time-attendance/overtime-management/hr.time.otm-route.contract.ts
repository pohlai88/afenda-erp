export const hrTimeOtmRoutePaths = {
  hub: "/apps/hrm/overtime",
} as const;

export const hrTimeOtmReadPermission = {
  module: "hr",
  object: "overtime",
  function: "read",
} as const;

export type HrTimeOtmRoutePath =
  (typeof hrTimeOtmRoutePaths)[keyof typeof hrTimeOtmRoutePaths];
