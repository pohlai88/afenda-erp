import { HrComplianceCommandError } from "@afenda/db";
import { describe, expect, it } from "vitest";

import { toComplianceActionFailure } from "../../src/employee-management/compliance-regulatory-tracking/data/hr.workforce.compliance-action-result.shared";
import { HrComplianceOrganizationScopeError } from "../../src/employee-management/compliance-regulatory-tracking/data/hr.workforce.compliance-org-scope.shared";

describe("compliance action failure mapping", () => {
  it.each([
    ["obligation_not_found", "Compliance obligation was not found."],
    ["exception_not_found", "Compliance exception was not found."],
    ["exception_not_open", "This compliance exception is already closed."],
    ["requirement_not_found", "Compliance requirement tracking row was not found."],
    ["work_eligibility_not_found", "Work eligibility tracking row was not found."],
    ["work_auth_document_not_found", "Work authorization document row was not found."],
    ["filing_not_found", "Mandatory filing row was not found."],
    ["invalid_exception_gap_kind", "Compliance exception gap kind is invalid."],
  ] as const)("maps %s to operator-safe message", (code, message) => {
    const result = toComplianceActionFailure(new HrComplianceCommandError(code));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(message);
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
