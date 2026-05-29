import { describe, expect, it, vi } from "vitest";
import {
  collectCronReliabilityIssues,
  collectIntegrationReliabilityIssues,
  collectMigrationReliabilityIssues,
  collectRepositoryReliabilityIssues,
  collectWorkflowReliabilityIssues,
  summarizeReliabilityIssues,
} from "../../src/reliability/data";

vi.mock("@afenda/db", () => ({
  listLynxWorkflowSessions: vi.fn(async (input: { status?: string }) => {
    if (input.status === "failed") {
      return [
        {
          id: "session_failed",
          workflowId: "approval-chain",
          status: "failed",
        },
      ];
    }

    return [];
  }),
}));

describe("system-admin reliability checks", () => {
  it("flags failed cron jobs as blocked", () => {
    const issues = collectCronReliabilityIssues([
      {
        id: "housekeeping",
        path: "/api/cron/housekeeping",
        schedule: "0 2 * * *",
        status: "failed",
        lastRun: "2026-05-01",
        duration: "120ms",
        failure: "Unauthorized",
      },
    ]);

    expect(issues[0]?.severity).toBe("blocked");
    expect(issues[0]?.category).toBe("cron_health");
  });

  it("maps integration readiness into operational reliability issues", () => {
    const issues = collectIntegrationReliabilityIssues({
      verdict: "blocked",
      issues: [
        {
          id: "blocked:webhook-health",
          title: "Webhook health is critically degraded",
          description: "Multiple consecutive failures indicate the endpoint is unhealthy.",
        },
      ],
    });

    expect(issues[0]?.category).toBe("webhook_health");
    expect(issues[0]?.targetHref).toBe("/system-admin/integrations");
  });

  it("detects migration journal drift", () => {
    const issues = collectMigrationReliabilityIssues({
      journalEntryCount: 2,
      sqlMigrationCount: 3,
      isConsistent: false,
      detail: "drift",
    });

    expect(issues[0]?.severity).toBe("blocked");
    expect(issues[0]?.category).toBe("migration_health");
  });

  it("summarizes reliability verdict from issue severities", () => {
    const summary = summarizeReliabilityIssues([
      ...collectRepositoryReliabilityIssues({
        checks: [
          {
            id: "architecture-index",
            label: "Architecture doctrine index",
            status: "fail",
            detail: "docs/architecture/README.md",
          },
        ],
        blockedCount: 1,
        warningCount: 0,
      }),
      ...collectCronReliabilityIssues([
        {
          id: "syncs",
          path: "/api/cron/syncs",
          schedule: "0 1 * * *",
          status: "configured",
          lastRun: "-",
          duration: "-",
          failure: "-",
        },
      ]),
    ]);

    expect(summary.verdict).toBe("blocked");
    expect(summary.blockedCount).toBeGreaterThan(0);
    expect(summary.warningCount).toBeGreaterThan(0);
  });

  it("flags failed Lynx workflow sessions as blocked", async () => {
    const issues = await collectWorkflowReliabilityIssues({
      organizationId: "org_1",
    });

    expect(issues[0]?.category).toBe("workflow_health");
    expect(issues[0]?.severity).toBe("blocked");
  });
});
