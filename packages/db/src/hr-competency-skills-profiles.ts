import { and, desc, eq, isNull } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { appendHrCsfAuditEventInTx } from "./hr-competency-skills-audit";
import { HrCsfCommandError } from "./hr-competency-skills.shared";
import { createEntityId } from "./ids";
import { hrEmployees } from "./hr";
import {
  hrCsfAssessments,
  hrCsfAssessmentEvidence,
  hrCsfCompetencies,
  hrCsfEmployeeCompetencyProfiles,
  hrCsfEmployeeSkillProfiles,
  hrCsfProficiencyLevels,
  hrCsfSkills,
} from "./dbx-hr-competency-skills";

async function assertHrEmployeeExistsInTx(
  db: AfendaTransaction,
  organizationId: string,
  employeeId: string,
): Promise<void> {
  const [employee] = await db
    .select({ id: hrEmployees.id })
    .from(hrEmployees)
    .where(
      and(
        eq(hrEmployees.organizationId, organizationId),
        eq(hrEmployees.id, employeeId),
        isNull(hrEmployees.archivedAt),
      ),
    )
    .limit(1);

  if (!employee) {
    throw new HrCsfCommandError("employee_not_found");
  }
}

async function assertProficiencyLevelForCompetencyInTx(
  db: AfendaTransaction,
  organizationId: string,
  competencyId: string,
  proficiencyLevelId: string,
): Promise<void> {
  const [row] = await db
    .select({
      competencyScaleId: hrCsfCompetencies.proficiencyScaleId,
      levelScaleId: hrCsfProficiencyLevels.scaleId,
    })
    .from(hrCsfCompetencies)
    .innerJoin(
      hrCsfProficiencyLevels,
      and(
        eq(hrCsfProficiencyLevels.organizationId, organizationId),
        eq(hrCsfProficiencyLevels.id, proficiencyLevelId),
      ),
    )
    .where(
      and(
        eq(hrCsfCompetencies.organizationId, organizationId),
        eq(hrCsfCompetencies.id, competencyId),
      ),
    )
    .limit(1);

  if (!row || row.competencyScaleId !== row.levelScaleId) {
    throw new HrCsfCommandError("proficiency_scale_mismatch");
  }
}

async function assertProficiencyLevelForSkillInTx(
  db: AfendaTransaction,
  organizationId: string,
  skillId: string,
  proficiencyLevelId: string,
): Promise<void> {
  const [row] = await db
    .select({
      skillScaleId: hrCsfSkills.proficiencyScaleId,
      levelScaleId: hrCsfProficiencyLevels.scaleId,
    })
    .from(hrCsfSkills)
    .innerJoin(
      hrCsfProficiencyLevels,
      and(
        eq(hrCsfProficiencyLevels.organizationId, organizationId),
        eq(hrCsfProficiencyLevels.id, proficiencyLevelId),
      ),
    )
    .where(
      and(
        eq(hrCsfSkills.organizationId, organizationId),
        eq(hrCsfSkills.id, skillId),
      ),
    )
    .limit(1);

  if (!row || row.skillScaleId !== row.levelScaleId) {
    throw new HrCsfCommandError("proficiency_scale_mismatch");
  }
}

async function syncProfileFromAssessmentInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    targetType: "competency" | "skill";
    profileId: string;
    assessmentId: string;
    proficiencyLevelId: string;
    assessmentDate: Date;
    applyCurrentProficiency: boolean;
  },
): Promise<void> {
  if (input.targetType === "competency") {
    await db
      .update(hrCsfEmployeeCompetencyProfiles)
      .set({
        lastAssessmentId: input.assessmentId,
        lastAssessedAt: input.assessmentDate,
        ...(input.applyCurrentProficiency
          ? { currentProficiencyLevelId: input.proficiencyLevelId }
          : {}),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(hrCsfEmployeeCompetencyProfiles.organizationId, input.organizationId),
          eq(hrCsfEmployeeCompetencyProfiles.id, input.profileId),
        ),
      );
    return;
  }

  await db
    .update(hrCsfEmployeeSkillProfiles)
    .set({
      lastAssessmentId: input.assessmentId,
      lastAssessedAt: input.assessmentDate,
      ...(input.applyCurrentProficiency
        ? { currentProficiencyLevelId: input.proficiencyLevelId }
        : {}),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(hrCsfEmployeeSkillProfiles.organizationId, input.organizationId),
        eq(hrCsfEmployeeSkillProfiles.id, input.profileId),
      ),
    );
}

