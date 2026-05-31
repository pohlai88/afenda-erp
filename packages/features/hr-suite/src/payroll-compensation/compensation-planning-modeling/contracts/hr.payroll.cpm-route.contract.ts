export const hrCpmRoutePaths = {
  hub: "/hr",
  compensationPlanning: "/hr/compensation-planning",
  reports: "/hr/compensation-planning/reports",
  audit: "/hr/compensation-planning/audit",
} as const;

export type HrCpmRoutePath = (typeof hrCpmRoutePaths)[keyof typeof hrCpmRoutePaths];

export function hrCpmCycleDetailRoutePath(cycleId: string): `/hr/compensation-planning/cycles/${string}` {
  return `/hr/compensation-planning/cycles/${cycleId}`;
}

export function hrCpmParticipantDetailRoutePath(input: {
  cycleId: string;
  participantId: string;
}): `/hr/compensation-planning/cycles/${string}/participants/${string}` {
  return `/hr/compensation-planning/cycles/${input.cycleId}/participants/${input.participantId}`;
}
