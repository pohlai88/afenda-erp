export const systemAdminDataManagementUiCopy = {
  page: {
    title: "Data Management",
    description:
      "Governed import/export workbench for staged validation, job execution, row evidence, and audit-backed exports.",
  },
  summary: {
    title: "Data movement posture",
    description:
      "Job states and row outcomes across tenant data movement controls.",
    totalJobs: "Import jobs",
    readyJobs: "Ready",
    completedJobs: "Completed",
    failedJobs: "Failed",
    failedRows: "Failed rows",
    exports: "Exports",
  },
  create: {
    title: "Create import validation job",
    description:
      "Paste CSV source data for the selected approved template. The server validates headers and rows before anything can run.",
    templateLabel: "Template",
    sourceLabel: "Source label",
    filenameLabel: "Filename",
    sourceDataLabel: "CSV source",
    sourceDataPlaceholder:
      "userEmail,requestedRole,accessReason\nowner@example.com,admin,Quarterly access certification",
    submitLabel: "Stage import job",
  },
  templates: {
    title: "Import templates",
    description:
      "Approved templates define adapter, required headers, retry safety, and capability gates.",
    searchPlaceholder: "Search templates by target, adapter, or header",
    emptyTitle: "No import templates are available.",
    emptyDescription:
      "Templates appear here after an adapter is approved for System Admin data movement.",
  },
  importJobs: {
    title: "Import jobs",
    description:
      "Staged and executed import jobs with row counts, digest, state, and operator evidence.",
    trailingHeader: "Actions",
    searchPlaceholder: "Search jobs by source, adapter, status, or actor",
    emptyTitle: "No import jobs have been staged.",
    emptyDescription:
      "Create a validation job from an approved template before running an import.",
  },
  failures: {
    title: "Row-level failures",
    description:
      "Redacted row validation failures and application failures for remediation.",
    searchPlaceholder: "Search failures by job, code, message, or digest",
    emptyTitle: "No row failures found.",
    emptyDescription:
      "Failed validation or application rows appear here with redacted evidence.",
  },
  exports: {
    title: "Export history",
    description:
      "Audit-backed export evidence for job registers, failure lists, and export packages.",
    searchPlaceholder: "Search exports by type, source, status, or actor",
    emptyTitle: "No data-management exports recorded.",
    emptyDescription:
      "Exports appear after an authorized operator downloads evidence.",
    buttonLabel: "Export jobs CSV",
    pendingButtonLabel: "Exporting...",
  },
  actions: {
    run: "Run",
    cancel: "Cancel",
    retry: "Retry",
    runDenied: "Requires system-admin.data-management.run.",
    cancelDenied: "Requires system-admin.data-management.cancel.",
  },
  accessDenied: {
    title: "Access denied",
    description:
      "You need system-admin.data-management.read to view import/export governance for this organization.",
  },
} as const;
