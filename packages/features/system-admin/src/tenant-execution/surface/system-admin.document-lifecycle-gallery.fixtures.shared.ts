export const documentLifecycleTrailingActionId = "document-lifecycle";

export const systemAdminDocumentRegistryGalleryModuleId = "finance" as const;

export const systemAdminDocumentRegistryGallerySurfaceKey =
  `${systemAdminDocumentRegistryGalleryModuleId}.documents.list` as const;

export const systemAdminDocumentActivityGallerySurfaceKey =
  `${systemAdminDocumentRegistryGalleryModuleId}.documents.activity` as const;

export type SystemAdminDocumentRegistryGalleryRow = {
  id: string;
  title: string;
  contentType: string;
  size: string;
  access: string;
  classification: string;
  retentionClass: string;
  scanStatus: string;
  createdAt: string;
};

export const systemAdminDocumentRegistryGalleryRows: readonly SystemAdminDocumentRegistryGalleryRow[] =
  [
    {
      id: "gallery-doc-001",
      title: "Supplier invoice Q2",
      contentType: "PDF",
      size: "121 KB",
      access: "private",
      classification: "internal",
      retentionClass: "standard",
      scanStatus: "passed",
      createdAt: "2026-06-02T10:00:00.000Z",
    },
    {
      id: "gallery-doc-quarantined",
      title: "Suspicious attachment",
      contentType: "PDF",
      size: "64 KB",
      access: "private",
      classification: "internal",
      retentionClass: "standard",
      scanStatus: "quarantined",
      createdAt: "2026-06-02T13:00:00.000Z",
    },
    {
      id: "gallery-doc-legal-hold",
      title: "Litigation bundle",
      contentType: "PDF",
      size: "2.1 MB",
      access: "private",
      classification: "confidential",
      retentionClass: "legal-hold",
      scanStatus: "passed",
      createdAt: "2026-06-02T14:00:00.000Z",
    },
  ];

export type SystemAdminDocumentActivityGalleryEvent = {
  id: string;
  summary: string;
  actorLabel: string;
  occurredAt: string;
  evidenceHref?: string;
  policyLabel?: string;
  riskTone?: "default" | "positive" | "attention" | "critical";
};

export const systemAdminDocumentActivityGalleryEvents: readonly SystemAdminDocumentActivityGalleryEvent[] =
  [
    {
      id: "gallery-evt-upload",
      summary: "Document uploaded",
      actorLabel: "Operator",
      occurredAt: "2026-06-02T10:00:00.000Z",
    },
    {
      id: "gallery-evt-legal-hold",
      summary: "Legal hold applied",
      actorLabel: "System",
      occurredAt: "2026-06-02T09:00:00.000Z",
      policyLabel: "Legal Hold",
      riskTone: "attention",
    },
    {
      id: "gallery-evt-verify",
      summary: "Contract verified",
      actorLabel: "HR Admin",
      occurredAt: "2026-06-02T11:00:00.000Z",
      evidenceHref:
        "/api/internal/v1/documents/hr_doc_a/download?moduleId=hr",
      policyLabel: "Verify",
      riskTone: "positive",
    },
  ];
