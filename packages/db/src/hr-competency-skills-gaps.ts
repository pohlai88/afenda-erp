import { and, count, desc, eq, inArray, or } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { buildPaginatedWindow, clampPageSize } from "./hr-benefits.shared";
import { appendHrCsfAuditEventInTx } from "./hr-competency-skills-audit";
import {
  classifyGap,
  computeCompetencyGap,
  computeSkillGap,
  type CompetencyGapResult,
  type GapClassificationResult,
  type SkillGapResult,
} from "./hr-competency-skills-gap-calculations.shared";
import { HrCsfCommandError } from "./hr-competency-skills.shared";
import {
  hrCsfCompetencies,
  hrCsfCompetencyRequirements,
  hrCsfEmployeeCompetencyProfiles,
  hrCsfEmployeeSkillProfiles,
  hrCsfGapClassifications,
  hrCsfGaps,
  hrCsfProficiencyLevels,
  hrCsfSkillRequirements,
  hrCsfSkills,
} from "./hr-competency-skills";
import { hrEmployees } from "./hr";

export {
  HrCsfGapCalculationError,
  computeProficiencyGap,
  computeSkillGap,
  computeCompetencyGap,
  classifyGap,
  recommendDevelopmentActions,
  buildDefaultDevelopmentLinks,
} from "./hr-competency-skills-gap-calculations.shared";

export type {
  ProficiencyGapInput,
  ProficiencyGapResult,
  SkillGapInput,
  SkillGapResult,
  CompetencyGapInput,
  CompetencyGapResult,
  GapClassificationInput,
  GapClassificationResult,
  DevelopmentRecommendationDraft,
  DevelopmentLinkDraft,
  GapSeverity,
  GapPriority,
  RoleImpact,
  DevelopmentUrgency,
  DevelopmentActionType,
  HrCsfGapKind,
  HrCsfSkillRequirementClass,
} from "./hr-competency-skills-gap-calculations.shared";

