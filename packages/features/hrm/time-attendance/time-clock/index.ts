export { HRM_TCI_AUDIT, type HrmTciAuditAction } from "./tci.contract"

export {
  HRM_TCI_SPEC_MAP,
  listHrmTciSpecCodes,
  type HrmTciSpecArea,
  type HrmTciSpecCode,
} from "./tci-spec-map.shared"

export {
  TCI_LIST_SURFACE_IDS,
  TCI_STAT_SURFACE_KEY,
  type TciListSurfaceId,
} from "./data/tci-surface-metadata.shared"

export {
  TCI_BREAK_PUNCH_EVENT_TYPES,
  TCI_CLOCK_IN_OUT_PUNCH_EVENT_TYPES,
  TCI_DEVICE_TYPES,
  TCI_DEVICE_STATES,
  TCI_DEVICE_REGISTRY_STATES,
  TCI_DEVICE_SYNC_STATUSES,
  TCI_PUNCH_EVENT_TYPES,
  TCI_EXCEPTION_STATES,
  TCI_DETECTION_OUTCOMES,
  isTciBreakPunchEventType,
  isTciClockInOutPunchEventType,
  type TciBreakPunchEventType,
  type TciClockInOutPunchEventType,
  type TciDeviceType,
  type TciDeviceState,
  type TciDeviceRegistryState,
  type TciDeviceSyncStatus,
  type TciPunchEventType,
} from "./schemas/tci-workflow-state.shared"

export {
  TCI_PHYSICAL_DEVICE_TYPES,
  TCI_DIGITAL_DEVICE_TYPES,
  TCI_INTEGRATION_INGEST_CHANNELS,
  TCI_VENDOR_INTEGRATION_ADAPTER_IDS,
  assertTimeClockDeviceTypePartition,
  isDigitalTimeClockDeviceType,
  isPhysicalTimeClockDeviceType,
  listTciIntegrationIngestChannels,
  type TciDigitalDeviceType,
  type TciIntegrationChannelKind,
  type TciIntegrationIngestChannel,
  type TciPhysicalDeviceType,
  type TciVendorIntegrationAdapterId,
} from "./tci-integration-sources.shared"

export {
  TCI_DEVICE_TYPE_FAMILIES,
  TCI_HRM_TCI_002_DEVICE_TYPES,
  TCI_MOBILE_CLOCK_FAMILY,
  assertHrmTci002DeviceTypeCoverage,
  listTciRegistryDeviceTypeFamilies,
  type TciDeviceTypeFamily,
  type TciDeviceTypeFamilyId,
  type TciHrmTci002DeviceType,
} from "./tci-device-types.shared"

export {
  TCI_DEVICE_RECORD_MAINTENANCE_OPERATIONS,
  TCI_DEVICE_RECORD_MAINTENANCE_SURFACES,
  TCI_DEVICE_RECORD_TABLE,
  assertHrmTci003DeviceRecordMaintenance,
  type TciDeviceRecordMaintenanceOperation,
} from "./tci-device-registry.shared"

export {
  TCI_DEVICE_METADATA_CAPTURE_SURFACES,
  TCI_DEVICE_METADATA_FIELD_BINDINGS,
  TCI_HRM_TCI_004_METADATA_FIELDS,
  assertHrmTci004DeviceMetadataCapture,
  type TciDeviceMetadataCaptureSurface,
  type TciDeviceMetadataFieldBinding,
  type TciHrmTci004MetadataField,
} from "./tci-device-metadata.shared"

export {
  TCI_EMPLOYEE_MAPPING_FIELD_BINDINGS,
  TCI_EMPLOYEE_MAPPING_MAINTENANCE_OPERATIONS,
  TCI_EMPLOYEE_MAPPING_MAINTENANCE_SURFACES,
  TCI_EMPLOYEE_MAPPING_TABLE,
  TCI_HRM_TCI_005_IDENTITY_FIELDS,
  assertHrmTci005EmployeeMapping,
  type TciEmployeeMappingFieldBinding,
  type TciEmployeeMappingMaintenanceOperation,
  type TciEmployeeMappingMaintenanceSurface,
  type TciHrmTci005IdentityField,
} from "./tci-employee-mapping.shared"

