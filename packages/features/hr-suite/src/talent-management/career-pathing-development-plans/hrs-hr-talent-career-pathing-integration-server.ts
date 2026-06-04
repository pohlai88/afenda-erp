import {
  listDevelopmentLearningRefsForEmployee,
  listDevelopmentPlanRefsForAppraisal,
  listReadinessRefsForSuccession,
} from "@afenda/db";

import type {
  HrCareerDevelopmentLearningRef,
  HrCareerDevelopmentPlanAppraisalRef,
  HrCareerPathingIntegrationQuery,
  HrCareerSuccessionReadinessRef,
} from "./hr.talent.career-pathing-integration.contract";
import { hrTalentCareerPathingAuditActions } from "./hr.talent.career-pathing.event";
import { emitHrCareerPathingAuditEvent } from "./hrs-hr-talent-career-pathing-audit-server";

/** HRM-CAR-026 — expose development plan refs to Performance Appraisals. */
export async function listCareerPathDevelopmentPlanRefsForAppraisal(
  query: HrCareerPathingIntegrationQuery,
): Promise<readonly HrCareerDevelopmentPlanAppraisalRef[]> {
  if (!query.performanceAuthorized || !query.employeeId) {
    return [];
  }

  const rows = await listDevelopmentPlanRefsForAppraisal({
    organizationId: query.organizationId,
    employeeId: query.employeeId,
    limit: query.limit,
  });

  await emitHrCareerPathingAuditEvent({
    organizationId: query.organizationId,
    action: hrTalentCareerPathingAuditActions.integration.exposeAppraisal,
    employeeId: query.employeeId,
    summary: `Exposed ${rows.length} development plan refs to Performance Appraisals`,
    metadata: { rowCount: rows.length },
  });

  return rows.map((row) => ({
    organizationId: query.organizationId,
    employeeId: row.employeeId,
    planId: row.planId,
    planCode: row.code,
    planTitle: row.title,
    planStatus: row.planStatus,
    goalCount: row.goalCount,
    completedGoalCount: row.completedGoalCount,
    targetCompletionDate: row.targetCompletionDate?.toISOString() ?? null,
  }));
}

/** HRM-CAR-027 — expose readiness indicators to Succession Planning where authorized. */
export async function listReadinessRefsForSuccessionPlanning(
  query: HrCareerPathingIntegrationQuery,
): Promise<readonly HrCareerSuccessionReadinessRef[]> {
  if (!query.successionAuthorized) {
    return [];
  }

  const rows = await listReadinessRefsForSuccession({
    organizationId: query.organizationId,
    readinessLevels: query.readinessLevels,
    limit: query.limit,
  });

  await emitHrCareerPathingAuditEvent({
    organizationId: query.organizationId,
    action: hrTalentCareerPathingAuditActions.integration.exposeSuccession,
    summary: `Exposed ${rows.length} readiness refs to Succession Planning`,
    metadata: { rowCount: rows.length },
  });

  return rows.map((row) => ({
    organizationId: query.organizationId,
    employeeId: row.employeeId,
    employeeNumber: row.employeeNumber,
    employeeName: row.employeeName,
    targetRoleId: row.targetRoleId,
    targetRoleTitle: row.targetRoleTitle,
    readinessLevel: row.readinessLevel as HrCareerSuccessionReadinessRef["readinessLevel"],
    readinessScore: row.readinessScore,
    computedAt: row.computedAt.toISOString(),
  }));
}

/** HRM-CAR-028 — expose learning recommendations to Training & LMS. */
export async function listDevelopmentLearningRefsForEmployeeTraining(
  query: HrCareerPathingIntegrationQuery,
): Promise<readonly HrCareerDevelopmentLearningRef[]> {
  if (!query.employeeId) {
    return [];
  }

  const rows = await listDevelopmentLearningRefsForEmployee({
    organizationId: query.organizationId,
    employeeId: query.employeeId,
    limit: query.limit,
    includeCompleted: query.includeCompletedLearning,
  });

  await emitHrCareerPathingAuditEvent({
    organizationId: query.organizationId,
    action: hrTalentCareerPathingAuditActions.integration.exposeLearning,
    employeeId: query.employeeId,
    summary: `Exposed ${rows.length} learning refs to Training & LMS`,
    metadata: { rowCount: rows.length },
  });

  return rows.map((row) => ({
    organizationId: query.organizationId,
    employeeId: query.employeeId!,
    learningActionId: row.learningActionId,
    planId: row.planId,
    planCode: row.planCode,
    title: row.title,
    trainingCourseId: row.trainingCourseId,
    externalTrainingRef: row.externalTrainingRef,
    learningActionStatus: row.learningActionStatus,
    dueDate: row.dueDate?.toISOString() ?? null,
  }));
}

/** Public integration aliases matching architecture doc door names. */
export {
  listCareerPathDevelopmentPlanRefsForAppraisal as listDevelopmentPlanRefsForAppraisalExport,
  listReadinessRefsForSuccessionPlanning as listReadinessRefsForSuccession,
  listDevelopmentLearningRefsForEmployeeTraining as listDevelopmentLearningRefsForEmployee,
};
