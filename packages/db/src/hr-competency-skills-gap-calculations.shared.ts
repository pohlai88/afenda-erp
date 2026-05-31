export class HrCsfGapCalculationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HrCsfGapCalculationError";
  }
}

export type HrCsfSkillRequirementClass =
  | "mandatory"
  | "preferred"
  | "critical"
  | "optional";

export type HrCsfGapKind = "skill" | "competency";

export type ProficiencyGapInput = {
  readonly requiredLevelOrder: number;
  readonly currentLevelOrder: number;
  readonly maxLevelOrder?: number;
};

export type ProficiencyGapResult = {
  readonly requiredLevelOrder: number;
  readonly currentLevelOrder: number;
  readonly gapSize: number;
  readonly hasGap: boolean;
  readonly meetsRequirement: boolean;
};

export type SkillGapInput = ProficiencyGapInput & {
  readonly skillId: string;
  readonly requirementClass?: HrCsfSkillRequirementClass | null;
};

export type SkillGapResult = ProficiencyGapResult & {
  readonly skillId: string;
  readonly requirementClass: HrCsfSkillRequirementClass | null;
};

export type CompetencyGapInput = ProficiencyGapInput & {
  readonly competencyId: string;
};

export type CompetencyGapResult = ProficiencyGapResult & {
  readonly competencyId: string;
};

export type GapClassificationInput = {
  readonly gapKind: HrCsfGapKind;
  readonly gapSize: number;
  readonly hasGap: boolean;
  readonly requirementClass?: HrCsfSkillRequirementClass | null;
};

export type GapSeverity =
  | "none"
  | "low"
  | "moderate"
  | "high"
  | "critical";

export type GapPriority = "low" | "medium" | "high" | "urgent";

export type RoleImpact = "minimal" | "moderate" | "significant" | "critical";

export type DevelopmentUrgency =
  | "deferred"
  | "planned"
  | "soon"
  | "immediate";

export type GapClassificationResult = {
  readonly severity: GapSeverity;
  readonly priority: GapPriority;
  readonly roleImpact: RoleImpact;
  readonly developmentUrgency: DevelopmentUrgency;
  readonly rationale: string;
};

export type DevelopmentActionType =
  | "training"
  | "coaching"
  | "mentoring"
  | "certification"
  | "stretch_assignment"
  | "self_study"
  | "peer_learning";

export type DevelopmentRecommendationDraft = {
  readonly actionType: DevelopmentActionType;
  readonly title: string;
  readonly description: string;
  readonly priority: GapPriority;
};

export type DevelopmentLinkDraft = {
  readonly linkType:
    | "course"
    | "learning_path"
    | "certification"
    | "coaching"
    | "development_plan";
  readonly externalRef: string;
  readonly title?: string | null;
  readonly url?: string | null;
  readonly metadata?: Record<string, unknown> | null;
};

function assertLevelOrder(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new HrCsfGapCalculationError(`invalid ${label}`);
  }
}

function assertPositiveLevelOrder(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 1) {
    throw new HrCsfGapCalculationError(`invalid ${label}`);
  }
}

function assertNonEmptyId(value: string, label: string): void {
  if (!value.trim()) {
    throw new HrCsfGapCalculationError(`invalid ${label}`);
  }
}

function requirementWeight(
  requirementClass: HrCsfSkillRequirementClass | null | undefined,
): number {
  switch (requirementClass) {
    case "critical":
      return 4;
    case "mandatory":
      return 3;
    case "preferred":
      return 2;
    case "optional":
      return 1;
    default:
      return 2;
  }
}

/** Shared CSF-018/019 — required vs current proficiency delta. */
export function computeProficiencyGap(
  input: ProficiencyGapInput,
): ProficiencyGapResult {
  assertPositiveLevelOrder(input.requiredLevelOrder, "required level order");
  assertLevelOrder(input.currentLevelOrder, "current level order");

  if (
    input.maxLevelOrder != null &&
    (!Number.isInteger(input.maxLevelOrder) || input.maxLevelOrder < 1)
  ) {
    throw new HrCsfGapCalculationError("invalid max level order");
  }

  const currentLevelOrder = Math.min(
    input.currentLevelOrder,
    input.maxLevelOrder ?? input.currentLevelOrder,
  );
  const gapSize = Math.max(0, input.requiredLevelOrder - currentLevelOrder);

  return {
    requiredLevelOrder: input.requiredLevelOrder,
    currentLevelOrder,
    gapSize,
    hasGap: gapSize > 0,
    meetsRequirement: currentLevelOrder >= input.requiredLevelOrder,
  };
}

/** CSF-018 — skill gap from required vs current proficiency. */
export function computeSkillGap(input: SkillGapInput): SkillGapResult {
  assertNonEmptyId(input.skillId, "skill id");

  const base = computeProficiencyGap(input);

  return {
    ...base,
    skillId: input.skillId.trim(),
    requirementClass: input.requirementClass ?? null,
  };
}

/** CSF-019 — competency gap from required vs current proficiency. */
export function computeCompetencyGap(
  input: CompetencyGapInput,
): CompetencyGapResult {
  assertNonEmptyId(input.competencyId, "competency id");

  const base = computeProficiencyGap(input);

  return {
    ...base,
    competencyId: input.competencyId.trim(),
  };
}

