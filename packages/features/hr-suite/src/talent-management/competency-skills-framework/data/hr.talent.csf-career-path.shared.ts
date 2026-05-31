import type { HrCsfCareerPathSkillComparison } from "../contracts/hr.talent.csf-integration.contract";
import {
  listHrCsfEmployeeProficienciesFromStore,
  listHrCsfRoleRequirementsFromStore,
  proficiencyIndex,
} from "./hr.talent.csf-store.shared";

/** HRM-CSF-027 — compare current skills against next-role requirements. */
export function compareCareerPathSkillRequirements(input: {
  organizationId: string;
  employeeId: string;
  targetRoleCode: string;
}): HrCsfCareerPathSkillComparison[] {
  const requirements = listHrCsfRoleRequirementsFromStore(input.organizationId).filter(
    (req) => req.roleCode === input.targetRoleCode && req.itemKind === "skill",
  );
  const proficiencies = listHrCsfEmployeeProficienciesFromStore(input.organizationId).filter(
    (row) => row.employeeId === input.employeeId && row.itemKind === "skill",
  );

  return requirements.map((req) => {
    const current = proficiencies.find((prof) => prof.itemCode === req.itemCode);
    const currentLevel = current?.currentLevel ?? null;
    const currentIndex = currentLevel ? proficiencyIndex(currentLevel) : -1;
    const targetIndex = proficiencyIndex(req.requiredLevel);
    const gapLevels = Math.max(0, targetIndex - currentIndex);

    return {
      skillCode: req.itemCode,
      skillName: req.itemName,
      requirementKind: req.requirementKind,
      currentLevel,
      targetLevel: req.requiredLevel,
      gapLevels,
      meetsRequirement: gapLevels === 0,
    };
  });
}

export function summarizeCareerPathReadiness(
  comparisons: readonly HrCsfCareerPathSkillComparison[],
): { readinessScorePct: number; openGapCount: number } {
  if (comparisons.length === 0) {
    return { readinessScorePct: 0, openGapCount: 0 };
  }
  const met = comparisons.filter((row) => row.meetsRequirement).length;
  const openGapCount = comparisons.length - met;
  return {
    readinessScorePct: Math.round((met / comparisons.length) * 100),
    openGapCount,
  };
}