export type UpsertHrCsfEmployeeCompetencyProfileInput = {
  organizationId: string;
  actorUserId: string;
  employeeId: string;
  competencyId: string;
  currentProficiencyLevelId?: string | null;
  selfAssessmentEnabled?: boolean;
  hrValidationRequired?: boolean;
  notes?: string | null;
};

export async function upsertHrCsfEmployeeCompetencyProfileInTx(
  db: AfendaTransaction,
  input: UpsertHrCsfEmployeeCompetencyProfileInput,
): Promise<{ profileId: string; created: boolean }> {
  await assertHrEmployeeExistsInTx(db, input.organizationId, input.employeeId);

  const [competency] = await db
    .select({ id: hrCsfCompetencies.id })
    .from(hrCsfCompetencies)
    .where(
      and(
        eq(hrCsfCompetencies.organizationId, input.organizationId),
        eq(hrCsfCompetencies.id, input.competencyId),
      ),
    )
    .limit(1);

  if (!competency) {
    throw new HrCsfCommandError("competency_not_found");
  }

  if (input.currentProficiencyLevelId) {
    await assertProficiencyLevelForCompetencyInTx(
      db,
      input.organizationId,
      input.competencyId,
      input.currentProficiencyLevelId,
    );
  }

  const [existing] = await db
    .select({ id: hrCsfEmployeeCompetencyProfiles.id })
    .from(hrCsfEmployeeCompetencyProfiles)
    .where(
      and(
        eq(hrCsfEmployeeCompetencyProfiles.organizationId, input.organizationId),
        eq(hrCsfEmployeeCompetencyProfiles.employeeId, input.employeeId),
        eq(hrCsfEmployeeCompetencyProfiles.competencyId, input.competencyId),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(hrCsfEmployeeCompetencyProfiles)
      .set({
        currentProficiencyLevelId: input.currentProficiencyLevelId ?? null,
        selfAssessmentEnabled: input.selfAssessmentEnabled ?? true,
        hrValidationRequired: input.hrValidationRequired ?? false,
        notes: input.notes ?? null,
        updatedAt: new Date(),
      })
      .where(eq(hrCsfEmployeeCompetencyProfiles.id, existing.id));

    await appendHrCsfAuditEventInTx(db, {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      action: "hr.csf.profile.competency.update",
      competencyId: input.competencyId,
      summary: `Updated employee competency profile for ${input.employeeId}`,
      metadata: {
        employeeId: input.employeeId,
        profileId: existing.id,
      },
    });

    return { profileId: existing.id, created: false };
  }

  const profileId = createEntityId("hr_csf_emp_comp");
  await db.insert(hrCsfEmployeeCompetencyProfiles).values({
    id: profileId,
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    competencyId: input.competencyId,
    currentProficiencyLevelId: input.currentProficiencyLevelId ?? null,
    selfAssessmentEnabled: input.selfAssessmentEnabled ?? true,
    hrValidationRequired: input.hrValidationRequired ?? false,
    notes: input.notes ?? null,
  });

  await appendHrCsfAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.csf.profile.competency.create",
    competencyId: input.competencyId,
    summary: `Created employee competency profile for ${input.employeeId}`,
    metadata: {
      employeeId: input.employeeId,
      profileId,
    },
  });

  return { profileId, created: true };
}

export type UpsertHrCsfEmployeeSkillProfileInput = {
  organizationId: string;
  actorUserId: string;
  employeeId: string;
  skillId: string;
  currentProficiencyLevelId?: string | null;
  selfAssessmentEnabled?: boolean;
  hrValidationRequired?: boolean;
  notes?: string | null;
};