/** CSF-020 — classify gap severity, priority, role impact, and urgency. */
export function classifyGap(
  input: GapClassificationInput,
): GapClassificationResult {
  if (!input.hasGap || input.gapSize <= 0) {
    return {
      severity: "none",
      priority: "low",
      roleImpact: "minimal",
      developmentUrgency: "deferred",
      rationale: "current proficiency meets or exceeds requirement",
    };
  }

  const weight = requirementWeight(input.requirementClass);
  const weightedGap = input.gapSize + (weight >= 3 ? 1 : 0);

  let severity: GapSeverity;
  if (input.requirementClass === "critical" && input.gapSize >= 2) {
    severity = "critical";
  } else if (weightedGap >= 4) {
    severity = "critical";
  } else if (weightedGap >= 3) {
    severity = "high";
  } else if (input.gapSize >= 2) {
    severity = "moderate";
  } else {
    severity = "low";
  }

  let priority: GapPriority;
  if (severity === "critical") {
    priority = "urgent";
  } else if (severity === "high" || input.requirementClass === "mandatory") {
    priority = "high";
  } else if (severity === "moderate") {
    priority = "medium";
  } else {
    priority = "low";
  }

  let roleImpact: RoleImpact;
  if (
    input.requirementClass === "critical" ||
    (input.gapKind === "competency" && input.gapSize >= 3)
  ) {
    roleImpact = "critical";
  } else if (input.requirementClass === "mandatory" && input.gapSize >= 2) {
    roleImpact = "significant";
  } else if (input.gapSize >= 2) {
    roleImpact = "moderate";
  } else {
    roleImpact = "minimal";
  }

  let developmentUrgency: DevelopmentUrgency;
  if (priority === "urgent") {
    developmentUrgency = "immediate";
  } else if (priority === "high") {
    developmentUrgency = "soon";
  } else if (priority === "medium") {
    developmentUrgency = "planned";
  } else {
    developmentUrgency = "deferred";
  }

  return {
    severity,
    priority,
    roleImpact,
    developmentUrgency,
    rationale: `${input.gapKind} gap of ${input.gapSize} level(s) with ${input.requirementClass ?? "standard"} requirement weight`,
  };
}

/** CSF-021 — recommend development actions from classified gap. */
export function recommendDevelopmentActions(input: {
  readonly gapKind: HrCsfGapKind;
  readonly gapSize: number;
  readonly targetLabel: string;
  readonly classification: GapClassificationResult;
}): readonly DevelopmentRecommendationDraft[] {
  if (input.classification.severity === "none") {
    return [];
  }

  const recommendations: DevelopmentRecommendationDraft[] = [];
  const { classification, targetLabel, gapKind, gapSize } = input;

  recommendations.push({
    actionType: "training",
    title: `Training for ${targetLabel}`,
    description: `Structured training to close the ${gapKind} gap (${classification.severity} severity).`,
    priority: classification.priority,
  });

  if (gapSize >= 2 || classification.severity === "critical") {
    recommendations.push({
      actionType: "coaching",
      title: `Coaching for ${targetLabel}`,
      description: "Targeted coaching to accelerate proficiency development.",
      priority: classification.priority,
    });
  }

  if (classification.developmentUrgency === "immediate") {
    recommendations.push({
      actionType: "stretch_assignment",
      title: `Stretch assignment: ${targetLabel}`,
      description:
        "Apply the capability in a supervised stretch assignment to build proficiency quickly.",
      priority: "urgent",
    });
  }

  if (classification.severity === "high" || classification.severity === "critical") {
    recommendations.push({
      actionType: "certification",
      title: `Certification path: ${targetLabel}`,
      description: "Formal certification to validate required proficiency.",
      priority: classification.priority,
    });
  }

  if (classification.developmentUrgency === "planned") {
    recommendations.push({
      actionType: "self_study",
      title: `Self-study plan: ${targetLabel}`,
      description: "Self-paced learning materials to close the gap over time.",
      priority: "medium",
    });
  }

  if (classification.roleImpact === "significant" || classification.roleImpact === "critical") {
    recommendations.push({
      actionType: "mentoring",
      title: `Mentoring for ${targetLabel}`,
      description: "Pair with a mentor to transfer role-critical capability.",
      priority: classification.priority,
    });
  }

  return recommendations;
}

/** CSF-022 — default linkage refs for a recommendation action. */
export function buildDefaultDevelopmentLinks(input: {
  readonly actionType: DevelopmentActionType;
  readonly targetCode: string;
  readonly courseRef?: string | null;
  readonly learningPathRef?: string | null;
  readonly certificationRef?: string | null;
  readonly coachingRef?: string | null;
  readonly developmentPlanRef?: string | null;
}): readonly DevelopmentLinkDraft[] {
  const links: DevelopmentLinkDraft[] = [];
  const code = input.targetCode.trim();

  switch (input.actionType) {
    case "training":
      if (input.courseRef) {
        links.push({
          linkType: "course",
          externalRef: input.courseRef,
          title: `Course: ${code}`,
        });
      }
      if (input.learningPathRef) {
        links.push({
          linkType: "learning_path",
          externalRef: input.learningPathRef,
          title: `Learning path: ${code}`,
        });
      }
      break;
    case "certification":
      if (input.certificationRef) {
        links.push({
          linkType: "certification",
          externalRef: input.certificationRef,
          title: `Certification: ${code}`,
        });
      }
      break;
    case "coaching":
    case "mentoring":
      if (input.coachingRef) {
        links.push({
          linkType: "coaching",
          externalRef: input.coachingRef,
          title: `Coaching: ${code}`,
        });
      }
      break;
    default:
      break;
  }

  if (input.developmentPlanRef) {
    links.push({
      linkType: "development_plan",
      externalRef: input.developmentPlanRef,
      title: `Development plan: ${code}`,
    });
  }

  return links;
}
