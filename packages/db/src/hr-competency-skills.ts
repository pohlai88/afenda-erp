import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { buildPaginatedWindow, clampPageSize } from "./hr-benefits.shared";
import { appendHrCsfAuditEventInTx } from "./hr-competency-skills-audit";
import {
  assertHrCsfRequirementScopeFields,
  deriveHrCsfRequirementScopeRef,
} from "./hr-competency-skills-scope.shared";
import {
  assertHrCsfProficiencyLevels,
  HrCsfCommandError,
  type HrCsfProficiencyLevelInput,
} from "./hr-competency-skills.shared";
import {
  hrCsfCompetencies,
  hrCsfCompetencyRequirements,
  hrCsfProficiencyLevels,
  hrCsfProficiencyScales,
  hrCsfSkillRequirements,
  hrCsfSkills,
} from "./hr-competency-skills";

export {
  HrCsfCommandError,
  assertHrCsfProficiencyLevels,
  type HrCsfProficiencyLevelInput,
} from "./hr-competency-skills.shared";

export {
  assertHrCsfRequirementScopeFields,
  deriveHrCsfRequirementScopeRef,
  HrCsfScopeError,
  type HrCsfRequirementScopeInput,
} from "./hr-competency-skills-scope.shared";

export {
  appendHrCsfAuditEventInTx,
  listHrCsfAuditTrailWindow,
} from "./hr-competency-skills-audit";

async function assertHrCsfProficiencyScaleExistsInTx(
  db: AfendaTransaction,
  organizationId: string,
  scaleId: string,
): Promise<(typeof hrCsfProficiencyScales.$inferSelect)> {
  const [scale] = await db
    .select()
    .from(hrCsfProficiencyScales)
    .where(
      and(
        eq(hrCsfProficiencyScales.organizationId, organizationId),
        eq(hrCsfProficiencyScales.id, scaleId),
      ),
    )
    .limit(1);

  if (!scale) {
    throw new HrCsfCommandError("scale_not_found");
  }

  return scale;
}

async function assertHrCsfProficiencyLevelBelongsToScaleInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    scaleId: string;
    levelId: string;
  },
): Promise<(typeof hrCsfProficiencyLevels.$inferSelect)> {
  const [level] = await db
    .select()
    .from(hrCsfProficiencyLevels)
    .where(
      and(
        eq(hrCsfProficiencyLevels.organizationId, input.organizationId),
        eq(hrCsfProficiencyLevels.id, input.levelId),
        eq(hrCsfProficiencyLevels.scaleId, input.scaleId),
      ),
    )
    .limit(1);

  if (!level) {
    throw new HrCsfCommandError("invalid_proficiency_level");
  }

  return level;
}

async function assertHrCsfCompetencyExistsInTx(
  db: AfendaTransaction,
  organizationId: string,
  competencyId: string,
): Promise<(typeof hrCsfCompetencies.$inferSelect)> {
  const [competency] = await db
    .select()
    .from(hrCsfCompetencies)
    .where(
      and(
        eq(hrCsfCompetencies.organizationId, organizationId),
        eq(hrCsfCompetencies.id, competencyId),
      ),
    )
    .limit(1);

  if (!competency) {
    throw new HrCsfCommandError("competency_not_found");
  }

  return competency;
}

async function assertHrCsfSkillExistsInTx(
  db: AfendaTransaction,
  organizationId: string,
  skillId: string,
): Promise<(typeof hrCsfSkills.$inferSelect)> {
  const [skill] = await db
    .select()
    .from(hrCsfSkills)
    .where(
      and(
        eq(hrCsfSkills.organizationId, organizationId),
        eq(hrCsfSkills.id, skillId),
      ),
    )
    .limit(1);

  if (!skill) {
    throw new HrCsfCommandError("skill_not_found");
  }

  return skill;
}

export type CreateHrCsfProficiencyScaleInput = {
  organizationId: string;
  actorUserId: string;
  code: string;
  name: string;
  description?: string | null;
  scaleStatus?: (typeof hrCsfProficiencyScales.$inferInsert)["scaleStatus"];
  levels: readonly HrCsfProficiencyLevelInput[];
};

