export type ReliabilitySeverity = "info" | "warning" | "blocked";

export type ReliabilityVerdict = "healthy" | "warning" | "blocked";

export type SystemAdminReliabilityCategory =
  | "cron_health"
  | "queue_health"
  | "workflow_health"
  | "webhook_health"
  | "integration_health"
  | "repository_health"
  | "migration_health"
  | "storage_health"
  | "cache_health";

export type SystemAdminReliabilityTargetType =
  | "cron_job"
  | "integration"
  | "webhook"
  | "repository"
  | "migration"
  | "workflow"
  | "platform";

export type SystemAdminReliabilityIssue = {
  id: string;
  category: SystemAdminReliabilityCategory;
  severity: ReliabilitySeverity;
  title: string;
  description: string;
  targetType: SystemAdminReliabilityTargetType;
  targetId?: string;
  targetHref?: string;
  recommendedAction: string;
};

export type SystemAdminReliabilitySummary = {
  verdict: ReliabilityVerdict;
  blockedCount: number;
  warningCount: number;
  infoCount: number;
  totalCount: number;
  isHealthy: boolean;
};

export type SystemAdminReliabilityOperationalLinkRow = {
  id: string;
  area: string;
  status: string;
  detail: string;
  href?: string;
};
