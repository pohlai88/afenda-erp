import { describe, expect, it } from "vitest";

import { auditVisualBehavior } from "../../audits/audit-visual-behavior";

describe("auditVisualBehavior", () => {
  it("warns when interface-lab is missing by default", () => {
    const violations = auditVisualBehavior({ exists: () => false });

    expect(violations).toContainEqual(
      expect.objectContaining({
        rule: "missing-interface-lab",
        severity: "warn",
      }),
    );
  });

  it("errors when interface-lab is missing in strict mode", () => {
    const violations = auditVisualBehavior({
      strict: true,
      exists: () => false,
    });

    expect(violations).toContainEqual(
      expect.objectContaining({
        rule: "missing-interface-lab",
        severity: "error",
      }),
    );
  });
});