async function loadLevelOrdersInTx(
  db: AfendaTransaction,
  organizationId: string,
  levelIds: readonly string[],
): Promise<Map<string, number>> {
  const uniqueIds = [...new Set(levelIds.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return new Map();
  }

  const rows = await db
    .select({
      id: hrCsfProficiencyLevels.id,
      levelOrder: hrCsfProficiencyLevels.levelOrder,
    })
    .from(hrCsfProficiencyLevels)
    .where(
      and(
        eq(hrCsfProficiencyLevels.organizationId, organizationId),
        inArray(hrCsfProficiencyLevels.id, uniqueIds),
      ),
    );

  return new Map(rows.map((row) => [row.id, row.levelOrder]));
}

export type HrCsfEmployeeGapAnalysisResult = {
  readonly gapIds: readonly string[];
  readonly skillGaps: readonly SkillGapResult[];
  readonly competencyGaps: readonly CompetencyGapResult[];
  readonly classifications: readonly GapClassificationResult[];
};

export async function analyzeHrCsfEmployeeGapsInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    employeeId: string;
    positionId?: string | null;
    departmentId?: string | null;
    grade?: string | null;
    jobRole?: string | null;
    jobFamily?: string | null;
    legalEntityCode?: string | null;
    linkageRefs?: {
      readonly courseRef?: string | null;
      readonly learningPathRef?: string | null;
      readonly certificationRef?: string | null;
      readonly coachingRef?: string | null;
      readonly developmentPlanRef?: string | null;
    };
  },
): Promise<HrCsfEmployeeGapAnalysisResult> {
  const [employee] = await db
    .select({ id: hrEmployees.id })
    .from(hrEmployees)
    .where(
      and(
        eq(hrEmployees.organizationId, input.organizationId),
        eq(hrEmployees.id, input.employeeId),
      ),
    )
    .limit(1);

  if (!employee) {
    throw new HrCsfCommandError("skill_not_found", "employee not found");
  }

  const scopeConditions = [
    input.positionId
      ? and(
          eq(hrCsfSkillRequirements.scope, "position"),
          eq(hrCsfSkillRequirements.scopeRef, input.positionId),
        )
      : undefined,
    input.departmentId
      ? and(
          eq(hrCsfSkillRequirements.scope, "department"),
          eq(hrCsfSkillRequirements.scopeRef, input.departmentId),
        )
      : undefined,
    input.grade
      ? and(
          eq(hrCsfSkillRequirements.scope, "grade"),
          eq(hrCsfSkillRequirements.scopeRef, input.grade),
        )
      : undefined,
    input.jobRole
      ? and(
          eq(hrCsfSkillRequirements.scope, "job_role"),
          eq(hrCsfSkillRequirements.scopeRef, input.jobRole),
        )
      : undefined,
    input.jobFamily
      ? and(
          eq(hrCsfSkillRequirements.scope, "job_family"),
          eq(hrCsfSkillRequirements.scopeRef, input.jobFamily),
        )
      : undefined,
    input.legalEntityCode
      ? and(
          eq(hrCsfSkillRequirements.scope, "legal_entity"),
          eq(hrCsfSkillRequirements.scopeRef, input.legalEntityCode),
        )
      : undefined,
  ].filter(Boolean);

  const skillRequirementWhere =
    scopeConditions.length > 0
      ? and(
          eq(hrCsfSkillRequirements.organizationId, input.organizationId),
          or(...scopeConditions)!,
        )
      : eq(hrCsfSkillRequirements.organizationId, input.organizationId);

  const competencyScopeConditions = scopeConditions.map((condition) => {
    if (!condition) return undefined;
    return condition;
  }).filter(Boolean);

  const competencyRequirementWhere =
    competencyScopeConditions.length > 0
      ? and(
          eq(hrCsfCompetencyRequirements.organizationId, input.organizationId),
          or(...competencyScopeConditions)!,
        )
      : eq(hrCsfCompetencyRequirements.organizationId, input.organizationId);

  const skillRequirements = await db
    .select({
      id: hrCsfSkillRequirements.id,
      skillId: hrCsfSkillRequirements.skillId,
      requirementClass: hrCsfSkillRequirements.requirementClass,
      requiredProficiencyLevelId:
        hrCsfSkillRequirements.requiredProficiencyLevelId,
      skillCode: hrCsfSkills.code,
      skillName: hrCsfSkills.name,
    })
    .from(hrCsfSkillRequirements)
    .innerJoin(hrCsfSkills, eq(hrCsfSkillRequirements.skillId, hrCsfSkills.id))
    .where(skillRequirementWhere);

  const competencyRequirements = await db
    .select({
      id: hrCsfCompetencyRequirements.id,
      competencyId: hrCsfCompetencyRequirements.competencyId,
      requiredProficiencyLevelId:
        hrCsfCompetencyRequirements.requiredProficiencyLevelId,
      competencyCode: hrCsfCompetencies.code,
      competencyName: hrCsfCompetencies.name,
    })
    .from(hrCsfCompetencyRequirements)
    .innerJoin(
      hrCsfCompetencies,
      eq(hrCsfCompetencyRequirements.competencyId, hrCsfCompetencies.id),
    )
    .where(competencyRequirementWhere);

  const skillProfiles = await db
    .select({
      skillId: hrCsfEmployeeSkillProfiles.skillId,
      currentProficiencyLevelId:
        hrCsfEmployeeSkillProfiles.currentProficiencyLevelId,
    })
    .from(hrCsfEmployeeSkillProfiles)
    .where(
      and(
        eq(hrCsfEmployeeSkillProfiles.organizationId, input.organizationId),
        eq(hrCsfEmployeeSkillProfiles.employeeId, input.employeeId),
        eq(hrCsfEmployeeSkillProfiles.profileStatus, "active"),
      ),
    );

  const competencyProfiles = await db
    .select({
      competencyId: hrCsfEmployeeCompetencyProfiles.competencyId,
      currentProficiencyLevelId:
        hrCsfEmployeeCompetencyProfiles.currentProficiencyLevelId,
    })
    .from(hrCsfEmployeeCompetencyProfiles)
    .where(
      and(
        eq(hrCsfEmployeeCompetencyProfiles.organizationId, input.organizationId),
        eq(hrCsfEmployeeCompetencyProfiles.employeeId, input.employeeId),
        eq(hrCsfEmployeeCompetencyProfiles.profileStatus, "active"),
      ),
    );

  const currentSkillLevelBySkillId = new Map(
    skillProfiles.map((row) => [row.skillId, row.currentProficiencyLevelId]),
  );
  const currentCompetencyLevelByCompetencyId = new Map(
    competencyProfiles.map((row) => [
      row.competencyId,
      row.currentProficiencyLevelId,
    ]),
  );

  const levelIds = [
    ...skillRequirements.map((row) => row.requiredProficiencyLevelId),
    ...competencyRequirements.map((row) => row.requiredProficiencyLevelId),
    ...skillProfiles.map((row) => row.currentProficiencyLevelId),
    ...competencyProfiles.map((row) => row.currentProficiencyLevelId),
  ].filter((id): id is string => Boolean(id));

  const levelOrderById = await loadLevelOrdersInTx(
    db,
    input.organizationId,
    levelIds,
  );

  const now = new Date();
  const gapIds: string[] = [];
  const skillGaps: SkillGapResult[] = [];
  const competencyGaps: CompetencyGapResult[] = [];
  const classifications: GapClassificationResult[] = [];

  for (const requirement of skillRequirements) {
    const requiredLevelOrder =
      levelOrderById.get(requirement.requiredProficiencyLevelId) ?? 0;
    if (requiredLevelOrder <= 0) continue;

    const currentLevelId =
      currentSkillLevelBySkillId.get(requirement.skillId) ?? null;
    const currentLevelOrder = currentLevelId
      ? (levelOrderById.get(currentLevelId) ?? 0)
      : 0;

    const gap = computeSkillGap({
      skillId: requirement.skillId,
      requirementClass: requirement.requirementClass,
      requiredLevelOrder,
      currentLevelOrder,
    });
    skillGaps.push(gap);

    const classification = classifyGap({
      gapKind: "skill",
      gapSize: gap.gapSize,
      hasGap: gap.hasGap,
      requirementClass: requirement.requirementClass,
    });
    classifications.push(classification);

    const gapId = await upsertHrCsfGapRecordInTx(db, {
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      gapKind: "skill",
      skillId: requirement.skillId,
      competencyId: null,
      requirementId: requirement.id,
      requirementClass: requirement.requirementClass,
      requiredProficiencyLevelId: requirement.requiredProficiencyLevelId,
      currentProficiencyLevelId: currentLevelId,
      requiredLevelOrder,
      currentLevelOrder,
      gapSize: gap.gapSize,
      hasGap: gap.hasGap,
      calculatedAt: now,
    });
    gapIds.push(gapId);

    await upsertHrCsfGapClassificationInTx(db, {
      organizationId: input.organizationId,
      gapId,
      classification,
      classifiedAt: now,
    });

    if (gap.hasGap) {
      const { createHrCsfDevelopmentRecommendationsInTx } = await import(
        "./hr-competency-skills-development"
      );
      await createHrCsfDevelopmentRecommendationsInTx(db, {
        organizationId: input.organizationId,
        gapId,
        gapKind: "skill",
        gapSize: gap.gapSize,
        targetLabel: requirement.skillName,
        targetCode: requirement.skillCode,
        classification,
        recommendedAt: now,
        linkageRefs: input.linkageRefs,
      });
    }
  }

  for (const requirement of competencyRequirements) {
    const requiredLevelOrder =
      levelOrderById.get(requirement.requiredProficiencyLevelId) ?? 0;
    if (requiredLevelOrder <= 0) continue;

    const currentLevelId =
      currentCompetencyLevelByCompetencyId.get(requirement.competencyId) ??
      null;
    const currentLevelOrder = currentLevelId
      ? (levelOrderById.get(currentLevelId) ?? 0)
      : 0;

    const gap = computeCompetencyGap({
      competencyId: requirement.competencyId,
      requiredLevelOrder,
      currentLevelOrder,
    });
    competencyGaps.push(gap);

    const classification = classifyGap({
      gapKind: "competency",
      gapSize: gap.gapSize,
      hasGap: gap.hasGap,
    });
    classifications.push(classification);

    const gapId = await upsertHrCsfGapRecordInTx(db, {
      organizationId: input.organizationId,
      employeeId: input.employeeId,
      gapKind: "competency",
      skillId: null,
      competencyId: requirement.competencyId,
      requirementId: requirement.id,
      requirementClass: null,
      requiredProficiencyLevelId: requirement.requiredProficiencyLevelId,
      currentProficiencyLevelId: currentLevelId,
      requiredLevelOrder,
      currentLevelOrder,
      gapSize: gap.gapSize,
      hasGap: gap.hasGap,
      calculatedAt: now,
    });
    gapIds.push(gapId);

    await upsertHrCsfGapClassificationInTx(db, {
      organizationId: input.organizationId,
      gapId,
      classification,
      classifiedAt: now,
    });

    if (gap.hasGap) {
      const { createHrCsfDevelopmentRecommendationsInTx } = await import(
        "./hr-competency-skills-development"
      );
      await createHrCsfDevelopmentRecommendationsInTx(db, {
        organizationId: input.organizationId,
        gapId,
        gapKind: "competency",
        gapSize: gap.gapSize,
        targetLabel: requirement.competencyName,
        targetCode: requirement.competencyCode,
        classification,
        recommendedAt: now,
        linkageRefs: input.linkageRefs,
      });
    }
  }

  await appendHrCsfAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.csf.gap.analyzed",
    summary: `Analyzed ${gapIds.length} gap record(s) for employee ${input.employeeId}`,
    metadata: {
      employeeId: input.employeeId,
      gapCount: gapIds.length,
      openGapCount: skillGaps.filter((g) => g.hasGap).length +
        competencyGaps.filter((g) => g.hasGap).length,
    },
  });

  return { gapIds, skillGaps, competencyGaps, classifications };
}

async function upsertHrCsfGapRecordInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
    gapKind: "skill" | "competency";
    skillId: string | null;
    competencyId: string | null;
    requirementId: string;
    requirementClass: (typeof hrCsfGaps.$inferInsert)["requirementClass"];
    requiredProficiencyLevelId: string;
    currentProficiencyLevelId: string | null;
    requiredLevelOrder: number;
    currentLevelOrder: number;
    gapSize: number;
    hasGap: boolean;
    calculatedAt: Date;
  },
): Promise<string> {
  const [existing] = await db
    .select({ id: hrCsfGaps.id })
    .from(hrCsfGaps)
    .where(
      and(
        eq(hrCsfGaps.organizationId, input.organizationId),
        eq(hrCsfGaps.employeeId, input.employeeId),
        eq(hrCsfGaps.gapKind, input.gapKind),
        eq(hrCsfGaps.requirementId, input.requirementId),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(hrCsfGaps)
      .set({
        skillId: input.skillId,
        competencyId: input.competencyId,
        requirementClass: input.requirementClass,
        requiredProficiencyLevelId: input.requiredProficiencyLevelId,
        currentProficiencyLevelId: input.currentProficiencyLevelId,
        requiredLevelOrder: input.requiredLevelOrder,
        currentLevelOrder: input.currentLevelOrder,
        gapSize: input.gapSize,
        hasGap: input.hasGap,
        gapStatus: input.hasGap ? "open" : "closed",
        calculatedAt: input.calculatedAt,
      })
      .where(eq(hrCsfGaps.id, existing.id));
    return existing.id;
  }

  const gapId = createEntityId("hr_csf_gap");
  await db.insert(hrCsfGaps).values({
    id: gapId,
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    gapKind: input.gapKind,
    skillId: input.skillId,
    competencyId: input.competencyId,
    requirementId: input.requirementId,
    requirementClass: input.requirementClass,
    requiredProficiencyLevelId: input.requiredProficiencyLevelId,
    currentProficiencyLevelId: input.currentProficiencyLevelId,
    requiredLevelOrder: input.requiredLevelOrder,
    currentLevelOrder: input.currentLevelOrder,
    gapSize: input.gapSize,
    hasGap: input.hasGap,
    gapStatus: input.hasGap ? "open" : "closed",
    calculatedAt: input.calculatedAt,
  });

  return gapId;
}

async function upsertHrCsfGapClassificationInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    gapId: string;
    classification: GapClassificationResult;
    classifiedAt: Date;
  },
): Promise<void> {
  const [existing] = await db
    .select({ id: hrCsfGapClassifications.id })
    .from(hrCsfGapClassifications)
    .where(
      and(
        eq(hrCsfGapClassifications.organizationId, input.organizationId),
        eq(hrCsfGapClassifications.gapId, input.gapId),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(hrCsfGapClassifications)
      .set({
        severity: input.classification.severity,
        priority: input.classification.priority,
        roleImpact: input.classification.roleImpact,
        developmentUrgency: input.classification.developmentUrgency,
        rationale: input.classification.rationale,
        classifiedAt: input.classifiedAt,
      })
      .where(eq(hrCsfGapClassifications.id, existing.id));
    return;
  }

  await db.insert(hrCsfGapClassifications).values({
    id: createEntityId("hr_csf_gap_class"),
    organizationId: input.organizationId,
    gapId: input.gapId,
    severity: input.classification.severity,
    priority: input.classification.priority,
    roleImpact: input.classification.roleImpact,
    developmentUrgency: input.classification.developmentUrgency,
    rationale: input.classification.rationale,
    classifiedAt: input.classifiedAt,
  });
}

export type HrCsfGapListRow = {
  id: string;
  employeeId: string;
  gapKind: (typeof hrCsfGaps.$inferSelect)["gapKind"];
  skillId: string | null;
  competencyId: string | null;
  requirementId: string;
  requirementClass: (typeof hrCsfGaps.$inferSelect)["requirementClass"];
  requiredLevelOrder: number;
  currentLevelOrder: number;
  gapSize: number;
  hasGap: boolean;
  gapStatus: (typeof hrCsfGaps.$inferSelect)["gapStatus"];
  calculatedAt: Date;
  severity: (typeof hrCsfGapClassifications.$inferSelect)["severity"] | null;
  priority: (typeof hrCsfGapClassifications.$inferSelect)["priority"] | null;
  roleImpact: (typeof hrCsfGapClassifications.$inferSelect)["roleImpact"] | null;
  developmentUrgency:
    | (typeof hrCsfGapClassifications.$inferSelect)["developmentUrgency"]
    | null;
};

export async function listHrCsfEmployeeGapsWindow(input: {
  organizationId: string;
  employeeId?: string;
  hasGapOnly?: boolean;
  limit?: number;
  offset?: number;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [eq(hrCsfGaps.organizationId, input.organizationId)];

    if (input.employeeId) {
      conditions.push(eq(hrCsfGaps.employeeId, input.employeeId));
    }
    if (input.hasGapOnly) {
      conditions.push(eq(hrCsfGaps.hasGap, true));
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrCsfGaps)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrCsfGaps.id,
        employeeId: hrCsfGaps.employeeId,
        gapKind: hrCsfGaps.gapKind,
        skillId: hrCsfGaps.skillId,
        competencyId: hrCsfGaps.competencyId,
        requirementId: hrCsfGaps.requirementId,
        requirementClass: hrCsfGaps.requirementClass,
        requiredLevelOrder: hrCsfGaps.requiredLevelOrder,
        currentLevelOrder: hrCsfGaps.currentLevelOrder,
        gapSize: hrCsfGaps.gapSize,
        hasGap: hrCsfGaps.hasGap,
        gapStatus: hrCsfGaps.gapStatus,
        calculatedAt: hrCsfGaps.calculatedAt,
        severity: hrCsfGapClassifications.severity,
        priority: hrCsfGapClassifications.priority,
        roleImpact: hrCsfGapClassifications.roleImpact,
        developmentUrgency: hrCsfGapClassifications.developmentUrgency,
      })
      .from(hrCsfGaps)
      .leftJoin(
        hrCsfGapClassifications,
        eq(hrCsfGaps.id, hrCsfGapClassifications.gapId),
      )
      .where(whereClause)
      .orderBy(desc(hrCsfGaps.calculatedAt))
      .limit(pageSize)
      .offset(offset);

    return buildPaginatedWindow({
      rows,
      pageSize,
      offset,
      totalCount: Number(totalRow?.total ?? 0),
    });
  });
}

export async function getHrCsfGapDetail(input: {
  organizationId: string;
  gapId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select({
        gap: hrCsfGaps,
        classification: hrCsfGapClassifications,
      })
      .from(hrCsfGaps)
      .leftJoin(
        hrCsfGapClassifications,
        eq(hrCsfGaps.id, hrCsfGapClassifications.gapId),
      )
      .where(
        and(
          eq(hrCsfGaps.organizationId, input.organizationId),
          eq(hrCsfGaps.id, input.gapId),
        ),
      )
      .limit(1);

    return row ?? null;
  });
}
