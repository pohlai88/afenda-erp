export const hrOnboardingUiCopy = {
  section: {
    title: "Onboarding cases",
    description: "Checklist-driven onboarding for employees in onboarding status.",
  },
  page: {
    title: "Onboarding",
    description: "Start, complete checklist items, and close onboarding cases.",
  },
  accessDenied: {
    title: "Access restricted",
    description: "You need hr.onboarding.read to open the HR onboarding queue.",
  },
  listSurface: {
    emptyTitle: "No onboarding cases",
    emptyDescription: "Start an onboarding case for an employee in onboarding status.",
    searchPlaceholder: "Search by employee or reason",
  },
  start: {
    title: "Start onboarding",
    description: "Opens a case with the default checklist for an onboarding employee.",
    employeeLabel: "Employee (onboarding status)",
    targetStatusLabel: "Target employment status",
    reasonLabel: "Reason",
    submitLabel: "Start onboarding",
    pendingLabel: "Starting…",
    successLabel: "Onboarding case opened.",
  },
  checklist: {
    title: "Complete checklist item",
    description: "Mark a pending onboarding checklist step as done.",
    itemLabel: "Checklist item",
    submitLabel: "Mark done",
  },
  complete: {
    title: "Complete onboarding",
    description: "Requires all checklist items done; sets target employment status.",
    caseLabel: "In-progress case",
    submitLabel: "Complete onboarding",
    pendingLabel: "Completing…",
    successLabel: "Onboarding completed.",
  },
} as const;

export const hrOnboardingSurfaceKey = "hr.workforce.onboarding.list";
