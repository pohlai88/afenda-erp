export const hrOrgRoutePaths = {
  hub: "/hr",
  org: "/hr/org",
} as const;

export type HrOrgRoutePath =
  (typeof hrOrgRoutePaths)[keyof typeof hrOrgRoutePaths];
