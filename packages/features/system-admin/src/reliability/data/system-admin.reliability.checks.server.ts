import type { IntegrationReadinessReport } from "../../integrations/contracts/system-admin.integrations-readiness.contract";
import { resolveSystemAdminReliabilityTargetHref } from "../contracts/system-admin.reliability-links.shared";
import type {
  SystemAdminReliabilityIssue,
  SystemAdminReliabilityOperationalLinkRow,
} from "../contracts/system-admin.reliability-issue.contract";
import type { CronHealthSurfaceRow } from "../contracts/system-admin.cron-health.contract";
import type { SystemAdminMigrationHealthSnapshot } from "./system-admin.reliability.migration-health.server";
import type { SystemAdminRepositoryHealthSnapshot } from "./system-admin.reliability.repository-health.server";

function issueId(parts: readonly string[]) {
  return parts.join(":");
}

function withHref(
  issue: Omit<SystemAdminReliabilityIssue, "targetHref">,
): SystemAdminReliabilityIssue {
  return {
    ...issue,
    targetHref: resolveSystemAdminReliabilityTargetHref({
      targetType: issue.targetType,
      targetId: issue.targetId,
    }),
  };
}

export function collectCronReliabilityIssues(
  rows: readonly CronHealthSurfaceRow[],
): SystemAdminReliabilityIssue[] {
  const issues: SystemAdminReliabilityIssue[] = [];

  for (const row of rows) {
    if (row.status === "failed" || row.status === "rejected") {
      issues.push(
        withHref({
          id: issueId(["cron_health", row.id, row.status]),
          category: "cron_health",
          severity: "blocked",
          title: `Cron job ${row.path} is unhealthy`,
          description: `Latest run status is ${row.status}. ${row.failure !== "-" ? row.failure : "Review cron logs and CRON_SECRET configuration."}`,
          targetType: "cron_job",
          targetId: row.id,
          recommendedAction:
            "Open Vercel cron logs, verify CRON_SECRET, and replay the job after fixing the root cause.",
        }),
      );
      continue;
    }

    if (row.status === "configured") {
      issues.push(
        withHref({
          id: issueId(["cron_health", row.id, "never-run"]),
          category: "cron_health",
          severity: "warning",
          title: `Cron job ${row.path} has no recorded run`,
          description:
            "The route is declared in vercel.json but no run history exists for this deployment.",
          targetType: "cron_job",
          targetId: row.id,
          recommendedAction:
            "Trigger the cron manually in preview or wait for the next schedule window, then refresh reliability.",
        }),
      );
    }
  }

  return issues;
}

export function collectIntegrationReliabilityIssues(
  readiness: IntegrationReadinessReport,
): SystemAdminReliabilityIssue[] {
  return readiness.issues.map((entry) =>
    withHref({
      id: issueId(["integration_health", entry.id]),
      category: entry.id.includes("webhook")
        ? "webhook_health"
        : "integration_health",
      severity: entry.id.startsWith("blocked:") ? "blocked" : "warning",
      title: entry.title,
      description: entry.description,
      targetType: entry.id.includes("webhook") ? "webhook" : "integration",
      targetId: "integrations",
      recommendedAction:
        "Review webhook deliveries, credential rotation, and SSO staging in System Admin integrations.",
    }),
  );
}

export function collectRepositoryReliabilityIssues(
  snapshot: SystemAdminRepositoryHealthSnapshot,
): SystemAdminReliabilityIssue[] {
  return snapshot.checks
    .filter((check) => check.status === "fail")
    .map((check) =>
      withHref({
        id: issueId(["repository_health", check.id]),
        category: "repository_health",
        severity: "blocked",
        title: `Repository guard missing: ${check.label}`,
        description: `Expected ${check.detail} at the monorepo root.`,
        targetType: "repository",
        targetId: check.id,
        recommendedAction:
          "Restore the file or run pnpm architecture:check locally before promoting this deployment.",
      }),
    );
}

export function collectMigrationReliabilityIssues(
  snapshot: SystemAdminMigrationHealthSnapshot,
): SystemAdminReliabilityIssue[] {
  if (snapshot.isConsistent) {
    return [];
  }

  return [
    withHref({
      id: issueId(["migration_health", "journal-drift"]),
      category: "migration_health",
      severity: "blocked",
      title: "Migration journal drift detected",
      description: snapshot.detail,
      targetType: "migration",
      targetId: "drizzle-journal",
      recommendedAction:
        "Run pnpm db:generate after schema edits and commit journal + SQL together. Do not hand-edit migration SQL.",
    }),
  ];
}

