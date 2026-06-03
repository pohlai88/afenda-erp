export {
  fetchObjectStorageUploadConfig,
  uploadTenantDocument,
  uploadTenantObject,
  type ObjectStorageUploadConfig,
  type TenantDocumentUploadInput,
  type TenantObjectUploadResult,
} from "./_object-storage-integration/components/upload-tenant-document.client";

export {
  OBJECT_STORAGE_HTTP_ROUTES,
  type ObjectStorageAccess,
  type ObjectStorageDocumentScanStatus,
  type ObjectStorageEvidenceAction,
  type ObjectStorageEvidenceAuditEvent,
  type ObjectStorageEvidenceAuditSink,
  type ObjectStorageGateDecision,
  type ObjectStorageUploadQuotaInput,
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
  BLOB_MULTIPART_THRESHOLD_BYTES,
  DEFAULT_DOCUMENT_LIST_PAGE_SIZE,
  MULTIPART_UPLOAD_THRESHOLD_BYTES,
  TENANT_BLOB_ROOT,
  TENANT_OBJECT_ROOT,
  buildTenantBlobPathPrefix,
  buildTenantBlobPathname,
  buildTenantObjectPathPrefix,
  buildTenantObjectPathname,
  sanitizeUploadFilename,
  shouldUseMultipartUpload,
} from "./_object-storage-integration/policies/tenant-pathnames.shared";