export async function upsertHrCsfEmployeeSkillProfileInTx(
  db: AfendaTransaction,
  input: UpsertHrCsfEmployeeSkillProfileInput,
): Promise<{ profileId: string; created: boolean }> {
  await assertHrEmployeeExistsInTx(db, input.organizationId, input.employeeId);

  const [skill] = await db
    .select({ id: hrCsfSkills.id })
    .from(hrCsfSkills)
    .where(
      and(
        eq(hrCsfSkills.organizationId, input.organizationId),
        eq(hrCsfSkills.id, input.skillId),
      ),
    )
    .limit(1);

  if (!skill) {
    throw new HrCsfCommandError("skill_not_found");
  }

  if (input.currentProficiencyLevelId) {
    await assertProficiencyLevelForSkillInTx(
      db,
      input.organizationId,
      input.skillId,
      input.currentProficiencyLevelId,
    );
  }

  const [existing] = await db
    .select({ id: hrCsfEmployeeSkillProfiles.id })
    .from(hrCsfEmployeeSkillProfiles)
    .where(
      and(
        eq(hrCsfEmployeeSkillProfiles.organizationId, input.organizationId),
        eq(hrCsfEmployeeSkillProfiles.employeeId, input.employeeId),
        eq(hrCsfEmployeeSkillProfiles.skillId, input.skillId),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(hrCsfEmployeeSkillProfiles)
      .set({
        currentProficiencyLevelId: input.currentProficiencyLevelId ?? null,
        selfAssessmentEnabled: input.selfAssessmentEnabled ?? true,
        hrValidationRequired: input.hrValidationRequired ?? false,
        notes: input.notes ?? null,
        updatedAt: new Date(),
      })
      .where(eq(hrCsfEmployeeSkillProfiles.id, existing.id));

    await appendHrCsfAuditEventInTx(db, {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      action: "hr.csf.profile.skill.update",
      skillId: input.skillId,
      summary: `Updated employee skill profile for ${input.employeeId}`,
      metadata: {
        employeeId: input.employeeId,
        profileId: existing.id,
      },
    });

    return { profileId: existing.id, created: false };
  }

  const profileId = createEntityId("hr_csf_emp_skill");
  await db.insert(hrCsfEmployeeSkillProfiles).values({
    id: profileId,
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    skillId: input.skillId,
    currentProficiencyLevelId: input.currentProficiencyLevelId ?? null,
    selfAssessmentEnabled: input.selfAssessmentEnabled ?? true,
    hrValidationRequired: input.hrValidationRequired ?? false,
    notes: input.notes ?? null,
  });

  await appendHrCsfAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.csf.profile.skill.create",
    skillId: input.skillId,
    summary: `Created employee skill profile for ${input.employeeId}`,
    metadata: {
      employeeId: input.employeeId,
      profileId,
    },
  });

  return { profileId, created: true };
}

export type SubmitHrCsfAssessmentInput = {
  organizationId: string;
  actorUserId: string;
  employeeId: string;
  targetType: "competency" | "skill";
  profileId: string;
  proficiencyLevelId: string;
  assessmentType: "self" | "manager" | "hr_validation";
  assessmentDate?: Date;
  confidenceLevel?: number;
  assessorEmployeeId?: string | null;
  notes?: string | null;
  evidence?: readonly {
    evidenceSummary: string;
    source: string;
    evidenceDate?: Date;
    confidenceLevel?: number;
    metadata?: Record<string, unknown>;
  }[];
};

async function loadCompetencyProfileInTx(
  db: AfendaTransaction,
  organizationId: string,
  profileId: string,
) {
  const [profile] = await db
    .select()
    .from(hrCsfEmployeeCompetencyProfiles)
    .where(
      and(
        eq(hrCsfEmployeeCompetencyProfiles.organizationId, organizationId),
        eq(hrCsfEmployeeCompetencyProfiles.id, profileId),
      ),
    )
    .limit(1);

  if (!profile) {
    throw new HrCsfCommandError("profile_not_found");
  }

  return profile;
}

