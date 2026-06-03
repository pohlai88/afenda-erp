import type { SystemAdminDocumentQuarantineInboxRow } from "../data/system-admin.document-quarantine-inbox.read-model.server";

export const systemAdminDocumentQuarantineInboxSurfaceKey =
  "system-admin.documents.quarantine-inbox";

export const systemAdminDocumentQuarantineInboxGalleryRows: readonly SystemAdminDocumentQuarantineInboxRow[] =
  [
    {
      id: "doc-quarantine-1",
      moduleId: "finance",
      title: "Suspicious invoice attachment",
      contentType: "application/pdf",
      size: "64 KB",
      access: "private",
      classification: "internal",
      retentionClass: "standard",
      scanStatus: "quarantined",
      createdAt: "2026-06-02T13:00:00.000Z",
    },
    {
      id: "doc-quarantine-2",
      moduleId: "purchasing",
      title: "Vendor payload scan failed",
      contentType: "application/zip",
      size: "1.2 MB",
      access: "private",
      classification: "confidential",
      retentionClass: "standard",
      scanStatus: "failed",
      createdAt: "2026-06-02T11:30:00.000Z",
    },
  ];
