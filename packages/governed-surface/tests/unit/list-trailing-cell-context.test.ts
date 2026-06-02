import { describe, expect, it } from "vitest";

import {
  parseGovernedListTrailingCellContext,
} from "../../src/schemas/list-trailing-cell-context.schema";

describe("parseGovernedListTrailingCellContext", () => {
  it("accepts an empty object (both fields optional)", () => {
    const result = parseGovernedListTrailingCellContext({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({});
    }
  });

  it("accepts a full context", () => {
    const result = parseGovernedListTrailingCellContext({
      surfaceKey: "finance-records",
      sectionKey: "reorder-queue",
      componentKey: "reorder-list",
      moduleId: "finance",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.surfaceKey).toBe("finance-records");
      expect(result.data.sectionKey).toBe("reorder-queue");
      expect(result.data.componentKey).toBe("reorder-list");
      expect(result.data.moduleId).toBe("finance");
    }
  });

  it("accepts context with only surfaceKey", () => {
    const result = parseGovernedListTrailingCellContext({ surfaceKey: "dashboard-workflow" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.surfaceKey).toBe("dashboard-workflow");
      expect(result.data.moduleId).toBeUndefined();
    }
  });

  it("accepts context with only moduleId", () => {
    const result = parseGovernedListTrailingCellContext({ moduleId: "approvals" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.moduleId).toBe("approvals");
    }
  });

  it("rejects an empty surfaceKey string", () => {
    const result = parseGovernedListTrailingCellContext({ surfaceKey: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty moduleId string", () => {
    const result = parseGovernedListTrailingCellContext({ moduleId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects empty section and component identity strings", () => {
    expect(
      parseGovernedListTrailingCellContext({ sectionKey: "" }).success,
    ).toBe(false);
    expect(
      parseGovernedListTrailingCellContext({ componentKey: "" }).success,
    ).toBe(false);
  });

  it("accepts document registry lifecycle context", () => {
    const result = parseGovernedListTrailingCellContext({
      surfaceKey: "finance-documents",
      moduleId: "finance",
      organizationLegalHoldActive: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.organizationLegalHoldActive).toBe(true);
    }
  });

  it("rejects extra fields (strict schema)", () => {
    const result = parseGovernedListTrailingCellContext({
      surfaceKey: "ok",
      unknownField: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects null", () => {
    const result = parseGovernedListTrailingCellContext(null);
    expect(result.success).toBe(false);
  });
});
