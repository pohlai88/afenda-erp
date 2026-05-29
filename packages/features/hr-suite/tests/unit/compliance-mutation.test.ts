import { describe, expect, it } from "vitest";

import {
  buildRequirementStatusAuditMetadata,
  resolveCertificationExpiresAtMutationInput,
  resolveFilingDeadlineMutationInput,
} from "../../src/employee-management/compliance-regulatory-tracking/data/hr.workforce.compliance-mutation.shared";

describe("compliance mutation helpers", () => {
  it("only forwards filing deadline when the trailing form submitted the field", () => {
    const formData = new FormData();
    expect(
      resolveFilingDeadlineMutationInput(
        formData,
        new Date("2026-12-31T00:00:00.000Z"),
      ),
    ).toBeUndefined();

    formData.set("filingDeadline", "");
    expect(resolveFilingDeadlineMutationInput(formData, null)).toBeNull();
  });

  it("only forwards certification expiry when the trailing form submitted the field", () => {
    const formData = new FormData();
    expect(
      resolveCertificationExpiresAtMutationInput(
        formData,
        new Date("2027-01-01T00:00:00.000Z"),
      ),
    ).toBeUndefined();

    formData.set("certificationExpiresAt", "");
    expect(
      resolveCertificationExpiresAtMutationInput(formData, null),
    ).toBeNull();
  });

  it("serializes certification expiry into audit metadata when included", () => {
    const expiry = new Date("2027-06-01T12:00:00.000Z");
    expect(
      buildRequirementStatusAuditMetadata({
        status: "compliant",
        certificationExpiresAt: expiry,
        includeCertificationExpiry: true,
      }),
    ).toEqual({
      status: "compliant",
      certificationExpiresAt: expiry.toISOString(),
    });
  });
});
