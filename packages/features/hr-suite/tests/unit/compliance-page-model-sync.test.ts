import { beforeEach, describe, expect, it, vi } from "vitest";

const syncCallLog: string[] = [];

vi.mock("@afenda/db", async (importOriginal) => {
  const original = await importOriginal<typeof import("@afenda/db")>();

  return {
    ...original,
    syncHrComplianceFilings: vi.fn(async () => {
      syncCallLog.push("filings");
    }),
    syncHrEmployeeLaborLawRequirements: vi.fn(async () => {
      syncCallLog.push("laborLaw");
    }),
    syncHrEmployeePolicyAcknowledgements: vi.fn(async () => {
      syncCallLog.push("policyAcknowledgements");
    }),
    syncHrEmployeeSafetyTrainingRequirements: vi.fn(async () => {
      syncCallLog.push("safetyTraining");
    }),
    syncHrEmployeeWorkplaceSafetyRequirements: vi.fn(async () => {
      syncCallLog.push("workplaceSafety");
    }),
    ensureHrWorkEligibilityTracking: vi.fn(async () => {
      syncCallLog.push("workEligibility");
    }),
    ensureHrWorkAuthorizationDocuments: vi.fn(async () => {
      syncCallLog.push("workAuthDocuments");
    }),
    syncHrComplianceExceptions: vi.fn(async () => {
      syncCallLog.push("exceptions");
    }),
  };
});

import {
  runHrCompliancePageLoadSync,
  runHrComplianceSourceSyncSteps,
} from "../../src/employee-management/compliance-regulatory-tracking/data/hr.workforce.compliance.page-model.server";

describe("hr compliance page load sync (HRM-CMP-017)", () => {
  beforeEach(() => {
    syncCallLog.length = 0;
  });

  it("runs all source sync/ensure steps in parallel", async () => {
    await runHrComplianceSourceSyncSteps({ organizationId: "org-1" });

    expect(syncCallLog).toHaveLength(7);
    expect(syncCallLog).not.toContain("exceptions");
  });

  it("materializes exceptions only after source sync steps complete", async () => {
    await runHrCompliancePageLoadSync({ organizationId: "org-1" });

    expect(syncCallLog.at(-1)).toBe("exceptions");
    expect(syncCallLog.slice(0, 7)).not.toContain("exceptions");
    expect(syncCallLog).toHaveLength(8);
  });
});