export {
  TCI_ATTENDANCE_EVENT_DEVICE_SOURCE,
  TCI_CLOCK_PUNCH_CAPTURE_FIELD_BINDINGS,
  TCI_CLOCK_PUNCH_CAPTURE_SURFACES,
  TCI_HRM_TCI_006_CAPTURE_FIELDS,
  TCI_RECENT_CLOCK_PUNCH_LIST_LIMIT,
  assertHrmTci006ClockPunchCapture,
  assertTciClockInOutEventTypes,
  type TciClockPunchCaptureFieldBinding,
  type TciClockPunchCaptureSurface,
  type TciHrmTci006CaptureField,
} from "./tci-clock-punch-capture.shared"

export {
  TCI_API_INGEST_SOURCE_KIND,
  TCI_API_INGEST_ROUTE_PATH,
  TCI_API_INGEST_ORG_HEADER,
  TCI_API_INGEST_BATCH_SCHEMA,
  TCI_API_INGEST_ENV_KEYS,
  TCI_API_INGEST_OVERRIDE_ENV,
  TCI_API_INGEST_SURFACES,
  assertHrmTci010ApiIngest,
  isTciApiIngestSourceKind,
  type TciApiIngestSurface,
} from "./tci-api-ingest.shared"

export {
  TCI_MANUAL_IMPORT_SOURCE_KIND,
  TCI_MANUAL_IMPORT_ADAPTER_ID,
  TCI_MANUAL_IMPORT_JOB_SYNC_BATCH_METADATA_KEY,
  TCI_MANUAL_IMPORT_REQUIRED_HEADERS,
  TCI_MANUAL_IMPORT_SURFACES,
  assertHrmTci009ManualImport,
  isTciManualImportSourceKind,
  type TciManualImportSurface,
} from "./tci-manual-import.shared"

export {
  TCI_OFFLINE_REPLAY_SOURCE_KIND,
  TCI_OFFLINE_REPLAY_DEVICE_TYPES,
  TCI_OFFLINE_REPLAY_BATCH_SCHEMA,
  TCI_OFFLINE_REPLAY_OVERRIDE_ENV,
  TCI_OFFLINE_REPLAY_SERVER_ACTION,
  TCI_OFFLINE_REPLAY_SURFACES,
  assertHrmTci012OfflineReplay,
  isTciOfflineReplaySourceKind,
  type TciOfflineReplaySurface,
} from "./tci-offline-replay.shared"

export {
  TCI_DEDUPLICATION_ATTENDANCE_HASH_COLUMN,
  TCI_DEDUPLICATION_PUNCH_FIELD,
  TCI_DEDUPLICATION_DETECTION_OUTCOME,
  TCI_DEDUPLICATION_PERSIST_OUTCOME,
  TCI_DEDUPLICATION_BATCH_COUNTER_FIELD,
  TCI_DEDUPLICATION_SURFACES,
  assertHrmTci013Deduplication,
  resolveTimeClockPunchPayloadHash,
  type TciDeduplicationSurface,
  type TimeClockPunchPayloadHashInput,
} from "./tci-deduplication.shared"

export {
  TCI_ACTIVE_EMPLOYEE_EMPLOYMENT_STATUS,
  TCI_ACTIVE_EMPLOYEE_STATUS_COLUMN,
  TCI_ACTIVE_EMPLOYEE_TABLE,
  TCI_INACTIVE_EMPLOYEE_DETECTION_OUTCOME,
  TCI_UNKNOWN_EMPLOYEE_DETECTION_OUTCOME,
  TCI_ACTIVE_EMPLOYEE_VALIDATION_SURFACES,
  assertHrmTci014ActiveEmployeeValidation,
  isTciPunchEligibleEmploymentStatus,
  resolveTimeClockEmployeeStatusValidation,
  type TciActiveEmployeeValidationSurface,
  type TimeClockEmployeeStatusValidationResult,
} from "./tci-active-employee-validation.shared"

