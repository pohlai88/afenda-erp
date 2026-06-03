import { and, asc, count, desc, eq, gte, ilike, inArray, lte, or, sql } from "drizzle-orm";
import type { AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { buildPaginatedWindow, clampPageSize } from "./list-window.shared";
import {
  assertEmployeeInOrg,
  assertFrameworkInOrg,
  assertGoalInOrg,
  assertPlanInOrg,
  HrCareerPathingCommandError,
} from "./hr-career-pathing.shared";
import { hrEmployees, hrPositions } from "./hr";
import {
  hrmCareerDiscussions,
  hrmCareerPathFrameworks,
  hrmCareerPathStages,
  hrmDevelopmentGoals,
  hrmDevelopmentLearningActions,
  hrmDevelopmentMilestones,
  hrmDevelopmentPlans,
  hrmDevelopmentSessions,
  hrmDevelopmentStretchAssignments,
  hrmDevelopmentCoachAssignments,
  hrmDevelopmentMentorAssignments,
  hrmEmployeeCareerAspirations,
  hrmEmployeeReadinessSnapshots,
  hrmEmployeeTargetRoles,
  type HrmCareerCompetencyRequirement,
  type HrmCareerSkillRequirement,
} from "./hr-career-pathing";
import {
  hrCsfCompetencies,
  hrCsfEmployeeCompetencyProfiles,
  hrCsfEmployeeSkillProfiles,
  hrCsfProficiencyLevels,
  hrCsfSkills,
} from "./hr-competency-skills";

export type HrCareerSkillGapRow = {
  skillCode: string;
  label: string | null;
  requiredLevel: number | string;
  currentLevel: number | string | null;
  gap: boolean;
};

export type HrCareerCompetencyGapRow = {
  competencyCode: string;
  label: string | null;
  requiredLevel: number | string;
  currentLevel: number | string | null;
  gap: boolean;
};

export type HrCareerSkillGapCompareResult = {
  employeeId: string;
  targetRoleId: string | null;
  skillGaps: readonly HrCareerSkillGapRow[];
  competencyGaps: readonly HrCareerCompetencyGapRow[];
  employeeSkillsAvailable: boolean;
  employeeCompetenciesAvailable: boolean;
};

export type HrCareerRoleStructureGap = {
  field: "grade" | "department" | "position" | "job_family";
  current: string | null;
  target: string | null;
  matched: boolean;
};

/** HRM-CAR-006 — current assignment vs target role org-structure requirements. */
export type HrCareerRoleCompareResult = {
  employeeId: string;
  targetRoleId: string | null;
  currentRole: {
    positionId: string | null;
    positionTitle: string | null;
    departmentId: string | null;
    grade: string | null;
    jobFamily: string | null;
  };
  targetRole: {
    targetRoleTitle: string;
    positionId: string | null;
    departmentId: string | null;
    grade: string | null;
    jobFamily: string | null;
    requiredSkillCount: number;
    requiredCompetencyCount: number;
  } | null;
  structureGaps: readonly HrCareerRoleStructureGap[];
};

export type HrDevelopmentPlanAppraisalRef = {
  planId: string;
  employeeId: string;
  code: string;
  title: string;
  planStatus: string;
  goalCount: number;
  completedGoalCount: number;
  targetCompletionDate: Date | null;
};

export type HrReadinessSuccessionRef = {
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  targetRoleId: string | null;
  targetRoleTitle: string | null;
  readinessLevel: string;
  readinessScore: string | null;
  computedAt: Date;
};

export type HrDevelopmentLearningRef = {
  learningActionId: string;
  planId: string;
  planCode: string;
  title: string;
  trainingCourseId: string | null;
  externalTrainingRef: string | null;
  learningActionStatus: string;
  dueDate: Date | null;
};

function compareLevels(
  current: number | string | null | undefined,
  required: number | string,
): boolean {
  if (current === null || current === undefined || current === "") {
    return true;
  }
  const currentNum = Number(current);
  const requiredNum = Number(required);
  if (Number.isFinite(currentNum) && Number.isFinite(requiredNum)) {
    return currentNum < requiredNum;
  }
  return String(current) !== String(required);
}

function buildSkillGapRows(
  requirements: readonly HrmCareerSkillRequirement[],
  currentByCode: ReadonlyMap<string, number | string>,
): readonly HrCareerSkillGapRow[] {
  return requirements.map((req) => {
    const currentLevel = currentByCode.get(req.skillCode) ?? null;
    return {
      skillCode: req.skillCode,
      label: req.label ?? null,
      requiredLevel: req.targetLevel,
      currentLevel,
      gap: compareLevels(currentLevel, req.targetLevel),
    };
  });
}

function buildCompetencyGapRows(
  requirements: readonly HrmCareerCompetencyRequirement[],
  currentByCode: ReadonlyMap<string, number | string>,
): readonly HrCareerCompetencyGapRow[] {
  return requirements.map((req) => {
    const currentLevel = currentByCode.get(req.competencyCode) ?? null;
    return {
      competencyCode: req.competencyCode,
      label: req.label ?? null,
      requiredLevel: req.targetLevel,
      currentLevel,
      gap: compareLevels(currentLevel, req.targetLevel),
    };
  });
}

/**
 * Reads active employee skill proficiency from CSF (`hr_csf_employee_skill_profiles`).
 */
export async function loadEmployeeSkillProficiencyMap(
  db: AfendaTransaction,
  input: { organizationId: string; employeeId: string },
): Promise<ReadonlyMap<string, number | string>> {
  const rows = await db
    .select({
      skillCode: hrCsfSkills.code,
      levelOrder: hrCsfProficiencyLevels.levelOrder,
    })
    .from(hrCsfEmployeeSkillProfiles)
    .innerJoin(hrCsfSkills, eq(hrCsfEmployeeSkillProfiles.skillId, hrCsfSkills.id))
    .leftJoin(
      hrCsfProficiencyLevels,
      eq(
        hrCsfEmployeeSkillProfiles.currentProficiencyLevelId,
        hrCsfProficiencyLevels.id,
      ),
    )
    .where(
      and(
        eq(hrCsfEmployeeSkillProfiles.organizationId, input.organizationId),
        eq(hrCsfEmployeeSkillProfiles.employeeId, input.employeeId),
        eq(hrCsfEmployeeSkillProfiles.profileStatus, "active"),
      ),
    );

  return new Map(rows.map((row) => [row.skillCode, row.levelOrder ?? 0]));
}

/** Reads active employee competency proficiency from CSF profiles. */
export async function loadEmployeeCompetencyProficiencyMap(
  db: AfendaTransaction,
  input: { organizationId: string; employeeId: string },
): Promise<ReadonlyMap<string, number | string>> {
  const rows = await db
    .select({
      competencyCode: hrCsfCompetencies.code,
      levelOrder: hrCsfProficiencyLevels.levelOrder,
    })
    .from(hrCsfEmployeeCompetencyProfiles)
    .innerJoin(
      hrCsfCompetencies,
      eq(hrCsfEmployeeCompetencyProfiles.competencyId, hrCsfCompetencies.id),
    )
    .leftJoin(
      hrCsfProficiencyLevels,
      eq(
        hrCsfEmployeeCompetencyProfiles.currentProficiencyLevelId,
        hrCsfProficiencyLevels.id,
      ),
    )
    .where(
      and(
        eq(hrCsfEmployeeCompetencyProfiles.organizationId, input.organizationId),
        eq(hrCsfEmployeeCompetencyProfiles.employeeId, input.employeeId),
        eq(hrCsfEmployeeCompetencyProfiles.profileStatus, "active"),
      ),
    );

  return new Map(rows.map((row) => [row.competencyCode, row.levelOrder ?? 0]));
}

/** HRM-CAR-001 — create career path framework. */
export async function createHrmCareerPathFrameworkInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    code: string;
    name: string;
    pathKind: (typeof hrmCareerPathFrameworks.$inferInsert)["pathKind"];
    description?: string;
  },
) {
  const id = createEntityId("car_frm");
  await db.insert(hrmCareerPathFrameworks).values({
    id,
    organizationId: input.organizationId,
    code: input.code,
    name: input.name,
    description: input.description ?? null,
    pathKind: input.pathKind,
    frameworkStatus: "draft",
  });
  return { frameworkId: id };
}

