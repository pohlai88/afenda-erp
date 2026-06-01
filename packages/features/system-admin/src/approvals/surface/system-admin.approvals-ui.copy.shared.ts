import {
  SYSTEM_ADMIN_APPROVALS_DECIDE_CAPABILITY,
  SYSTEM_ADMIN_APPROVALS_MANAGE_CAPABILITY,
  SYSTEM_ADMIN_APPROVALS_READ_CAPABILITY,
  SYSTEM_ADMIN_APPROVALS_REVIEW_CAPABILITY,
  SYSTEM_ADMIN_APPROVALS_VIEW_CAPABILITY,
} from "../schemas/system-admin.approvals-capability.shared";

const queueReadOnlyWithoutDecide = `You can view the queue but cannot record decisions without ${SYSTEM_ADMIN_APPROVALS_DECIDE_CAPABILITY}.`;

export const systemAdminApprovalsUiCopy = {
  permissions: {
    capabilities: {
      view: SYSTEM_ADMIN_APPROVALS_VIEW_CAPABILITY,
      decide: SYSTEM_ADMIN_APPROVALS_DECIDE_CAPABILITY,
      read: SYSTEM_ADMIN_APPROVALS_READ_CAPABILITY,
      manage: SYSTEM_ADMIN_APPROVALS_MANAGE_CAPABILITY,
      review: SYSTEM_ADMIN_APPROVALS_REVIEW_CAPABILITY,
    },
    requiresView: `Requires ${SYSTEM_ADMIN_APPROVALS_VIEW_CAPABILITY}.`,
    requiresDecide: `Requires ${SYSTEM_ADMIN_APPROVALS_DECIDE_CAPABILITY}.`,
    requiresRead: `Requires ${SYSTEM_ADMIN_APPROVALS_READ_CAPABILITY}.`,
    requiresManage: `Requires ${SYSTEM_ADMIN_APPROVALS_MANAGE_CAPABILITY}.`,
    requiresReview: `Requires ${SYSTEM_ADMIN_APPROVALS_REVIEW_CAPABILITY}.`,
  },
  page: {
    title: "Approvals",
    description:
      "Configure approval rules and review the operator queue for pending tenant work items.",
  },
  queue: {
    title: "Operator approval queue",
    description: `Pending approval work items assigned to this tenant. Approve or reject when you hold ${SYSTEM_ADMIN_APPROVALS_DECIDE_CAPABILITY}.`,
    columns: {
      subject: "Work item",
      owner: "Owner",
      status: "Status",
      priority: "Priority",
      due: "Due",
      route: "Route",
      escalation: "Escalation",
    },
    toolbar: {
      sortLabel: "Sort",
      sortOptions: {
        dueAsc: "Due soonest",
        priorityDesc: "Priority",
      },
    },
    actionsHeader: "Decision",
    approveActionLabel: "Approve",
    rejectActionLabel: "Reject",
    rejectReasonLabel: "Rejection reason",
    rejectReasonPlaceholder: "Required to reject this work item",
    rejectSectionLabel: "Reject with reason",
    rejectReasonDescription:
      "Provide a reason before rejecting this work item.",
    openActionLabel: "Open",
    readOnlyNotice: queueReadOnlyWithoutDecide,
    forbiddenDescription: `You need ${SYSTEM_ADMIN_APPROVALS_VIEW_CAPABILITY} to open the operator approval queue.`,
    statusLabels: {
      pending: "Pending",
      "in-review": "In review",
      escalated: "Escalated",
      scheduled: "Scheduled",
      completed: "Completed",
    },
    priorityLabels: {
      low: "Low",
      medium: "Medium",
      high: "High",
    },
    escalationLabels: {
      escalated: "Escalated",
      none: "—",
    },
    emptyTitle: "No approval work items",
    emptyDescription:
      "Pending approvals will appear here when routed to this queue.",
    emptyDescriptionReadOnly: queueReadOnlyWithoutDecide,
    trailingDisabledReasons: {
      decisionComplete: "This work item already has a recorded decision.",
    },
  },
  list: {
    title: "Approval rules",
    description:
      "Configure tenant approval law for protected actions. Select a rule to review configuration and audit activity.",
    readOnlyNotice: `You can review approval rules but cannot change them without ${SYSTEM_ADMIN_APPROVALS_MANAGE_CAPABILITY}.`,
    forbiddenDescription: `You need ${SYSTEM_ADMIN_APPROVALS_READ_CAPABILITY} to open approval rules.`,
    searchPlaceholder: "Search approval rules by name, module, or action",
    emptyTitle: "No approval rules are configured for this organization.",
    emptyDescription: `Create or update a rule in the editor below when you have ${SYSTEM_ADMIN_APPROVALS_MANAGE_CAPABILITY}.`,
    emptyDescriptionReadOnly: `Ask an administrator with ${SYSTEM_ADMIN_APPROVALS_MANAGE_CAPABILITY} to configure approval rules for this organization.`,
    actionsHeader: "Actions",
    reviewActionLabel: "Review",
    enableActionLabel: "Enable",
    disableActionLabel: "Disable",
    targetTypeLabels: {
      "erp-record": "ERP record",
      document: "Document",
      "workflow-item": "Workflow item",
      organization: "Organization",
      "approval_rule": "Approval rule",
      "approval_work_item": "Approval work item",
    },
    trailingConfirms: {
      disable: {
        title: "Disable this approval rule?",
        description:
          "Disabled rules stop participating in runtime approval resolution until re-enabled.",
        confirmLabel: "Disable rule",
      },
    },
    trailingDisabledReasons: {
      deprecatedReactivate:
        "Deprecated rules reactivate from the rule detail after review.",
    },
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
    footnote:
      "Approval law is configured here. Workflow runtime creates tasks; System Admin does not execute approvals directly.",
    submitCreate: "Save approval rule",
    submitUpdate: "Update approval rule",
    sections: {
      identity: "Rule identity",
      scope: "Protected action",
      routing: "Approval routing",
      delegation: "Delegation",
      escalation: "Escalation",
      lifecycle: "Lifecycle",
    },
    hints: {
      approverRoleKeys:
        "Comma-separated organization role keys validated on save.",
      delegateToRoleKeys: "Optional comma-separated delegation role keys.",
      escalationRoleKeys: "Roles notified or reassigned when escalation fires.",
    },
    fields: {
      approvalKey: "Approval key",
      name: "Display name",
      moduleKey: "Module",
      action: "Action",
      targetType: "Target type",
      approvalMode: "Approval mode",
      approverRoleKeys: "Approver roles",
      delegateToRoleKeys: "Delegation roles (optional)",
      delegationValidDays: "Delegation valid days",
      minApprovals: "Minimum approvals",
      escalationAfterHours: "Escalation (hours)",
      escalationBehavior: "Escalation behavior",
      escalationRoleKeys: "Escalation roles",
      status: "Status",
      enabled: "Enabled",
    },
    placeholders: {
      approvalKey: "purchasing.po.high-value",
      name: "Purchase order above threshold",
      moduleKey: "purchasing",
      action: "purchasing.purchase-order.create",
      approverRoleKeys: "finance-manager,owner",
      delegateToRoleKeys: "operations-manager",
      delegationValidDays: "30",
      escalationAfterHours: "24",
      escalationRoleKeys: "owner",
    },
    modes: {
      sequential: "Sequential",
      parallel: "Parallel",
    },
    escalationBehaviors: {
      notify: "Notify",
      reassign: "Reassign",
      expire: "Expire",
    },
    statuses: {
      active: "Active",
      disabled: "Disabled",
      deprecated: "Deprecated",
    },
    enabledOptions: {
      true: "Enabled",
      false: "Disabled",
    },
  },
  accessDenied: {
    title: "Approvals unavailable",
    description: `You need ${SYSTEM_ADMIN_APPROVALS_VIEW_CAPABILITY} or ${SYSTEM_ADMIN_APPROVALS_READ_CAPABILITY} to open this page.`,
  },
  detail: {
    badges: {
      readiness: {
        ready: "Ready",
        warning: "Warning",
        blocked: "Blocked",
      },
    },
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
      targetType: "Target type",
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
    reactivate: {
      actionLabel: "Reactivate after review",
      description: `Deprecated rules stay out of runtime until a reviewer with ${SYSTEM_ADMIN_APPROVALS_REVIEW_CAPABILITY} reactivates them.`,
      confirmTitle: "Reactivate this approval rule?",
      confirmDescription:
        "The rule will participate in runtime resolution again after reactivation. This action is audited.",
      confirmLabel: "Reactivate rule",
    },
  },
} as const;
