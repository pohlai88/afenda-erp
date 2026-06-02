/**
 * Metadata public door for @afenda/object-storage.
 *
 * Registry- and policy-safe only — no tenant reads, no server runtime, no provider SDKs.
 * ARCH-1002 §8 · ARCH-1005 §10.2
 */
export { OBJECT_STORAGE_HTTP_ROUTES } from "./_object-storage-integration/contracts/index";
export type { ObjectStorageAccess } from "./_object-storage-integration/contracts/index";

export {
  documentUploadAccept,
  documentUploadContentTypes,
  documentUploadMaxSizeBytes,
  formatUploadLimit,
} from "./_object-storage-integration/policies/document-upload-policy.shared";

export {
  BLOB_MULTIPART_THRESHOLD_BYTES,
  DEFAULT_DOCUMENT_LIST_PAGE_SIZE,
  MULTIPART_UPLOAD_THRESHOLD_BYTES,
  TENANT_BLOB_ROOT,
  TENANT_OBJECT_ROOT,
} from "./_object-storage-integration/policies/tenant-pathnames.shared";

export const objectStorageProviderIds = ["vercel-blob", "r2"] as const;
