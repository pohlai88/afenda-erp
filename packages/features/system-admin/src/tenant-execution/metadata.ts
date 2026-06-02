/**
 * Governed metadata door — system-admin/tenant-execution
 * List surfaces, surface keys, and metadata-only copy. No tenant I/O.
 */
export type { SystemAdminActionResult } from "./contracts/system-admin.action-result.contract";
export {
  buildSystemAdminDocumentQuarantineInboxListSurface,
  systemAdminDocumentQuarantineInboxGalleryRows,
  systemAdminDocumentQuarantineInboxSurfaceKey,
  documentLifecycleTrailingActionId,
  systemAdminDocumentActivityGalleryEvents,
  systemAdminDocumentActivityGallerySurfaceKey,
  systemAdminDocumentRegistryGalleryModuleId,
  systemAdminDocumentRegistryGalleryRows,
  systemAdminDocumentRegistryGallerySurfaceKey,
} from "./surface";
