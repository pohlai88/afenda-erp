import { describe, expect, it } from "vitest";

import {
  buildHrComplianceOverviewFollowUpStatGrid,
  buildHrComplianceOverviewRiskStatGrid,
  hrComplianceOverviewStatSurfaceKey,
} from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-overview-stat.surface";
import { buildHrComplianceOverviewBreakdownListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-overview-breakdown-list.surface";
import { hrWorkforceComplianceReadPermission } from "../../src/employee-management/compliance-regulatory-tracking/contracts/hr.workforce.compliance.contract";

describe("HRM-CMP-022 compliance overview surfaces", () => {
  const snapshot = {
    openExceptionCount: 2,
    criticalAlertCount: 1,
    overdueFilingCount: 3,
    pendingReviewCount: 4,
    atRiskRequirementCount: 5,
    overdueRequirementCount: 6,
    dimensionBreakdown: [
      {
        id: "department:Legal",
        dimension: "department" as const,
        dimensionValue: "Legal",
        trackedCount: 10,
        atRiskCount: 2,
        overdueCount: 1,
        openExceptionCount: 0,
      },
    ],
  };

  it("builds governed risk stat grid with snapshot-summary data nature", () => {
    const grid = buildHrComplianceOverviewRiskStatGrid({ snapshot });

    expect(grid.dataNature).toBe("snapshot-summary");
    expect(grid.stats).toHaveLength(4);
    expect(grid.stats?.[0]?.tone).toBe("attention");
    expect(grid.stats?.[1]?.tone).toBe("critical");
  });

  it("builds follow-up stat grid for filings and reviews", () => {
    const grid = buildHrComplianceOverviewFollowUpStatGrid({ snapshot });

    expect(grid.dataNature).toBe("snapshot-summary");
    expect(grid.stats).toHaveLength(2);
  });

  it("uses stable overview stat surface key", () => {
    expect(hrComplianceOverviewStatSurfaceKey).toBe(
      "hr.workforce.compliance.overview.stats",
    );
  });

  it("builds read-only breakdown list surface without trailing column", () => {
    const surface = buildHrComplianceOverviewBreakdownListSurface({
      snapshot,
    });

    expect(surface.dataNature).toBe("table");
    expect(surface.requiresErpPermission).toEqual(hrWorkforceComplianceReadPermission);
    expect(surface.trailingColumn).toBeUndefined();
    expect(surface.rows).toHaveLength(1);
  });
});
