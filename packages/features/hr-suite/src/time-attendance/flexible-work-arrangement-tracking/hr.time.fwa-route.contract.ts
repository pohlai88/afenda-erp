export const hrFwaRoutePaths = {
  hub: "/hr/flexible-work-arrangement",
} as const;

export type HrFwaRoutePath =
  (typeof hrFwaRoutePaths)[keyof typeof hrFwaRoutePaths];
