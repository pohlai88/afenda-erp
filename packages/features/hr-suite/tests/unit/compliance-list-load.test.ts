import { describe, expect, it } from "vitest";

import {
  buildComplianceEmbeddedListLoadError,
  settleComplianceListLoad,
} from "../../src/employee-management/compliance-regulatory-tracking/data/hr.workforce.compliance-list-load.shared";

describe("compliance list load resilience", () => {
  it("builds operator-safe embedded load errors", () => {
    expect(buildComplianceEmbeddedListLoadError("Labor law requirements")).toEqual({
      variant: "error",
      title: "Labor law requirements unavailable",
      description:
        "This register could not be loaded. Refresh the page or try again later.",
    });
  });

  it("returns loadError without throwing when a list query fails", async () => {
    const result = await settleComplianceListLoad({
      sectionTitle: "Work eligibility",
      load: async () => {
        throw new Error("connection refused");
      },
    });

    expect(result.value).toBeUndefined();
    expect(result.loadError?.variant).toBe("error");
  });
});
