export const hrOffboardingUiCopy = {
  page: {
    title: "Offboarding",
    description:
      "Manage employee exit cases, clearance checklists, asset recovery, settlement readiness, and audit history.",
  },
  accessDenied: {
    title: "Offboarding access restricted",
    description: "You need offboarding read permission to view this workbench.",
  },
  sensitiveAccess: {
    title: "Sensitive exit information restricted",
    description:
      "Termination details and exit interview feedback are masked. Request hr.offboarding.sensitive.read for full visibility.",
  },
  overview: {
    postureTitle: "Exit posture",
    clearanceTitle: "Clearance and settlement",
  },
  cases: {
    sectionTitle: "Active offboarding cases",
    searchLabel: "Search cases",
    searchPlaceholder: "Employee, reason, or exit type",
    surfaceHeaderTitle: "Offboarding cases",
    emptyTitle: "No offboarding cases",
    emptyDescription: "Start an offboarding case to track employee exit.",
  },
  clearance: {
    sectionTitle: "Clearance checklist",
    searchLabel: "Search checklist",
    searchPlaceholder: "Employee or task",
    surfaceHeaderTitle: "Clearance items",
    emptyTitle: "No clearance items",
    emptyDescription: "Clearance tasks appear when offboarding cases are active.",
  },
  approvals: {
    sectionTitle: "Exit approvals",
    searchLabel: "Search approvals",
    searchPlaceholder: "Employee or approval step",
    surfaceHeaderTitle: "Approval queue",
    emptyTitle: "No approval steps",
    emptyDescription: "Approval steps are created when offboarding starts.",
  },
  assets: {
    sectionTitle: "Asset recovery",
    searchLabel: "Search assets",
    searchPlaceholder: "Employee or asset",
    surfaceHeaderTitle: "Company assets",
    emptyTitle: "No asset records",
    emptyDescription: "Asset recovery rows are seeded per offboarding case.",
  },
  settlement: {
    sectionTitle: "Settlement readiness",
    searchLabel: "Search settlement",
    searchPlaceholder: "Employee number or name",
    surfaceHeaderTitle: "Final settlement posture",
    emptyTitle: "No in-progress cases",
    emptyDescription: "Settlement readiness tracks payroll handoff posture.",
  },
  overdue: {
    sectionTitle: "Overdue tasks",
    searchLabel: "Search overdue",
    searchPlaceholder: "Employee or task",
    surfaceHeaderTitle: "Overdue clearance tasks",
    emptyTitle: "No overdue tasks",
    emptyDescription: "Overdue tasks are derived from checklist due dates.",
  },
  auditTrail: {
    sectionTitle: "Audit trail",
    searchLabel: "Search audit trail",
    searchPlaceholder: "Action or summary",
    surfaceHeaderTitle: "Offboarding audit events",
    emptyTitle: "No audit events",
    emptyDescription: "Offboarding mutations write audit events here.",
  },
  initiatePanel: {
    title: "Initiate offboarding",
    description: "Start an exit case with exit type, notice period, and reason.",
  },
  trailing: {
    actionsHeader: "Actions",
  },
} as const;
