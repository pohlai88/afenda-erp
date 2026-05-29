export const hrDocumentsUiCopy = {
  section: {
    title: "Document vault",
    description:
      "Employee-scoped HR documents with verification and lifecycle status.",
  },
  page: {
    title: "Documents",
    description: "Browse and register workforce document metadata.",
  },
  accessDenied: {
    title: "Access restricted",
    description: "You need hr.documents.read to open the HR document vault.",
  },
  listSurface: {
    emptyTitle: "No documents yet",
    emptyDescription:
      "Register employee document metadata after upload to populate the vault.",
    searchPlaceholder: "Search by title, type, or employee",
  },
  register: {
    title: "Register document",
    description: "Attach metadata for a file already stored at a blob URL.",
    employeeLabel: "Employee",
    documentTypeLabel: "Document type",
    titleLabel: "Title",
    blobUrlLabel: "Blob URL",
    mimeTypeLabel: "MIME type",
    sizeBytesLabel: "Size (bytes)",
    classificationLabel: "Classification",
    effectiveFromLabel: "Effective from",
    effectiveToLabel: "Expires on",
    submitLabel: "Register document",
    pendingLabel: "Registering…",
    successLabel: "Document registered.",
  },
  verify: {
    title: "Verify document",
    description: "Mark a pending document as verified.",
    documentLabel: "Pending document",
    submitLabel: "Verify",
  },
  reject: {
    title: "Reject document",
    description: "Reject a pending document verification with a reason for the employee.",
    documentLabel: "Pending document",
    rejectionReasonLabel: "Rejection reason",
    submitLabel: "Reject",
  },
  archiveForm: {
    title: "Archive document",
    description: "Archive an active document record.",
    documentLabel: "Active document",
    submitLabel: "Archive",
  },
  requirements: {
    title: "Document requirements",
    description: "Types required for employment statuses in this tenant.",
    documentTypeLabel: "Document type",
    titleLabel: "Requirement title",
    requiredForStatusLabel: "Required for status",
    graceDaysLabel: "Grace days before due",
    submitLabel: "Save requirement",
    pendingLabel: "Saving…",
    successLabel: "Requirement saved.",
    noneConfigured: "No document requirements configured yet.",
  },
} as const;

export const hrDocumentsSurfaceKey = "hr.workforce.documents.list";