export {
  TCI_DEVICE_MAPPING_TABLE,
  TCI_DEVICE_MAPPING_ACTIVE_STATE,
  TCI_DEVICE_MAPPING_CLOCK_USER_FIELD,
  TCI_UNMAPPED_DEVICE_USER_DETECTION_OUTCOME,
  TCI_DEVICE_MAPPING_LOOKUP_SYMBOL,
  TCI_DEVICE_MAPPING_VALIDATION_SURFACES,
  assertHrmTci015DeviceMappingValidation,
  resolveTimeClockDeviceMappingValidation,
  type TciDeviceMappingValidationSurface,
  type TimeClockActiveDeviceMappingRow,
  type TimeClockDeviceMappingValidationResult,
} from "./tci-device-mapping-validation.shared"

export {
  TCI_PUNCH_CLASSIFICATION_TAXONOMY,
  TCI_PUNCH_CLASSIFICATION_SURFACES,
  TCI_TRANSFER_PUNCH_EVENT_TYPE,
  TCI_CORRECTION_PUNCH_EVENT_TYPE,
  assertHrmTci016PunchClassification,
  isTciClassifiedPunchEventType,
  isTciClockInOutClassification,
  isTciBreakClassification,
  resolveTimeClockPunchClassification,
  type TciPunchClassificationEntry,
  type TciPunchClassificationRequirement,
  type TimeClockPunchClassificationResult,
} from "./tci-punch-classification.shared"

export {
  TCI_MISSING_PUNCH_CODES,
  TCI_MISSING_PUNCH_DETECTION_SURFACES,
  TCI_MISSING_PUNCH_LAM_HANDOFF_SYMBOL,
  TCI_MISSING_PUNCH_AGGREGATOR_SYMBOL,
  assertHrmTci017MissingPunchDetection,
  detectMissingPunchesInDeviceEventSequence,
  extractMissingPunchCodesFromAttendanceSnapshot,
  isTciMissingPunchCode,
  type TciMissingPunchCode,
  type TciMissingPunchFinding,
} from "./tci-missing-punch-detection.shared"

export {
  TCI_DUPLICATE_PUNCH_DETECTION_OUTCOME,
  TCI_DUPLICATE_DETECTION_SURFACES,
  TCI_DUPLICATE_SEQUENCE_CODES,
  TCI_DUPLICATE_EXCEPTION_TABLE,
  assertHrmTci018DuplicateDetection,
  detectDuplicatePunchesInDeviceEventSequence,
  extractDuplicatePunchCodesFromAttendanceSnapshot,
  isTciDuplicateDetectionCode,
  isTciDuplicatePunchDetectionOutcome,
  type TciDuplicateDetectionCode,
  type TciDuplicatePunchFinding,
  type TciDuplicateSequenceCode,
} from "./tci-duplicate-detection.shared"

export {
  TCI_SHIFT_ASSIGNMENT_TABLE,
  TCI_SHIFT_MATCH_LOOKUP_SYMBOL,
  TCI_SHIFT_MATCH_OUTSIDE_OUTCOME,
  TCI_SHIFT_MATCH_STATUSES,
  TCI_SHIFT_MATCHING_SURFACES,
  TCI_SHIFT_WINDOW_MS,
  assertHrmTci020ShiftMatching,
  isTimeClockPunchWithinShiftWindow,
  isTciShiftMatchStatus,
  resolveTimeClockShiftMatchStatus,
  type TciShiftAssignmentWindow,
  type TciShiftMatchStatus,
} from "./tci-shift-matching.shared"

