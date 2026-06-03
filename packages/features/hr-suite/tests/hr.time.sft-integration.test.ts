import { describe, expect, it } from "vitest";

import {
  HR_TIME_SFT_ARCHITECTURE_SURFACE_KEYS,
  HR_TIME_SFT_AUDIT_MODULE_KEY,
} from "../contracts/hr.time.sft.contract";
import {
  assertSftConflictPolicyCoverageComplete,
  assertSftFoundationCoverageComplete,
  assertSftIntegrationCoverageComplete,
  assertSftRequirementCoverageComplete,
  assertSftWorkflowCoverageComplete,
  SFT_REQUIREMENT_COVERAGE,
} from "../data/hr.time.sft-acceptance-coverage.shared";
import {
  hrTimeSftAuditActions,
  HR_SFT_EMITTED_AUDIT_ACTIONS,
} from "../events/hr.time.sft.event";
import { getHrSftArchitectureSurfaceKeys } from "../surface/hr.time.sft-surface-metadata.shared";
import {
  buildHrSftNotificationCopy,
  hrSftNotificationSubjectTypes,
} from "../surface/hr.time.sft-notification-templates.shared";

describe("HRM-SFT architecture surface keys", () => {
  it("registers all 11 architecture surface keys", () => {
    expect(getHrSftArchitectureSurfaceKeys()).toHaveLength(11);
    expect(getHrSftArchitectureSurfaceKeys()).toEqual(
      HR_TIME_SFT_ARCHITECTURE_SURFACE_KEYS,
    );
  });
});

describe("HRM-SFT-030 audit trail contract", () => {
  it("uses hr.sft audit module key", () => {
    expect(HR_TIME_SFT_AUDIT_MODULE_KEY).toBe("hr.sft");
    expect(hrTimeSftAuditActions.roster.published.startsWith("hr.sft.")).toBe(
      true,
    );
  });

  it("includes integration slice audit emitters", () => {
    const required = [
      hrTimeSftAuditActions.roster.published,
      hrTimeSftAuditActions.report.exported,
      hrTimeSftAuditActions.notification.enqueued,
      hrTimeSftAuditActions.payroll.referenceLinked,
    ];
    for (const action of required) {
      expect(HR_SFT_EMITTED_AUDIT_ACTIONS).toContain(action);
    }
  });
});

describe("HRM-SFT-025 notification templates", () => {
  it("builds roster published copy", () => {
    const copy = buildHrSftNotificationCopy({
      kind: "roster_published",
      periodStart: new Date("2026-05-01T00:00:00.000Z"),
      periodEnd: new Date("2026-05-14T00:00:00.000Z"),
    });
    expect(copy.title).toBe("Shift roster published");
    expect(copy.body).toContain("2026-05-01");
  });

  it("defines subject types for publication and assignment", () => {
    expect(hrSftNotificationSubjectTypes.rosterPublication).toBe(
      "hr_sft_roster_publication",
    );
  });
});

describe("SFT requirement coverage SFT-001 … SFT-030", () => {
  it("covers all 30 requirement codes", () => {
    const codes = SFT_REQUIREMENT_COVERAGE.map((row) => row.code);
    for (let index = 1; index <= 30; index += 1) {
      const code = `HRM-SFT-${String(index).padStart(3, "0")}` as const;
      expect(codes).toContain(code);
    }
  });

  it("marks foundation, conflict, workflow, and integration slices as shipped", () => {
    expect(() => assertSftFoundationCoverageComplete()).not.toThrow();
    expect(() => assertSftConflictPolicyCoverageComplete()).not.toThrow();
    expect(() => assertSftWorkflowCoverageComplete()).not.toThrow();
    expect(() => assertSftIntegrationCoverageComplete()).not.toThrow();
    expect(() => assertSftRequirementCoverageComplete()).not.toThrow();
  });
});