export async function updateHrmCareerPathFrameworkStatusInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    frameworkId: string;
    frameworkStatus: (typeof hrmCareerPathFrameworks.$inferInsert)["frameworkStatus"];
  },
) {
  await assertFrameworkInOrg(db, input.organizationId, input.frameworkId);

  const archivedAt =
    input.frameworkStatus === "archived" ? new Date() : null;

  await db
    .update(hrmCareerPathFrameworks)
    .set({
      frameworkStatus: input.frameworkStatus,
      archivedAt,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(hrmCareerPathFrameworks.organizationId, input.organizationId),
        eq(hrmCareerPathFrameworks.id, input.frameworkId),
      ),
    );
}

export async function upsertHrmCareerPathFrameworkInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    frameworkId?: string;
    code: string;
    name: string;
    pathKind: (typeof hrmCareerPathFrameworks.$inferInsert)["pathKind"];
    description?: string;
  },
) {
  if (input.frameworkId) {
    await db
      .update(hrmCareerPathFrameworks)
      .set({
        code: input.code,
        name: input.name,
        pathKind: input.pathKind,
        description: input.description ?? null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(hrmCareerPathFrameworks.organizationId, input.organizationId),
          eq(hrmCareerPathFrameworks.id, input.frameworkId),
        ),
      );
    return { frameworkId: input.frameworkId };
  }

  return createHrmCareerPathFrameworkInTx(db, input);
}

export async function createHrmCareerPathStageInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    frameworkId: string;
    stageOrder: number;
    code: string;
    name: string;
    description?: string;
    expectedDurationMonths?: number;
    requiredSkillRefs?: readonly HrmCareerSkillRequirement[];
    requiredCompetencyRefs?: readonly HrmCareerCompetencyRequirement[];
  },
) {
  await assertFrameworkInOrg(db, input.organizationId, input.frameworkId);

  const id = createEntityId("car_stg");
  await db.insert(hrmCareerPathStages).values({
    id,
    organizationId: input.organizationId,
    frameworkId: input.frameworkId,
    stageOrder: input.stageOrder,
    code: input.code,
    name: input.name,
    description: input.description ?? null,
    expectedDurationMonths: input.expectedDurationMonths ?? null,
    requiredSkillRefs: input.requiredSkillRefs ?? [],
    requiredCompetencyRefs: input.requiredCompetencyRefs ?? [],
  });
  return { stageId: id };
}

export async function updateHrmCareerPathStageInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    stageId: string;
    stageOrder?: number;
    code?: string;
    name?: string;
    description?: string | null;
    expectedDurationMonths?: number | null;
    requiredSkillRefs?: readonly HrmCareerSkillRequirement[];
    requiredCompetencyRefs?: readonly HrmCareerCompetencyRequirement[];
  },
) {
  const [stage] = await db
    .select({ id: hrmCareerPathStages.id })
    .from(hrmCareerPathStages)
    .where(
      and(
        eq(hrmCareerPathStages.organizationId, input.organizationId),
        eq(hrmCareerPathStages.id, input.stageId),
      ),
    )
    .limit(1);

  if (!stage) {
    throw new HrCareerPathingCommandError("stage_not_found", "Career path stage not found.");
  }

  await db
    .update(hrmCareerPathStages)
    .set({
      ...(input.stageOrder !== undefined ? { stageOrder: input.stageOrder } : {}),
      ...(input.code !== undefined ? { code: input.code } : {}),
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.expectedDurationMonths !== undefined
        ? { expectedDurationMonths: input.expectedDurationMonths }
        : {}),
      ...(input.requiredSkillRefs !== undefined
        ? { requiredSkillRefs: input.requiredSkillRefs }
        : {}),
      ...(input.requiredCompetencyRefs !== undefined
        ? { requiredCompetencyRefs: input.requiredCompetencyRefs }
        : {}),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(hrmCareerPathStages.organizationId, input.organizationId),
        eq(hrmCareerPathStages.id, input.stageId),
      ),
    );
}

export async function deleteHrmCareerPathStageInTx(
  db: AfendaTransaction,
  input: { organizationId: string; stageId: string },
) {
  const result = await db
    .delete(hrmCareerPathStages)
    .where(
      and(
        eq(hrmCareerPathStages.organizationId, input.organizationId),
        eq(hrmCareerPathStages.id, input.stageId),
      ),
    )
    .returning({ id: hrmCareerPathStages.id });

  if (result.length === 0) {
    throw new HrCareerPathingCommandError("stage_not_found", "Career path stage not found.");
  }
}

export async function upsertHrmEmployeeCareerAspirationInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
    updatedByUserId?: string;
    preferredRoleTitle?: string | null;
    preferredDepartmentId?: string | null;
    preferredLocationCode?: string | null;
    mobilityPreference?: string | null;
    careerInterestNotes?: string | null;
  },
) {
  await assertEmployeeInOrg(db, input.organizationId, input.employeeId);

  const [existing] = await db
    .select({ id: hrmEmployeeCareerAspirations.id })
    .from(hrmEmployeeCareerAspirations)
    .where(
      and(
        eq(hrmEmployeeCareerAspirations.organizationId, input.organizationId),
        eq(hrmEmployeeCareerAspirations.employeeId, input.employeeId),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(hrmEmployeeCareerAspirations)
      .set({
        preferredRoleTitle: input.preferredRoleTitle ?? null,
        preferredDepartmentId: input.preferredDepartmentId ?? null,
        preferredLocationCode: input.preferredLocationCode ?? null,
        mobilityPreference: input.mobilityPreference ?? null,
        careerInterestNotes: input.careerInterestNotes ?? null,
        updatedByUserId: input.updatedByUserId ?? null,
        updatedAt: new Date(),
      })
      .where(eq(hrmEmployeeCareerAspirations.id, existing.id));
    return { aspirationId: existing.id };
  }

  const id = createEntityId("car_asp");
  await db.insert(hrmEmployeeCareerAspirations).values({
    id,
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    preferredRoleTitle: input.preferredRoleTitle ?? null,
    preferredDepartmentId: input.preferredDepartmentId ?? null,
    preferredLocationCode: input.preferredLocationCode ?? null,
    mobilityPreference: input.mobilityPreference ?? null,
    careerInterestNotes: input.careerInterestNotes ?? null,
    updatedByUserId: input.updatedByUserId ?? null,
  });
  return { aspirationId: id };
}

export async function upsertHrmEmployeeTargetRoleInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
    targetRoleTitle: string;
    jobFamily?: string | null;
    grade?: string | null;
    positionId?: string | null;
    departmentId?: string | null;
    frameworkId?: string | null;
    stageId?: string | null;
    targetRoleSource?: (typeof hrmEmployeeTargetRoles.$inferInsert)["targetRoleSource"];
    recommendedByUserId?: string | null;
    requiredSkillRequirements?: readonly HrmCareerSkillRequirement[];
    requiredCompetencyRequirements?: readonly HrmCareerCompetencyRequirement[];
    expectedReadinessDate?: Date | null;
    notes?: string | null;
  },
) {
  await assertEmployeeInOrg(db, input.organizationId, input.employeeId);

  const [existing] = await db
    .select({ id: hrmEmployeeTargetRoles.id })
    .from(hrmEmployeeTargetRoles)
    .where(
      and(
        eq(hrmEmployeeTargetRoles.organizationId, input.organizationId),
        eq(hrmEmployeeTargetRoles.employeeId, input.employeeId),
      ),
    )
    .limit(1);

  const values = {
    targetRoleTitle: input.targetRoleTitle,
    jobFamily: input.jobFamily ?? null,
    grade: input.grade ?? null,
    positionId: input.positionId ?? null,
    departmentId: input.departmentId ?? null,
    frameworkId: input.frameworkId ?? null,
    stageId: input.stageId ?? null,
    targetRoleSource: input.targetRoleSource ?? "employee",
    recommendedByUserId: input.recommendedByUserId ?? null,
    requiredSkillRequirements: input.requiredSkillRequirements ?? [],
    requiredCompetencyRequirements: input.requiredCompetencyRequirements ?? [],
    expectedReadinessDate: input.expectedReadinessDate ?? null,
    notes: input.notes ?? null,
    updatedAt: new Date(),
  };

  if (existing) {
    await db
      .update(hrmEmployeeTargetRoles)
      .set(values)
      .where(eq(hrmEmployeeTargetRoles.id, existing.id));
    return { targetRoleId: existing.id };
  }

  const id = createEntityId("car_tgt");
  await db.insert(hrmEmployeeTargetRoles).values({
    id,
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    primaryTarget: true,
    ...values,
  });
  return { targetRoleId: id };
}

export async function createHrmDevelopmentPlanInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
    code: string;
    title: string;
    createdByUserId?: string;
    targetRoleId?: string | null;
    description?: string | null;
    startDate?: Date | null;
    targetCompletionDate?: Date | null;
  },
) {
  await assertEmployeeInOrg(db, input.organizationId, input.employeeId);

  const id = createEntityId("car_pln");
  await db.insert(hrmDevelopmentPlans).values({
    id,
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    targetRoleId: input.targetRoleId ?? null,
    code: input.code,
    title: input.title,
    description: input.description ?? null,
    planStatus: "draft",
    startDate: input.startDate ?? null,
    targetCompletionDate: input.targetCompletionDate ?? null,
    createdByUserId: input.createdByUserId ?? null,
  });
  return { planId: id };
}

export async function updateHrmDevelopmentPlanStatusInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    planId: string;
    planStatus: (typeof hrmDevelopmentPlans.$inferInsert)["planStatus"];
    managerReviewNotes?: string | null;
    managerReviewedByUserId?: string | null;
  },
) {
  await assertPlanInOrg(db, input.organizationId, input.planId);

  await db
    .update(hrmDevelopmentPlans)
    .set({
      planStatus: input.planStatus,
      ...(input.managerReviewNotes !== undefined
        ? { managerReviewNotes: input.managerReviewNotes }
        : {}),
      ...(input.managerReviewedByUserId !== undefined
        ? {
            managerReviewedByUserId: input.managerReviewedByUserId,
            managerReviewedAt: new Date(),
          }
        : {}),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(hrmDevelopmentPlans.organizationId, input.organizationId),
        eq(hrmDevelopmentPlans.id, input.planId),
      ),
    );
}

export async function createHrmDevelopmentGoalInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    planId: string;
    goalType: (typeof hrmDevelopmentGoals.$inferInsert)["goalType"];
    title: string;
    description?: string | null;
    priority?: (typeof hrmDevelopmentGoals.$inferInsert)["priority"];
    targetCompletionDate?: Date | null;
    skillCode?: string | null;
    competencyCode?: string | null;
    sortOrder?: number;
  },
) {
  await assertPlanInOrg(db, input.organizationId, input.planId);

  const id = createEntityId("car_gol");
  await db.insert(hrmDevelopmentGoals).values({
    id,
    organizationId: input.organizationId,
    planId: input.planId,
    goalType: input.goalType,
    title: input.title,
    description: input.description ?? null,
    goalStatus: "not_started",
    priority: input.priority ?? "medium",
    targetCompletionDate: input.targetCompletionDate ?? null,
    skillCode: input.skillCode ?? null,
    competencyCode: input.competencyCode ?? null,
    sortOrder: input.sortOrder ?? 0,
  });
  return { goalId: id };
}

export async function updateHrmDevelopmentGoalStatusInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    goalId: string;
    goalStatus: (typeof hrmDevelopmentGoals.$inferInsert)["goalStatus"];
    progressPercent?: number;
    evidenceNotes?: string | null;
  },
) {
  await assertGoalInOrg(db, input.organizationId, input.goalId);

  const completedAt = input.goalStatus === "completed" ? new Date() : null;

  await db
    .update(hrmDevelopmentGoals)
    .set({
      goalStatus: input.goalStatus,
      ...(input.progressPercent !== undefined
        ? { progressPercent: input.progressPercent }
        : {}),
      ...(input.evidenceNotes !== undefined ? { evidenceNotes: input.evidenceNotes } : {}),
      completedAt,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(hrmDevelopmentGoals.organizationId, input.organizationId),
        eq(hrmDevelopmentGoals.id, input.goalId),
      ),
    );
}

export async function createHrmDevelopmentMilestoneInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    goalId: string;
    title: string;
    targetDate: Date;
    ownerEmployeeId?: string | null;
    ownerUserId?: string | null;
    priority?: (typeof hrmDevelopmentMilestones.$inferInsert)["priority"];
    completionCriteria?: string | null;
    description?: string | null;
  },
) {
  await assertGoalInOrg(db, input.organizationId, input.goalId);

  const id = createEntityId("car_mil");
  await db.insert(hrmDevelopmentMilestones).values({
    id,
    organizationId: input.organizationId,
    goalId: input.goalId,
    title: input.title,
    description: input.description ?? null,
    targetDate: input.targetDate,
    ownerEmployeeId: input.ownerEmployeeId ?? null,
    ownerUserId: input.ownerUserId ?? null,
    priority: input.priority ?? "medium",
    completionCriteria: input.completionCriteria ?? null,
    milestoneStatus: "not_started",
  });
  return { milestoneId: id };
}

export async function updateHrmDevelopmentMilestoneStatusInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    milestoneId: string;
    milestoneStatus: (typeof hrmDevelopmentMilestones.$inferInsert)["milestoneStatus"];
  },
) {
  const [milestone] = await db
    .select({ id: hrmDevelopmentMilestones.id })
    .from(hrmDevelopmentMilestones)
    .where(
      and(
        eq(hrmDevelopmentMilestones.organizationId, input.organizationId),
        eq(hrmDevelopmentMilestones.id, input.milestoneId),
      ),
    )
    .limit(1);

  if (!milestone) {
    throw new HrCareerPathingCommandError(
      "milestone_not_found",
      "Development milestone not found.",
    );
  }

  const completedAt = input.milestoneStatus === "completed" ? new Date() : null;

  await db
    .update(hrmDevelopmentMilestones)
    .set({
      milestoneStatus: input.milestoneStatus,
      completedAt,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(hrmDevelopmentMilestones.organizationId, input.organizationId),
        eq(hrmDevelopmentMilestones.id, input.milestoneId),
      ),
    );
}

export async function insertHrmEmployeeReadinessSnapshotInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
    readinessLevel: (typeof hrmEmployeeReadinessSnapshots.$inferInsert)["readinessLevel"];
    targetRoleId?: string | null;
    readinessScore?: string | null;
    gapSummary?: Record<string, unknown> | null;
    snapshotNotes?: string | null;
    computedByUserId?: string | null;
    computedAt?: Date;
  },
) {
  await assertEmployeeInOrg(db, input.organizationId, input.employeeId);

  const id = createEntityId("car_rdy");
  await db.insert(hrmEmployeeReadinessSnapshots).values({
    id,
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    targetRoleId: input.targetRoleId ?? null,
    readinessLevel: input.readinessLevel,
    readinessScore: input.readinessScore ?? null,
    gapSummary: input.gapSummary ?? null,
    snapshotNotes: input.snapshotNotes ?? null,
    computedByUserId: input.computedByUserId ?? null,
    computedAt: input.computedAt ?? new Date(),
  });
  return { snapshotId: id };
}

function fieldMatched(current: string | null, target: string | null): boolean {
  if (!target) {
    return true;
  }
  if (!current) {
    return false;
  }
  return current === target;
}

