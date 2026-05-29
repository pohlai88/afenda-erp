export type {
  DiagnosticSeverity,
  GovernanceHealthVerdict,
  SystemAdminDiagnosticCategory,
  SystemAdminDiagnosticIssue,
  SystemAdminDiagnosticTargetType,
  SystemAdminDiagnosticsSummary,
} from "./system-admin.diagnostic-issue.contract";
export type {
  SystemAdminDiagnosticsModuleCoverageRow,
  SystemAdminDiagnosticsRecentChangeRow,
} from "./system-admin.diagnostics-coverage.contract";
export {
  buildSystemAdminDiagnosticsCategoryHref,
  resolveSystemAdminDiagnosticTargetHref,
  systemAdminAuditCoverageDiagnosticsHref,
  systemAdminDiagnosticsHubHref,
} from "./system-admin.diagnostics-links.shared";
