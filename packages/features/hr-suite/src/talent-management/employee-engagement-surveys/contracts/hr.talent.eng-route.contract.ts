export const hrTalentEngRoutePaths = {
  hub: "/hr/employee-engagement-surveys",
} as const;

export type HrTalentEngRoutePath =
  (typeof hrTalentEngRoutePaths)[keyof typeof hrTalentEngRoutePaths];
