import {
  countHrmReadinessByLevel,
  countOverdueHrmDevelopmentMilestones,
  insertHrmEmployeeReadinessSnapshot,
  listHrmDevelopmentGoalsWindow,
  listHrmDevelopmentPlansWindow,
  listHrmEmployeeReadinessSnapshotsWindow,
  listSkillGapsForEmployee,
  runWithOrganizationContext,
} from "@afenda/db";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";

import { hrTalentCareerPathingAuditActions } from "./hr.talent.career-pathing.event";
import { emitHrCareerPathingAuditEvent } from "./hr.talent.career-pathing-audit.server";
import {
  computeCareerPathReadiness,
  type HrCareerReadinessComputeResult,
} from "./hr.talent.career-pathing-readiness.shared";

export type { HrCareerReadinessComputeResult };

export type HrCareerPathingOverviewKpis = {
  nearReadyCount: number;
  readyCount: number;
  roleReadyCount: number;
  overdueMilestoneCount: number;
  activePlanCount: number;
};

/** HRM-CAR-023 — compute readiness, append snapshot, return result. */
export async function computeAndPersistEmployeeReadiness(input: {
  organizationId: string;
  employeeId: string;
  targetRoleId?: string;
  actorAuthUserId: string;
  snapshotNotes?: string;
}): Promise<HrCareerReadinessComputeResult & { snapshotId: string }> {
  const gapCompare = await listSkillGapsForEmployee({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    targetRoleId: input.targetRoleId,
  });

  const plansWindow = await listHrmDevelopmentPlansWindow({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    limit: 50,
  });

  let totalGoalCount = 0;
  let completedGoalCount = 0;
  for (const plan of plansWindow.rows) {
    const goalsWindow = await listHrmDevelopmentGoalsWindow({
      organizationId: input.organizationId,
      planId: plan.id,
      limit: 500,
    });
    totalGoalCount += goalsWindow.rows.length;
    completedGoalCount += goalsWindow.rows.filter(
      (row) => row.goalStatus === "completed",
    ).length;
  }

  const skillGapCount = gapCompare.skillGaps.filter((row) => row.gap).length;
  const competencyGapCount = gapCompare.competencyGaps.filter((row) => row.gap).length;
  const totalRequirements = gapCompare.skillGaps.length + gapCompare.competencyGaps.length;

  const computed = computeCareerPathReadiness({
    skillGapCount,
    competencyGapCount,
    totalRequirements,
    completedGoalCount,
    totalGoalCount,
  });

  const { snapshotId } = await insertHrmEmployeeReadinessSnapshot({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    targetRoleId: gapCompare.targetRoleId,
    readinessLevel: computed.readinessLevel,
    readinessScore: String(computed.readinessScorePct),
    gapSummary: {
      skillGapCount,
      competencyGapCount,
      goalCompletionPct: computed.goalCompletionPct,
    },
    snapshotNotes: input.snapshotNotes ?? null,
    computedByUserId: input.actorAuthUserId,
  });

  await emitHrCareerPathingAuditEvent({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    action: hrTalentCareerPathingAuditActions.readiness.compute,
    employeeId: input.employeeId,
    summary: `Computed readiness ${computed.readinessLevel} (${computed.readinessScorePct}%)`,
    metadata: {
      snapshotId,
      readinessLevel: computed.readinessLevel,
      readinessScorePct: computed.readinessScorePct,
    },
  });

  return { ...computed, snapshotId };
}

/** Overview KPI strip — near-ready tally and overdue counts. */
export async function loadHrCareerPathingOverviewKpis(input: {
  organizationId: string;
}): Promise<HrCareerPathingOverviewKpis> {
  const [readinessByLevel, overdueMilestoneCount] = await Promise.all([
    countHrmReadinessByLevel({ organizationId: input.organizationId }),
    countOverdueHrmDevelopmentMilestones({ organizationId: input.organizationId }),
  ]);

  return {
    nearReadyCount: readinessByLevel.near_ready ?? 0,
    readyCount: readinessByLevel.ready ?? 0,
    roleReadyCount: readinessByLevel.role_ready ?? 0,
    overdueMilestoneCount,
    activePlanCount: 0,
  };
}

export async function listHrCareerPathingReadinessWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  employeeId?: string;
  readinessLevel?: Parameters<
    typeof listHrmEmployeeReadinessSnapshotsWindow
  >[0]["readinessLevel"];
}) {
  return listHrmEmployeeReadinessSnapshotsWindow(input);
}

export function buildCareerPathReadinessCsvContent(
  rows: Array<{
    employeeNumber: string;
    employeeName: string;
    targetRoleTitle: string | null;
    readinessLevel: string;
    readinessScore: string | null;
    computedAt: Date;
  }>,
): string {
  const header = [
    "employee_number",
    "employee_name",
    "target_role",
    "readiness_level",
    "readiness_score",
    "computed_at",
  ].join(",");

  const body = rows.map((row) =>
    [
      csvEscape(row.employeeNumber),
      csvEscape(row.employeeName),
      csvEscape(row.targetRoleTitle ?? ""),
      csvEscape(row.readinessLevel),
      csvEscape(row.readinessScore ?? ""),
      csvEscape(row.computedAt.toISOString()),
    ].join(","),
  );

  return [header, ...body].join("\n");
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Batch recompute readiness for all employees with target roles (cron/admin). */
export async function recomputeOrgCareerPathReadiness(input: {
  organizationId: string;
  actorAuthUserId: string;
  employeeIds: readonly string[];
}): Promise<{ computedCount: number }> {
  let computedCount = 0;
  for (const employeeId of input.employeeIds) {
    await computeAndPersistEmployeeReadiness({
      organizationId: input.organizationId,
      employeeId,
      actorAuthUserId: input.actorAuthUserId,
    });
    computedCount += 1;
  }
  return { computedCount };
}

export async function writeCareerPathReadinessExportAudit(input: {
  organizationId: string;
  actorAuthUserId: string;
  rowCount: number;
}): Promise<void> {
  await writeExecutionAuditEvent({
    organizationId: input.organizationId,
    actorId: input.actorAuthUserId,
    actorType: "user",
    action: hrTalentCareerPathingAuditActions.readiness.exportCsv,
    targetType: "hr.talent.career-pathing",
    targetId: input.organizationId,
    summary: `Exported ${input.rowCount} readiness rows to CSV`,
    metadata: { rowCount: input.rowCount },
  });
}

export { runWithOrganizationContext };