export async function createHrCsfProficiencyScaleInTx(
  db: AfendaTransaction,
  input: CreateHrCsfProficiencyScaleInput,
): Promise<{ scaleId: string; levelIds: string[] }> {
  assertHrCsfProficiencyLevels(input.levels);

  const scaleId = createEntityId("hr_csf_scale");
  const levelIds: string[] = [];

  await db.insert(hrCsfProficiencyScales).values({
    id: scaleId,
    organizationId: input.organizationId,
    code: input.code.trim(),
    name: input.name.trim(),
    description: input.description?.trim() ?? null,
    scaleStatus: input.scaleStatus ?? "draft",
  });

  for (const level of input.levels) {
    const levelId = createEntityId("hr_csf_level");
    levelIds.push(levelId);
    await db.insert(hrCsfProficiencyLevels).values({
      id: levelId,
      organizationId: input.organizationId,
      scaleId,
      levelOrder: level.levelOrder,
      code: level.code.trim(),
      name: level.name.trim(),
      description: level.description.trim(),
      assessmentCriteria: level.assessmentCriteria.trim(),
    });
  }

  await appendHrCsfAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.csf.scale.create",
    proficiencyScaleId: scaleId,
    summary: `Created proficiency scale ${input.code}`,
    metadata: { levelCount: levelIds.length },
  });

  return { scaleId, levelIds };
}

export type UpdateHrCsfProficiencyScaleInput = {
  organizationId: string;
  actorUserId: string;
  scaleId: string;
  name?: string;
  description?: string | null;
  scaleStatus?: (typeof hrCsfProficiencyScales.$inferInsert)["scaleStatus"];
  levels?: readonly HrCsfProficiencyLevelInput[];
};

export async function updateHrCsfProficiencyScaleInTx(
  db: AfendaTransaction,
  input: UpdateHrCsfProficiencyScaleInput,
): Promise<{ scaleId: string }> {
  const scale = await assertHrCsfProficiencyScaleExistsInTx(
    db,
    input.organizationId,
    input.scaleId,
  );

  const updates: Partial<typeof hrCsfProficiencyScales.$inferInsert> = {};
  if (input.name != null) updates.name = input.name.trim();
  if (input.description !== undefined) {
    updates.description = input.description?.trim() ?? null;
  }
  if (input.scaleStatus != null) updates.scaleStatus = input.scaleStatus;

  if (Object.keys(updates).length > 0) {
    await db
      .update(hrCsfProficiencyScales)
      .set(updates)
      .where(eq(hrCsfProficiencyScales.id, input.scaleId));
  }

  if (input.levels) {
    assertHrCsfProficiencyLevels(input.levels);

    for (const level of input.levels) {
      const [existing] = await db
        .select({ id: hrCsfProficiencyLevels.id })
        .from(hrCsfProficiencyLevels)
        .where(
          and(
            eq(hrCsfProficiencyLevels.organizationId, input.organizationId),
            eq(hrCsfProficiencyLevels.scaleId, input.scaleId),
            eq(hrCsfProficiencyLevels.code, level.code.trim()),
          ),
        )
        .limit(1);

      if (existing) {
        await db
          .update(hrCsfProficiencyLevels)
          .set({
            levelOrder: level.levelOrder,
            name: level.name.trim(),
            description: level.description.trim(),
            assessmentCriteria: level.assessmentCriteria.trim(),
          })
          .where(eq(hrCsfProficiencyLevels.id, existing.id));
      } else {
        await db.insert(hrCsfProficiencyLevels).values({
          id: createEntityId("hr_csf_level"),
          organizationId: input.organizationId,
          scaleId: input.scaleId,
          levelOrder: level.levelOrder,
          code: level.code.trim(),
          name: level.name.trim(),
          description: level.description.trim(),
          assessmentCriteria: level.assessmentCriteria.trim(),
        });
      }
    }
  }

  if (Object.keys(updates).length > 0 || input.levels) {
    await appendHrCsfAuditEventInTx(db, {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      action: "hr.csf.scale.update",
      proficiencyScaleId: input.scaleId,
      summary: `Updated proficiency scale ${scale.code}`,
      metadata: {
        updatedFields: Object.keys(updates),
        levelsReplaced: input.levels != null,
      },
    });
  }

  return { scaleId: input.scaleId };
}

