export const systemAdminPoliciesUiCopy = {
  page: {
    title: "Policies",
    description:
      "Configure lock, deny, warn, and approval-required rules. The execution kernel evaluates active rules by priority during protected mutations.",
  },
  list: {
    title: "Policy rules",
    searchPlaceholder: "Search policy rules by name, module, or action",
    emptyTitle: "No policy rules are configured for this organization.",
    emptyDescription:
      "Create a rule below when you have system-admin.policies.manage.",
  },
  editor: {
    createTitle: "Create or update policy rule",
    updateTitle: "Update selected policy rule",
    description:
      "Rules are organization-scoped, audited, and applied before workflow runtime.",
  },
  accessDenied: {
    title: "Access denied",
    description:
      "You need the system-admin.policies.read capability to view policy rules for this organization.",
  },
  detail: {
    backLabel: "Back to catalog",
    conditionTitle: "Policy condition",
    auditHistoryLabel: "View policy audit history",
    noCapability: "No registered execution capability",
    fields: {
      policyKey: "Policy key",
      module: "Module",
      effect: "Effect",
      status: "Status",
      priority: "Priority",
      readiness: "Readiness",
      coverage: "Coverage",
      action: "Action",
      capability: "Capability",
      requiredPermission: "Required permission",
      relatedApprovals: "Related approval rules",
    },
  },
} as const;
