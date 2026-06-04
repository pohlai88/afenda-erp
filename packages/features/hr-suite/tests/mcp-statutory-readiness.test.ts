import { describe, expect, it } from "vitest";

import {
  assertEmployeeStatutoryReady,
  buildStatutoryReadinessChecklist,
  HrMcpValidationError,
  resolveRequiredStatutoryIdKeys,
  validateEmployeeStatutoryReadiness,
} from "./hr.payroll.mcp-statutory-readiness.shared";
import type { HrMcpStatutoryReadinessInput } from "../schemas/hr.payroll.mcp-validation.schema";

const readyEmployeeInput: HrMcpStatutoryReadinessInput = {
  employeeId: "hr_emp_001",
  countryCode: "MY",
  taxId: "IG123456789",
  statutoryIds: {
    epf_number: "EPF123456",
    socso_number: "SOCSO987654",
  },
  requiredStatutoryIdKeys: ["epf_number", "socso_number"],
  classification: {
    taxResidency: "resident",
    workerCategory: "full_time",
    statutoryEligibility: "eligible",
    legalEntitySetupId: "hr_mcp_entity_001",
  },
};

describe("HRM-MCP-015 statutory readiness", () => {
  it("passes when tax ID, statutory IDs, classification, and entity assignment are complete", () => {
    const result = validateEmployeeStatutoryReadiness(readyEmployeeInput);

    expect(result.ready).toBe(true);
    expect(result.blockingCodes).toEqual([]);
    expect(result.checks.every((check) => check.passed)).toBe(true);
  });

  it("blocks when tax ID is missing", () => {
    const result = validateEmployeeStatutoryReadiness({
      ...readyEmployeeInput,
      taxId: null,
    });

    expect(result.ready).toBe(false);
    expect(result.blockingCodes).toContain("tax_id");
    expect(
      result.checks.find((check) => check.code === "tax_id")?.message,
    ).toMatch(/tax ID/i);
  });

  it("blocks when required statutory IDs are missing", () => {
    const result = validateEmployeeStatutoryReadiness({
      ...readyEmployeeInput,
      statutoryIds: { epf_number: "EPF123456" },
    });

    expect(result.ready).toBe(false);
    expect(result.blockingCodes).toContain("statutory_id");
    expect(
      result.checks.find((check) => check.code === "statutory_id")?.message,
    ).toMatch(/socso_number/);
  });

  it("blocks when classification is pending or ineligible", () => {
    const pending = validateEmployeeStatutoryReadiness({
      ...readyEmployeeInput,
      classification: {
        ...readyEmployeeInput.classification!,
        statutoryEligibility: "pending",
      },
    });
    expect(pending.ready).toBe(false);
    expect(pending.blockingCodes).toContain("classification");

    const ineligible = validateEmployeeStatutoryReadiness({
      ...readyEmployeeInput,
      classification: {
        ...readyEmployeeInput.classification!,
        statutoryEligibility: "ineligible",
      },
    });
    expect(ineligible.ready).toBe(false);
    expect(ineligible.blockingCodes).toContain("classification");
  });

  it("blocks when legal entity assignment is missing", () => {
    const result = validateEmployeeStatutoryReadiness({
      ...readyEmployeeInput,
      classification: {
        ...readyEmployeeInput.classification!,
        legalEntitySetupId: null,
      },
    });

    expect(result.ready).toBe(false);
    expect(result.blockingCodes).toContain("legal_entity_assignment");
  });

  it("throws on invalid input", () => {
    expect(() =>
      validateEmployeeStatutoryReadiness({
        ...readyEmployeeInput,
        employeeId: "",
      }),
    ).toThrow(HrMcpValidationError);
  });

  it("assertEmployeeStatutoryReady throws when not ready", () => {
    expect(() =>
      assertEmployeeStatutoryReady({
        ...readyEmployeeInput,
        taxId: null,
      }),
    ).toThrow(HrMcpValidationError);
  });

  it("buildStatutoryReadinessChecklist returns four checks", () => {
    const checks = buildStatutoryReadinessChecklist(readyEmployeeInput);
    expect(checks).toHaveLength(4);
    expect(checks.map((check) => check.code)).toEqual([
      "tax_id",
      "statutory_id",
      "classification",
      "legal_entity_assignment",
    ]);
  });

  it("resolveRequiredStatutoryIdKeys returns country defaults", () => {
    expect(resolveRequiredStatutoryIdKeys("MY")).toEqual([
      "epf_number",
      "socso_number",
    ]);
    expect(resolveRequiredStatutoryIdKeys("SG")).toEqual(["cpf_number"]);
    expect(resolveRequiredStatutoryIdKeys("GB")).toEqual(["ni_number"]);
  });
});
