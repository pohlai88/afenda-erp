import "server-only"

export * from "./offboarding-exit-management/server"

export {
  cancelPendingLifecycleTransition,
  runLifecycleTransitionDueTick,
} from "./employee-lifecycle-management/data/employee-lifecycle.mutations.server"
export type { LifecycleTransitionDueTickSummary } from "./employee-lifecycle-management/data/employee-lifecycle.mutations.server"

export { runContractExpiryWatchTick } from "./employee-lifecycle-management/data/contract-expiry-watch.server"
export type { ContractExpiryWatchTickSummary } from "./employee-lifecycle-management/data/contract-expiry-watch.server"

export {
  listProbationReviewCandidates,
  runProbationWatchTick,
} from "./employee-lifecycle-management/data/probation-watch.server"
export type { ProbationWatchTickSummary } from "./employee-lifecycle-management/data/probation-watch.server"

export {
  PROBATION_REVIEW_DUE_AUDIT_ACTION,
  PROBATION_WATCH_BATCH_LIMIT,
  probationReviewWindowBounds,
} from "./employee-lifecycle-management/data/probation-watch.shared"
export type { ProbationReviewCandidate } from "./employee-lifecycle-management/data/probation-watch.shared"

export { runOffboardingTaskOverdueTick } from "./offboarding-exit-management/data/offboarding-overdue-watch.server"
export type { OffboardingOverdueWatchTickSummary } from "./offboarding-exit-management/data/offboarding-overdue-watch.server"

export {
  createEmployeeMutation,
} from "./employee-records-management/data/employee.mutations.server"

export {
  getEmployeeForOrganization,
  listEmployeesForOrganization,
} from "./employee-records-management/data/employee.queries.server"

export type {
  EmployeeDetailRow,
  EmployeeRow,
} from "@afenda/feature-hrm-core/shared"

export {
  listDependentsForOrganization,
} from "./employee-records-management/data/dependent.queries.server"
export type { DependentRow } from "./employee-records-management/data/dependent.queries.server"

export {
  resolveEmployeeOrgContextReference,
} from "./employee-records-management/data/employee-org-context.queries.server"

export {
  requireMutableEmployeeRecord,
} from "./employee-records-management/data/employee-record-mutability.server"

export {
  listDepartmentsForOrg,
  listJobGradesForOrg,
  listPositionsForOrg,
} from "./organizational-chart-hierarchy/data/org-structure.queries.server"

export {
  resolveManagerApproverUserId,
} from "./organizational-chart-hierarchy/data/org-structure-approval.server"

export {
  buildOrganizationStructureExportCsv,
} from "./organizational-chart-hierarchy/data/org-structure-export.server"

export {
  buildWorkforceListSurfaceConfiguration,
} from "./employee-records-management/data/workforce-list-surface.server"

export {
  HRM_ORG_STRUCTURE_AUDIT,
} from "./organizational-chart-hierarchy/org-structure.contract"

export { HRM_ESS_AUDIT } from "./employee-selfservice-portal/ess.contract"
export { HRM_DOCUMENT_AUDIT } from "./documents-management/document.contract"

export {
  withPortalMutationSpan,
} from "./employee-selfservice-portal/data/portal-mutation-tracing.server"

export {
  transitionBoardingTask,
} from "./employee-lifecycle-management/data/boarding.mutations.server"

export {
  completeBoardingTasksForLmsCourseCompletion,
} from "./employee-lifecycle-management/data/boarding-lms-bridge.server"

export {
  onSignatureRequestSealedForBoardingTask,
} from "./employee-lifecycle-management/data/boarding-signature-seal-hook.server"

export type {
  DocumentEmployeeChoiceRow,
  EmployeeVisibleDocumentSummary,
  ListHrmDocumentsForOrgOptions,
  OrgHrmDocumentRow,
} from "./documents-management/data/hrm-document.queries.server"

export {
  listHrmDocumentsForEmployee,
} from "./documents-management/data/hrm-document.queries.server"

export {
  listRetentionDueDocuments,
  canUploadHrmDocumentForUser,
} from "./documents-management/data/hrm-document-governance.server"

export type {
  EmployeeDocumentReadinessRequirement,
  EmployeeDocumentReadinessSummary,
} from "./documents-management/data/hrm-document-governance.server"

