"use server";

import {
  createHrmDevelopmentGoalInTx,
  createHrmDevelopmentMilestoneInTx,
  createHrmDevelopmentPlanInTx,
  updateHrmCareerPathFrameworkStatusInTx,
  updateHrmDevelopmentGoalStatusInTx,
  upsertHrmCareerPathFrameworkInTx,
  upsertHrmEmployeeCareerAspirationInTx,
  upsertHrmEmployeeTargetRoleInTx,
} from "@afenda/db";
import {
  actionFailure,
  type ActionResult,
  actionSuccess,
  zodActionFailure,
} from "@afenda/governed-surface/schemas";

import {
  buildCareerPathReadinessCsvContent,
  computeAndPersistEmployeeReadiness,
  listHrCareerPathingReadinessWindow,
  writeCareerPathReadinessExportAudit,
  type HrCareerReadinessComputeResult,
} from "./hrs-hr-talent-career-pathing-readiness-server";
import { hrTalentCareerPathAuditActions } from "./hr.talent.career-pathing.event";
import {
  requireHrCareerPathingRead,
  requireHrCareerPathingWrite,
  requireHrTalentCareerPathSelfWrite,
} from "./hr.talent.career-pathing-access.policy.server";
import { hrCareerPathAspirationUpsertSchema } from "./hr.talent.career-pathing-aspiration.schema";
import {
  hrCareerPathDevelopmentGoalCreateSchema,
  hrCareerPathDevelopmentGoalStatusSchema,
} from "./hr.talent.career-pathing-goal.schema";
import {
  hrCareerPathFrameworkStatusSchema,
  hrCareerPathFrameworkUpsertSchema,
} from "./hr.talent.career-pathing-framework.schema";
import { hrCareerPathDevelopmentMilestoneCreateSchema } from "./hr.talent.career-pathing-milestone.schema";
import { hrCareerPathDevelopmentPlanCreateSchema } from "./hr.talent.career-pathing-plan.schema";
import {
  hrCareerPathTargetRoleRecommendSchema,
  hrCareerPathTargetRoleUpsertSchema,
} from "./hr.talent.career-pathing-target-role.schema";
import { finalizeHrTalentCareerPathMutation } from "./hr.talent.career-pathing.mutation.shared.server";

function normalizeDevelopmentPriority(
  priority: "low" | "medium" | "high" | "critical",
): "low" | "medium" | "high" {
  return priority === "critical" ? "high" : priority;
}

export type ExportCareerPathReadinessCsvResult = {
  content: string;
  mimeType: "text/csv;charset=utf-8";
  fileExtension: "csv";
  encoding: "utf8";
  rowCount: number;
};

/** HRM-CAR-023 — export readiness snapshot window to CSV. */
export async function exportCareerPathReadinessCsvAction(input?: {
  employeeId?: string;
  readinessLevel?: string;
}): Promise<ActionResult<ExportCareerPathReadinessCsvResult>> {
  const guard = await requireHrCareerPathingRead();
  if (!guard.canReadReadiness) {
    return actionFailure("Readiness export not permitted.", undefined, "forbidden");
  }

  const window = await listHrCareerPathingReadinessWindow({
    organizationId: guard.organization.id,
    limit: 500,
    employeeId: input?.employeeId,
    readinessLevel: input?.readinessLevel as Parameters<
      typeof listHrCareerPathingReadinessWindow
    >[0]["readinessLevel"],
  });

  const content = buildCareerPathReadinessCsvContent(
    window.rows.map((row) => ({
      employeeNumber: row.employeeNumber,
      employeeName: row.employeeName,
      targetRoleTitle: null,
      readinessLevel: row.readinessLevel,
      readinessScore: row.readinessScore,
      computedAt: row.computedAt,
    })),
  );

  await writeCareerPathReadinessExportAudit({
    organizationId: guard.organization.id,
    actorAuthUserId: guard.session.id,
    rowCount: window.rows.length,
  });

  return actionSuccess({
    content,
    mimeType: "text/csv;charset=utf-8",
    fileExtension: "csv",
    encoding: "utf8",
    rowCount: window.rows.length,
  });
}

