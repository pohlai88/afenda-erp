import type {
  SystemAdminDiagnosticCategory,
  SystemAdminDiagnosticIssue,
  SystemAdminDiagnosticsSummary,
  DiagnosticSeverity,
} from "../contracts/system-admin.diagnostic-issue.contract";

const severityRank: Record<DiagnosticSeverity, number> = {
  blocked: 0,
  warning: 1,
  info: 2,
};

const categoryLabels: Record<SystemAdminDiagnosticCategory, string> = {
  permission_coverage: "Permission coverage",
  capability_status: "Capability status",
  module_health: "Module health",
  policy_drift: "Policy drift",
  approval_drift: "Approval drift",
  audit_coverage: "Audit coverage",
  security_posture: "Security posture",
  role_coverage: "Role coverage",
};

const severityLabels: Record<DiagnosticSeverity, string> = {
  blocked: "Blocked",
  warning: "Warning",
  info: "Info",
};

export function formatDiagnosticCategoryLabel(
  category: SystemAdminDiagnosticCategory,
) {
  return categoryLabels[category];
}

export function formatDiagnosticSeverityLabel(severity: DiagnosticSeverity) {
  return severityLabels[severity];
}

export function sortDiagnosticIssues(issues: readonly SystemAdminDiagnosticIssue[]) {
  return [...issues].sort(
    (left, right) =>
      severityRank[left.severity] - severityRank[right.severity] ||
      left.category.localeCompare(right.category) ||
      left.title.localeCompare(right.title),
  );
}

export function summarizeDiagnosticIssues(
  issues: readonly SystemAdminDiagnosticIssue[],
): SystemAdminDiagnosticsSummary {
  const blockedCount = issues.filter((issue) => issue.severity === "blocked").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;
  const infoCount = issues.filter((issue) => issue.severity === "info").length;

  return {
    blockedCount,
    warningCount,
    infoCount,
    totalCount: issues.length,
    isHealthy: issues.length === 0,
  };
}

export function groupDiagnosticIssuesBySeverity(
  issues: readonly SystemAdminDiagnosticIssue[],
) {
  return {
    blocked: issues.filter((issue) => issue.severity === "blocked"),
    warning: issues.filter((issue) => issue.severity === "warning"),
    info: issues.filter((issue) => issue.severity === "info"),
  };
}
