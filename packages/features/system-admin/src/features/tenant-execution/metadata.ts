/**
 * Governed metadata door — system-admin/tenant-execution
 * List surfaces, surface keys, and metadata-only copy. No tenant I/O.
 */
export type { SystemAdminActionResult } from "./sys-action-result.contract";
export {
  buildSystemAdminDocumentQuarantineInboxListSurface,
  systemAdminDocumentQuarantineInboxSurfaceKey,
} from "./sys-document-quarantine-inbox.surface";
export {
  systemAdminDocumentQuarantineInboxGalleryRows,
} from "./sys-document-quarantine-inbox-gallery.fixtures.shared";
export {
  documentLifecycleTrailingActionId,
  systemAdminDocumentActivityGalleryEvents,
  systemAdminDocumentActivityGallerySurfaceKey,
  systemAdminDocumentActivityHrGalleryEvents,
  systemAdminDocumentActivityHrGallerySurfaceKey,
  systemAdminDocumentRegistryGalleryModuleId,
  systemAdminDocumentRegistryGalleryRows,
  systemAdminDocumentRegistryGallerySurfaceKey,
  systemAdminDocumentRegistrySensitiveGalleryModuleId,
} from "./sys-document-lifecycle-gallery.fixtures.shared";
export {
  buildSystemAdminOrganizationStorageQuotaStatGrid,
  buildSystemAdminOrganizationStorageQuotaStatGroups,
  systemAdminOrganizationStorageQuotaSurfaceKey,
} from "./sys-organization-storage-quota-stat.surface";