export async function getHrCsfProficiencyScaleWithLevels(input: {
  organizationId: string;
  scaleId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [scale] = await db
      .select()
      .from(hrCsfProficiencyScales)
      .where(
        and(
          eq(hrCsfProficiencyScales.organizationId, input.organizationId),
          eq(hrCsfProficiencyScales.id, input.scaleId),
        ),
      )
      .limit(1);

    if (!scale) return null;

    const levels = await db
      .select()
      .from(hrCsfProficiencyLevels)
      .where(
        and(
          eq(hrCsfProficiencyLevels.organizationId, input.organizationId),
          eq(hrCsfProficiencyLevels.scaleId, input.scaleId),
        ),
      )
      .orderBy(asc(hrCsfProficiencyLevels.levelOrder));

    return { scale, levels };
  });
}

export async function listHrCsfProficiencyScalesWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  scaleStatus?: (typeof hrCsfProficiencyScales.$inferSelect)["scaleStatus"];
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrCsfProficiencyScales.organizationId, input.organizationId),
    ];

    if (input.scaleStatus) {
      conditions.push(eq(hrCsfProficiencyScales.scaleStatus, input.scaleStatus));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrCsfProficiencyScales.code, pattern),
          ilike(hrCsfProficiencyScales.name, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrCsfProficiencyScales)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrCsfProficiencyScales.id,
        code: hrCsfProficiencyScales.code,
        name: hrCsfProficiencyScales.name,
        description: hrCsfProficiencyScales.description,
        scaleStatus: hrCsfProficiencyScales.scaleStatus,
      })
      .from(hrCsfProficiencyScales)
      .where(whereClause)
      .orderBy(desc(hrCsfProficiencyScales.createdAt))
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

export type CreateHrCsfCompetencyInput = {
  organizationId: string;
  actorUserId: string;
  code: string;
  name: string;
  category: (typeof hrCsfCompetencies.$inferInsert)["category"];
  description?: string | null;
  libraryStatus?: (typeof hrCsfCompetencies.$inferInsert)["libraryStatus"];
  proficiencyScaleId: string;
};

export async function createHrCsfCompetencyInTx(
  db: AfendaTransaction,
  input: CreateHrCsfCompetencyInput,
): Promise<{ competencyId: string }> {
  await assertHrCsfProficiencyScaleExistsInTx(
    db,
    input.organizationId,
    input.proficiencyScaleId,
  );

  const competencyId = createEntityId("hr_csf_comp");

  await db.insert(hrCsfCompetencies).values({
    id: competencyId,
    organizationId: input.organizationId,
    code: input.code.trim(),
    name: input.name.trim(),
    category: input.category,
    description: input.description?.trim() ?? null,
    libraryStatus: input.libraryStatus ?? "draft",
    proficiencyScaleId: input.proficiencyScaleId,
  });

  await appendHrCsfAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.csf.competency.create",
    competencyId,
    proficiencyScaleId: input.proficiencyScaleId,
    summary: `Created competency ${input.code}`,
    metadata: { category: input.category },
  });

  return { competencyId };
}

export type UpdateHrCsfCompetencyInput = {
  organizationId: string;
  actorUserId: string;
  competencyId: string;
  name?: string;
  category?: (typeof hrCsfCompetencies.$inferInsert)["category"];
  description?: string | null;
  libraryStatus?: (typeof hrCsfCompetencies.$inferInsert)["libraryStatus"];
  proficiencyScaleId?: string;
};

export async function updateHrCsfCompetencyInTx(
  db: AfendaTransaction,
  input: UpdateHrCsfCompetencyInput,
): Promise<{ competencyId: string }> {
  const competency = await assertHrCsfCompetencyExistsInTx(
    db,
    input.organizationId,
    input.competencyId,
  );

  if (input.proficiencyScaleId) {
    await assertHrCsfProficiencyScaleExistsInTx(
      db,
      input.organizationId,
      input.proficiencyScaleId,
    );
  }

  const updates: Partial<typeof hrCsfCompetencies.$inferInsert> = {};
  if (input.name != null) updates.name = input.name.trim();
  if (input.category != null) updates.category = input.category;
  if (input.description !== undefined) {
    updates.description = input.description?.trim() ?? null;
  }
  if (input.libraryStatus != null) updates.libraryStatus = input.libraryStatus;
  if (input.proficiencyScaleId != null) {
    updates.proficiencyScaleId = input.proficiencyScaleId;
  }

  if (Object.keys(updates).length === 0) {
    return { competencyId: input.competencyId };
  }

  await db
    .update(hrCsfCompetencies)
    .set(updates)
    .where(eq(hrCsfCompetencies.id, input.competencyId));

  await appendHrCsfAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.csf.competency.update",
    competencyId: input.competencyId,
    summary: `Updated competency ${competency.code}`,
    metadata: { updates: Object.keys(updates) },
  });

  return { competencyId: input.competencyId };
}

