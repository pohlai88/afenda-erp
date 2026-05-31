export const hrTimeClockRoutePaths = {
  hub: "/hr/time-clock",
} as const;

export const hrTimeClockCapabilities = {
  read: "hr.timeClock.read",
  write: "hr.timeClock.write",
  admin: "hr.timeClock.admin",
} as const;

export type HrTimeClockCapability =
  (typeof hrTimeClockCapabilities)[keyof typeof hrTimeClockCapabilities];

export type HrTimeClockRoutePath =
  (typeof hrTimeClockRoutePaths)[keyof typeof hrTimeClockRoutePaths];
