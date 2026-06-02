export { OBJECT_STORAGE_HTTP_ROUTES } from "./_object-storage-integration/contracts/index";
export type {
  GetTenantDocumentForDownload,
  ObjectStorageDocumentScanStatus,
  ObjectStorageDownloadGovernanceInput,
  ObjectStorageEvidenceAction,
  ObjectStorageEvidenceAuditEvent,
  ObjectStorageEvidenceAuditSink,
  ObjectStorageGateDecision,
  ObjectStorageUploadQuotaInput,
  ObjectStorageAccess,
  ObjectStorePort,
  PresignedUploadInput,
  PresignedUploadResult,
  SignedDownloadInput,
  SignedDownloadResult,
  StoredObjectMetadata,
  TenantDocumentDownloadRecord,
  UploadRegistrationInput,
} from "./_object-storage-integration/contracts/index";

export {
  documentUploadAccept,
  documentUploadContentTypes,
  documentUploadMaxSizeBytes,
  formatUploadLimit,
} from "./_object-storage-integration/policies/document-upload-policy.shared";

export {
  defaultObjectStorageDocumentClassification,
  defaultObjectStorageRetentionClass,
  objectStorageDocumentClassifications,
  objectStorageGovernancePolicy,
  objectStorageRetentionClasses,
  type ObjectStorageDocumentClassification,
  type ObjectStorageRetentionClass,
} from "./_object-storage-integration/policies/document-governance-policy.shared";

export {
  r2CompleteBodySchema,
  r2PresignBodySchema,
  uploadAccessSchema,
  uploadClassificationSchema,
  uploadPayloadSchema,
  uploadRetentionClassSchema,
  type UploadTokenPayload,
} from "./_object-storage-integration/schemas/upload-payload.shared";
