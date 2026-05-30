export type AatIntegrationCoverageStatus = "shipped" | "partial" | "deferred";

export type AatIntegrationRequirementCoverage = {
  readonly code: `HRM-AAT-${string}`;
  readonly status: AatIntegrationCoverageStatus;
  readonly evidence: readonly string[];
};

/** HRM-AAT-027 … HRM-AAT-029 integration slice coverage. */
export const AAT_INTEGRATION_REQUIREMENT_COVERAGE: readonly AatIntegrationRequirementCoverage[] =
  [
    {
      code: "HRM-AAT-027",
      status: "shipped",
      evidence: [
        "packages/db/src/schema/hr.ts (hr_aat_notifications)",
        "packages/db/src/hr-aat-advanced.ts (enqueueHrAatNotification)",
        "packages/features/hr-suite/.../data/hr.time.aat-notifications.server.ts (syncHrAatRiskThresholdNotifications)",
        "packages/features/hr-suite/.../surface/hr.time.aat-notifications-list.surface.ts",
      ],
    },
    {
      code: "HRM-AAT-028",
      status: "shipped",
      evidence: [
        "packages/db/src/schema/hr.ts (hr_aat_analytics_snapshots)",
        "packages/db/src/hr-aat-advanced.ts (persistHrAatAnalyticsSnapshot)",
        "packages/features/hr-suite/.../data/hr.time.aat-snapshots.server.ts",
        "packages/features/hr-suite/.../surface/hr.time.aat-snapshots-list.surface.ts",
      ],
    },
    {
      code: "HRM-AAT-029",
      status: "shipped",
      evidence: [
        "packages/features/hr-suite/.../events/hr.time.aat.event.ts (hrTimeAatAuditActions)",
        "packages/features/hr-suite/.../data/hr.time.aat-audit.server.ts (emitHrAatAuditEvent, listHrAatAuditTrailWindow)",
        "packages/features/hr-suite/.../surface/hr.time.aat-audit-trail-list.surface.ts",
      ],
    },
  ] as const;

export function assertAatIntegrationCoverageComplete(): void {
  const missing = AAT_INTEGRATION_REQUIREMENT_COVERAGE.filter(
    (row) => row.status !== "shipped",
  );
  if (missing.length > 0) {
    throw new Error(
      `aat_integration_incomplete:${missing.map((row) => row.code).join(",")}`,
    );
  }
}
