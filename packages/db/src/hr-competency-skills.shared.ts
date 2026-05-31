export class HrCsfCommandError extends Error {
  readonly code:
    | "scale_not_found"
    | "level_not_found"
    | "competency_not_found"
    | "skill_not_found"
    | "requirement_not_found"
    | "invalid_requirement_scope"
    | "invalid_proficiency_level"
    | "duplicate_code"
    | "invalid_level_config"
    | "employee_not_found"
    | "profile_not_found"
    | "assessment_not_found"
    | "self_assessment_disabled"
    | "validation_not_required"
    | "invalid_assessment_type"
    | "proficiency_scale_mismatch";

  constructor(code: HrCsfCommandError["code"], message?: string) {
    super(message ?? code);
    this.name = "HrCsfCommandError";
    this.code = code;
  }
}

export type HrCsfProficiencyLevelInput = {
  readonly levelOrder: number;
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly assessmentCriteria: string;
};

export function assertHrCsfProficiencyLevels(
  levels: readonly HrCsfProficiencyLevelInput[],
): void {
  if (levels.length === 0) {
    throw new HrCsfCommandError(
      "invalid_level_config",
      "proficiency scale requires at least one level",
    );
  }

  const orders = new Set<number>();
  const codes = new Set<string>();

  for (const level of levels) {
    if (!Number.isInteger(level.levelOrder) || level.levelOrder < 1) {
      throw new HrCsfCommandError(
        "invalid_level_config",
        "levelOrder must be a positive integer",
      );
    }
    if (!level.code.trim() || !level.name.trim()) {
      throw new HrCsfCommandError(
        "invalid_level_config",
        "each level requires code and name",
      );
    }
    if (!level.description.trim() || !level.assessmentCriteria.trim()) {
      throw new HrCsfCommandError(
        "invalid_level_config",
        "each level requires description and assessment criteria",
      );
    }
    if (orders.has(level.levelOrder)) {
      throw new HrCsfCommandError(
        "invalid_level_config",
        `duplicate levelOrder ${level.levelOrder}`,
      );
    }
    if (codes.has(level.code.trim())) {
      throw new HrCsfCommandError(
        "invalid_level_config",
        `duplicate level code ${level.code}`,
      );
    }
    orders.add(level.levelOrder);
    codes.add(level.code.trim());
  }
}