async function loadSkillProfileInTx(
  db: AfendaTransaction,
  organizationId: string,
  profileId: string,
) {
  const [profile] = await db
    .select()
    .from(hrCsfEmployeeSkillProfiles)
    .where(
      and(
        eq(hrCsfEmployeeSkillProfiles.organizationId, organizationId),
        eq(hrCsfEmployeeSkillProfiles.id, profileId),
      ),
    )
    .limit(1);

  if (!profile) {
    throw new HrCsfCommandError("profile_not_found");
  }

  return profile;
}

export async function submitHrCsfAssessmentInTx(
  db: AfendaTransaction,
  input: SubmitHrCsfAssessmentInput,
): Promise<{ assessmentId: string }> {
  await assertHrEmployeeExistsInTx(db, input.organizationId, input.employeeId);

  const assessmentDate = input.assessmentDate ?? new Date();
  const confidenceLevel = input.confidenceLevel ?? 3;

  let competencyId: string | null = null;
  let skillId: string | null = null;
  let competencyProfileId: string | null = null;
  let skillProfileId: string | null = null;
  let hrValidationRequired = false;
  let selfAssessmentEnabled = true;

  if (input.targetType === "competency") {
    const profile = await loadCompetencyProfileInTx(
      db,
      input.organizationId,
      input.profileId,
    );
    if (profile.employeeId !== input.employeeId) {
      throw new HrCsfCommandError("profile_not_found");
    }
    competencyId = profile.competencyId;
    competencyProfileId = profile.id;
    hrValidationRequired = profile.hrValidationRequired;
    selfAssessmentEnabled = profile.selfAssessmentEnabled;
    await assertProficiencyLevelForCompetencyInTx(
      db,
      input.organizationId,
      profile.competencyId,
      input.proficiencyLevelId,
    );
  } else {
    const profile = await loadSkillProfileInTx(
      db,
      input.organizationId,
      input.profileId,
    );
    if (profile.employeeId !== input.employeeId) {
      throw new HrCsfCommandError("profile_not_found");
    }
    skillId = profile.skillId;
    skillProfileId = profile.id;
    hrValidationRequired = profile.hrValidationRequired;
    selfAssessmentEnabled = profile.selfAssessmentEnabled;
    await assertProficiencyLevelForSkillInTx(
      db,
      input.organizationId,
      profile.skillId,
      input.proficiencyLevelId,
    );
  }

  if (input.assessmentType === "self" && !selfAssessmentEnabled) {
    throw new HrCsfCommandError("self_assessment_disabled");
  }

  if (input.assessmentType === "hr_validation" && !hrValidationRequired) {
    throw new HrCsfCommandError("validation_not_required");
  }

  const applyCurrentProficiency =
    input.assessmentType === "manager" ||
    input.assessmentType === "hr_validation" ||
    (input.assessmentType === "self" && !hrValidationRequired);

  const assessmentStatus =
    input.assessmentType === "hr_validation"
      ? ("validated" as const)
      : hrValidationRequired && input.assessmentType !== "self"
        ? ("submitted" as const)
        : applyCurrentProficiency
          ? ("validated" as const)
          : ("submitted" as const);

  const assessmentId = createEntityId("hr_csf_assessment");
  await db.insert(hrCsfAssessments).values({
    id: assessmentId,
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    assessmentType: input.assessmentType,
    targetType: input.targetType,
    competencyProfileId,
    skillProfileId,
    competencyId,
    skillId,
    proficiencyLevelId: input.proficiencyLevelId,
    assessorUserId: input.actorUserId,
    assessorEmployeeId: input.assessorEmployeeId ?? null,
    assessmentDate,
    confidenceLevel,
    assessmentStatus,
    notes: input.notes ?? null,
    validatedByUserId:
      input.assessmentType === "hr_validation" ? input.actorUserId : null,
    validatedAt: input.assessmentType === "hr_validation" ? assessmentDate : null,
  });

  if (input.evidence?.length) {
    for (const item of input.evidence) {
      await db.insert(hrCsfAssessmentEvidence).values({
        id: createEntityId("hr_csf_evidence"),
        organizationId: input.organizationId,
        assessmentId,
        evidenceSummary: item.evidenceSummary.trim(),
        source: item.source.trim(),
        evidenceDate: item.evidenceDate ?? assessmentDate,
        assessorUserId: input.actorUserId,
        confidenceLevel: item.confidenceLevel ?? confidenceLevel,
        metadata: item.metadata ?? null,
      });
    }
  }

  if (applyCurrentProficiency) {
    await syncProfileFromAssessmentInTx(db, {
      organizationId: input.organizationId,
      targetType: input.targetType,
      profileId: input.profileId,
      assessmentId,
      proficiencyLevelId: input.proficiencyLevelId,
      assessmentDate,
      applyCurrentProficiency: true,
    });
  } else {
    await syncProfileFromAssessmentInTx(db, {
      organizationId: input.organizationId,
      targetType: input.targetType,
      profileId: input.profileId,
      assessmentId,
      proficiencyLevelId: input.proficiencyLevelId,
      assessmentDate,
      applyCurrentProficiency: false,
    });
  }

  const auditAction =
    input.assessmentType === "self"
      ? "hr.csf.assessment.self.submit"
      : input.assessmentType === "manager"
        ? "hr.csf.assessment.manager.submit"
        : "hr.csf.assessment.validate";

  await appendHrCsfAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: auditAction,
    competencyId,
    skillId,
    summary: `Submitted ${input.assessmentType} ${input.targetType} assessment for ${input.employeeId}`,
    metadata: {
      employeeId: input.employeeId,
      profileId: input.profileId,
      assessmentId,
      proficiencyLevelId: input.proficiencyLevelId,
      confidenceLevel,
    },
  });

  return { assessmentId };
}

