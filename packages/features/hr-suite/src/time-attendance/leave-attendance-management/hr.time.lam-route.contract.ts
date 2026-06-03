export const hrLamRoutePaths = {
  hub: "/hr/leave-attendance",
  leave: "/hr/leave",
  attendance: "/hr/attendance",
} as const;

export type HrLamRoutePath =
  (typeof hrLamRoutePaths)[keyof typeof hrLamRoutePaths];
