import { HrComplianceCommandError } from "@afenda/db";
import { describe, expect, it } from "vitest";

import { toComplianceActionFailure } from "../../src/employee-management/compliance-regulatory-tracking/data/hr.workforce.compliance-action-result.shared";
import {
  HrComplianceOrganizationScopeError,
  HrComplianceSensitiveAccessError,
} from "../../src/employee-management/compliance-regulatory-tracking/data/hr.workforce.compliance-org-scope.shared";

describe("compliance action failure mapping", () => {
  it.each([
    ["obligation_not_found", "Compliance obligation was not found."],
    ["exception_not_found", "Compliance exception was not found."],
    ["exception_not_open", "This compliance exception is already closed."],
    [
      "corrective_action_not_assigned",
      "Assign a corrective action owner before recording progress.",
    ],
    [
      "corrective_action_assignment_incomplete",
      "Corrective action owner and due date must be assigned together.",
    ],
    [
      "corrective_action_owner_not_found",
      "Corrective action owner employee was not found.",
    ],
    ["requirement_not_found", "Compliance requirement tracking row was not found."],
    ["work_eligibility_not_found", "Work eligibility tracking row was not found."],
    ["work_auth_document_not_found", "Work authorization document row was not found."],
    ["filing_not_found", "Mandatory filing row was not found."],
    ["invalid_exception_gap_kind", "Compliance exception gap kind is invalid."],
    [
      "evidence_source_not_found",
      "Compliance record for evidence linking was not found.",
    ],
    [
      "evidence_document_not_found",
      "Supporting employee document was not found or is not active.",
    ],
    [
      "evidence_document_employee_mismatch",
      "Selected document does not belong to the compliance record employee.",
    ],
    ["evidence_link_not_found", "Compliance evidence link was not found."],
    [
      "evidence_link_already_exists",
      "This document is already linked to the compliance record.",
    ],
    [
      "invalid_evidence_submission_state",
      "Evidence submission state is invalid.",
    ],
    [
      "invalid_evidence_record_kind",
      "Compliance record type for evidence linking is invalid.",
    ],
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

  it("maps sensitive access violations", () => {
    const result = toComplianceActionFailure(
      new HrComplianceSensitiveAccessError(),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Sensitive compliance records");
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
