export const systemAdminDiagnosticsUiCopy = {
  page: {
    title: "Diagnostics",
    description:
      "Read-only configuration health. Diagnostics observes drift and coverage gaps; System Admin surfaces are where operators remediate settings.",
    categoryFilterTitle: "Category filter active",
    categoryFilterDescription: (categoryLabel: string) =>
      `Showing ${categoryLabel} issues only. Module coverage and recent changes remain organization-wide.`,
    clearCategoryFilterLabel: "Show all categories",
  },
  summary: {
    healthyTitle: "System configuration is healthy",
    healthyDescription:
      "Diagnostics did not detect blocked issues, warnings, or informational notices for this organization.",
    verdictTitle: "Governance health",
    blockedCard: "Blocked",
    blockedBadge: "Must resolve",
    warningCard: "Warnings",
    warningBadge: "Review",
    infoCard: "Informational",
    infoBadge: "Notice",
  },
  moduleCoverage: {
    title: "Coverage by module",
    searchPlaceholder: "Search module coverage by module or status",
    emptyTitle: "No module settings are configured for this organization.",
    emptyDescription:
      "Module settings appear after rollout configuration is saved for this tenant.",
  },
  recentChanges: {
    title: "Recent configuration changes",
    description:
      "Latest administrative audit evidence for module, capability, policy, approval, security, and role configuration. Open the audit viewer for full search and export.",
    searchPlaceholder: "Search changes by action, module, or target",
    emptyTitle:
      "No recent configuration changes were recorded in the administrative audit log.",
    emptyDescription:
      "Changes appear after operators update module, capability, or security settings.",
  },
  issues: {
    blockedTitle: "Blocked issues",
    searchPlaceholder: "Search blocked issues by category or target",
    blockedEmpty: "No blocked configuration issues.",
    blockedEmptyDescription:
      "No blocking configuration drift detected for this organization.",
    warningTitle: "Warnings",
    warningEmpty: "No configuration warnings.",
    warningEmptyDescription:
      "No warning-level configuration drift detected for this organization.",
    infoTitle: "Informational notices",
    infoEmpty: "No informational notices.",
    infoEmptyDescription:
      "No informational configuration notices for this organization.",
    allTitle: "Configuration diagnostics",
    allEmpty: "No configuration issues detected for this organization.",
    allEmptyDescription:
      "Diagnostics did not find blocked, warning, or informational issues.",
  },
  export: {
    label: "Export diagnostics CSV",
    pendingLabel: "Exporting…",
  },
  accessDenied: {
    title: "Access denied",
    description:
      "You need the system-admin.diagnostics.read capability to view configuration diagnostics for this organization.",
  },
} as const;