export async function getHrCsfCompetencySummary(input: {
  organizationId: string;
  competencyId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select({
        id: hrCsfCompetencies.id,
        code: hrCsfCompetencies.code,
        name: hrCsfCompetencies.name,
        category: hrCsfCompetencies.category,
        description: hrCsfCompetencies.description,
        libraryStatus: hrCsfCompetencies.libraryStatus,
        proficiencyScaleId: hrCsfCompetencies.proficiencyScaleId,
        scaleCode: hrCsfProficiencyScales.code,
        scaleName: hrCsfProficiencyScales.name,
      })
      .from(hrCsfCompetencies)
      .innerJoin(
        hrCsfProficiencyScales,
        eq(hrCsfCompetencies.proficiencyScaleId, hrCsfProficiencyScales.id),
      )
      .where(
        and(
          eq(hrCsfCompetencies.organizationId, input.organizationId),
          eq(hrCsfCompetencies.id, input.competencyId),
        ),
      )
      .limit(1);

    return row ?? null;
  });
}

export async function listHrCsfCompetenciesWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  category?: (typeof hrCsfCompetencies.$inferSelect)["category"];
  libraryStatus?: (typeof hrCsfCompetencies.$inferSelect)["libraryStatus"];
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrCsfCompetencies.organizationId, input.organizationId),
    ];

    if (input.category) {
      conditions.push(eq(hrCsfCompetencies.category, input.category));
    }
    if (input.libraryStatus) {
      conditions.push(eq(hrCsfCompetencies.libraryStatus, input.libraryStatus));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrCsfCompetencies.code, pattern),
          ilike(hrCsfCompetencies.name, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrCsfCompetencies)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrCsfCompetencies.id,
        code: hrCsfCompetencies.code,
        name: hrCsfCompetencies.name,
        category: hrCsfCompetencies.category,
        libraryStatus: hrCsfCompetencies.libraryStatus,
        proficiencyScaleId: hrCsfCompetencies.proficiencyScaleId,
      })
      .from(hrCsfCompetencies)
      .where(whereClause)
      .orderBy(desc(hrCsfCompetencies.createdAt))
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

export type CreateHrCsfSkillInput = {
  organizationId: string;
  actorUserId: string;
  code: string;
  name: string;
  category: (typeof hrCsfSkills.$inferInsert)["category"];
  description?: string | null;
  libraryStatus?: (typeof hrCsfSkills.$inferInsert)["libraryStatus"];
  proficiencyScaleId: string;
};

export async function createHrCsfSkillInTx(
  db: AfendaTransaction,
  input: CreateHrCsfSkillInput,
): Promise<{ skillId: string }> {
  await assertHrCsfProficiencyScaleExistsInTx(
    db,
    input.organizationId,
    input.proficiencyScaleId,
  );

  const skillId = createEntityId("hr_csf_skill");

  await db.insert(hrCsfSkills).values({
    id: skillId,
    organizationId: input.organizationId,
    code: input.code.trim(),
    name: input.name.trim(),
    category: input.category,
    description: input.description?.trim() ?? null,
    libraryStatus: input.libraryStatus ?? "draft",
    proficiencyScaleId: input.proficiencyScaleId,
  });

  await appendHrCsfAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.csf.skill.create",
    skillId,
    proficiencyScaleId: input.proficiencyScaleId,
    summary: `Created skill ${input.code}`,
    metadata: { category: input.category },
  });

  return { skillId };
}

export type UpdateHrCsfSkillInput = {
  organizationId: string;
  actorUserId: string;
  skillId: string;
  name?: string;
  category?: (typeof hrCsfSkills.$inferInsert)["category"];
  description?: string | null;
  libraryStatus?: (typeof hrCsfSkills.$inferInsert)["libraryStatus"];
  proficiencyScaleId?: string;
};