/** HRM-CAR-006 — compare employee current role against target role requirements. */
export async function compareEmployeeCurrentRoleToTarget(
  db: AfendaTransaction,
  input: { organizationId: string; employeeId: string; targetRoleId?: string },
): Promise<HrCareerRoleCompareResult> {
  await assertEmployeeInOrg(db, input.organizationId, input.employeeId);

  const [employee] = await db
    .select({
      grade: hrEmployees.grade,
      currentDepartmentId: hrEmployees.currentDepartmentId,
      currentPositionId: hrEmployees.currentPositionId,
      positionTitle: hrPositions.title,
    })
    .from(hrEmployees)
    .leftJoin(hrPositions, eq(hrEmployees.currentPositionId, hrPositions.id))
    .where(
      and(
        eq(hrEmployees.organizationId, input.organizationId),
        eq(hrEmployees.id, input.employeeId),
      ),
    )
    .limit(1);

  const targetRoleConditions = [
    eq(hrmEmployeeTargetRoles.organizationId, input.organizationId),
    eq(hrmEmployeeTargetRoles.employeeId, input.employeeId),
  ];

  if (input.targetRoleId) {
    targetRoleConditions.push(eq(hrmEmployeeTargetRoles.id, input.targetRoleId));
  } else {
    targetRoleConditions.push(eq(hrmEmployeeTargetRoles.primaryTarget, true));
  }

  const [targetRole] = await db
    .select({
      id: hrmEmployeeTargetRoles.id,
      targetRoleTitle: hrmEmployeeTargetRoles.targetRoleTitle,
      jobFamily: hrmEmployeeTargetRoles.jobFamily,
      grade: hrmEmployeeTargetRoles.grade,
      positionId: hrmEmployeeTargetRoles.positionId,
      departmentId: hrmEmployeeTargetRoles.departmentId,
      requiredSkillRequirements: hrmEmployeeTargetRoles.requiredSkillRequirements,
      requiredCompetencyRequirements:
        hrmEmployeeTargetRoles.requiredCompetencyRequirements,
    })
    .from(hrmEmployeeTargetRoles)
    .where(and(...targetRoleConditions))
    .limit(1);

  const currentRole = {
    positionId: employee?.currentPositionId ?? null,
    positionTitle: employee?.positionTitle ?? null,
    departmentId: employee?.currentDepartmentId ?? null,
    grade: employee?.grade ?? null,
    jobFamily: null as string | null,
  };

  if (!targetRole) {
    return {
      employeeId: input.employeeId,
      targetRoleId: null,
      currentRole,
      targetRole: null,
      structureGaps: [],
    };
  }

  const structureGaps: HrCareerRoleStructureGap[] = [
    {
      field: "grade",
      current: currentRole.grade,
      target: targetRole.grade,
      matched: fieldMatched(currentRole.grade, targetRole.grade),
    },
    {
      field: "department",
      current: currentRole.departmentId,
      target: targetRole.departmentId,
      matched: fieldMatched(currentRole.departmentId, targetRole.departmentId),
    },
    {
      field: "position",
      current: currentRole.positionId,
      target: targetRole.positionId,
      matched: fieldMatched(currentRole.positionId, targetRole.positionId),
    },
    {
      field: "job_family",
      current: currentRole.jobFamily,
      target: targetRole.jobFamily,
      matched: fieldMatched(currentRole.jobFamily, targetRole.jobFamily),
    },
  ];

  return {
    employeeId: input.employeeId,
    targetRoleId: targetRole.id,
    currentRole,
    targetRole: {
      targetRoleTitle: targetRole.targetRoleTitle,
      positionId: targetRole.positionId,
      departmentId: targetRole.departmentId,
      grade: targetRole.grade,
      jobFamily: targetRole.jobFamily,
      requiredSkillCount: targetRole.requiredSkillRequirements.length,
      requiredCompetencyCount: targetRole.requiredCompetencyRequirements.length,
    },
    structureGaps,
  };
}

/** HRM-CAR-007 — compare employee proficiency against primary target role requirements. */
export async function listSkillGapsForEmployee(
  db: AfendaTransaction,
  input: { organizationId: string; employeeId: string; targetRoleId?: string },
): Promise<HrCareerSkillGapCompareResult> {
  await assertEmployeeInOrg(db, input.organizationId, input.employeeId);

  const targetRoleConditions = [
    eq(hrmEmployeeTargetRoles.organizationId, input.organizationId),
    eq(hrmEmployeeTargetRoles.employeeId, input.employeeId),
  ];

  if (input.targetRoleId) {
    targetRoleConditions.push(eq(hrmEmployeeTargetRoles.id, input.targetRoleId));
  } else {
    targetRoleConditions.push(eq(hrmEmployeeTargetRoles.primaryTarget, true));
  }

  const [targetRole] = await db
    .select({
      id: hrmEmployeeTargetRoles.id,
      requiredSkillRequirements: hrmEmployeeTargetRoles.requiredSkillRequirements,
      requiredCompetencyRequirements:
        hrmEmployeeTargetRoles.requiredCompetencyRequirements,
    })
    .from(hrmEmployeeTargetRoles)
    .where(and(...targetRoleConditions))
    .limit(1);

  if (!targetRole) {
    return {
      employeeId: input.employeeId,
      targetRoleId: null,
      skillGaps: [],
      competencyGaps: [],
      employeeSkillsAvailable: false,
      employeeCompetenciesAvailable: false,
    };
  }

  const skillMap = await loadEmployeeSkillProficiencyMap(db, input);
  const competencyMap = await loadEmployeeCompetencyProficiencyMap(db, input);

  return {
    employeeId: input.employeeId,
    targetRoleId: targetRole.id,
    skillGaps: buildSkillGapRows(targetRole.requiredSkillRequirements, skillMap),
    competencyGaps: buildCompetencyGapRows(
      targetRole.requiredCompetencyRequirements,
      competencyMap,
    ),
    employeeSkillsAvailable: skillMap.size > 0,
    employeeCompetenciesAvailable: competencyMap.size > 0,
  };
}

export async function listHrmCareerPathFrameworksWindow(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    limit?: number;
    offset?: number;
    search?: string;
    frameworkStatus?: (typeof hrmCareerPathFrameworks.$inferSelect)["frameworkStatus"];
  },
) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const conditions = [
    eq(hrmCareerPathFrameworks.organizationId, input.organizationId),
  ];

  if (input.frameworkStatus) {
    conditions.push(eq(hrmCareerPathFrameworks.frameworkStatus, input.frameworkStatus));
  }

  const trimmedSearch = input.search?.trim();
  if (trimmedSearch) {
    const pattern = `%${trimmedSearch}%`;
    conditions.push(
      or(
        ilike(hrmCareerPathFrameworks.code, pattern),
        ilike(hrmCareerPathFrameworks.name, pattern),
      )!,
    );
  }

  const whereClause = and(...conditions);

  const [totalRow] = await db
    .select({ total: count() })
    .from(hrmCareerPathFrameworks)
    .where(whereClause);

  const rows = await db
    .select({
      id: hrmCareerPathFrameworks.id,
      code: hrmCareerPathFrameworks.code,
      name: hrmCareerPathFrameworks.name,
      pathKind: hrmCareerPathFrameworks.pathKind,
      frameworkStatus: hrmCareerPathFrameworks.frameworkStatus,
      description: hrmCareerPathFrameworks.description,
    })
    .from(hrmCareerPathFrameworks)
    .where(whereClause)
    .orderBy(asc(hrmCareerPathFrameworks.code))
    .limit(pageSize)
    .offset(offset);

  return buildPaginatedWindow({
    rows,
    pageSize,
    offset,
    totalCount: Number(totalRow?.total ?? 0),
  });
}

export async function listHrmCareerPathStagesWindow(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    frameworkId: string;
    limit?: number;
    offset?: number;
  },
) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const whereClause = and(
    eq(hrmCareerPathStages.organizationId, input.organizationId),
    eq(hrmCareerPathStages.frameworkId, input.frameworkId),
  );

  const [totalRow] = await db
    .select({ total: count() })
    .from(hrmCareerPathStages)
    .where(whereClause);

  const rows = await db
    .select({
      id: hrmCareerPathStages.id,
      frameworkId: hrmCareerPathStages.frameworkId,
      stageOrder: hrmCareerPathStages.stageOrder,
      code: hrmCareerPathStages.code,
      name: hrmCareerPathStages.name,
      description: hrmCareerPathStages.description,
      expectedDurationMonths: hrmCareerPathStages.expectedDurationMonths,
    })
    .from(hrmCareerPathStages)
    .where(whereClause)
    .orderBy(asc(hrmCareerPathStages.stageOrder))
    .limit(pageSize)
    .offset(offset);

  return buildPaginatedWindow({
    rows,
    pageSize,
    offset,
    totalCount: Number(totalRow?.total ?? 0),
  });
}

