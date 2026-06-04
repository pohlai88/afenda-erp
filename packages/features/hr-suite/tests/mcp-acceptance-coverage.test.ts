import { describe, expect, it } from "vitest";

import {
  MCP_ACCEPTANCE_CRITERIA_COVERAGE,
  MCP_REQUIREMENT_COVERAGE,
} from "../src/payroll-compensation/multi-country-payroll/hr.payroll.mcp-acceptance-coverage.shared";

const EXPECTED_MCP_CODES = Array.from({ length: 28 }, (_, index) => {
  const number = String(index + 1).padStart(3, "0");
  return `HRM-MCP-${number}` as const;
});

describe("HRM-MCP-001..028 acceptance coverage", () => {
  it("ships all 28 enterprise requirement codes", () => {
    const coveredCodes = MCP_REQUIREMENT_COVERAGE.map((entry) => entry.code);

    expect(coveredCodes).toHaveLength(28);
    expect(coveredCodes).toEqual(EXPECTED_MCP_CODES);
    expect(
      MCP_REQUIREMENT_COVERAGE.every((entry) => entry.status === "shipped"),
    ).toBe(true);
    expect(
      MCP_REQUIREMENT_COVERAGE.every((entry) => entry.evidence.length > 0),
    ).toBe(true);
  });

  it("ships all 22 enterprise acceptance criteria", () => {
    expect(MCP_ACCEPTANCE_CRITERIA_COVERAGE).toHaveLength(22);
    expect(
      MCP_ACCEPTANCE_CRITERIA_COVERAGE.every(
        (entry) => entry.status === "shipped",
      ),
    ).toBe(true);

    const mappedRequirements = new Set(
      MCP_ACCEPTANCE_CRITERIA_COVERAGE.flatMap((entry) => entry.requirements),
    );

    expect(mappedRequirements.size).toBeGreaterThanOrEqual(20);
    for (const entry of MCP_ACCEPTANCE_CRITERIA_COVERAGE) {
      expect(entry.requirements.length).toBeGreaterThan(0);
    }
  });
});
