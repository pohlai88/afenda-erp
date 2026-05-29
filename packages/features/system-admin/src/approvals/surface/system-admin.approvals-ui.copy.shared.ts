export const systemAdminApprovalsUiCopy = {
  page: {
    title: "Approvals",
    description:
      "Approval law is configured here. Orbit and workflow runtime create tasks; System Admin does not execute workflow work directly.",
  },
  list: {
    title: "Approval rules",
  },
  editor: {
    title: "Create or update approval rule",
    description:
      "Approver roles are validated against organization roles. Disabled rules do not affect execution kernel verdicts.",
  },
  accessDenied: {
    title: "Approval rules unavailable",
    description:
      "You need system-admin.approvals.read or system-admin.settings.read to review approval configuration.",
  },
} as const;