export async function updateHrCsfSkillInTx(
  db: AfendaTransaction,
  input: UpdateHrCsfSkillInput,
): Promise<{ skillId: string }> {
  const skill = await assertHrCsfSkillExistsInTx(
    db,
    input.organizationId,
    input.skillId,
  );

  if (input.proficiencyScaleId) {
    await assertHrCsfProficiencyScaleExistsInTx(
      db,
      input.organizationId,
      input.proficiencyScaleId,
    );
  }

  const updates: Partial<typeof hrCsfSkills.$inferInsert> = {};
  if (input.name != null) updates.name = input.name.trim();
  if (input.category != null) updates.category = input.category;
  if (input.description !== undefined) {
    updates.description = input.description?.trim() ?? null;
  }
  if (input.libraryStatus != null) updates.libraryStatus = input.libraryStatus;
  if (input.proficiencyScaleId != null) {
    updates.proficiencyScaleId = input.proficiencyScaleId;
  }

  if (Object.keys(updates).length === 0) {
    return { skillId: input.skillId };
  }

  await db
    .update(hrCsfSkills)
    .set(updates)
    .where(eq(hrCsfSkills.id, input.skillId));

  await appendHrCsfAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.csf.skill.update",
    skillId: input.skillId,
    summary: `Updated skill ${skill.code}`,
    metadata: { updates: Object.keys(updates) },
  });

  return { skillId: input.skillId };
}

export async function getHrCsfSkillSummary(input: {
  organizationId: string;
  skillId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select({
        id: hrCsfSkills.id,
        code: hrCsfSkills.code,
        name: hrCsfSkills.name,
        category: hrCsfSkills.category,
        description: hrCsfSkills.description,
        libraryStatus: hrCsfSkills.libraryStatus,
        proficiencyScaleId: hrCsfSkills.proficiencyScaleId,
        scaleCode: hrCsfProficiencyScales.code,
        scaleName: hrCsfProficiencyScales.name,
      })
      .from(hrCsfSkills)
      .innerJoin(
        hrCsfProficiencyScales,
        eq(hrCsfSkills.proficiencyScaleId, hrCsfProficiencyScales.id),
      )
      .where(
        and(
          eq(hrCsfSkills.organizationId, input.organizationId),
          eq(hrCsfSkills.id, input.skillId),
        ),
      )
      .limit(1);

    return row ?? null;
  });
}

export async function listHrCsfSkillsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  category?: (typeof hrCsfSkills.$inferSelect)["category"];
  libraryStatus?: (typeof hrCsfSkills.$inferSelect)["libraryStatus"];
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [eq(hrCsfSkills.organizationId, input.organizationId)];

    if (input.category) {
      conditions.push(eq(hrCsfSkills.category, input.category));
    }
    if (input.libraryStatus) {
      conditions.push(eq(hrCsfSkills.libraryStatus, input.libraryStatus));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrCsfSkills.code, pattern),
          ilike(hrCsfSkills.name, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrCsfSkills)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrCsfSkills.id,
        code: hrCsfSkills.code,
        name: hrCsfSkills.name,
        category: hrCsfSkills.category,
        libraryStatus: hrCsfSkills.libraryStatus,
        proficiencyScaleId: hrCsfSkills.proficiencyScaleId,
      })
      .from(hrCsfSkills)
      .where(whereClause)
      .orderBy(desc(hrCsfSkills.createdAt))
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

export type UpsertHrCsfCompetencyRequirementInput = {
  organizationId: string;
  actorUserId: string;
  competencyId: string;
  scope: (typeof hrCsfCompetencyRequirements.$inferInsert)["scope"];
  requiredProficiencyLevelId: string;
  scopeRef?: string | null;
  jobRole?: string | null;
  jobFamily?: string | null;
  grade?: string | null;
  positionId?: string | null;
  departmentId?: string | null;
  legalEntityCode?: string | null;
  notes?: string | null;
  requirementId?: string | null;
};

