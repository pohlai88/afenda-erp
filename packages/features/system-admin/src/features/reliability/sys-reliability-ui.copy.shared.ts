export const systemAdminReliabilityUiCopy = {
  page: {
    title: "Reliability",
    description:
      "Operational continuity for scheduled jobs, integrations, repository guards, and migrations. Reliability is read-only; remediation happens in integrations, Lynx, or deployment tooling.",
  },
  summary: {
    healthyTitle: "Platform operations are healthy",
    healthyDescription:
      "No blocked operational issues, warnings, or informational notices were detected for this deployment.",
    verdictTitle: "Operational reliability",
    blockedCard: "Blocked",
    blockedBadge: "Outage risk",
    warningCard: "Warnings",
    warningBadge: "Review",
    infoCard: "Informational",
    infoBadge: "Notice",
  },
  cron: {
    title: "Cron health",
    description: "Configured in vercel.json. Each route validates CRON_SECRET.",
    searchPlaceholder: "Search cron routes by path or status",
    emptyTitle: "No cron routes configured.",
    emptyDescription:
      "Cron routes are declared in vercel.json and validated with CRON_SECRET at runtime.",
  },
  operationalLinks: {
    title: "Operational review",
    description:
      "Cross-links for workflow sessions, observability drain, and governance diagnostics.",
    searchPlaceholder: "Search operational links by area or status",
    emptyTitle: "No operational review links are configured.",
    emptyDescription:
      "Links appear when workflow, observability, or diagnostics surfaces are available.",
  },
  issues: {
    blockedTitle: "Blocked operational issues",
    searchPlaceholder: "Search operational issues by category or target",
    blockedEmpty: "No blocked operational issues.",
    blockedEmptyDescription:
      "No blocking operational drift detected for this deployment.",
    warningTitle: "Warnings",
    warningEmpty: "No operational warnings.",
    warningEmptyDescription:
      "No warning-level operational drift detected for this deployment.",
    infoTitle: "Informational notices",
    infoEmpty: "No informational notices.",
    infoEmptyDescription:
      "No informational operational notices for this deployment.",
    allTitle: "Operational reliability",
    allEmpty: "No operational issues detected.",
    allEmptyDescription:
      "Reliability did not find blocked, warning, or informational issues.",
  },
  accessDenied: {
    title: "Access denied",
    description:
      "You need the system-admin.reliability.read capability to view operational reliability for this deployment.",
  },
} as const;
