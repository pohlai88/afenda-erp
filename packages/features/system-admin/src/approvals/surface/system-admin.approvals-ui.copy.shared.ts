export const systemAdminApprovalsUiCopy = {
  page: {
    title: "Approvals",
    description:
      "Approval law is configured here. Orbit and workflow runtime create tasks; System Admin does not execute workflow work directly.",
  },
  list: {
    title: "Approval rules",
    searchPlaceholder: "Search approval rules by name, module, or action",
    emptyTitle: "No approval rules are configured for this organization.",
    emptyDescription:
      "Create or update a rule in the editor below when you have system-admin.approvals.manage.",
    actionsHeader: "Actions",
    reviewActionLabel: "Review",
  },
  editor: {
    title: "Create or update approval rule",
    updateTitle: "Update selected approval rule",
    description:
      "Approver roles are validated against organization roles. Disabled rules do not affect execution kernel verdicts.",
  },
  accessDenied: {
    title: "Approval rules unavailable",
    description:
      "You need system-admin.approvals.read or system-admin.settings.read to review approval configuration.",
  },
} as const;