export async function upsertHrCsfCompetencyRequirementInTx(
  db: AfendaTransaction,
  input: UpsertHrCsfCompetencyRequirementInput,
): Promise<{ requirementId: string }> {
  const competency = await assertHrCsfCompetencyExistsInTx(
    db,
    input.organizationId,
    input.competencyId,
  );

  try {
    assertHrCsfRequirementScopeFields(input);
  } catch {
    throw new HrCsfCommandError("invalid_requirement_scope");
  }

  const scopeRef = deriveHrCsfRequirementScopeRef(input);

  await assertHrCsfProficiencyLevelBelongsToScaleInTx(db, {
    organizationId: input.organizationId,
    scaleId: competency.proficiencyScaleId,
    levelId: input.requiredProficiencyLevelId,
  });

  if (input.requirementId) {
    const [existing] = await db
      .select({ id: hrCsfCompetencyRequirements.id })
      .from(hrCsfCompetencyRequirements)
      .where(
        and(
          eq(hrCsfCompetencyRequirements.organizationId, input.organizationId),
          eq(hrCsfCompetencyRequirements.id, input.requirementId),
          eq(hrCsfCompetencyRequirements.competencyId, input.competencyId),
        ),
      )
      .limit(1);

    if (!existing) {
      throw new HrCsfCommandError("requirement_not_found");
    }

    await db
      .update(hrCsfCompetencyRequirements)
      .set({
        scope: input.scope,
        scopeRef,
        jobRole: input.jobRole?.trim() ?? null,
        jobFamily: input.jobFamily?.trim() ?? null,
        grade: input.grade?.trim() ?? null,
        positionId: input.positionId ?? null,
        departmentId: input.departmentId ?? null,
        legalEntityCode: input.legalEntityCode?.trim() ?? null,
        requiredProficiencyLevelId: input.requiredProficiencyLevelId,
        notes: input.notes?.trim() ?? null,
      })
      .where(eq(hrCsfCompetencyRequirements.id, input.requirementId));

    await appendHrCsfAuditEventInTx(db, {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      action: "hr.csf.competency_requirement.update",
      competencyId: input.competencyId,
      requirementId: input.requirementId,
      summary: `Updated competency requirement for ${competency.code}`,
      metadata: { scope: input.scope, scopeRef },
    });

    return { requirementId: input.requirementId };
  }

  const requirementId = createEntityId("hr_csf_comp_req");

  await db.insert(hrCsfCompetencyRequirements).values({
    id: requirementId,
    organizationId: input.organizationId,
    competencyId: input.competencyId,
    scope: input.scope,
    scopeRef,
    jobRole: input.jobRole?.trim() ?? null,
    jobFamily: input.jobFamily?.trim() ?? null,
    grade: input.grade?.trim() ?? null,
    positionId: input.positionId ?? null,
    departmentId: input.departmentId ?? null,
    legalEntityCode: input.legalEntityCode?.trim() ?? null,
    requiredProficiencyLevelId: input.requiredProficiencyLevelId,
    notes: input.notes?.trim() ?? null,
  });

  await appendHrCsfAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.csf.competency_requirement.create",
    competencyId: input.competencyId,
    requirementId,
    summary: `Mapped competency ${competency.code} to ${input.scope}`,
    metadata: { scope: input.scope, scopeRef },
  });

  return { requirementId };
}

export async function listHrCsfCompetencyRequirementsWindow(input: {
  organizationId: string;
  competencyId?: string | null;
  scope?: (typeof hrCsfCompetencyRequirements.$inferSelect)["scope"];
  scopeRef?: string | null;
  limit?: number;
  offset?: number;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrCsfCompetencyRequirements.organizationId, input.organizationId),
    ];

    if (input.competencyId) {
      conditions.push(
        eq(hrCsfCompetencyRequirements.competencyId, input.competencyId),
      );
    }
    if (input.scope) {
      conditions.push(eq(hrCsfCompetencyRequirements.scope, input.scope));
    }
    if (input.scopeRef) {
      conditions.push(
        eq(hrCsfCompetencyRequirements.scopeRef, input.scopeRef.trim()),
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrCsfCompetencyRequirements)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrCsfCompetencyRequirements.id,
        competencyId: hrCsfCompetencyRequirements.competencyId,
        competencyCode: hrCsfCompetencies.code,
        competencyName: hrCsfCompetencies.name,
        scope: hrCsfCompetencyRequirements.scope,
        scopeRef: hrCsfCompetencyRequirements.scopeRef,
        requiredProficiencyLevelId:
          hrCsfCompetencyRequirements.requiredProficiencyLevelId,
        levelCode: hrCsfProficiencyLevels.code,
        levelName: hrCsfProficiencyLevels.name,
        levelOrder: hrCsfProficiencyLevels.levelOrder,
        notes: hrCsfCompetencyRequirements.notes,
      })
      .from(hrCsfCompetencyRequirements)
      .innerJoin(
        hrCsfCompetencies,
        eq(hrCsfCompetencyRequirements.competencyId, hrCsfCompetencies.id),
      )
      .innerJoin(
        hrCsfProficiencyLevels,
        eq(
          hrCsfCompetencyRequirements.requiredProficiencyLevelId,
          hrCsfProficiencyLevels.id,
        ),
      )
      .where(whereClause)
      .orderBy(desc(hrCsfCompetencyRequirements.createdAt))
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

