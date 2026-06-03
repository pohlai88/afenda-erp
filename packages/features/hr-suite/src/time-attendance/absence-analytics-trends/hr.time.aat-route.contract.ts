export const hrAatRoutePaths = {
  hub: "/hr/absence-analytics-trends",
} as const;

export type HrAatRoutePath = (typeof hrAatRoutePaths)[keyof typeof hrAatRoutePaths];
