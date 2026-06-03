export const hrBonusRoutePaths = {
  hub: "/hr",
  bonus: "/hr/bonus",
} as const;

export type HrBonusRoutePath =
  (typeof hrBonusRoutePaths)[keyof typeof hrBonusRoutePaths];