export async function computeEmployeeReadinessAction(input: {
  employeeId: string;
  targetRoleId?: string;
  snapshotNotes?: string;
}): Promise<ActionResult<HrCareerReadinessComputeResult & { snapshotId: string }>> {
  const guard = await requireHrCareerPathingWrite();

  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds({ scope: "org" });
  if (
    visibleEmployeeIds &&
    !visibleEmployeeIds.includes(input.employeeId)
  ) {
    return actionFailure("Employee not visible.", undefined, "forbidden");
  }

  const result = await computeAndPersistEmployeeReadiness({
    organizationId: guard.organization.id,
    employeeId: input.employeeId,
    targetRoleId: input.targetRoleId,
    actorAuthUserId: guard.session.id,
    snapshotNotes: input.snapshotNotes,
  });

  return actionSuccess(result);
}

/** Cron-friendly due notification sync (CAR-025). */
export async function syncCareerPathingDueNotificationsAction(input?: {
  hrOperatorAuthUserIds?: readonly string[];
}): Promise<ActionResult<{ enqueuedCount: number }>> {
  const guard = await requireHrCareerPathingWrite();
  const { syncHrCareerPathingDueNotifications } = await import(
    "./hrs-hr-talent-career-pathing-notification-server"
  );

  const result = await syncHrCareerPathingDueNotifications({
    organizationId: guard.organization.id,
    actorAuthUserId: guard.session.id,
    hrOperatorAuthUserIds: input?.hrOperatorAuthUserIds,
  });

  return actionSuccess(result);
}

/** CAR-001 / CAR-002 */
export async function upsertCareerPathFrameworkAction(
  input: unknown,
): Promise<ActionResult> {
  const guard = await requireHrCareerPathingWrite();
  const parsed = hrCareerPathFrameworkUpsertSchema.safeParse(input);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeHrTalentCareerPathMutation(guard.organization.id, async (db) => {
    const saved = await upsertHrmCareerPathFrameworkInTx(db, {
      organizationId: guard.organization.id,
      frameworkId: parsed.data.frameworkId,
      code: parsed.data.code,
      name: parsed.data.name,
      pathKind: parsed.data.pathKind,
      description: parsed.data.description,
    });

    return {
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      action: parsed.data.frameworkId
        ? hrTalentCareerPathAuditActions.framework.update
        : hrTalentCareerPathAuditActions.framework.create,
      targetId: saved.frameworkId,
      summary: "Career path framework saved",
      metadata: { code: parsed.data.code, pathKind: parsed.data.pathKind },
    };
  });
}

export async function updateCareerPathFrameworkStatusAction(
  input: unknown,
): Promise<ActionResult> {
  const guard = await requireHrCareerPathingWrite();
  const parsed = hrCareerPathFrameworkStatusSchema.safeParse(input);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeHrTalentCareerPathMutation(guard.organization.id, async (db) => {
    await updateHrmCareerPathFrameworkStatusInTx(db, {
      organizationId: guard.organization.id,
      frameworkId: parsed.data.frameworkId,
      frameworkStatus: parsed.data.frameworkStatus,
    });

    return {
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      action: hrTalentCareerPathAuditActions.framework.statusChange,
      targetId: parsed.data.frameworkId,
      summary: "Career path framework status updated",
      metadata: { frameworkStatus: parsed.data.frameworkStatus },
    };
  });
}

/** CAR-003 */
export async function upsertEmployeeCareerAspirationAction(
  input: unknown,
): Promise<ActionResult> {
  const parsed = hrCareerPathAspirationUpsertSchema.safeParse(input);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTalentCareerPathSelfWrite(parsed.data.employeeId);
  await guard.assertEmployeeVisible(parsed.data.employeeId);

  return finalizeHrTalentCareerPathMutation(guard.organization.id, async (db) => {
    const saved = await upsertHrmEmployeeCareerAspirationInTx(db, {
      organizationId: guard.organization.id,
      employeeId: parsed.data.employeeId,
      updatedByUserId: guard.session.id,
      preferredRoleTitle: parsed.data.preferredRoleTitle,
      preferredDepartmentId: parsed.data.preferredDepartmentId,
      preferredLocationCode: parsed.data.preferredLocationCode,
      mobilityPreference: parsed.data.mobilityPreference,
      careerInterestNotes: parsed.data.careerInterestNotes,
    });

    return {
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      action: hrTalentCareerPathAuditActions.aspiration.upsert,
      targetId: saved.aspirationId,
      summary: "Employee career aspiration saved",
      metadata: { employeeId: parsed.data.employeeId },
    };
  });
}

