export {
  resolveSuccessionSurfaceAccess,
  type SuccessionSurfaceAccess,
} from "./data/succession-access.server"
export { revalidateSuccessionSurfaces } from "./data/succession-revalidate.server"
export {
  listSuccessionCriticalRolesForOrg,
  listSuccessionCriticalRoleChoicesForOrg,
  createSuccessionCriticalRole,
  updateSuccessionCriticalRole,
} from "./data/succession-critical-roles.server"
export {
  listSuccessionNominationsForOrg,
  createSuccessionNomination,
  updateSuccessionNominationReadiness,
} from "./data/succession-nominations.server"
export {
  listSuccessionDevelopmentLinksForNomination,
  createSuccessionDevelopmentLink,
} from "./data/succession-development-links.server"
export {
  listSuccessionTalentPoolsForOrg,
  createSuccessionTalentPool,
  addSuccessionPoolMember,
} from "./data/succession-pools.server"
export {
  listSuccessionCalibrationSessionsForOrg,
  listSuccessionCalibrationEntriesForSession,
  createSuccessionCalibrationSession,
  updateSuccessionCalibrationEntry,
} from "./data/succession-calibration.server"
export {
  listSuccessionBenchStrength,
  listSuccessionRiskSnapshotsForOrg,
  listSuccessionReplacementPlansForOrg,
  listSuccessionReviewCyclesForOrg,
  computeSuccessionRiskSnapshots,
  createSuccessionReplacementPlan,
  getApprovedSuccessionRecommendationForLifecycle,
} from "./data/succession-bench.server"
export {
  listSuccessionPerformanceRefs,
  listSuccessionCompetencyGapStubs,
} from "./data/succession-integration.server"
export { summarizeSuccessionOrgOverview } from "./data/succession-overview.server"
export { buildSuccessionOrgReportCsv } from "./data/succession-reports.server"
export {
  buildSuccessionOverviewStatConfiguration,
  buildSuccessionCriticalRolesListSurfaceConfiguration,
  buildSuccessionNominationsListSurfaceConfiguration,
  buildSuccessionTalentPoolsListSurfaceConfiguration,
  buildSuccessionCalibrationSessionsListSurfaceConfiguration,
  buildSuccessionBenchStrengthListSurfaceConfiguration,
} from "./data/succession-surface-builders.server"