export {
  TCI_OTM_WORK_HOUR_DAY_TABLE,
  TCI_OTM_WORKED_MINUTES_FIELD,
  TCI_OTM_OVERTIME_MINUTES_FIELD,
  TCI_OTM_ATTENDANCE_COMPARE_SYMBOL,
  TCI_OTM_WORK_HOURS_RANGE_SYMBOL,
  TCI_OTM_WORK_HOUR_EXPOSURE_STATUSES,
  TCI_OVERTIME_REFERENCE_SURFACES,
  assertHrmTci022OvertimeReference,
  isTciOtmWorkHourExposureStatus,
  resolveTimeClockOtmWorkHourExposureStatus,
  type TciOtmWorkHourExposureStatus,
  type TciOvertimeReferenceSurface,
} from "./tci-overtime-reference.shared"

export {
  TCI_PAYROLL_APPROVED_DAY_TABLE,
  TCI_PAYROLL_RAW_EVENT_TABLE,
  TCI_PAYROLL_RAW_EVENT_SOURCE,
  TCI_PAYROLL_READINESS_SYMBOL,
  TCI_PAYROLL_LIST_DAYS_SYMBOL,
  TCI_PAYROLL_RUN_INPUT_SYMBOL,
  TCI_PAYROLL_PERIOD_LOCK_SYMBOL,
  TCI_PAYROLL_EXPOSURE_STATUSES,
  TCI_PAYROLL_REFERENCE_SURFACES,
  assertHrmTci023PayrollReference,
  isTciPayrollExposureStatus,
  resolveTimeClockPayrollExposureStatus,
  type TciPayrollExposureStatus,
  type TciPayrollReferenceSurface,
} from "./tci-payroll-reference.shared"

export {
  TCI_CORRECTION_EXCEPTION_TABLE,
  TCI_CORRECTION_DECIDE_SYMBOL,
  TCI_CORRECTION_LAM_DIALOG_SYMBOL,
  TCI_CORRECTION_LAM_SUBMIT_SYMBOL,
  TCI_CORRECTION_HR_OVERRIDE_FIELD,
  TCI_CORRECTION_CATEGORIES,
  TCI_CORRECTION_WORKFLOW_STEPS,
  TCI_CORRECTION_WORKFLOW_SURFACES,
  assertHrmTci024CorrectionWorkflow,
  isTciCorrectionCategory,
  resolveCorrectionCategoryFromDetectionOutcome,
  resolveCorrectionCategoryFromLamCodes,
  type TciCorrectionCategory,
  type TciCorrectionWorkflowStep,
  type TciCorrectionWorkflowSurface,
} from "./tci-correction-workflow.shared"

export {
  TCI_CORRECTION_HRM_MODULE,
  TCI_CORRECTION_EXCEPTION_DECIDE_PERMISSION,
  TCI_CORRECTION_LAM_PERMISSION,
  TCI_CORRECTION_ACCESS_RESOLVER_SYMBOL,
  TCI_CORRECTION_EXCEPTION_DECIDE_ACTION_SYMBOL,
  TCI_CORRECTION_LAM_ACTION_SYMBOL,
  TCI_CORRECTION_ACCESS_SURFACES,
  assertHrmTci025CorrectionAccessControl,
  type TciCorrectionAccessSurface,
} from "./tci-correction-access.shared"

export {
  TCI_SYNC_MONITORING_DEVICE_TABLE,
  TCI_SYNC_MONITORING_STALE_MS,
  TCI_SYNC_MONITORING_WATCH_SYMBOL,
  TCI_SYNC_MONITORING_CRON_SYMBOL,
  TCI_SYNC_MONITORING_NOTIFY_SYMBOL,
  TCI_SYNC_MONITORING_DISPATCHER_SYMBOL,
  TCI_SYNC_MONITORING_ALERT_PERMISSION,
  TCI_SYNC_MONITORING_ALERT_REASONS,
  TCI_SYNC_MONITORING_ATTENTION_KINDS,
  TCI_SYNC_MONITORING_SURFACES,
  assertHrmTci026SyncMonitoring,
  isTimeClockDeviceSyncAttention,
  resolveTimeClockSyncMonitoringAttentionKind,
  type TciSyncMonitoringAlertReason,
  type TciSyncMonitoringAttentionKind,
  type TciSyncMonitoringSurface,
} from "./tci-sync-monitoring.shared"