export async function listHrmEmployeeCareerAspirationsWindow(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    limit?: number;
    offset?: number;
    employeeId?: string;
  },
) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const conditions = [
    eq(hrmEmployeeCareerAspirations.organizationId, input.organizationId),
  ];

  if (input.employeeId) {
    conditions.push(eq(hrmEmployeeCareerAspirations.employeeId, input.employeeId));
  }

  const whereClause = and(...conditions);

  const [totalRow] = await db
    .select({ total: count() })
    .from(hrmEmployeeCareerAspirations)
    .where(whereClause);

  const rows = await db
    .select({
      id: hrmEmployeeCareerAspirations.id,
      employeeId: hrmEmployeeCareerAspirations.employeeId,
      employeeNumber: hrEmployees.employeeNumber,
      employeeName: hrEmployees.legalName,
      preferredRoleTitle: hrmEmployeeCareerAspirations.preferredRoleTitle,
      preferredDepartmentId: hrmEmployeeCareerAspirations.preferredDepartmentId,
      preferredLocationCode: hrmEmployeeCareerAspirations.preferredLocationCode,
      mobilityPreference: hrmEmployeeCareerAspirations.mobilityPreference,
      careerInterestNotes: hrmEmployeeCareerAspirations.careerInterestNotes,
    })
    .from(hrmEmployeeCareerAspirations)
    .innerJoin(
      hrEmployees,
      eq(hrmEmployeeCareerAspirations.employeeId, hrEmployees.id),
    )
    .where(whereClause)
    .orderBy(asc(hrEmployees.employeeNumber))
    .limit(pageSize)
    .offset(offset);

  return buildPaginatedWindow({
    rows,
    pageSize,
    offset,
    totalCount: Number(totalRow?.total ?? 0),
  });
}

export async function listHrmEmployeeTargetRolesWindow(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    limit?: number;
    offset?: number;
    employeeId?: string;
    departmentId?: string;
    jobFamily?: string;
  },
) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const conditions = [eq(hrmEmployeeTargetRoles.organizationId, input.organizationId)];

  if (input.employeeId) {
    conditions.push(eq(hrmEmployeeTargetRoles.employeeId, input.employeeId));
  }
  if (input.departmentId) {
    conditions.push(eq(hrmEmployeeTargetRoles.departmentId, input.departmentId));
  }
  if (input.jobFamily) {
    conditions.push(eq(hrmEmployeeTargetRoles.jobFamily, input.jobFamily));
  }

  const whereClause = and(...conditions);

  const [totalRow] = await db
    .select({ total: count() })
    .from(hrmEmployeeTargetRoles)
    .where(whereClause);

  const rows = await db
    .select({
      id: hrmEmployeeTargetRoles.id,
      employeeId: hrmEmployeeTargetRoles.employeeId,
      employeeNumber: hrEmployees.employeeNumber,
      employeeName: hrEmployees.legalName,
      targetRoleTitle: hrmEmployeeTargetRoles.targetRoleTitle,
      jobFamily: hrmEmployeeTargetRoles.jobFamily,
      grade: hrmEmployeeTargetRoles.grade,
      departmentId: hrmEmployeeTargetRoles.departmentId,
      positionId: hrmEmployeeTargetRoles.positionId,
      frameworkId: hrmEmployeeTargetRoles.frameworkId,
      stageId: hrmEmployeeTargetRoles.stageId,
      targetRoleSource: hrmEmployeeTargetRoles.targetRoleSource,
      expectedReadinessDate: hrmEmployeeTargetRoles.expectedReadinessDate,
    })
    .from(hrmEmployeeTargetRoles)
    .innerJoin(hrEmployees, eq(hrmEmployeeTargetRoles.employeeId, hrEmployees.id))
    .where(whereClause)
    .orderBy(asc(hrEmployees.employeeNumber))
    .limit(pageSize)
    .offset(offset);

  return buildPaginatedWindow({
    rows,
    pageSize,
    offset,
    totalCount: Number(totalRow?.total ?? 0),
  });
}

export async function listHrmDevelopmentPlansWindow(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    limit?: number;
    offset?: number;
    employeeId?: string;
    planStatus?: (typeof hrmDevelopmentPlans.$inferSelect)["planStatus"];
    search?: string;
  },
) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const conditions = [eq(hrmDevelopmentPlans.organizationId, input.organizationId)];

  if (input.employeeId) {
    conditions.push(eq(hrmDevelopmentPlans.employeeId, input.employeeId));
  }
  if (input.planStatus) {
    conditions.push(eq(hrmDevelopmentPlans.planStatus, input.planStatus));
  }

  const trimmedSearch = input.search?.trim();
  if (trimmedSearch) {
    const pattern = `%${trimmedSearch}%`;
    conditions.push(
      or(
        ilike(hrmDevelopmentPlans.code, pattern),
        ilike(hrmDevelopmentPlans.title, pattern),
      )!,
    );
  }

  const whereClause = and(...conditions);

  const [totalRow] = await db
    .select({ total: count() })
    .from(hrmDevelopmentPlans)
    .where(whereClause);

  const rows = await db
    .select({
      id: hrmDevelopmentPlans.id,
      employeeId: hrmDevelopmentPlans.employeeId,
      employeeNumber: hrEmployees.employeeNumber,
      employeeName: hrEmployees.legalName,
      targetRoleId: hrmDevelopmentPlans.targetRoleId,
      code: hrmDevelopmentPlans.code,
      title: hrmDevelopmentPlans.title,
      planStatus: hrmDevelopmentPlans.planStatus,
      startDate: hrmDevelopmentPlans.startDate,
      targetCompletionDate: hrmDevelopmentPlans.targetCompletionDate,
      managerReviewedAt: hrmDevelopmentPlans.managerReviewedAt,
    })
    .from(hrmDevelopmentPlans)
    .innerJoin(hrEmployees, eq(hrmDevelopmentPlans.employeeId, hrEmployees.id))
    .where(whereClause)
    .orderBy(desc(hrmDevelopmentPlans.updatedAt))
    .limit(pageSize)
    .offset(offset);

  return buildPaginatedWindow({
    rows,
    pageSize,
    offset,
    totalCount: Number(totalRow?.total ?? 0),
  });
}

export async function listHrmDevelopmentGoalsWindow(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    planId: string;
    limit?: number;
    offset?: number;
    goalStatus?: (typeof hrmDevelopmentGoals.$inferSelect)["goalStatus"];
  },
) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const conditions = [
    eq(hrmDevelopmentGoals.organizationId, input.organizationId),
    eq(hrmDevelopmentGoals.planId, input.planId),
  ];

  if (input.goalStatus) {
    conditions.push(eq(hrmDevelopmentGoals.goalStatus, input.goalStatus));
  }

  const whereClause = and(...conditions);

  const [totalRow] = await db
    .select({ total: count() })
    .from(hrmDevelopmentGoals)
    .where(whereClause);

  const rows = await db
    .select({
      id: hrmDevelopmentGoals.id,
      planId: hrmDevelopmentGoals.planId,
      goalType: hrmDevelopmentGoals.goalType,
      title: hrmDevelopmentGoals.title,
      goalStatus: hrmDevelopmentGoals.goalStatus,
      priority: hrmDevelopmentGoals.priority,
      targetCompletionDate: hrmDevelopmentGoals.targetCompletionDate,
      progressPercent: hrmDevelopmentGoals.progressPercent,
      skillCode: hrmDevelopmentGoals.skillCode,
      competencyCode: hrmDevelopmentGoals.competencyCode,
      sortOrder: hrmDevelopmentGoals.sortOrder,
    })
    .from(hrmDevelopmentGoals)
    .where(whereClause)
    .orderBy(asc(hrmDevelopmentGoals.sortOrder), asc(hrmDevelopmentGoals.title))
    .limit(pageSize)
    .offset(offset);

  return buildPaginatedWindow({
    rows,
    pageSize,
    offset,
    totalCount: Number(totalRow?.total ?? 0),
  });
}

export async function listHrmDevelopmentMilestonesWindow(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    goalId: string;
    limit?: number;
    offset?: number;
  },
) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const whereClause = and(
    eq(hrmDevelopmentMilestones.organizationId, input.organizationId),
    eq(hrmDevelopmentMilestones.goalId, input.goalId),
  );

  const [totalRow] = await db
    .select({ total: count() })
    .from(hrmDevelopmentMilestones)
    .where(whereClause);

  const rows = await db
    .select({
      id: hrmDevelopmentMilestones.id,
      goalId: hrmDevelopmentMilestones.goalId,
      title: hrmDevelopmentMilestones.title,
      targetDate: hrmDevelopmentMilestones.targetDate,
      ownerEmployeeId: hrmDevelopmentMilestones.ownerEmployeeId,
      priority: hrmDevelopmentMilestones.priority,
      milestoneStatus: hrmDevelopmentMilestones.milestoneStatus,
      completionCriteria: hrmDevelopmentMilestones.completionCriteria,
      completedAt: hrmDevelopmentMilestones.completedAt,
    })
    .from(hrmDevelopmentMilestones)
    .where(whereClause)
    .orderBy(asc(hrmDevelopmentMilestones.targetDate))
    .limit(pageSize)
    .offset(offset);

  return buildPaginatedWindow({
    rows,
    pageSize,
    offset,
    totalCount: Number(totalRow?.total ?? 0),
  });
}

