export const hrSuccessionRoutePaths = {
  hub: "/hr/succession-planning",
} as const;

export const hrSuccessionPlanningRoutePaths = hrSuccessionRoutePaths;

export type HrSuccessionRoutePath =
  (typeof hrSuccessionRoutePaths)[keyof typeof hrSuccessionRoutePaths];

export type HrSuccessionPlanningRoutePath = HrSuccessionRoutePath;

export function hrSuccessionCriticalRoleDetailRoutePath(
  criticalRoleId: string,
): `/hr/succession-planning/critical-roles/${string}` {
  return `/hr/succession-planning/critical-roles/${criticalRoleId}`;
}

export function hrSuccessionSuccessorDetailRoutePath(
  successorNominationId: string,
): `/hr/succession-planning/successors/${string}` {
  return `/hr/succession-planning/successors/${successorNominationId}`;
}
