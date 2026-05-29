import { HrComplianceCommandError } from "@afenda/db";
import { describe, expect, it } from "vitest";

import { toComplianceActionFailure } from "../../src/employee-management/compliance-regulatory-tracking/data/hr.workforce.compliance-action-result.shared";
import { HrComplianceOrganizationScopeError } from "../../src/employee-management/compliance-regulatory-tracking/data/hr.workforce.compliance-org-scope.shared";

describe("compliance action failure mapping", () => {
  it("maps domain command errors to operator-safe messages", () => {
    const result = toComplianceActionFailure(
      new HrComplianceCommandError("requirement_not_found"),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(
        "Labor law requirement tracking row was not found.",
      );
    }
  });

  it("maps organization scope violations", () => {
    const result = toComplianceActionFailure(
      new HrComplianceOrganizationScopeError(),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Organization scope mismatch.");
    }
  });

  it("does not expose unexpected internal error text", () => {
    const result = toComplianceActionFailure(
      new Error("relation hr_compliance_obligations does not exist"),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Compliance action failed.");
    }
  });
});
