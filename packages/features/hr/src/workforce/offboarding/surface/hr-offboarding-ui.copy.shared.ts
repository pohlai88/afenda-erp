export const hrOffboardingUiCopy = {
  section: {
    title: "Offboarding cases",
    description: "Exit workflows with lifecycle-linked employment status changes.",
  },
  page: {
    title: "Offboarding",
    description: "Start, complete, or cancel employee offboarding cases.",
  },
  accessDenied: {
    title: "Access restricted",
    description: "You need hr.offboarding.read to open the HR offboarding queue.",
  },
  listSurface: {
    emptyTitle: "No offboarding cases",
    emptyDescription: "Start an offboarding case when an employee begins their exit process.",
    searchPlaceholder: "Search by employee or reason",
  },
  start: {
    title: "Start offboarding",
    description: "Moves the employee to offboarding status and opens a case.",
    employeeLabel: "Employee",
    lastWorkingDateLabel: "Last working date",
    reasonLabel: "Reason",
    submitLabel: "Start offboarding",
    pendingLabel: "Starting…",
    successLabel: "Offboarding case opened.",
  },
  clearance: {
    title: "Complete clearance item",
    description: "Mark an exit clearance step as done before completing the case.",
    itemLabel: "Clearance item",
    submitLabel: "Mark done",
  },
  complete: {
    title: "Complete offboarding",
    description:
      "Requires all clearance items done; closes the case and sets status to separated.",
    caseLabel: "In-progress case",
    submitLabel: "Complete offboarding",
    pendingLabel: "Completing…",
    successLabel: "Offboarding completed.",
  },
} as const;

export const hrOffboardingSurfaceKey = "hr.workforce.offboarding.list";