export async function listHrmDevelopmentLearningActionsWindow(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    planId: string;
    limit?: number;
    offset?: number;
  },
) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const whereClause = and(
    eq(hrmDevelopmentLearningActions.organizationId, input.organizationId),
    eq(hrmDevelopmentLearningActions.planId, input.planId),
  );

  const [totalRow] = await db
    .select({ total: count() })
    .from(hrmDevelopmentLearningActions)
    .where(whereClause);

  const rows = await db
    .select({
      id: hrmDevelopmentLearningActions.id,
      planId: hrmDevelopmentLearningActions.planId,
      goalId: hrmDevelopmentLearningActions.goalId,
      title: hrmDevelopmentLearningActions.title,
      trainingCourseId: hrmDevelopmentLearningActions.trainingCourseId,
      externalTrainingRef: hrmDevelopmentLearningActions.externalTrainingRef,
      learningActionStatus: hrmDevelopmentLearningActions.learningActionStatus,
      dueDate: hrmDevelopmentLearningActions.dueDate,
      completedAt: hrmDevelopmentLearningActions.completedAt,
    })
    .from(hrmDevelopmentLearningActions)
    .where(whereClause)
    .orderBy(asc(hrmDevelopmentLearningActions.dueDate))
    .limit(pageSize)
    .offset(offset);

  return buildPaginatedWindow({
    rows,
    pageSize,
    offset,
    totalCount: Number(totalRow?.total ?? 0),
  });
}

export async function listHrmDevelopmentStretchAssignmentsWindow(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    planId: string;
    limit?: number;
    offset?: number;
  },
) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const whereClause = and(
    eq(hrmDevelopmentStretchAssignments.organizationId, input.organizationId),
    eq(hrmDevelopmentStretchAssignments.planId, input.planId),
  );

  const [totalRow] = await db
    .select({ total: count() })
    .from(hrmDevelopmentStretchAssignments)
    .where(whereClause);

  const rows = await db
    .select({
      id: hrmDevelopmentStretchAssignments.id,
      planId: hrmDevelopmentStretchAssignments.planId,
      assignmentKind: hrmDevelopmentStretchAssignments.assignmentKind,
      title: hrmDevelopmentStretchAssignments.title,
      assignmentStatus: hrmDevelopmentStretchAssignments.assignmentStatus,
      departmentId: hrmDevelopmentStretchAssignments.departmentId,
      positionId: hrmDevelopmentStretchAssignments.positionId,
      startDate: hrmDevelopmentStretchAssignments.startDate,
      endDate: hrmDevelopmentStretchAssignments.endDate,
    })
    .from(hrmDevelopmentStretchAssignments)
    .where(whereClause)
    .orderBy(desc(hrmDevelopmentStretchAssignments.startDate))
    .limit(pageSize)
    .offset(offset);

  return buildPaginatedWindow({
    rows,
    pageSize,
    offset,
    totalCount: Number(totalRow?.total ?? 0),
  });
}

export async function listHrmCareerDiscussionsWindow(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    limit?: number;
    offset?: number;
    employeeId?: string;
  },
) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const conditions = [eq(hrmCareerDiscussions.organizationId, input.organizationId)];

  if (input.employeeId) {
    conditions.push(eq(hrmCareerDiscussions.employeeId, input.employeeId));
  }

  const whereClause = and(...conditions);

  const [totalRow] = await db
    .select({ total: count() })
    .from(hrmCareerDiscussions)
    .where(whereClause);

  const rows = await db
    .select({
      id: hrmCareerDiscussions.id,
      employeeId: hrmCareerDiscussions.employeeId,
      employeeNumber: hrEmployees.employeeNumber,
      employeeName: hrEmployees.legalName,
      planId: hrmCareerDiscussions.planId,
      discussionDate: hrmCareerDiscussions.discussionDate,
      nextReviewDate: hrmCareerDiscussions.nextReviewDate,
      notes: hrmCareerDiscussions.notes,
      participants: hrmCareerDiscussions.participants,
      agreedActions: hrmCareerDiscussions.agreedActions,
    })
    .from(hrmCareerDiscussions)
    .innerJoin(hrEmployees, eq(hrmCareerDiscussions.employeeId, hrEmployees.id))
    .where(whereClause)
    .orderBy(desc(hrmCareerDiscussions.discussionDate))
    .limit(pageSize)
    .offset(offset);

  return buildPaginatedWindow({
    rows,
    pageSize,
    offset,
    totalCount: Number(totalRow?.total ?? 0),
  });
}

export async function listHrmEmployeeReadinessSnapshotsWindow(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    limit?: number;
    offset?: number;
    employeeId?: string;
    readinessLevel?: (typeof hrmEmployeeReadinessSnapshots.$inferSelect)["readinessLevel"];
  },
) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const conditions = [
    eq(hrmEmployeeReadinessSnapshots.organizationId, input.organizationId),
  ];

  if (input.employeeId) {
    conditions.push(eq(hrmEmployeeReadinessSnapshots.employeeId, input.employeeId));
  }
  if (input.readinessLevel) {
    conditions.push(
      eq(hrmEmployeeReadinessSnapshots.readinessLevel, input.readinessLevel),
    );
  }

  const whereClause = and(...conditions);

  const [totalRow] = await db
    .select({ total: count() })
    .from(hrmEmployeeReadinessSnapshots)
    .where(whereClause);

  const rows = await db
    .select({
      id: hrmEmployeeReadinessSnapshots.id,
      employeeId: hrmEmployeeReadinessSnapshots.employeeId,
      employeeNumber: hrEmployees.employeeNumber,
      employeeName: hrEmployees.legalName,
      targetRoleId: hrmEmployeeReadinessSnapshots.targetRoleId,
      readinessLevel: hrmEmployeeReadinessSnapshots.readinessLevel,
      readinessScore: hrmEmployeeReadinessSnapshots.readinessScore,
      computedAt: hrmEmployeeReadinessSnapshots.computedAt,
      snapshotNotes: hrmEmployeeReadinessSnapshots.snapshotNotes,
    })
    .from(hrmEmployeeReadinessSnapshots)
    .innerJoin(
      hrEmployees,
      eq(hrmEmployeeReadinessSnapshots.employeeId, hrEmployees.id),
    )
    .where(whereClause)
    .orderBy(desc(hrmEmployeeReadinessSnapshots.computedAt))
    .limit(pageSize)
    .offset(offset);

  return buildPaginatedWindow({
    rows,
    pageSize,
    offset,
    totalCount: Number(totalRow?.total ?? 0),
  });
}

