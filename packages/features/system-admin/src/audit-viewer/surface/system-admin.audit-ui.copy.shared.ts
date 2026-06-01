export const systemAdminAuditUiCopy = {
  page: {
    title: "Audit viewer",
    description:
      "Search, inspect, and export administrative evidence for this organization. The execution kernel writes events; System Admin reviews them.",
  },
  auditList: {
    title: "Administrative audit log",
    description:
      "Server-side filters and pagination. Select evidence links to inspect redacted metadata.",
    surfaceHeaderTitle: "Administrative audit evidence",
    emptyTitle: "No audit events match the current filters.",
    emptyDescription:
      "Broaden the date range or clear filters. New events appear as operators change tenant configuration.",
    searchPlaceholder: "Search actions, targets, summaries, actors",
  },
  retentionList: {
    title: "Retention policies",
    description: "Retention posture for purge and legal hold.",
    emptyTitle: "No retention policies configured.",
    emptyDescription:
      "Define retention below when you have system-admin.audit.review.",
  },
  retentionForm: {
    title: "Update retention policy",
    description:
      "Legal hold prevents automated purge for the selected entity type.",
  },
  detail: {
    title: "Audit event detail",
    backLabel: "Back to results",
    metadataLabel: "Metadata (redacted)",
    correlationTitle: "Evidence correlation",
    policyLabel: "Policy references",
    approvalLabel: "Approval references",
    emptyCorrelation: "No policy or approval references in this event metadata.",
    timelineTitle: "Evidence timeline",
    selectedEventSuffix: " (selected)",
    fields: {
      time: "Time",
      actor: "Actor",
      action: "Action",
      module: "Module",
      target: "Target",
      summary: "Summary",
    },
  },
  export: {
    csvLabel: "Export CSV",
    jsonLabel: "Export JSON",
    xlsxLabel: "Export Excel",
    pdfLabel: "Export PDF",
    pendingLabel: "Exporting…",
  },
  investigation: {
    title: "Investigation",
    description:
      "Open filtered audit views for the actor, target, module, or action tied to this event.",
  },
  coverage: {
    title: "Audit coverage gaps",
    description:
      "Capabilities declared in the execution kernel without audit area mapping. Resolve in Capabilities or Diagnostics.",
    empty: "No missing audit mappings detected for enabled capabilities.",
    diagnosticsLink: "Open diagnostics",
    capabilityLink: "View capability",
    truncatedSuffix: "more gaps listed in Diagnostics.",
  },
  accessDenied: {
    title: "Access denied",
    description:
      "You need the system-admin.audit.read capability to review administrative audit evidence.",
  },
} as const;
