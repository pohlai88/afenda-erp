export const hrWorkforceEssRoutePaths = {
  hub: "/hr/employee-selfservice-portal",
} as const;

export type HrWorkforceEssRoutePath =
  (typeof hrWorkforceEssRoutePaths)[keyof typeof hrWorkforceEssRoutePaths];