export {
  TCI_DEVICE_ADMIN_HRM_MODULE,
  TCI_DEVICE_ADMIN_PERMISSION,
  TCI_DEVICE_ADMIN_CREDENTIAL_COLUMN,
  TCI_DEVICE_ADMIN_UPSERT_ACTION_SYMBOL,
  TCI_DEVICE_ADMIN_REVOKE_ACTION_SYMBOL,
  TCI_DEVICE_ADMIN_UPSERT_COMMAND_SYMBOL,
  TCI_DEVICE_ADMIN_REVOKE_COMMAND_SYMBOL,
  TCI_DEVICE_ADMIN_ACCESS_RESOLVER_SYMBOL,
  TCI_DEVICE_ADMIN_CAN_MANAGE_FLAG,
  TCI_DEVICE_ADMIN_ACCESS_SURFACES,
  assertHrmTci027DeviceAdminAccessControl,
  type TciDeviceAdminAccessSurface,
} from "./tci-device-admin-access.shared"

export {
  TCI_REPORT_BUILD_SYMBOL,
  TCI_REPORT_EXPORT_ACTION_SYMBOL,
  TCI_REPORT_FILTER_OPTIONS_SYMBOL,
  TCI_REPORT_FILTER_DIMENSIONS,
  TCI_REPORT_EXCEPTION_TYPE_FIELD,
  TCI_REPORT_SYNC_STATUS_FIELD,
  TCI_REPORT_ROW_KINDS,
  TCI_REPORT_CSV_COLUMNS,
  TCI_OPERATIONAL_REPORT_SURFACES,
  assertHrmTci028OperationalReports,
  shouldIncludeTciReportRowKind,
  isTciReportRowKind,
  type TciReportFilterDimension,
  type TciReportRowKind,
  type TciOperationalReportSurface,
} from "./tci-operational-reports.shared"

export {
  TCI_RAW_PUNCH_LEDGER_TABLE,
  TCI_RAW_PUNCH_LEDGER_SOURCE,
  TCI_APPROVED_ATTENDANCE_OUTCOME_TABLE,
  TCI_RAW_VS_APPROVED_PERSIST_SYMBOL,
  TCI_RAW_VS_APPROVED_REGENERATE_SYMBOL,
  TCI_RAW_VS_APPROVED_PAYROLL_READ_SYMBOL,
  TCI_RAW_VS_APPROVED_RELATIONSHIPS,
  TCI_RAW_VS_APPROVED_SURFACES,
  assertHrmTci029RawVsApprovedSeparation,
  resolveTimeClockRawVsApprovedRelationship,
  isTciRawVsApprovedRelationship,
  type TciRawVsApprovedRelationship,
  type TciRawVsApprovedSurface,
} from "./tci-raw-vs-approved.shared"

export {
  TCI_AUDIT_LEDGER_TABLE,
  TCI_AUDIT_ACTION_PREFIX,
  TCI_AUDIT_LAM_CORRECTION_SYMBOL,
  TCI_AUDIT_TRAIL_LIST_SYMBOL,
  TCI_AUDIT_DOMAINS,
  TCI_AUDIT_DOMAIN_ACTIONS,
  TCI_AUDIT_TRAIL_SURFACES,
  assertHrmTci030AuditTrail,
  type TciAuditDomain,
  type TciAuditTrailEmitter,
} from "./tci-audit-trail.shared"

