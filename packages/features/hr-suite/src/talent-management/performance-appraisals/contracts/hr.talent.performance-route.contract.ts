export const hrPerformanceRoutePaths = {
  hub: "/hr/performance-appraisals",
} as const;

export type HrPerformanceRoutePath =
  (typeof hrPerformanceRoutePaths)[keyof typeof hrPerformanceRoutePaths];
