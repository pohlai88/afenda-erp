export const hrTimeSftRoutePaths = {
  hub: "/apps/hrm/shift-scheduling",
} as const;

export type HrTimeSftRoutePath =
  (typeof hrTimeSftRoutePaths)[keyof typeof hrTimeSftRoutePaths];

/** HR section adapter route (`/hr/shift-scheduling`). */
export const hrSftRoutePaths = {
  hub: "/hr/shift-scheduling",
} as const;

export type HrSftRoutePath =
  (typeof hrSftRoutePaths)[keyof typeof hrSftRoutePaths];
