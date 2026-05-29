export const CANDIDATE_PORTAL_CAREERS_SURFACE_KEY =
  "portal:candidate:careers" as const
export const CANDIDATE_PORTAL_APPLICATION_STATUS_SURFACE_KEY =
  "portal:candidate:application-status" as const
export const CANDIDATE_PORTAL_CAREERS_DETAIL_SURFACE_KEY =
  "portal:candidate:careers-detail" as const

export function candidatePortalListHeader(columnsId: string) {
  return { title: columnsId }
}