/** HRM-CAR-026 — development plan refs for performance appraisals. */
export async function listDevelopmentPlanRefsForAppraisal(
  db: AfendaTransaction,
  input: { organizationId: string; employeeId: string; limit?: number },
): Promise<readonly HrDevelopmentPlanAppraisalRef[]> {
  const pageSize = clampPageSize(input.limit ?? 50);

  const plans = await db
    .select({
      planId: hrmDevelopmentPlans.id,
      employeeId: hrmDevelopmentPlans.employeeId,
      code: hrmDevelopmentPlans.code,
      title: hrmDevelopmentPlans.title,
      planStatus: hrmDevelopmentPlans.planStatus,
      targetCompletionDate: hrmDevelopmentPlans.targetCompletionDate,
    })
    .from(hrmDevelopmentPlans)
    .where(
      and(
        eq(hrmDevelopmentPlans.organizationId, input.organizationId),
        eq(hrmDevelopmentPlans.employeeId, input.employeeId),
        inArray(hrmDevelopmentPlans.planStatus, ["active", "completed", "on_hold"]),
      ),
    )
    .orderBy(desc(hrmDevelopmentPlans.updatedAt))
    .limit(pageSize);

  if (plans.length === 0) {
    return [];
  }

  const planIds = plans.map((plan) => plan.planId);
  const goalCounts = await db
    .select({
      planId: hrmDevelopmentGoals.planId,
      goalStatus: hrmDevelopmentGoals.goalStatus,
      total: count(),
    })
    .from(hrmDevelopmentGoals)
    .where(
      and(
        eq(hrmDevelopmentGoals.organizationId, input.organizationId),
        inArray(hrmDevelopmentGoals.planId, planIds),
      ),
    )
    .groupBy(hrmDevelopmentGoals.planId, hrmDevelopmentGoals.goalStatus);

  const totalsByPlan = new Map<string, { total: number; completed: number }>();
  for (const row of goalCounts) {
    const current = totalsByPlan.get(row.planId) ?? { total: 0, completed: 0 };
    const rowTotal = Number(row.total);
    totalsByPlan.set(row.planId, {
      total: current.total + rowTotal,
      completed:
        current.completed + (row.goalStatus === "completed" ? rowTotal : 0),
    });
  }

  return plans.map((plan) => {
    const counts = totalsByPlan.get(plan.planId) ?? { total: 0, completed: 0 };
    return {
      planId: plan.planId,
      employeeId: plan.employeeId,
      code: plan.code,
      title: plan.title,
      planStatus: plan.planStatus,
      goalCount: counts.total,
      completedGoalCount: counts.completed,
      targetCompletionDate: plan.targetCompletionDate,
    };
  });
}

/** HRM-CAR-027 — latest readiness refs for succession planning consumers. */
export async function listReadinessRefsForSuccession(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    readinessLevels?: readonly (typeof hrmEmployeeReadinessSnapshots.$inferSelect)["readinessLevel"][];
    limit?: number;
    offset?: number;
  },
): Promise<readonly HrReadinessSuccessionRef[]> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  const latestSnapshotSubquery = db
    .select({
      employeeId: hrmEmployeeReadinessSnapshots.employeeId,
      maxComputedAt: sql<Date>`max(${hrmEmployeeReadinessSnapshots.computedAt})`.as(
        "max_computed_at",
      ),
    })
    .from(hrmEmployeeReadinessSnapshots)
    .where(eq(hrmEmployeeReadinessSnapshots.organizationId, input.organizationId))
    .groupBy(hrmEmployeeReadinessSnapshots.employeeId)
    .as("latest_snapshots");

  const conditions = [
    eq(hrmEmployeeReadinessSnapshots.organizationId, input.organizationId),
    eq(hrmEmployeeReadinessSnapshots.employeeId, latestSnapshotSubquery.employeeId),
    eq(
      hrmEmployeeReadinessSnapshots.computedAt,
      latestSnapshotSubquery.maxComputedAt,
    ),
  ];

  if (input.readinessLevels && input.readinessLevels.length > 0) {
    conditions.push(
      inArray(hrmEmployeeReadinessSnapshots.readinessLevel, [...input.readinessLevels]),
    );
  }

  const rows = await db
    .select({
      employeeId: hrmEmployeeReadinessSnapshots.employeeId,
      employeeNumber: hrEmployees.employeeNumber,
      employeeName: hrEmployees.legalName,
      targetRoleId: hrmEmployeeReadinessSnapshots.targetRoleId,
      targetRoleTitle: hrmEmployeeTargetRoles.targetRoleTitle,
      readinessLevel: hrmEmployeeReadinessSnapshots.readinessLevel,
      readinessScore: hrmEmployeeReadinessSnapshots.readinessScore,
      computedAt: hrmEmployeeReadinessSnapshots.computedAt,
    })
    .from(hrmEmployeeReadinessSnapshots)
    .innerJoin(
      latestSnapshotSubquery,
      eq(hrmEmployeeReadinessSnapshots.employeeId, latestSnapshotSubquery.employeeId),
    )
    .innerJoin(
      hrEmployees,
      eq(hrmEmployeeReadinessSnapshots.employeeId, hrEmployees.id),
    )
    .leftJoin(
      hrmEmployeeTargetRoles,
      eq(hrmEmployeeReadinessSnapshots.targetRoleId, hrmEmployeeTargetRoles.id),
    )
    .where(and(...conditions))
    .orderBy(desc(hrmEmployeeReadinessSnapshots.computedAt))
    .limit(pageSize)
    .offset(offset);

  return rows;
}

/** HRM-CAR-028 — learning action refs for training / LMS consumers. */
export async function listDevelopmentLearningRefsForEmployee(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
    limit?: number;
    includeCompleted?: boolean;
  },
): Promise<readonly HrDevelopmentLearningRef[]> {
  const pageSize = clampPageSize(input.limit ?? 50);
  const statusFilter = input.includeCompleted
    ? undefined
    : (["planned", "in_progress"] as const);

  const conditions = [
    eq(hrmDevelopmentPlans.organizationId, input.organizationId),
    eq(hrmDevelopmentPlans.employeeId, input.employeeId),
  ];

  const rows = await db
    .select({
      learningActionId: hrmDevelopmentLearningActions.id,
      planId: hrmDevelopmentPlans.id,
      planCode: hrmDevelopmentPlans.code,
      title: hrmDevelopmentLearningActions.title,
      trainingCourseId: hrmDevelopmentLearningActions.trainingCourseId,
      externalTrainingRef: hrmDevelopmentLearningActions.externalTrainingRef,
      learningActionStatus: hrmDevelopmentLearningActions.learningActionStatus,
      dueDate: hrmDevelopmentLearningActions.dueDate,
    })
    .from(hrmDevelopmentLearningActions)
    .innerJoin(
      hrmDevelopmentPlans,
      eq(hrmDevelopmentLearningActions.planId, hrmDevelopmentPlans.id),
    )
    .where(
      and(
        ...conditions,
        ...(statusFilter
          ? [inArray(hrmDevelopmentLearningActions.learningActionStatus, [...statusFilter])]
          : []),
      ),
    )
    .orderBy(asc(hrmDevelopmentLearningActions.dueDate))
    .limit(pageSize);

  return rows;
}

export async function countOverdueHrmDevelopmentMilestones(
  db: AfendaTransaction,
  input: { organizationId: string; asOf?: Date },
) {
  const asOf = input.asOf ?? new Date();

  const [row] = await db
    .select({ total: count() })
    .from(hrmDevelopmentMilestones)
    .where(
      and(
        eq(hrmDevelopmentMilestones.organizationId, input.organizationId),
        inArray(hrmDevelopmentMilestones.milestoneStatus, [
          "not_started",
          "in_progress",
          "overdue",
        ]),
        lte(hrmDevelopmentMilestones.targetDate, asOf),
      ),
    );

  return Number(row?.total ?? 0);
}

export async function countHrmReadinessByLevel(
  db: AfendaTransaction,
  input: { organizationId: string },
) {
  const rows = await db
    .select({
      readinessLevel: hrmEmployeeReadinessSnapshots.readinessLevel,
      total: count(),
    })
    .from(hrmEmployeeReadinessSnapshots)
    .where(eq(hrmEmployeeReadinessSnapshots.organizationId, input.organizationId))
    .groupBy(hrmEmployeeReadinessSnapshots.readinessLevel);

  return Object.fromEntries(
    rows.map((row) => [row.readinessLevel, Number(row.total)]),
  ) as Partial<
    Record<
      (typeof hrmEmployeeReadinessSnapshots.$inferSelect)["readinessLevel"],
      number
    >
  >;
}