export {
  getEmployeeDocumentReadiness,
  getSecureHrmDocumentDownload,
  listEmployeeVisibleDocuments,
  searchHrmDocumentsForCurrentOrg,
} from "./documents-management/data/hrm-document-guarded.server"

export {
  canUploadPortalEmployeeDocument,
} from "./employee-selfservice-portal/data/employee-portal-document-upload.server"
export { getEmployeePortalSectionNavLabels } from "./employee-selfservice-portal/data/employee-portal-nav-labels.server"

export {
  HRM_DOCUMENT_GROUPS,
  HRM_DOCUMENT_LIFECYCLE_STATUSES,
  HRM_DOCUMENT_CLASSIFICATIONS,
  HRM_DOCUMENT_TYPES,
  formatHrmDocumentSize,
  hrmDocumentGroupForType,
  hrmDocumentTypeLabelKey,
  hrmDocumentClassificationTone,
  hrmDocumentTypeTone,
  isHrmDocumentClassification,
  isHrmDocumentGroup,
  isHrmDocumentLifecycleStatus,
  isHrmDocumentType,
  shortenPayloadHash,
} from "./documents-management/data/hrm-document-display.shared"

export type {
  HrmDocumentClassification,
  HrmDocumentClassificationTone,
  HrmDocumentGroup,
  HrmDocumentLifecycleStatus,
  HrmDocumentType,
  HrmDocumentTypeTone,
} from "./documents-management/data/hrm-document-display.shared"

export {
  HRM_DOCUMENT_READINESS_SURFACE,
  HRM_DOCUMENT_SURFACE_COLUMNS,
  HRM_DOCUMENT_SURFACE_FILTERS,
  HRM_DOCUMENT_SURFACE_ROW_ACTIONS,
} from "./documents-management/data/hrm-document-surface-metadata.shared"

export {
  blobUrlMatchesOrgHrmEmployeePath,
  deriveHrmDocumentGroup,
} from "./documents-management/data/hrm-document-governance.shared"

export {
  buildDocumentExpiryAuditMetadata,
  computeDocumentExpiryCutoff,
  daysToExpiry,
  DOCUMENT_EXPIRY_LOOKAHEAD_DAYS,
  DOCUMENT_EXPIRY_TIERS,
  DOCUMENT_EXPIRY_TIER_AUDIT_ACTIONS,
  DOCUMENT_EXPIRY_TIER_THRESHOLD_DAYS,
  DOCUMENT_EXPIRY_WATCH_BATCH_LIMIT,
  documentExpiryTiersCrossed,
  partitionDocumentExpiryEmissions,
} from "./documents-management/data/document-expiry-watch.shared"

export type {
  DocumentExpiryCandidate,
  DocumentExpiryTier,
  DocumentExpiryTierEmission,
} from "./documents-management/data/document-expiry-watch.shared"

export {
  listDocumentExpiryCandidates,
  runDocumentExpiryWatchTick,
} from "./documents-management/data/document-expiry-watch.server"

export type { DocumentExpiryWatchTickSummary } from "./documents-management/data/document-expiry-watch.server"

export {
  listComplianceEvidenceForPeriod,
  listComplianceEvidenceForOrg,
  getComplianceEvidence,
  fetchRunsForStatutoryPack,
  findEvidenceByDeliveryId,
} from "./compliance-regulatory-tracking/data/compliance.queries.server"

export type { ComplianceEvidenceRow } from "./compliance-regulatory-tracking/data/compliance.queries.server"

export { acknowledgeEvidenceTransition } from "./compliance-regulatory-tracking/data/compliance-acknowledgement.server"

export type {
  AcknowledgeEvidenceTransitionInput,
  AcknowledgeEvidenceTransitionResult,
} from "./compliance-regulatory-tracking/data/compliance-acknowledgement.server"

export { listComplianceEvidenceTimeline } from "./compliance-regulatory-tracking/data/compliance-timeline.queries.server"

