import "server-only";

export {
  handleObjectStorageDocumentDownloadGet,
  handleObjectStorageUploadConfigGet,
  handleObjectStorageUploadPost,
  type ObjectStorageDownloadHandlerDeps,
  type ObjectStorageHandlerDeps,
  type ObjectStorageHandlerResult,
  type ObjectStorageUploadHandlerDeps,
} from "./_object-storage-integration/api/object-storage-handlers.server";

export {
  assertDocumentScanPassed,
  assertGateDecisionAllowed,
  assertUploadQuotaAllowed,
  getRequestSourceIp,
  recordEvidenceEvent,
} from "./_object-storage-integration/api/evidence-governance.server";

export {
  requireBlobModuleAccess,
  requireUploadModuleAccess,
} from "./_object-storage-integration/domain/upload-route-auth.server";

export {
  assertBlobConfigured,
  assertObjectStorageConfigured,
  getConfiguredBlobEnv,
  getConfiguredObjectStorageEnv,
  resolveBlobCallbackUrl,
  resolveUploadedDocumentSize,
  resolveVercelBlobCallbackUrl,
} from "./_object-storage-integration/domain/object-storage-config.server";

export {
  createObjectStore,
  resolveObjectStorageProviderId,
  type CreateObjectStoreOptions,
  type ObjectStorageProviderId,
} from "./_object-storage-integration/domain/create-object-store.server";

export {
  incrementObjectStorageMetric,
  objectStorageMetricNames,
  type ObjectStorageMetricName,
} from "./_object-storage-integration/api/object-storage-metrics.server";

export { assertUploadTokenMatchesSession } from "./_object-storage-integration/schemas/upload-payload.shared";

export type {
  GetTenantDocumentForDownload,
  ObjectStorageDocumentScanStatus,
  ObjectStorageDownloadGovernanceInput,
  ObjectStorageEvidenceAction,
  ObjectStorageEvidenceAuditEvent,
  ObjectStorageEvidenceAuditSink,
  ObjectStorageGateDecision,
  ObjectStorageUploadQuotaInput,
  TenantDocumentDownloadRecord,
} from "./_object-storage-integration/contracts/index";