export type UpsertHrCsfSkillRequirementInput = {
  organizationId: string;
  actorUserId: string;
  skillId: string;
  scope: (typeof hrCsfSkillRequirements.$inferInsert)["scope"];
  requiredProficiencyLevelId: string;
  requirementClass?: (typeof hrCsfSkillRequirements.$inferInsert)["requirementClass"];
  scopeRef?: string | null;
  jobRole?: string | null;
  jobFamily?: string | null;
  grade?: string | null;
  positionId?: string | null;
  departmentId?: string | null;
  legalEntityCode?: string | null;
  notes?: string | null;
  requirementId?: string | null;
};

export async function upsertHrCsfSkillRequirementInTx(
  db: AfendaTransaction,
  input: UpsertHrCsfSkillRequirementInput,
): Promise<{ requirementId: string }> {
  const skill = await assertHrCsfSkillExistsInTx(
    db,
    input.organizationId,
    input.skillId,
  );

  try {
    assertHrCsfRequirementScopeFields(input);
  } catch {
    throw new HrCsfCommandError("invalid_requirement_scope");
  }

  const scopeRef = deriveHrCsfRequirementScopeRef(input);

  await assertHrCsfProficiencyLevelBelongsToScaleInTx(db, {
    organizationId: input.organizationId,
    scaleId: skill.proficiencyScaleId,
    levelId: input.requiredProficiencyLevelId,
  });

  const requirementClass = input.requirementClass ?? "mandatory";

  if (input.requirementId) {
    const [existing] = await db
      .select({ id: hrCsfSkillRequirements.id })
      .from(hrCsfSkillRequirements)
      .where(
        and(
          eq(hrCsfSkillRequirements.organizationId, input.organizationId),
          eq(hrCsfSkillRequirements.id, input.requirementId),
          eq(hrCsfSkillRequirements.skillId, input.skillId),
        ),
      )
      .limit(1);

    if (!existing) {
      throw new HrCsfCommandError("requirement_not_found");
    }

    await db
      .update(hrCsfSkillRequirements)
      .set({
        scope: input.scope,
        scopeRef,
        jobRole: input.jobRole?.trim() ?? null,
        jobFamily: input.jobFamily?.trim() ?? null,
        grade: input.grade?.trim() ?? null,
        positionId: input.positionId ?? null,
        departmentId: input.departmentId ?? null,
        legalEntityCode: input.legalEntityCode?.trim() ?? null,
        requirementClass,
        requiredProficiencyLevelId: input.requiredProficiencyLevelId,
        notes: input.notes?.trim() ?? null,
      })
      .where(eq(hrCsfSkillRequirements.id, input.requirementId));

    await appendHrCsfAuditEventInTx(db, {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      action: "hr.csf.skill_requirement.update",
      skillId: input.skillId,
      requirementId: input.requirementId,
      summary: `Updated skill requirement for ${skill.code}`,
      metadata: { scope: input.scope, scopeRef, requirementClass },
    });

    return { requirementId: input.requirementId };
  }

  const requirementId = createEntityId("hr_csf_skill_req");

  await db.insert(hrCsfSkillRequirements).values({
    id: requirementId,
    organizationId: input.organizationId,
    skillId: input.skillId,
    scope: input.scope,
    scopeRef,
    jobRole: input.jobRole?.trim() ?? null,
    jobFamily: input.jobFamily?.trim() ?? null,
    grade: input.grade?.trim() ?? null,
    positionId: input.positionId ?? null,
    departmentId: input.departmentId ?? null,
    legalEntityCode: input.legalEntityCode?.trim() ?? null,
    requirementClass,
    requiredProficiencyLevelId: input.requiredProficiencyLevelId,
    notes: input.notes?.trim() ?? null,
  });

  await appendHrCsfAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.csf.skill_requirement.create",
    skillId: input.skillId,
    requirementId,
    summary: `Mapped skill ${skill.code} to ${input.scope}`,
    metadata: { scope: input.scope, scopeRef, requirementClass },
  });

  return { requirementId };
}

