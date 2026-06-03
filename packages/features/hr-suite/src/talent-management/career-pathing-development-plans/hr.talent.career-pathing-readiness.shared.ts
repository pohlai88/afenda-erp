import type { HrCareerReadinessLevel } from "./hr.talent.career-pathing-constants.shared";

export type HrCareerReadinessComputeInput = {
  skillGapCount: number;
  competencyGapCount: number;
  totalRequirements: number;
  completedGoalCount: number;
  totalGoalCount: number;
};

export type HrCareerReadinessComputeResult = {
  readinessScorePct: number;
  openGapCount: number;
  readinessLevel: HrCareerReadinessLevel;
  goalCompletionPct: number;
};

/** HRM-CAR-023/024 — derive readiness score and classification from gaps and goal progress. */
export function computeCareerPathReadiness(
  input: HrCareerReadinessComputeInput,
): HrCareerReadinessComputeResult {
  const openGapCount = input.skillGapCount + input.competencyGapCount;
  const totalRequirements = Math.max(input.totalRequirements, 1);
  const metRequirements = Math.max(0, totalRequirements - openGapCount);
  const gapScorePct = Math.round((metRequirements / totalRequirements) * 100);

  const totalGoals = Math.max(input.totalGoalCount, 1);
  const goalCompletionPct =
    input.totalGoalCount === 0
      ? 0
      : Math.round((input.completedGoalCount / totalGoals) * 100);

  const readinessScorePct = Math.round(gapScorePct * 0.7 + goalCompletionPct * 0.3);
  const readinessLevel = classifyCareerPathReadinessLevel({
    readinessScorePct,
    openGapCount,
    goalCompletionPct,
  });

  return {
    readinessScorePct,
    openGapCount,
    readinessLevel,
    goalCompletionPct,
  };
}

export function classifyCareerPathReadinessLevel(input: {
  readinessScorePct: number;
  openGapCount: number;
  goalCompletionPct: number;
}): HrCareerReadinessLevel {
  if (input.readinessScorePct >= 95 && input.openGapCount === 0 && input.goalCompletionPct >= 90) {
    return "role_ready";
  }
  if (input.readinessScorePct >= 80 && input.openGapCount <= 1) {
    return "ready";
  }
  if (input.readinessScorePct >= 60) {
    return "near_ready";
  }
  if (input.readinessScorePct >= 30 || input.goalCompletionPct >= 25) {
    return "developing";
  }
  return "not_ready";
}

export function formatCareerReadinessLevelLabel(level: HrCareerReadinessLevel): string {
  return level
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