export {
  COMPLIANCE_TIMELINE_KINDS,
  COMPLIANCE_TIMELINE_AUDIT_ACTIONS,
  COMPLIANCE_AUDIT_ACTION_TO_KIND,
  STATUTORY_PACK_EXPORT_AUDIT_ACTION,
  STATUTORY_PACK_REGENERATE_AUDIT_ACTION,
  complianceTimelineKindForAuditAction,
  isComplianceTimelineKind,
} from "./compliance-regulatory-tracking/data/compliance-timeline.shared"

export type {
  ComplianceTimelineEntry,
  ComplianceTimelineKind,
} from "./compliance-regulatory-tracking/data/compliance-timeline.shared"

export { getComplianceOperationalHealthSnapshot } from "./compliance-regulatory-tracking/data/compliance-operational-health.queries.server"

export type {
  ComplianceHealthSampleRow,
  ComplianceHealthSnapshot,
} from "./compliance-regulatory-tracking/data/compliance-operational-health.queries.server"

export {
  ageInDays,
  classifyComplianceEvidenceForOperationalHealth,
  COMPLIANCE_AGING_TIERS,
  COMPLIANCE_OPERATIONAL_HEALTH_AGING,
  COMPLIANCE_OPERATIONAL_HEALTH_ATTENTION_BUCKETS,
  COMPLIANCE_OPERATIONAL_HEALTH_BUCKETS,
  complianceAgingTiersCrossed,
  complianceAgingTierThresholdDays,
  effectiveAgeAnchorForRow,
  highestComplianceAgingTier,
  isAttentionBucket,
  isComplianceOperationalHealthBucket,
} from "./compliance-regulatory-tracking/data/compliance-operational-health.shared"

export type {
  ComplianceAgingTier,
  ComplianceHealthAttentionBucket,
  ComplianceHealthClassifierRow,
  ComplianceHealthDisplayedBucket,
  ComplianceOperationalHealthBucket,
} from "./compliance-regulatory-tracking/data/compliance-operational-health.shared"

export { buildStatutoryPackFromRuns } from "./compliance-regulatory-tracking/data/statutory-pack.server"

export type {
  StatutoryPackRunInput,
  StatutoryPackLineInput,
  StatutoryPackResult,
} from "./compliance-regulatory-tracking/data/statutory-pack.server"

export {
  STATUTORY_PACK_HASH_HEADER,
  STATUTORY_PACK_HASH_PREFIX,
  computeStatutoryPackResponseHash,
  formatStatutoryPackHashHeader,
  serializeStatutoryPackToCsv,
  statutoryPackFilename,
} from "./compliance-regulatory-tracking/data/statutory-pack-csv.shared"

export type { StatutoryPackCsvResult } from "./compliance-regulatory-tracking/data/statutory-pack-csv.shared"

export {
  STATUTORY_PACK_TO_EVENT_TYPE,
  STATUTORY_PACK_TO_ACK_EVENT_TYPE,
  STATUTORY_PACK_TO_AUTHORITY,
  ACKNOWLEDGEMENT_SOURCES,
  ackEventTypeForStatutoryPack,
  authorityForStatutoryPack,
  eventTypeForStatutoryPack,
  isAcknowledgementSource,
} from "./compliance-regulatory-tracking/data/statutory-event-types.shared"
export type { AcknowledgementSource } from "./compliance-regulatory-tracking/data/statutory-event-types.shared"

export {
  STATUTORY_RETRY_BASE_DELAY_MS,
  STATUTORY_RETRY_MAX_ATTEMPTS,
  STATUTORY_RETRY_MAX_DELAY_MS,
  STATUTORY_RETRY_BATCH_LIMIT,
  listStatutoryRetryCandidates,
  nextStatutoryRetryAt,
  retryStatutorySubmissionForEvidence,
  runStatutoryRetryTick,
  shouldRetryStatutorySubmission,
  statutoryRetryDelayMs,
} from "./compliance-regulatory-tracking/data/statutory-retry.server"

export type {
  StatutoryRetryCandidate,
  StatutoryRetryOutcome,
  StatutoryRetryTickSummary,
} from "./compliance-regulatory-tracking/data/statutory-retry.server"

