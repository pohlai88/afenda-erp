import { describe, expect, it } from "vitest";

import {
  assertCareerPathingCoverageComplete,
  CAREER_PATHING_REQUIREMENT_COVERAGE,
} from "../src/talent-management/career-pathing-development-plans/hr.talent.career-pathing-acceptance-coverage.shared";

describe("Career pathing acceptance coverage matrix", () => {
  it("lists HRM-CAR-001 through HRM-CAR-012 foundation requirements", () => {
    const foundation = CAREER_PATHING_REQUIREMENT_COVERAGE.filter((row) => {
      const num = Number(row.code.replace("HRM-CAR-", ""));
      return num >= 1 && num <= 12;
    });
    expect(foundation).toHaveLength(12);
    const codes = foundation.map((row) => row.code);
    for (let index = 1; index <= 12; index += 1) {
      const padded = String(index).padStart(3, "0");
      expect(codes).toContain(`HRM-CAR-${padded}`);
    }
  });

  it("documents shipped framework, gap, plan, and goal requirements", () => {
    const shipped = new Set(
      CAREER_PATHING_REQUIREMENT_COVERAGE.filter((row) => row.status === "shipped").map(
        (row) => row.code,
      ),
    );
    for (const code of [
      "HRM-CAR-001",
      "HRM-CAR-006",
      "HRM-CAR-007",
      "HRM-CAR-009",
      "HRM-CAR-012",
    ] as const) {
      expect(shipped.has(code)).toBe(true);
    }
  });

  it("assertCareerPathingCoverageComplete passes when all requirements are shipped", () => {
    expect(() => assertCareerPathingCoverageComplete()).not.toThrow();
  });
});