export async function listHrCsfSkillRequirementsWindow(input: {
  organizationId: string;
  skillId?: string | null;
  scope?: (typeof hrCsfSkillRequirements.$inferSelect)["scope"];
  scopeRef?: string | null;
  requirementClass?: (typeof hrCsfSkillRequirements.$inferSelect)["requirementClass"];
  limit?: number;
  offset?: number;
}) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrCsfSkillRequirements.organizationId, input.organizationId),
    ];

    if (input.skillId) {
      conditions.push(eq(hrCsfSkillRequirements.skillId, input.skillId));
    }
    if (input.scope) {
      conditions.push(eq(hrCsfSkillRequirements.scope, input.scope));
    }
    if (input.scopeRef) {
      conditions.push(eq(hrCsfSkillRequirements.scopeRef, input.scopeRef.trim()));
    }
    if (input.requirementClass) {
      conditions.push(
        eq(hrCsfSkillRequirements.requirementClass, input.requirementClass),
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrCsfSkillRequirements)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrCsfSkillRequirements.id,
        skillId: hrCsfSkillRequirements.skillId,
        skillCode: hrCsfSkills.code,
        skillName: hrCsfSkills.name,
        scope: hrCsfSkillRequirements.scope,
        scopeRef: hrCsfSkillRequirements.scopeRef,
        requirementClass: hrCsfSkillRequirements.requirementClass,
        requiredProficiencyLevelId:
          hrCsfSkillRequirements.requiredProficiencyLevelId,
        levelCode: hrCsfProficiencyLevels.code,
        levelName: hrCsfProficiencyLevels.name,
        levelOrder: hrCsfProficiencyLevels.levelOrder,
        notes: hrCsfSkillRequirements.notes,
      })
      .from(hrCsfSkillRequirements)
      .innerJoin(hrCsfSkills, eq(hrCsfSkillRequirements.skillId, hrCsfSkills.id))
      .innerJoin(
        hrCsfProficiencyLevels,
        eq(
          hrCsfSkillRequirements.requiredProficiencyLevelId,
          hrCsfProficiencyLevels.id,
        ),
      )
      .where(whereClause)
      .orderBy(desc(hrCsfSkillRequirements.createdAt))
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

export async function deleteHrCsfCompetencyRequirementInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    requirementId: string;
  },
): Promise<void> {
  const [requirement] = await db
    .select()
    .from(hrCsfCompetencyRequirements)
    .where(
      and(
        eq(hrCsfCompetencyRequirements.organizationId, input.organizationId),
        eq(hrCsfCompetencyRequirements.id, input.requirementId),
      ),
    )
    .limit(1);

  if (!requirement) {
    throw new HrCsfCommandError("requirement_not_found");
  }

  await db
    .delete(hrCsfCompetencyRequirements)
    .where(eq(hrCsfCompetencyRequirements.id, input.requirementId));

  await appendHrCsfAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.csf.competency_requirement.delete",
    competencyId: requirement.competencyId,
    requirementId: input.requirementId,
    summary: "Removed competency requirement mapping",
  });
}

export async function deleteHrCsfSkillRequirementInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    requirementId: string;
  },
): Promise<void> {
  const [requirement] = await db
    .select()
    .from(hrCsfSkillRequirements)
    .where(
      and(
        eq(hrCsfSkillRequirements.organizationId, input.organizationId),
        eq(hrCsfSkillRequirements.id, input.requirementId),
      ),
    )
    .limit(1);

  if (!requirement) {
    throw new HrCsfCommandError("requirement_not_found");
  }

  await db
    .delete(hrCsfSkillRequirements)
    .where(eq(hrCsfSkillRequirements.id, input.requirementId));

  await appendHrCsfAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.csf.skill_requirement.delete",
    skillId: requirement.skillId,
    requirementId: input.requirementId,
    summary: "Removed skill requirement mapping",
  });
}
