import type {
  ReliabilitySeverity,
  ReliabilityVerdict,
  SystemAdminReliabilityCategory,
  SystemAdminReliabilityIssue,
  SystemAdminReliabilitySummary,
} from "../contracts/system-admin.reliability-issue.contract";

const severityRank: Record<ReliabilitySeverity, number> = {
  blocked: 0,
  warning: 1,
  info: 2,
};

const categoryLabels: Record<SystemAdminReliabilityCategory, string> = {
  cron_health: "Cron health",
  queue_health: "Queue health",
  workflow_health: "Workflow health",
  webhook_health: "Webhook health",
  integration_health: "Integration health",
  repository_health: "Repository health",
  migration_health: "Migration health",
  storage_health: "Storage health",
  cache_health: "Cache health",
};

const severityLabels: Record<ReliabilitySeverity, string> = {
  blocked: "Blocked",
  warning: "Warning",
  info: "Info",
};

export function formatReliabilityCategoryLabel(
  category: SystemAdminReliabilityCategory,
) {
  return categoryLabels[category];
}

export function formatReliabilitySeverityLabel(severity: ReliabilitySeverity) {
  return severityLabels[severity];
}

export function resolveReliabilityVerdict(input: {
  blockedCount: number;
  warningCount: number;
  infoCount: number;
}): ReliabilityVerdict {
  if (input.blockedCount > 0) {
    return "blocked";
  }

  if (input.warningCount > 0 || input.infoCount > 0) {
    return "warning";
  }

  return "healthy";
}

export function formatReliabilityVerdictLabel(verdict: ReliabilityVerdict) {
  if (verdict === "blocked") {
    return "Blocked";
  }

  if (verdict === "warning") {
    return "Warning";
  }

  return "Healthy";
}

export function sortReliabilityIssues(
  issues: readonly SystemAdminReliabilityIssue[],
) {
  return [...issues].sort(
    (left, right) =>
      severityRank[left.severity] - severityRank[right.severity] ||
      left.category.localeCompare(right.category) ||
      left.title.localeCompare(right.title),
  );
}

export function summarizeReliabilityIssues(
  issues: readonly SystemAdminReliabilityIssue[],
): SystemAdminReliabilitySummary {
  const blockedCount = issues.filter((issue) => issue.severity === "blocked").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;
  const infoCount = issues.filter((issue) => issue.severity === "info").length;

  const verdict = resolveReliabilityVerdict({
    blockedCount,
    warningCount,
    infoCount,
  });

  return {
    verdict,
    blockedCount,
    warningCount,
    infoCount,
    totalCount: issues.length,
    isHealthy: verdict === "healthy",
  };
}

export function groupReliabilityIssuesBySeverity(
  issues: readonly SystemAdminReliabilityIssue[],
) {
  return {
    blocked: issues.filter((issue) => issue.severity === "blocked"),
    warning: issues.filter((issue) => issue.severity === "warning"),
    info: issues.filter((issue) => issue.severity === "info"),
  };
}