/** HRM-CAR-017 — mentor or coach session log window for a plan. */
export async function listHrmDevelopmentSessionsWindow(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    planId: string;
    limit?: number;
    offset?: number;
    sessionKind?: (typeof hrmDevelopmentSessions.$inferSelect)["sessionKind"];
  },
) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const conditions = [
    eq(hrmDevelopmentSessions.organizationId, input.organizationId),
    eq(hrmDevelopmentSessions.planId, input.planId),
  ];

  if (input.sessionKind) {
    conditions.push(eq(hrmDevelopmentSessions.sessionKind, input.sessionKind));
  }

  const whereClause = and(...conditions);

  const [totalRow] = await db
    .select({ total: count() })
    .from(hrmDevelopmentSessions)
    .where(whereClause);

  const rows = await db
    .select({
      id: hrmDevelopmentSessions.id,
      planId: hrmDevelopmentSessions.planId,
      sessionKind: hrmDevelopmentSessions.sessionKind,
      sessionDate: hrmDevelopmentSessions.sessionDate,
      durationMinutes: hrmDevelopmentSessions.durationMinutes,
      notes: hrmDevelopmentSessions.notes,
      actions: hrmDevelopmentSessions.actions,
      outcome: hrmDevelopmentSessions.outcome,
      mentorAssignmentId: hrmDevelopmentSessions.mentorAssignmentId,
      coachAssignmentId: hrmDevelopmentSessions.coachAssignmentId,
    })
    .from(hrmDevelopmentSessions)
    .where(whereClause)
    .orderBy(desc(hrmDevelopmentSessions.sessionDate))
    .limit(pageSize)
    .offset(offset);

  return buildPaginatedWindow({
    rows,
    pageSize,
    offset,
    totalCount: Number(totalRow?.total ?? 0),
  });
}

/** HRM-CAR-015 — active mentor assignment for a development plan. */
export async function loadHrmDevelopmentMentorAssignmentForPlan(
  db: AfendaTransaction,
  input: { organizationId: string; planId: string },
) {
  const [row] = await db
    .select({
      id: hrmDevelopmentMentorAssignments.id,
      planId: hrmDevelopmentMentorAssignments.planId,
      mentorEmployeeId: hrmDevelopmentMentorAssignments.mentorEmployeeId,
      assignmentStatus: hrmDevelopmentMentorAssignments.assignmentStatus,
      assignedAt: hrmDevelopmentMentorAssignments.assignedAt,
      notes: hrmDevelopmentMentorAssignments.notes,
    })
    .from(hrmDevelopmentMentorAssignments)
    .where(
      and(
        eq(hrmDevelopmentMentorAssignments.organizationId, input.organizationId),
        eq(hrmDevelopmentMentorAssignments.planId, input.planId),
      ),
    )
    .limit(1);

  return row ?? null;
}

/** HRM-CAR-016 — active coach assignment for a development plan. */
export async function loadHrmDevelopmentCoachAssignmentForPlan(
  db: AfendaTransaction,
  input: { organizationId: string; planId: string },
) {
  const [row] = await db
    .select({
      id: hrmDevelopmentCoachAssignments.id,
      planId: hrmDevelopmentCoachAssignments.planId,
      coachEmployeeId: hrmDevelopmentCoachAssignments.coachEmployeeId,
      coachingObjective: hrmDevelopmentCoachAssignments.coachingObjective,
      assignmentStatus: hrmDevelopmentCoachAssignments.assignmentStatus,
      assignedAt: hrmDevelopmentCoachAssignments.assignedAt,
      notes: hrmDevelopmentCoachAssignments.notes,
    })
    .from(hrmDevelopmentCoachAssignments)
    .where(
      and(
        eq(hrmDevelopmentCoachAssignments.organizationId, input.organizationId),
        eq(hrmDevelopmentCoachAssignments.planId, input.planId),
      ),
    )
    .limit(1);

  return row ?? null;
}

export type HrCareerPathingDueNotificationItem = {
  kind: "overdue_milestone" | "upcoming_review" | "completed_goal";
  employeeId: string;
  employeeName: string;
  planId: string | null;
  subjectId: string;
  subjectLabel: string;
  dueDate: Date | null;
};

/** HRM-CAR-025 — due milestones, reviews, and recently completed goals for notification sync. */
export async function listHrmCareerPathingDueForNotification(
  db: AfendaTransaction,
  input: { organizationId: string; asOf?: Date; limit?: number },
): Promise<readonly HrCareerPathingDueNotificationItem[]> {
  const asOf = input.asOf ?? new Date();
  const limit = clampPageSize(input.limit ?? 100);
  const items: HrCareerPathingDueNotificationItem[] = [];
  const upcomingEnd = new Date(asOf);
  upcomingEnd.setDate(upcomingEnd.getDate() + 14);
  const completedSince = new Date(asOf);
  completedSince.setDate(completedSince.getDate() - 1);

  const overdueRows = await db
    .select({
      milestoneId: hrmDevelopmentMilestones.id,
      title: hrmDevelopmentMilestones.title,
      targetDate: hrmDevelopmentMilestones.targetDate,
      employeeId: hrmDevelopmentPlans.employeeId,
      employeeName: hrEmployees.legalName,
      planId: hrmDevelopmentPlans.id,
    })
    .from(hrmDevelopmentMilestones)
    .innerJoin(
      hrmDevelopmentGoals,
      eq(hrmDevelopmentMilestones.goalId, hrmDevelopmentGoals.id),
    )
    .innerJoin(
      hrmDevelopmentPlans,
      eq(hrmDevelopmentGoals.planId, hrmDevelopmentPlans.id),
    )
    .innerJoin(hrEmployees, eq(hrmDevelopmentPlans.employeeId, hrEmployees.id))
    .where(
      and(
        eq(hrmDevelopmentMilestones.organizationId, input.organizationId),
        inArray(hrmDevelopmentMilestones.milestoneStatus, [
          "not_started",
          "in_progress",
          "overdue",
        ]),
        lte(hrmDevelopmentMilestones.targetDate, asOf),
      ),
    )
    .orderBy(asc(hrmDevelopmentMilestones.targetDate))
    .limit(limit);

  for (const row of overdueRows) {
    items.push({
      kind: "overdue_milestone",
      employeeId: row.employeeId,
      employeeName: row.employeeName,
      planId: row.planId,
      subjectId: row.milestoneId,
      subjectLabel: row.title,
      dueDate: row.targetDate,
    });
  }

  const reviewRows = await db
    .select({
      discussionId: hrmCareerDiscussions.id,
      employeeId: hrmCareerDiscussions.employeeId,
      employeeName: hrEmployees.legalName,
      planId: hrmCareerDiscussions.planId,
      nextReviewDate: hrmCareerDiscussions.nextReviewDate,
    })
    .from(hrmCareerDiscussions)
    .innerJoin(hrEmployees, eq(hrmCareerDiscussions.employeeId, hrEmployees.id))
    .where(
      and(
        eq(hrmCareerDiscussions.organizationId, input.organizationId),
        sql`${hrmCareerDiscussions.nextReviewDate} is not null`,
        gte(hrmCareerDiscussions.nextReviewDate, asOf),
        lte(hrmCareerDiscussions.nextReviewDate, upcomingEnd),
      ),
    )
    .orderBy(asc(hrmCareerDiscussions.nextReviewDate))
    .limit(Math.max(0, limit - items.length));

  for (const row of reviewRows) {
    items.push({
      kind: "upcoming_review",
      employeeId: row.employeeId,
      employeeName: row.employeeName,
      planId: row.planId,
      subjectId: row.discussionId,
      subjectLabel: "Career development review",
      dueDate: row.nextReviewDate,
    });
  }

  const completedRows = await db
    .select({
      goalId: hrmDevelopmentGoals.id,
      title: hrmDevelopmentGoals.title,
      completedAt: hrmDevelopmentGoals.completedAt,
      employeeId: hrmDevelopmentPlans.employeeId,
      employeeName: hrEmployees.legalName,
      planId: hrmDevelopmentPlans.id,
    })
    .from(hrmDevelopmentGoals)
    .innerJoin(
      hrmDevelopmentPlans,
      eq(hrmDevelopmentGoals.planId, hrmDevelopmentPlans.id),
    )
    .innerJoin(hrEmployees, eq(hrmDevelopmentPlans.employeeId, hrEmployees.id))
    .where(
      and(
        eq(hrmDevelopmentGoals.organizationId, input.organizationId),
        eq(hrmDevelopmentGoals.goalStatus, "completed"),
        gte(hrmDevelopmentGoals.completedAt, completedSince),
        lte(hrmDevelopmentGoals.completedAt, asOf),
      ),
    )
    .orderBy(desc(hrmDevelopmentGoals.completedAt))
    .limit(Math.max(0, limit - items.length));

  for (const row of completedRows) {
    items.push({
      kind: "completed_goal",
      employeeId: row.employeeId,
      employeeName: row.employeeName,
      planId: row.planId,
      subjectId: row.goalId,
      subjectLabel: row.title,
      dueDate: row.completedAt,
    });
  }

  return items.slice(0, limit);
}
