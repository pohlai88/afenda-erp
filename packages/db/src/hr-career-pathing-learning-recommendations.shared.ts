import type {
  HrCareerCompetencyGapRow,
  HrCareerSkillGapRow,
} from "./hr-career-pathing-foundation";

/** HRM-CAR-013 — draft learning action from an identified gap. */
export type HrmLearningActionRecommendationDraft = {
  readonly title: string;
  readonly description: string;
  readonly goalType: "skill" | "competency" | "certification";
  readonly skillCode?: string | null;
  readonly competencyCode?: string | null;
  readonly externalTrainingRef?: string | null;
};

function draftForSkillGap(gap: HrCareerSkillGapRow): HrmLearningActionRecommendationDraft {
  const label = gap.label ?? gap.skillCode;
  return {
    title: `Training: ${label}`,
    description: `Close skill gap for ${label} (required ${gap.requiredLevel}, current ${gap.currentLevel ?? "none"}).`,
    goalType: "skill",
    skillCode: gap.skillCode,
    externalTrainingRef: `skill:${gap.skillCode}`,
  };
}

function draftForCompetencyGap(
  gap: HrCareerCompetencyGapRow,
): HrmLearningActionRecommendationDraft {
  const label = gap.label ?? gap.competencyCode;
  return {
    title: `Development: ${label}`,
    description: `Close competency gap for ${label} (required ${gap.requiredLevel}, current ${gap.currentLevel ?? "none"}).`,
    goalType: "competency",
    competencyCode: gap.competencyCode,
    externalTrainingRef: `competency:${gap.competencyCode}`,
  };
}

/** HRM-CAR-013 — recommend learning actions from skill and competency gaps. */
export function recommendHrmLearningActionsFromGaps(input: {
  readonly skillGaps: readonly HrCareerSkillGapRow[];
  readonly competencyGaps: readonly HrCareerCompetencyGapRow[];
}): readonly HrmLearningActionRecommendationDraft[] {
  const drafts: HrmLearningActionRecommendationDraft[] = [];

  for (const gap of input.skillGaps) {
    if (!gap.gap) continue;
    drafts.push(draftForSkillGap(gap));
  }

  for (const gap of input.competencyGaps) {
    if (!gap.gap) continue;
    drafts.push(draftForCompetencyGap(gap));
  }

  return drafts;
}
