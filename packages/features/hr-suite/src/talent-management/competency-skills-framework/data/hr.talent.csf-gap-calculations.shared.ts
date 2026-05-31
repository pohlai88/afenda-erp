export {
  HrCsfGapCalculationError,
  computeProficiencyGap,
  computeSkillGap,
  computeCompetencyGap,
  classifyGap,
  recommendDevelopmentActions,
  buildDefaultDevelopmentLinks,
} from "@afenda/db";

export type {
  ProficiencyGapInput,
  ProficiencyGapResult,
  SkillGapInput,
  SkillGapResult,
  CompetencyGapInput,
  CompetencyGapResult,
  GapClassificationInput,
  GapClassificationResult,
  GapSeverity,
  GapPriority,
  RoleImpact,
  DevelopmentUrgency,
  DevelopmentActionType,
  DevelopmentRecommendationDraft,
  DevelopmentLinkDraft,
  HrCsfGapKind,
  HrCsfSkillRequirementClass,
} from "@afenda/db";
