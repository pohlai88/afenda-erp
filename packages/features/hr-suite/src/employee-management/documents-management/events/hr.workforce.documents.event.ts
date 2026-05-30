/** Audit action strings for document mutations (HRM-DOC-023 foundation). */
export const hrWorkforceDocumentsAuditActions = {
  document: {
    registered: "hr.documents.document.register",
    verified: "hr.documents.document.verify",
    rejected: "hr.documents.document.reject",
    replaced: "hr.documents.document.replace",
    archived: "hr.documents.document.archive",
  },
  requirement: {
    upserted: "hr.documents.requirement.upsert",
  },
  retention: {
    upserted: "hr.documents.retention.upsert",
  },
  acknowledgment: {
    recorded: "hr.documents.acknowledgment.record",
  },
} as const;

export type HrWorkforceDocumentsAuditAction =
  | (typeof hrWorkforceDocumentsAuditActions)["document"][keyof (typeof hrWorkforceDocumentsAuditActions)["document"]]
  | (typeof hrWorkforceDocumentsAuditActions)["requirement"][keyof (typeof hrWorkforceDocumentsAuditActions)["requirement"]]
  | (typeof hrWorkforceDocumentsAuditActions)["retention"][keyof (typeof hrWorkforceDocumentsAuditActions)["retention"]]
  | (typeof hrWorkforceDocumentsAuditActions)["acknowledgment"][keyof (typeof hrWorkforceDocumentsAuditActions)["acknowledgment"]];
