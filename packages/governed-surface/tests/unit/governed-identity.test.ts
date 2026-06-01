import { describe, expect, it } from "vitest";

import {
  governedDescriptionId,
  governedHeadingId,
  governedIdentityAttributes,
  governedTestId,
  toGovernedDomId,
} from "../../src/utils/governed-identity.shared";

describe("governed identity contract", () => {
  it("emits surface, section, and component keys", () => {
    expect(
      governedIdentityAttributes({
        surfaceKey: "hrm.employee-directory",
        sectionKey: "active-employees",
        componentKey: "employee-list",
      }),
    ).toEqual({
      "data-surface-key": "hrm.employee-directory",
      "data-section-key": "active-employees",
      "data-component-key": "employee-list",
    });
  });

  it("omits undefined identity attributes", () => {
    expect(
      governedIdentityAttributes({ componentKey: "employee-list" }),
    ).toEqual({
      "data-component-key": "employee-list",
    });
  });

  it("normalizes governed test ids", () => {
    expect(governedTestId("List Section", "HR Records")).toBe(
      "governed:list-section:hr-records",
    );
  });

  it("builds stable dom ids with fallback", () => {
    expect(toGovernedDomId("governed-audit-panel", "Recent Activity")).toBe(
      "governed-audit-panel-recent-activity",
    );
    expect(toGovernedDomId("  ", "   ")).toBe("governed-unknown");
  });

  it("builds heading and description ids for accessibility", () => {
    expect(governedHeadingId("audit-panel", "recent-activity")).toBe(
      "governed-audit-panel-recent-activity-title",
    );
    expect(governedDescriptionId("audit-panel", "recent-activity")).toBe(
      "governed-audit-panel-recent-activity-description",
    );
  });
});
