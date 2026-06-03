export const hrLifecycleRoutePaths = {
  hub: "/hr",
  lifecycle: "/hr/lifecycle",
} as const;

export type HrLifecycleRoutePath =
  (typeof hrLifecycleRoutePaths)[keyof typeof hrLifecycleRoutePaths];
