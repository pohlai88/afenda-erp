import { describe, expect, it } from "vitest";

import {
  classifyGap,
  computeCompetencyGap,
  computeSkillGap,
  recommendDevelopmentActions,
  buildDefaultDevelopmentLinks,
} from "../../../../../../db/src/hr-competency-skills-gap-calculations.shared";

describe("hr.talent.csf-gap-calculations", () => {
  it("CSF-018 — computes skill gap as required minus current level order", () => {
    const result = computeSkillGap({
      skillId: "skill_1",
      requiredLevelOrder: 4,
      currentLevelOrder: 2,
      requirementClass: "mandatory",
    });

    expect(result.gapSize).toBe(2);
    expect(result.hasGap).toBe(true);
    expect(result.meetsRequirement).toBe(false);
  });

  it("CSF-019 — computes competency gap as required minus current level order", () => {
    const result = computeCompetencyGap({
      competencyId: "comp_1",
      requiredLevelOrder: 3,
      currentLevelOrder: 3,
    });

    expect(result.gapSize).toBe(0);
    expect(result.hasGap).toBe(false);
    expect(result.meetsRequirement).toBe(true);
  });

  it("CSF-020 — classifies gap severity, priority, role impact, and urgency", () => {
    const classification = classifyGap({
      gapKind: "skill",
      gapSize: 3,
      hasGap: true,
      requirementClass: "critical",
    });

    expect(classification.severity).toBe("critical");
    expect(classification.priority).toBe("urgent");
    expect(classification.roleImpact).toBe("critical");
    expect(classification.developmentUrgency).toBe("immediate");
  });

  it("CSF-021 — recommends development actions for identified gaps", () => {
    const classification = classifyGap({
      gapKind: "competency",
      gapSize: 2,
      hasGap: true,
    });

    const recommendations = recommendDevelopmentActions({
      gapKind: "competency",
      gapSize: 2,
      targetLabel: "Leadership",
      classification,
    });

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations.some((row) => row.actionType === "training")).toBe(
      true,
    );
  });

  it("CSF-022 — builds course, path, certification, coaching, and plan links", () => {
    const links = buildDefaultDevelopmentLinks({
      actionType: "training",
      targetCode: "LEAD-001",
      courseRef: "course-101",
      learningPathRef: "path-leadership",
      developmentPlanRef: "plan-2026",
    });

    expect(links.map((link) => link.linkType)).toEqual(
      expect.arrayContaining(["course", "learning_path", "development_plan"]),
    );
  });

  it("rejects invalid level orders", () => {
    expect(() =>
      computeSkillGap({
        skillId: "skill_1",
        requiredLevelOrder: 0,
        currentLevelOrder: 1,
      }),
    ).toThrow();
  });
});