export function collectPlatformInstrumentationIssues(): SystemAdminReliabilityIssue[] {
  return [
    withHref({
      id: issueId(["queue_health", "not-instrumented"]),
      category: "queue_health",
      severity: "info",
      title: "Queue health is not instrumented",
      description:
        "Background queue depth and dead-letter metrics are not yet exposed to System Admin reliability.",
      targetType: "platform",
      targetId: "queue",
      recommendedAction:
        "Track queue instrumentation in platform infrastructure before enabling operational alerts here.",
    }),
    withHref({
      id: issueId(["storage_health", "metrics-shipped"]),
      category: "storage_health",
      severity: "info",
      title: "Object storage metrics emit via structured logs",
      description:
        "Upload/download counters and malware_detected events log to the observability drain. Run pnpm r2:verify quarterly for DR evidence.",
      targetType: "platform",
      targetId: "storage",
      recommendedAction:
        "Run pnpm r2:verify and pnpm r2:verify:presign from repo root after env:sync:all. See packages/object-storage/docs/object-storage-dr-runbook.md.",
    }),
    withHref({
      id: issueId(["cache_health", "not-instrumented"]),
      category: "cache_health",
      severity: "info",
      title: "Cache health is not instrumented",
      description:
        "Redis or runtime cache hit rates are not yet collected for this surface.",
      targetType: "platform",
      targetId: "cache",
      recommendedAction:
        "Enable cache telemetry when a shared cache layer is adopted for this deployment.",
    }),
  ];
}

export async function collectWorkflowReliabilityIssues(input: {
  organizationId: string;
}): Promise<SystemAdminReliabilityIssue[]> {
  const { listLynxWorkflowSessions } = await import("@afenda/db");

  const [failedSessions, activeSessions] = await Promise.all([
    listLynxWorkflowSessions({
      organizationId: input.organizationId,
      status: "failed",
      limit: 10,
    }),
    listLynxWorkflowSessions({
      organizationId: input.organizationId,
      status: "active",
      limit: 100,
    }),
  ]);

  const issues: SystemAdminReliabilityIssue[] = [];

  for (const session of failedSessions) {
    issues.push(
      withHref({
        id: issueId(["workflow_health", session.id, "failed"]),
        category: "workflow_health",
        severity: "blocked",
        title: `Lynx workflow ${session.workflowId} failed`,
        description: `Session ${session.id} ended in failed state.`,
        targetType: "workflow",
        targetId: session.id,
        recommendedAction:
          "Review Lynx workflow sessions and outcome monitors in System Admin Lynx.",
      }),
    );
  }

  if (activeSessions.length >= 25) {
    issues.push(
      withHref({
        id: issueId(["workflow_health", "active-backlog"]),
        category: "workflow_health",
        severity: "warning",
        title: "Large active Lynx workflow backlog",
        description: `${activeSessions.length} active workflow sessions are open for this organization.`,
        targetType: "workflow",
        targetId: "lynx-workflows",
        recommendedAction:
          "Review stalled sessions in Lynx workflows and close or resume them.",
      }),
    );
  }

  return issues;
}

export function buildReliabilityOperationalLinkRows(): SystemAdminReliabilityOperationalLinkRow[] {
  return [
    {
      id: "lynx-workflows",
      area: "Workflow health",
      status: "Review",
      detail: "Lynx workflow sessions and outcome monitors",
      href: "/lynx/workflows",
    },
    {
      id: "observability-drain",
      area: "Observability drain",
      status: "Configured",
      detail: "Route /api/internal/v1/observability/drain",
    },
    {
      id: "object-storage-verify",
      area: "Object storage DR drill",
      status: "Operator",
      detail: "pnpm r2:verify + pnpm r2:verify:presign (see object-storage-dr-runbook.md)",
    },
    {
      id: "governance-diagnostics",
      area: "Governance diagnostics",
      status: "Cross-check",
      detail: "Configuration drift and coverage (read-only)",
      href: "/system-admin/diagnostics",
    },
  ];
}
