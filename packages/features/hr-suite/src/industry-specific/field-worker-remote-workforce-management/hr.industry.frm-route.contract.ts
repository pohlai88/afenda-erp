export const hrIndustryFrmRoutePaths = {
  hub: "/hr/field-worker-remote-workforce-management",
} as const;

export type HrIndustryFrmRoutePath =
  (typeof hrIndustryFrmRoutePaths)[keyof typeof hrIndustryFrmRoutePaths];

export function hrIndustryFrmAssignmentDetailRoutePath(assignmentId: string) {
  return `/hr/field-worker-remote-workforce-management/assignments/${assignmentId}` as const;
}
