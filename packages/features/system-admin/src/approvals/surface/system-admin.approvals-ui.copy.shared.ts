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
    emptyDescriptionReadOnly:
      "Ask an administrator with system-admin.approvals.manage to configure approval rules for this organization.",
    actionsHeader: "Actions",
    reviewActionLabel: "Review",
    enableActionLabel: "Enable",
    disableActionLabel: "Disable",
    columns: {
      name: "Rule",
      moduleKey: "Module",
      action: "Action",
      targetType: "Target",
      approvalMode: "Mode",
      approverRoles: "Approvers",
      minApprovals: "Min approvals",
      escalation: "Escalation",
      status: "Status",
      readinessVerdict: "Readiness",
    },
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
  detail: {
    backLabel: "Back to catalog",
    auditHistoryLabel: "View approval audit history",
    noCapability: "No registered execution capability",
    notConfigured: "Not configured",
    enabledYes: "Yes",
    enabledNo: "No",
    fields: {
      approvalKey: "Approval key",
      module: "Module",
      approvalMode: "Approval mode",
      status: "Status",
      minApprovals: "Minimum approvals",
      readiness: "Readiness",
      escalation: "Escalation",
      escalationBehavior: "Escalation behavior",
      escalationRoles: "Escalation roles",
      delegationValidDays: "Delegation valid days",
      enabled: "Enabled",
      action: "Action",
      approverRoles: "Approver roles",
      delegationRoles: "Delegation roles",
      capability: "Capability",
      requiredPermission: "Required permission",
      relatedPolicies: "Related policies",
    },
    recentActivityTitle: "Recent approval activity",
    noRecentActivityTitle: "No recent activity",
    noRecentActivityDescription:
      "Configuration changes and runtime audit events for this approval rule will appear here.",
    activityColumns: {
      when: "When",
      actor: "Actor",
      action: "Action",
      summary: "Summary",
    },
  },
} as const;
