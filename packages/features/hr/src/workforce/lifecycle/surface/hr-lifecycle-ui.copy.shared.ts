export const hrLifecycleUiCopy = {
  section: {
    title: "Lifecycle overview",
    description:
      "Employment status, probation outcomes, and pending effective-dated transitions.",
  },
  page: {
    title: "Lifecycle",
    description: "Track workforce employment stages and schedule status changes.",
  },
  accessDenied: {
    title: "Access restricted",
    description: "You need hr.lifecycle.read to open the HR lifecycle overview.",
  },
  listSurface: {
    emptyTitle: "No lifecycle rows",
    emptyDescription:
      "Active employees appear here once workforce records exist.",
    searchPlaceholder: "Search by employee number or name",
  },
  statusChange: {
    title: "Change employment status",
    description: "Immediate changes apply now; future dates queue a transition.",
    employeeLabel: "Employee",
    toStatusLabel: "New status",
    effectiveDateLabel: "Effective date",
    reasonLabel: "Reason",
    submitLabel: "Apply status change",
    pendingLabel: "Saving…",
    successLabel: "Status change recorded.",
  },
  probation: {
    title: "Record probation outcome",
    description: "Confirm, extend, or recommend separation after probation review.",
    employeeLabel: "Employee",
    outcomeLabel: "Outcome",
    effectiveDateLabel: "Effective date",
    probationEndDateLabel: "New probation end date",
    reasonLabel: "Reason",
    submitLabel: "Record outcome",
    pendingLabel: "Saving…",
    successLabel: "Probation outcome recorded.",
  },
  movement: {
    title: "Record employee movement",
    description: "Transfer placement with an auditable lifecycle event.",
    employeeLabel: "Employee",
    movementKindLabel: "Movement type",
    departmentLabel: "Department",
    positionLabel: "Position",
    managerLabel: "Manager",
    reasonLabel: "Reason",
    submitLabel: "Record movement",
    pendingLabel: "Saving…",
    successLabel: "Movement recorded.",
  },
  timeline: {
    title: "Lifecycle timeline",
    description: "Append-only employment lifecycle events for this record.",
    emptyLabel: "No lifecycle events recorded yet.",
  },
} as const;

export const hrLifecycleSurfaceKey = "hr.workforce.lifecycle.list";