export type ValidateHrCsfAssessmentInput = {
  organizationId: string;
  actorUserId: string;
  assessmentId: string;
  proficiencyLevelId?: string;
  notes?: string | null;
};

export async function validateHrCsfAssessmentInTx(
  db: AfendaTransaction,
  input: ValidateHrCsfAssessmentInput,
): Promise<{ assessmentId: string }> {
  const [assessment] = await db
    .select()
    .from(hrCsfAssessments)
    .where(
      and(
        eq(hrCsfAssessments.organizationId, input.organizationId),
        eq(hrCsfAssessments.id, input.assessmentId),
      ),
    )
    .limit(1);

  if (!assessment) {
    throw new HrCsfCommandError("assessment_not_found");
  }

  const proficiencyLevelId =
    input.proficiencyLevelId ?? assessment.proficiencyLevelId;

  if (assessment.targetType === "competency" && assessment.competencyId) {
    await assertProficiencyLevelForCompetencyInTx(
      db,
      input.organizationId,
      assessment.competencyId,
      proficiencyLevelId,
    );
  } else if (assessment.skillId) {
    await assertProficiencyLevelForSkillInTx(
      db,
      input.organizationId,
      assessment.skillId,
      proficiencyLevelId,
    );
  }

  const validatedAt = new Date();
  await db
    .update(hrCsfAssessments)
    .set({
      assessmentStatus: "validated",
      proficiencyLevelId,
      validatedByUserId: input.actorUserId,
      validatedAt,
      notes: input.notes ?? assessment.notes,
      updatedAt: validatedAt,
    })
    .where(eq(hrCsfAssessments.id, assessment.id));

  const profileId =
    assessment.targetType === "competency"
      ? assessment.competencyProfileId
      : assessment.skillProfileId;

  if (profileId) {
    await syncProfileFromAssessmentInTx(db, {
      organizationId: input.organizationId,
      targetType: assessment.targetType,
      profileId,
      assessmentId: assessment.id,
      proficiencyLevelId,
      assessmentDate: validatedAt,
      applyCurrentProficiency: true,
    });
  }

  await appendHrCsfAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.csf.assessment.validate",
    competencyId: assessment.competencyId,
    skillId: assessment.skillId,
    summary: `Validated ${assessment.targetType} assessment ${assessment.id}`,
    metadata: {
      employeeId: assessment.employeeId,
      assessmentId: assessment.id,
      proficiencyLevelId,
    },
  });

  return { assessmentId: assessment.id };
}

