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

export { createObjectStore } from "./_object-storage-integration/domain/create-object-store.server";

export { assertUploadTokenMatchesSession } from "./_object-storage-integration/schemas/upload-payload.shared";

export type {
  GetTenantDocumentForDownload,
  TenantDocumentDownloadRecord,
} from "./_object-storage-integration/contracts/index";
