export const hrComplianceObligationsSurfaceKey =
  "hr.workforce.compliance.obligations.list" as const;

export const hrComplianceExceptionsSurfaceKey =
  "hr.workforce.compliance.exceptions.list" as const;

export const hrComplianceUiCopy = {
  page: {
    title: "Compliance",
    description:
      "Track regulatory obligations and open compliance exceptions for the active tenant.",
  },
  accessDenied: {
    title: "Compliance access required",
    description:
      "You need hr.compliance.read to open the HR compliance workspace.",
  },
  obligations: {
    section: {
      title: "Obligations",
      description: "Active regulatory and policy obligations for this organization.",
    },
    listSurface: {
      searchPlaceholder: "Search code, title, or area…",
      emptyTitle: "No obligations",
      emptyDescription: "Register an obligation to begin compliance tracking.",
    },
    upsert: {
      title: "Register obligation",
      description: "Create or update an obligation by unique code.",
      codeLabel: "Code",
      titleLabel: "Title",
      areaLabel: "Compliance area",
      kindLabel: "Requirement kind",
      descriptionLabel: "Description",
      dueDateLabel: "Due date",
      submitLabel: "Save obligation",
    },
    archive: {
      title: "Archive obligation",
      description: "Mark an active obligation as archived.",
      obligationLabel: "Obligation",
      submitLabel: "Archive",
    },
  },
  exceptions: {
    section: {
      title: "Open exceptions",
      description: "Exceptions requiring review or corrective action.",
    },
    listSurface: {
      searchPlaceholder: "Search title, area, or employee…",
      emptyTitle: "No open exceptions",
      emptyDescription: "All tracked exceptions are resolved or waived.",
    },
    create: {
      title: "Log exception",
      description: "Record a new compliance exception for follow-up.",
      titleLabel: "Title",
      areaLabel: "Compliance area",
      typeLabel: "Item type",
      severityLabel: "Severity",
      employeeLabel: "Employee (optional)",
      correctiveDescriptionLabel: "Corrective action (optional)",
      correctiveDueDateLabel: "Corrective due date (optional)",
      submitLabel: "Create exception",
    },
    assignCorrective: {
      title: "Assign corrective action",
      description:
        "Set corrective action details and move the exception to in progress.",
      exceptionLabel: "Exception",
      descriptionLabel: "Corrective action description",
      dueDateLabel: "Due date",
      submitLabel: "Assign corrective action",
    },
    correctiveProgress: {
      title: "Update corrective action progress",
      description: "Append a progress note to the corrective action log.",
      exceptionLabel: "Exception",
      progressNoteLabel: "Progress note",
      submitLabel: "Save progress",
    },
    resolve: {
      title: "Resolve exception",
      description: "Close an open exception with an optional resolution note.",
      exceptionLabel: "Exception",
      noteLabel: "Resolution note",
      submitLabel: "Resolve",
    },
    waive: {
      title: "Waive exception",
      description:
        "Waive an open exception with documented reason and approval reference.",
      exceptionLabel: "Exception",
      waiverReasonLabel: "Waiver reason",
      approvalReferenceLabel: "Approval reference",
      submitLabel: "Waive exception",
    },
  },
} as const;
