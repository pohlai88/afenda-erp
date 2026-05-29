export { timeClockIngestWorkflow } from "./data/tci-ingest.workflow"

export {
  countTimeClockKpiSummary,
  listTimeClockDevicesForOrg,
  listTimeClockMappingsForOrg,
  listTimeClockExceptionsForOrg,
  listRecentBreakPunchesForOrg,
  listTimeClockSyncBatchesForOrg,
  findTimeClockDeviceByExternalId,
} from "./data/tci.queries.server"

export { resolveTciBreakPunchCaptureEnabled } from "./data/tci-break-punch-enablement.server"

export { resolveTciApiIngestEnabled } from "./data/tci-api-ingest-enablement.server"

export { resolveTciScheduledSyncEnabled } from "./data/tci-scheduled-sync-enablement.server"

export { resolveTciOfflineReplayEnabled } from "./data/tci-offline-replay-enablement.server"

export { replayOfflineTimeClockPunchBatchAction } from "./actions/tci-offline-replay.actions"
export type { ReplayOfflineTimeClockBatchFormState } from "./tci-action-state.shared"

export { resolveTimeClockSurfaceAccess } from "./data/tci-access.server"

export type {
  TimeClockDeviceRow,
  TimeClockMappingRow,
  TimeClockKpiSummary,
  TimeClockExceptionRow,
  TimeClockPunchRecordRow,
  TimeClockSyncBatchRow,
} from "./data/tci.queries.server"

export type { TimeClockSurfaceAccess } from "./data/tci-access.server"

export {
  ingestTimeClockBatch,
  persistTimeClockPunch,
} from "./data/tci-punch-commands.server"
export type {
  IngestTimeClockBatchOptions,
  IngestTimeClockBatchResult,
} from "./data/tci-punch-commands.server"

export {
  revalidateTimeClockSurfaces,
  shouldRevalidateTimeClockUi,
  updateTimeClockOrgCacheTag,
} from "./data/tci-revalidate.server"
export { hrmTimeClockOrgCacheTag } from "./tci-cache-tags.shared"
export {
  shouldEnqueueTimeClockIngestWorkflow,
  TCI_INGEST_WORKFLOW_PUNCH_THRESHOLD,
} from "./tci-ingest-workflow.shared"
export {
  tciIngestRunPayloadSchema,
  type TciIngestRunPayload,
} from "./schemas/tci-ingest-run-payload.schema"
export {
  resolveTimeClockApiCredentialSha256,
  resolveTimeClockBearerTokenSha256,
} from "./tci-credential-lookup.shared"

export {
  ensureTimeClockManualImportSyncBatchForJob,
  finalizeTimeClockManualImportSyncBatchForJob,
  recordTimeClockManualImportRowOutcome,
} from "./data/tci-manual-import-batch.server"
export type { TimeClockManualImportRowOutcome } from "./data/tci-manual-import-batch.server"

export {
  resolveTimeClockIngestActor,
  type TimeClockIngestActor,
  type TimeClockIngestAuthKind,
} from "./data/tci-ingest-auth.server"

export { buildTimeClockReportCsv } from "./data/tci-report.server"

export {
  listDevicePunchesForEmployeeDate,
  hasDevicePunchOnDate,
  getDeviceAttendanceHoursForEmployeeDateRange,
} from "./data/tci-integration.server"

export { runTimeClockSyncWatchTick } from "./data/tci-sync-watch.server"
export type { TimeClockSyncWatchSummary } from "./data/tci-sync-watch.server"

export {
  runTimeClockScheduledSyncTick,
  runTimeClockCronSyncTick,
} from "./data/tci-scheduled-sync.server"
export type {
  TimeClockCronSyncSummary,
  TimeClockScheduledSyncSummary,
} from "./data/tci-scheduled-sync.server"

export {
  timeClockIngestBatchSchema,
  timeClockExceptionDecisionFormSchema,
} from "./schemas/tci.schema"

export { decideTimeClockPunchException } from "./data/tci-exception-commands.server"

export {
  loadTciWorkbenchSearchParams,
  serializeTciWorkbenchSearchParams,
  type TciWorkbenchSearchParamsLoaded,
} from "./schemas/tci.search-params"

export {
  buildTimeClockAuditTrailListSurfaceConfiguration,
  buildTimeClockAbnormalPunchFindingsListSurfaceConfiguration,
  buildTimeClockCorrectionWorkflowListSurfaceConfiguration,
  buildTimeClockDevicesListSurfaceConfiguration,
  buildTimeClockDuplicatePunchFindingsListSurfaceConfiguration,
  buildTimeClockExceptionsListSurfaceConfiguration,
  buildTimeClockKpiStatGroupConfigurations,
  buildTimeClockMappingsListSurfaceConfiguration,
  buildTimeClockMissingPunchFindingsListSurfaceConfiguration,
  buildTimeClockPunchRecordsListSurfaceConfiguration,
  buildTimeClockRawVsApprovedFindingsListSurfaceConfiguration,
  buildTimeClockShiftMatchFindingsListSurfaceConfiguration,
  buildTimeClockSyncBatchesListSurfaceConfiguration,
  buildTimeClockSyncMonitoringFindingsListSurfaceConfiguration,
} from "./data/tci-surface-builders.server"

export type { TimeClockAuditTrailRow } from "./data/tci-audit-trail.server"
export type { TimeClockAbnormalPunchFindingRow } from "./data/tci-abnormal-punch-detection.server"
export type { TimeClockCorrectionWorkflowRow } from "./data/tci-correction-workflow.server"
export type { TimeClockDuplicatePunchFindingRow } from "./data/tci-duplicate-detection.server"
export type { TimeClockMissingPunchFindingRow } from "./data/tci-missing-punch-detection.server"
export type { TimeClockRawVsApprovedRow } from "./data/tci-raw-vs-approved.server"
export type { TimeClockShiftMatchRow } from "./data/tci-shift-matching.server"
export type { TimeClockSyncMonitoringRow } from "./data/tci-sync-monitoring.server"
