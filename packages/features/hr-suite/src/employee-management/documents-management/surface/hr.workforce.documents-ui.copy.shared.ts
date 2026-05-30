export const hrDocumentsUiCopy = {
  page: {
    title: "Documents",
    description:
      "Store, organize, secure, and track employee-related documents with verification, expiry, and audit readiness.",
  },
  accessDenied: {
    title: "Access restricted",
    description:
      "Document records are not available for this account. Contact your administrator if you need access.",
  },
  overview: {
    sectionTitle: "Document posture",
    sectionDescription:
      "Active vault counts for verification backlog, expiry risk, and expired documents still on file.",
    riskGroupLabel: "Vault posture",
    followUpGroupLabel: "Verification and expiry",
  },
  repository: {
    sectionTitle: "Employee document repository",
    sectionDescription:
      "Central register of employee-linked documents with verification and lifecycle status.",
    registerPanelDescription:
      "Register a new employee document in the vault.",
    surfaceHeaderTitle: "Document repository",
    emptyTitle: "No employee documents yet",
    emptyDescription:
      "Upload a document and link it to an employee to begin building the vault.",
    searchLabel: "Search documents",
    searchPlaceholder:
      "Search by title, type, employee, verification, or lifecycle status",
    colEmployee: "Employee",
    colType: "Document type",
    colTitle: "Title",
    colClassification: "Classification",
    colVerification: "Verification",
    colLifecycle: "Lifecycle",
    colExpiry: "Expiry",
    colUploaded: "Uploaded",
    colActions: "Actions",
    formSubmitLabel: "Register document",
    formFieldEmployee: "Employee",
    formFieldType: "Document type",
    formFieldTitle: "Title",
    formFieldClassification: "Classification",
    formFieldEffectiveFrom: "Effective from",
    formFieldEffectiveTo: "Expiry date",
    formFieldBlobUrl: "Blob URL",
    formFieldMimeType: "MIME type",
    formFieldSizeBytes: "Size (bytes)",
    formFieldEmployeePlaceholder: "Select employee",
    trailingVerifyLabel: "Verify",
    trailingRejectLabel: "Reject",
    trailingReplaceLabel: "Replace",
    trailingRejectReasonLabel: "Rejection reason",
    latestVersionBadge: "Latest",
  },
  requirements: {
    sectionTitle: "Mandatory document requirements",
    sectionDescription:
      "Configure document types required for active employees by employment status.",
    upsertPanelDescription: "Define mandatory document requirements.",
    surfaceHeaderTitle: "Requirement register",
    emptyTitle: "No document requirements configured",
    emptyDescription:
      "Define mandatory document types to drive readiness and missing-document flags.",
    searchLabel: "Search requirements",
    searchPlaceholder: "Search by document type or title",
    colType: "Document type",
    colTitle: "Title",
    colStatus: "Required for status",
    colGraceDays: "Grace days",
    colActions: "Actions",
    formSubmitLabel: "Save requirement",
  },
  missing: {
    sectionTitle: "Missing mandatory documents",
    sectionDescription:
      "Active employees without a verified document for a configured requirement.",
    surfaceHeaderTitle: "Missing mandatory documents",
    emptyTitle: "No missing mandatory documents",
    emptyDescription:
      "All tracked employees satisfy configured mandatory document requirements.",
    searchLabel: "Search missing documents",
    searchPlaceholder: "Search by employee, document type, or requirement",
    colEmployee: "Employee",
    colRequirement: "Requirement",
    colType: "Document type",
    colStatus: "Posture",
  },
  expiring: {
    sectionTitle: "Expiring and expired documents",
    sectionDescription:
      "Documents approaching or past expiry while still active in the vault (flag-first posture).",
    surfaceHeaderTitle: "Expiry watchlist",
    emptyTitle: "No expiring or expired documents",
    emptyDescription:
      "Active documents with expiry dates are current within the configured horizon.",
    searchLabel: "Search expiry watchlist",
    searchPlaceholder:
      "Search by employee, title, type, or posture (expiring, expired)",
    colEmployee: "Employee",
    colTitle: "Title",
    colType: "Document type",
    colExpiry: "Expiry",
    colPosture: "Posture",
  },
  retention: {
    sectionTitle: "Retention policies",
    sectionDescription:
      "Retention periods and archive rules applied after employee separation.",
    upsertPanelDescription:
      "Configure retention policies for post-separation archive.",
    formSubmitLabel: "Save retention policy",
    surfaceHeaderTitle: "Retention policy register",
    emptyTitle: "No retention policies configured",
    emptyDescription:
      "Define retention rules to govern post-separation document availability.",
    searchLabel: "Search retention policies",
    searchPlaceholder: "Search by document type or group",
    colType: "Document type",
    colGroup: "Document group",
    colRetentionDays: "Retention days",
    colArchiveOnSeparation: "Archive on separation",
    colActions: "Actions",
  },
  auditTrail: {
    sectionTitle: "Document audit trail",
    sectionDescription:
      "Immutable record of upload, view, download, verify, reject, replace, archive, and delete actions.",
    surfaceHeaderTitle: "Audit events",
    emptyTitle: "No document audit events yet",
    emptyDescription:
      "Document mutations and access events appear here as operators use the vault.",
    searchLabel: "Search audit trail",
    searchPlaceholder: "Search by action, actor, target, or summary",
    colOccurredAt: "When",
    colAction: "Action",
    colActor: "Actor",
    colTarget: "Target",
    colSummary: "Summary",
  },
  acknowledgments: {
    sectionTitle: "Policy acknowledgments",
    sectionDescription:
      "Employee acknowledgment artifacts for required policies (storage owned here; compliance monitors obligation posture).",
    recordPanelDescription:
      "Record an employee policy acknowledgment with version and method.",
    formSubmitLabel: "Record acknowledgment",
    formFieldEmployee: "Employee",
    formFieldPolicyKey: "Policy key",
    formFieldPolicyVersion: "Policy version",
    formFieldMethod: "Acknowledgment method",
    formFieldLinkedDocument: "Linked document ID (optional)",
    formFieldEmployeePlaceholder: "Select employee",
    surfaceHeaderTitle: "Acknowledgment register",
    emptyTitle: "No policy acknowledgments recorded",
    emptyDescription:
      "Acknowledgment records appear when employees acknowledge required policies.",
    searchLabel: "Search acknowledgments",
    searchPlaceholder: "Search by employee, policy, or method",
    colEmployee: "Employee",
    colPolicy: "Policy",
    colVersion: "Version",
    colAcknowledgedAt: "Acknowledged",
    colMethod: "Method",
  },
  sensitiveAccess: {
    title: "Sensitive document access",
    repositoryDescription:
      "Confidential and restricted document titles require the sensitive documents read permission.",
    downloadDescription:
      "Downloading confidential or restricted documents requires explicit sensitive read access.",
  },
} as const;

export type HrDocumentsUiCopy = typeof hrDocumentsUiCopy;
