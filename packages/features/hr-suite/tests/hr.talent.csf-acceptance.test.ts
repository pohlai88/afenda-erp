import { describe, expect, it } from "vitest";

import {
  CSF_ACCEPTANCE_CRITERIA_COVERAGE,
  CSF_REQUIREMENT_COVERAGE,
} from "../data/hr.talent.csf-acceptance-coverage.shared";
import {
  listHrCsfLmsLearningRecommendations,
  listHrCsfPerformanceAppraisalCompetencyRefs,
  listHrCsfSuccessionReadinessIndicators,
  listHrCsfTrainingDevelopmentGapExposure,
} from "../data/hr.talent.csf-integration.server";
import { compareCareerPathSkillRequirements } from "../data/hr.talent.csf-career-path.shared";
import { findEmployeesMatchingRequiredSkills } from "../data/hr.talent.csf-matching.server";
import { buildHrCsfReportRows } from "../data/hr.talent.csf-reports.server";
import { emitHrCsfAuditTrailEvent, listHrCsfAuditTrailWindow } from "../data/hr.talent.csf-audit.server";
import { hrTalentCsfAuditActions } from "../events/hr.talent.csf-audit.event";

const ORG = "org_csf_test";

describe("HRM-CSF-001..031 coverage registry", () => {
  it("registers all thirty-one functional requirements", () => {
    expect(CSF_REQUIREMENT_COVERAGE).toHaveLength(31);
    const codes = CSF_REQUIREMENT_COVERAGE.map((entry) => entry.code);
    for (let index = 1; index <= 31; index += 1) {
      expect(codes).toContain(`HRM-CSF-${String(index).padStart(3, "0")}`);
    }
  });

  it("ships integration, reports, permissions, and audit requirements (023-031)", () => {
    const shipped = new Set(
      CSF_REQUIREMENT_COVERAGE.filter((row) => row.status === "shipped").map(
        (row) => row.code,
      ),
    );
    for (const code of [
      "HRM-CSF-023",
      "HRM-CSF-024",
      "HRM-CSF-025",
      "HRM-CSF-026",
      "HRM-CSF-027",
      "HRM-CSF-028",
      "HRM-CSF-029",
      "HRM-CSF-030",
      "HRM-CSF-031",
    ] as const) {
      expect(shipped.has(code)).toBe(true);
    }
  });

  it("maps enterprise acceptance criteria 19-27 as shipped", () => {
    const ac1927 = CSF_ACCEPTANCE_CRITERIA_COVERAGE.filter(
      (row) => row.criterion >= 19 && row.criterion <= 27,
    );
    expect(ac1927).toHaveLength(9);
    expect(ac1927.every((row) => row.status === "shipped")).toBe(true);
  });
});

describe("HRM-CSF-023..031 behavior", () => {
  it("exposes gaps and downstream integration payloads", async () => {
    const query = {
      organizationId: ORG,
      employeeIds: null,
      lmsEnabled: true,
      performanceAuthorized: true,
      successionAuthorized: true,
    };

    const [training, lms, performance, succession] = await Promise.all([
      listHrCsfTrainingDevelopmentGapExposure(query),
      listHrCsfLmsLearningRecommendations(query),
      listHrCsfPerformanceAppraisalCompetencyRefs(query),
      listHrCsfSuccessionReadinessIndicators(query),
    ]);

    expect(training.length).toBeGreaterThan(0);
    expect(lms.length).toBeGreaterThan(0);
    expect(performance.length).toBeGreaterThan(0);
    expect(succession.length).toBeGreaterThan(0);
  });

  it("compares career path skills and finds role matches", async () => {
    const comparisons = compareCareerPathSkillRequirements({
      organizationId: ORG,
      employeeId: "emp-001",
      targetRoleCode: "SR-ENG",
    });
    expect(comparisons.length).toBeGreaterThan(0);

    const matches = await findEmployeesMatchingRequiredSkills({
      organizationId: ORG,
      targetKind: "role",
      targetCode: "SR-ENG",
    });
    expect(matches.some((row) => row.employeeId === "emp-002")).toBe(true);
  });

  it("builds grouped capability reports", () => {
    const rows = buildHrCsfReportRows({
      organizationId: ORG,
      groupBy: "department",
    });
    expect(rows.length).toBeGreaterThan(0);
  });

  it("records and lists audit events", async () => {
    await emitHrCsfAuditTrailEvent({
      organizationId: ORG,
      action: hrTalentCsfAuditActions.competency.create,
      summary: "Test competency create",
    });
    const window = await listHrCsfAuditTrailWindow({
      organizationId: ORG,
      limit: 10,
    });
    expect(window.rows.length).toBeGreaterThan(0);
  });
});
