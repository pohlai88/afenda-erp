export type DiagnosticSeverity = "info" | "warning" | "blocked";

export type GovernanceHealthVerdict = "healthy" | "warning" | "blocked";

export type SystemAdminDiagnosticCategory =
  | "permission_coverage"
  | "capability_status"
  | "module_health"
  | "policy_drift"
  | "approval_drift"
  | "audit_coverage"
  | "security_posture"
  | "role_coverage"
  | "integration_health";

export type SystemAdminDiagnosticTargetType =
  | "permission"
  | "capability"
  | "module"
  | "policy"
  | "approval_rule"
  | "audit_action"
  | "role"
  | "security_setting"
  | "integration";

export type SystemAdminDiagnosticIssue = {
  id: string;
  category: SystemAdminDiagnosticCategory;
  severity: DiagnosticSeverity;
  title: string;
  description: string;
  targetType: SystemAdminDiagnosticTargetType;
  targetId?: string;
  targetHref?: string;
  recommendedAction: string;
};

export type SystemAdminDiagnosticsSummary = {
  verdict: GovernanceHealthVerdict;
  blockedCount: number;
  warningCount: number;
  infoCount: number;
  totalCount: number;
  isHealthy: boolean;
};