export type AddHrCsfAssessmentEvidenceInput = {
  organizationId: string;
  actorUserId: string;
  assessmentId: string;
  evidenceSummary: string;
  source: string;
  evidenceDate?: Date;
  confidenceLevel?: number;
  metadata?: Record<string, unknown>;
};

export async function addHrCsfAssessmentEvidenceInTx(
  db: AfendaTransaction,
  input: AddHrCsfAssessmentEvidenceInput,
): Promise<{ evidenceId: string }> {
  const [assessment] = await db
    .select({ id: hrCsfAssessments.id })
    .from(hrCsfAssessments)
    .where(
      and(
        eq(hrCsfAssessments.organizationId, input.organizationId),
        eq(hrCsfAssessments.id, input.assessmentId),
      ),
    )
    .limit(1);

  if (!assessment) {
    throw new HrCsfCommandError("assessment_not_found");
  }

  const evidenceId = createEntityId("hr_csf_evidence");
  await db.insert(hrCsfAssessmentEvidence).values({
    id: evidenceId,
    organizationId: input.organizationId,
    assessmentId: input.assessmentId,
    evidenceSummary: input.evidenceSummary.trim(),
    source: input.source.trim(),
    evidenceDate: input.evidenceDate ?? new Date(),
    assessorUserId: input.actorUserId,
    confidenceLevel: input.confidenceLevel ?? 3,
    metadata: input.metadata ?? null,
  });

  await appendHrCsfAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.csf.assessment.evidence.add",
    summary: `Added assessment evidence for ${input.assessmentId}`,
    metadata: {
      assessmentId: input.assessmentId,
      evidenceId,
      source: input.source,
    },
  });

  return { evidenceId };
}

export async function listHrCsfEmployeeCompetencyProfiles(input: {
  organizationId: string;
  employeeId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    db
      .select()
      .from(hrCsfEmployeeCompetencyProfiles)
      .where(
        and(
          eq(hrCsfEmployeeCompetencyProfiles.organizationId, input.organizationId),
          eq(hrCsfEmployeeCompetencyProfiles.employeeId, input.employeeId),
        ),
      )
      .orderBy(desc(hrCsfEmployeeCompetencyProfiles.updatedAt)),
  );
}

export async function listHrCsfEmployeeSkillProfiles(input: {
  organizationId: string;
  employeeId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    db
      .select()
      .from(hrCsfEmployeeSkillProfiles)
      .where(
        and(
          eq(hrCsfEmployeeSkillProfiles.organizationId, input.organizationId),
          eq(hrCsfEmployeeSkillProfiles.employeeId, input.employeeId),
        ),
      )
      .orderBy(desc(hrCsfEmployeeSkillProfiles.updatedAt)),
  );
}

export async function listHrCsfAssessmentsForProfile(input: {
  organizationId: string;
  targetType: "competency" | "skill";
  profileId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const profileColumn =
      input.targetType === "competency"
        ? hrCsfAssessments.competencyProfileId
        : hrCsfAssessments.skillProfileId;

    return db
      .select()
      .from(hrCsfAssessments)
      .where(
        and(
          eq(hrCsfAssessments.organizationId, input.organizationId),
          eq(profileColumn, input.profileId),
        ),
      )
      .orderBy(desc(hrCsfAssessments.assessmentDate));
  });
}

export async function listHrCsfAssessmentEvidence(input: {
  organizationId: string;
  assessmentId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    db
      .select()
      .from(hrCsfAssessmentEvidence)
      .where(
        and(
          eq(hrCsfAssessmentEvidence.organizationId, input.organizationId),
          eq(hrCsfAssessmentEvidence.assessmentId, input.assessmentId),
        ),
      )
      .orderBy(desc(hrCsfAssessmentEvidence.evidenceDate)),
  );
}