export {
  BUREAU_RELIABILITY_AUTHORITIES,
  BUREAU_RELIABILITY_CRITICAL_THRESHOLD,
  BUREAU_RELIABILITY_DEGRADED_THRESHOLD,
  BUREAU_RELIABILITY_HEALTH_LEVELS,
  BUREAU_RELIABILITY_MIN_SIGNAL_COUNT,
  BUREAU_RELIABILITY_WINDOW_DAYS,
  classifyBureauHealth,
  computeBureauReliabilitySummary,
  computeMedian,
  dayAge,
  isBureauReliabilityHealth,
} from "./compliance-regulatory-tracking/data/bureau-reliability.shared"

export type {
  BureauReliabilityClassifierRow,
  BureauReliabilityHealth,
  BureauReliabilityRow,
  BureauReliabilitySnapshot,
} from "./compliance-regulatory-tracking/data/bureau-reliability.shared"

export { getBureauReliabilitySnapshot } from "./compliance-regulatory-tracking/data/bureau-reliability.queries.server"
export {
  listComplianceFilingsForOrg,
  type ComplianceFilingListRow,
} from "./compliance-regulatory-tracking/data/compliance-filing.queries.server"
export { listComplianceOverviewRowsForOrg } from "./compliance-regulatory-tracking/data/compliance-overview.queries.server"
export type {
  ComplianceOverviewFilterInput,
  ComplianceOverviewRow,
} from "./compliance-regulatory-tracking/data/compliance-overview.shared"
export {
  HRM_COMPLIANCE_SURFACE_COLUMNS,
  HRM_COMPLIANCE_SURFACE_FILTERS,
  HRM_COMPLIANCE_SURFACE_ROW_ACTIONS,
  HRM_COMPLIANCE_FILING_SURFACE,
} from "./compliance-regulatory-tracking/data/compliance-surface-metadata.shared"
export { resolveComplianceSurfaceCapabilities } from "./compliance-regulatory-tracking/data/compliance-capabilities.server"
export type { ComplianceSurfaceCapabilities } from "./compliance-regulatory-tracking/data/compliance-capabilities.server"
export {
  listComplianceExceptionsForOrg,
  type ComplianceExceptionListRow,
} from "./compliance-regulatory-tracking/data/compliance-exception.queries.server"
export {
  listComplianceObligationsForOrg,
  listActivePolicyAcknowledgementObligations,
  type ComplianceObligationRow,
} from "./compliance-regulatory-tracking/data/compliance-obligation.queries.server"

export {
  STATUTORY_AGING_WATCH_AUDIT_ACTION,
  STATUTORY_AGING_WATCH_AUDIT_ACTIONS,
  STATUTORY_AGING_WATCH_BATCH_LIMIT,
  buildAgingAuditMetadata,
  computeAgingThresholdAt,
  listAgingWatchCandidates,
  partitionAgingTierEmissions,
  runComplianceAgingWatchTick,
  tierEmissionsForCandidate,
} from "./compliance-regulatory-tracking/data/compliance-aging-watch.server"

export type {
  AgingTierEmission,
  AgingWatchCandidate,
  AgingWatchTickSummary,
} from "./compliance-regulatory-tracking/data/compliance-aging-watch.server"
export { runComplianceControlWatchTick } from "./compliance-regulatory-tracking/data/compliance-control-watch.server"
export type { ComplianceControlWatchTickSummary } from "./compliance-regulatory-tracking/data/compliance-control-watch.server"

export {
  HRM_COMPLIANCE_AGING_TIER_EVENT_TYPES,
  HRM_FANOUT_FORBIDDEN_KEYS,
  buildAgingCriticalEventEnvelopeData,
  buildAgingTierEventEnvelopeData,
  emptyAgingCriticalFanoutCounters,
  emptyAgingTierFanoutCounters,
  emptyAgingTierFanoutCountersByTier,
  fanoutAgingCriticalEvent,
  fanoutAgingTierEvent,
  tallyAgingCriticalFanoutOutcome,
  tallyAgingTierFanoutOutcome,
  tallyAgingTierFanoutOutcomeByTier,
} from "./compliance-regulatory-tracking/data/compliance-aging-fanout.server"

export type {
  AgingCriticalFanoutCounters,
  AgingCriticalFanoutOutcome,
  AgingTierFanoutCounters,
  AgingTierFanoutCountersByTier,
  AgingTierFanoutOutcome,
} from "./compliance-regulatory-tracking/data/compliance-aging-fanout.server"