/** CAR-003 / CAR-005 */
export async function upsertEmployeeTargetRoleAction(
  input: unknown,
): Promise<ActionResult> {
  const parsed = hrCareerPathTargetRoleUpsertSchema.safeParse(input);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTalentCareerPathSelfWrite(parsed.data.employeeId);
  await guard.assertEmployeeVisible(parsed.data.employeeId);

  return finalizeHrTalentCareerPathMutation(guard.organization.id, async (db) => {
    const saved = await upsertHrmEmployeeTargetRoleInTx(db, {
      organizationId: guard.organization.id,
      employeeId: parsed.data.employeeId,
      targetRoleTitle: parsed.data.targetRoleTitle,
      jobFamily: parsed.data.jobFamily,
      grade: parsed.data.grade,
      positionId: parsed.data.positionId,
      departmentId: parsed.data.departmentId,
      frameworkId: parsed.data.frameworkId,
      stageId: parsed.data.stageId,
      targetRoleSource: parsed.data.targetRoleSource,
      recommendedByUserId:
        parsed.data.targetRoleSource === "employee" ? null : guard.session.id,
      requiredSkillRequirements: parsed.data.requiredSkillRequirements,
      requiredCompetencyRequirements: parsed.data.requiredCompetencyRequirements,
      expectedReadinessDate: parsed.data.expectedReadinessDate,
      notes: parsed.data.notes,
    });

    return {
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      action: hrTalentCareerPathAuditActions.targetRole.upsert,
      targetId: saved.targetRoleId,
      summary: "Employee target role saved",
      metadata: {
        employeeId: parsed.data.employeeId,
        targetRoleSource: parsed.data.targetRoleSource,
      },
    };
  });
}

/** CAR-004 */
export async function recommendEmployeeTargetRoleAction(
  input: unknown,
): Promise<ActionResult> {
  const parsed = hrCareerPathTargetRoleRecommendSchema.safeParse(input);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrCareerPathingWrite();
  guard.assertCanRecommendTargetRole();
  await guard.assertEmployeeVisible(parsed.data.employeeId);

  return finalizeHrTalentCareerPathMutation(guard.organization.id, async (db) => {
    const saved = await upsertHrmEmployeeTargetRoleInTx(db, {
      organizationId: guard.organization.id,
      employeeId: parsed.data.employeeId,
      targetRoleTitle: parsed.data.targetRoleTitle,
      jobFamily: parsed.data.jobFamily,
      grade: parsed.data.grade,
      positionId: parsed.data.positionId,
      departmentId: parsed.data.departmentId,
      frameworkId: parsed.data.frameworkId,
      stageId: parsed.data.stageId,
      targetRoleSource: parsed.data.targetRoleSource,
      recommendedByUserId: guard.session.id,
      requiredSkillRequirements: parsed.data.requiredSkillRequirements,
      requiredCompetencyRequirements: parsed.data.requiredCompetencyRequirements,
      expectedReadinessDate: parsed.data.expectedReadinessDate,
      notes: parsed.data.notes,
    });

    return {
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      action: hrTalentCareerPathAuditActions.targetRole.recommend,
      targetId: saved.targetRoleId,
      summary: "Target role recommended for employee",
      metadata: {
        employeeId: parsed.data.employeeId,
        targetRoleSource: parsed.data.targetRoleSource,
      },
    };
  });
}