export {
  TCI_LAM_ATTENDANCE_DAY_TABLE,
  TCI_LAM_ATTENDANCE_EVENT_TABLE,
  TCI_LAM_AGGREGATOR_SYMBOL,
  TCI_LAM_EXPOSURE_STATUSES,
  TCI_LAM_HANDOFF_SYMBOL,
  TCI_LAM_REGENERATE_RESULTS,
  TCI_ATTENDANCE_HANDOFF_PERSIST_SYMBOL,
  TCI_ATTENDANCE_HANDOFF_SURFACES,
  assertHrmTci021AttendanceHandoff,
  isTciLamExposureStatus,
  isTciLamRegenerateResult,
  resolveTimeClockLamExposureStatus,
  type TciAttendanceHandoffSurface,
  type TciLamExposureStatus,
  type TciLamRegenerateResult,
} from "./tci-attendance-handoff.shared"

export {
  TCI_ABNORMAL_PUNCH_INGEST_OUTCOME,
  TCI_ABNORMAL_PUNCH_LAM_CODES,
  TCI_ABNORMAL_PUNCH_TAXONOMY,
  TCI_ABNORMAL_PUNCH_DETECTION_SURFACES,
  TCI_ABNORMAL_PUNCH_LAM_HANDOFF_SYMBOL,
  assertHrmTci019AbnormalPunchDetection,
  detectAbnormalPunchesInDeviceEventSequence,
  extractAbnormalPunchCodesFromAttendanceSnapshot,
  isTciAbnormalPunchLamCode,
  isTciAbnormalPunchIngestOutcome,
  type TciAbnormalPunchLamCode,
  type TciAbnormalPunchFinding,
  type TciAbnormalPunchRequirement,
} from "./tci-abnormal-punch-detection.shared"

export {
  TCI_SCHEDULED_SYNC_SOURCE_KIND,
  TCI_SCHEDULED_SYNC_CRON_ROUTE_PATH,
  TCI_SCHEDULED_SYNC_INTERVAL_ENV,
  TCI_SCHEDULED_SYNC_OVERRIDE_ENV,
  TCI_SCHEDULED_SYNC_VENDOR_CREDENTIAL_PREFIXES,
  TCI_SCHEDULED_SYNC_SURFACES,
  TCI_DEFAULT_SYNC_INTERVAL_MINUTES,
  TCI_SCHEDULED_SYNC_MIN_INTERVAL_MINUTES,
  resolveTimeClockSyncIntervalMs,
  isDeviceConfiguredForScheduledVendorSync,
  isDeviceDueForScheduledSync,
  formatScheduledSyncCredentialHint,
  assertHrmTci011ScheduledSync,
  isTciScheduledSyncSourceKind,
  type TciScheduledSyncSurface,
} from "./tci-scheduled-sync.shared"

export {
  TCI_AUTOMATED_SYNC_SOURCE_KINDS,
  TCI_AUTOMATED_SYNC_CRON_JOB,
  TCI_AUTOMATED_SYNC_SURFACES,
  TCI_SYNC_BATCH_TABLE,
  TCI_SYNC_BATCH_STATES,
  assertHrmTci008AutomatedSync,
  isTciAutomatedSyncSourceKind,
  type TciAutomatedSyncSourceKind,
  type TciAutomatedSyncSurface,
  type TciSyncBatchState,
} from "./tci-automated-sync.shared"

export {
  TCI_BREAK_PUNCH_CAPTURE_FIELD_BINDINGS,
  TCI_BREAK_PUNCH_CAPTURE_SURFACES,
  TCI_HRM_TCI_007_CAPTURE_FIELDS,
  TCI_RECENT_BREAK_PUNCH_LIST_LIMIT,
  assertHrmTci007BreakPunchCapture,
  assertTciBreakPunchEventTypes,
  type TciBreakPunchCaptureFieldBinding,
  type TciBreakPunchCaptureSurface,
  type TciHrmTci007CaptureField,
} from "./tci-break-punch-capture.shared"

export { TimeClockPage } from "./components/time-clock-page"
export { TimeClockPageGate } from "./components/time-clock-page-gate"
export { TimeClockPageLoading } from "./components/time-clock-page-loading"
