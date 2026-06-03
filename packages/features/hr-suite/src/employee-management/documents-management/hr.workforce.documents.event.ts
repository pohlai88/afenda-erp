/** Audit action strings for document mutations (HRM-DOC-023 foundation). */
export const hrWorkforceDocumentsAuditActions = {
  document: {
    uploaded: "hr.document.upload",
    viewed: "hr.document.view",
    downloaded: "hr.document.download",
    verified: "hr.document.verify",
    rejected: "hr.document.reject",
    replaced: "hr.document.replace",
    archived: "hr.document.archive",
    deleted: "hr.document.delete",
  },
  requirement: {
    upserted: "hr.document.requirement.upsert",
  },
  retention: {
    upserted: "hr.document.retention.upsert",
  },
  acknowledgment: {
    recorded: "hr.document.acknowledgment.record",
  },
} as const;

export type HrWorkforceDocumentsAuditAction =
  | (typeof hrWorkforceDocumentsAuditActions)["document"][keyof (typeof hrWorkforceDocumentsAuditActions)["document"]]
  | (typeof hrWorkforceDocumentsAuditActions)["requirement"][keyof (typeof hrWorkforceDocumentsAuditActions)["requirement"]]
  | (typeof hrWorkforceDocumentsAuditActions)["retention"][keyof (typeof hrWorkforceDocumentsAuditActions)["retention"]]
  | (typeof hrWorkforceDocumentsAuditActions)["acknowledgment"][keyof (typeof hrWorkforceDocumentsAuditActions)["acknowledgment"]];
