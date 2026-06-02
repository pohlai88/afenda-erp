import "server-only";

export {
  handleObjectStorageDocumentDownloadGet,
  handleObjectStorageUploadConfigGet,
  handleObjectStorageUploadPost,
  type ObjectStorageHandlerResult,
  type ObjectStorageUploadHandlerDeps,
} from "./handlers/object-storage-handlers.server";

export {
  requireBlobModuleAccess,
  requireUploadModuleAccess,
} from "./auth/upload-route-auth.server";

export {
  assertBlobConfigured,
  assertObjectStorageConfigured,
  getConfiguredBlobEnv,
  getConfiguredObjectStorageEnv,
  resolveBlobCallbackUrl,
  resolveUploadedDocumentSize,
  resolveVercelBlobCallbackUrl,
} from "./env/object-storage-config.server";

export { createObjectStore } from "./providers/create-object-store.server";

export { assertUploadTokenMatchesSession } from "./schemas/upload-payload.shared";