/** CAR-009 */
export async function createDevelopmentPlanAction(
  input: unknown,
): Promise<ActionResult> {
  const guard = await requireHrCareerPathingWrite();
  const parsed = hrCareerPathDevelopmentPlanCreateSchema.safeParse(input);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  await guard.assertEmployeeVisible(parsed.data.employeeId);

  return finalizeHrTalentCareerPathMutation(guard.organization.id, async (db) => {
    const saved = await createHrmDevelopmentPlanInTx(db, {
      organizationId: guard.organization.id,
      employeeId: parsed.data.employeeId,
      code: parsed.data.code,
      title: parsed.data.title,
      targetRoleId: parsed.data.targetRoleId,
      description: parsed.data.description,
      startDate: parsed.data.startDate,
      targetCompletionDate: parsed.data.targetCompletionDate,
      createdByUserId: guard.session.id,
    });

    return {
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      action: hrTalentCareerPathAuditActions.plan.create,
      targetId: saved.planId,
      summary: "Development plan created",
      metadata: { employeeId: parsed.data.employeeId, code: parsed.data.code },
    };
  });
}

/** CAR-010 */
export async function createDevelopmentGoalAction(
  input: unknown,
): Promise<ActionResult> {
  const guard = await requireHrCareerPathingWrite();
  const parsed = hrCareerPathDevelopmentGoalCreateSchema.safeParse(input);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeHrTalentCareerPathMutation(guard.organization.id, async (db) => {
    const saved = await createHrmDevelopmentGoalInTx(db, {
      organizationId: guard.organization.id,
      planId: parsed.data.planId,
      goalType: parsed.data.goalType,
      title: parsed.data.title,
      description: parsed.data.description,
      priority: normalizeDevelopmentPriority(parsed.data.priority),
      targetCompletionDate: parsed.data.targetCompletionDate,
      skillCode: parsed.data.skillCode,
      competencyCode: parsed.data.competencyCode,
      sortOrder: parsed.data.sortOrder,
    });

    return {
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      action: hrTalentCareerPathAuditActions.goal.create,
      targetId: saved.goalId,
      summary: "Development goal created",
      metadata: { planId: parsed.data.planId, goalType: parsed.data.goalType },
    };
  });
}

/** CAR-011 */
export async function createDevelopmentMilestoneAction(
  input: unknown,
): Promise<ActionResult> {
  const guard = await requireHrCareerPathingWrite();
  const parsed = hrCareerPathDevelopmentMilestoneCreateSchema.safeParse(input);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeHrTalentCareerPathMutation(guard.organization.id, async (db) => {
    const saved = await createHrmDevelopmentMilestoneInTx(db, {
      organizationId: guard.organization.id,
      goalId: parsed.data.goalId,
      title: parsed.data.title,
      targetDate: parsed.data.targetDate,
      ownerEmployeeId: parsed.data.ownerEmployeeId,
      ownerUserId: parsed.data.ownerUserId ?? guard.session.id,
      priority: normalizeDevelopmentPriority(parsed.data.priority),
      completionCriteria: parsed.data.completionCriteria,
      description: parsed.data.description,
    });

    return {
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      action: hrTalentCareerPathAuditActions.milestone.create,
      targetId: saved.milestoneId,
      summary: "Development milestone created",
      metadata: { goalId: parsed.data.goalId },
    };
  });
}

/** CAR-012 */
export async function updateDevelopmentGoalStatusAction(
  input: unknown,
): Promise<ActionResult> {
  const guard = await requireHrCareerPathingWrite();
  const parsed = hrCareerPathDevelopmentGoalStatusSchema.safeParse(input);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeHrTalentCareerPathMutation(guard.organization.id, async (db) => {
    await updateHrmDevelopmentGoalStatusInTx(db, {
      organizationId: guard.organization.id,
      goalId: parsed.data.goalId,
      goalStatus: parsed.data.goalStatus,
      progressPercent: parsed.data.progressPercent,
      evidenceNotes: parsed.data.evidenceNotes,
    });

    return {
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      action: hrTalentCareerPathAuditActions.goal.statusChange,
      targetId: parsed.data.goalId,
      summary: "Development goal status updated",
      metadata: { goalStatus: parsed.data.goalStatus },
    };
  });
}
