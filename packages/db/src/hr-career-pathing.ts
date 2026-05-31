import { runWithOrganizationContext } from "./client";

export { HrCareerPathingCommandError } from "./hr-career-pathing.shared";

export type {
  HrCareerCompetencyGapRow,
  HrCareerRoleCompareResult,
  HrCareerRoleStructureGap,
  HrCareerSkillGapCompareResult,
  HrCareerSkillGapRow,
  HrCareerPathingDueNotificationItem,
  HrDevelopmentLearningRef,
  HrDevelopmentPlanAppraisalRef,
  HrReadinessSuccessionRef,
} from "./hr-career-pathing-foundation";

export type { HrmLearningActionRecommendationDraft } from "./hr-career-pathing-learning-recommendations.shared";

import {
  assignHrmDevelopmentCoachInTx,
  assignHrmDevelopmentMentorInTx,
  createHrmCareerDiscussionInTx,
  createHrmDevelopmentLearningActionInTx,
  createHrmDevelopmentSessionInTx,
  createHrmDevelopmentStretchAssignmentInTx,
  recommendHrmLearningActionsFromGapsInTx,
  updateHrmCareerDiscussionInTx,
  updateHrmDevelopmentLearningActionInTx,
} from "./hr-career-pathing-assignments";

import {
  compareEmployeeCurrentRoleToTarget as compareEmployeeCurrentRoleToTargetInTx,
  countHrmReadinessByLevel as countHrmReadinessByLevelInTx,
  countOverdueHrmDevelopmentMilestones as countOverdueHrmDevelopmentMilestonesInTx,
  createHrmCareerPathFrameworkInTx,
  createHrmCareerPathStageInTx,
  createHrmDevelopmentGoalInTx,
  createHrmDevelopmentMilestoneInTx,
  createHrmDevelopmentPlanInTx,
  deleteHrmCareerPathStageInTx,
  insertHrmEmployeeReadinessSnapshotInTx,
  listDevelopmentLearningRefsForEmployee as listDevelopmentLearningRefsForEmployeeInTx,
  listDevelopmentPlanRefsForAppraisal as listDevelopmentPlanRefsForAppraisalInTx,
  listHrmCareerDiscussionsWindow as listHrmCareerDiscussionsWindowInTx,
  listHrmCareerPathingDueForNotification as listHrmCareerPathingDueForNotificationInTx,
  listHrmCareerPathFrameworksWindow as listHrmCareerPathFrameworksWindowInTx,
  listHrmCareerPathStagesWindow as listHrmCareerPathStagesWindowInTx,
  listHrmDevelopmentGoalsWindow as listHrmDevelopmentGoalsWindowInTx,
  listHrmDevelopmentLearningActionsWindow as listHrmDevelopmentLearningActionsWindowInTx,
  listHrmDevelopmentMilestonesWindow as listHrmDevelopmentMilestonesWindowInTx,
  listHrmDevelopmentPlansWindow as listHrmDevelopmentPlansWindowInTx,
  listHrmDevelopmentSessionsWindow as listHrmDevelopmentSessionsWindowInTx,
  listHrmDevelopmentStretchAssignmentsWindow as listHrmDevelopmentStretchAssignmentsWindowInTx,
  loadHrmDevelopmentCoachAssignmentForPlan as loadHrmDevelopmentCoachAssignmentForPlanInTx,
  loadHrmDevelopmentMentorAssignmentForPlan as loadHrmDevelopmentMentorAssignmentForPlanInTx,
  listHrmEmployeeCareerAspirationsWindow as listHrmEmployeeCareerAspirationsWindowInTx,
  listHrmEmployeeReadinessSnapshotsWindow as listHrmEmployeeReadinessSnapshotsWindowInTx,
  listHrmEmployeeTargetRolesWindow as listHrmEmployeeTargetRolesWindowInTx,
  listReadinessRefsForSuccession as listReadinessRefsForSuccessionInTx,
  listSkillGapsForEmployee as listSkillGapsForEmployeeInTx,
  loadEmployeeCompetencyProficiencyMap as loadEmployeeCompetencyProficiencyMapInTx,
  loadEmployeeSkillProficiencyMap as loadEmployeeSkillProficiencyMapInTx,
  updateHrmCareerPathFrameworkStatusInTx,
  updateHrmCareerPathStageInTx,
  updateHrmDevelopmentGoalStatusInTx,
  updateHrmDevelopmentMilestoneStatusInTx,
  updateHrmDevelopmentPlanStatusInTx,
  upsertHrmCareerPathFrameworkInTx,
  upsertHrmEmployeeCareerAspirationInTx,
  upsertHrmEmployeeTargetRoleInTx,
} from "./hr-career-pathing-foundation";

type OrgScopedInput = { organizationId: string };

function withOrgContext<TInput extends OrgScopedInput, TResult>(
  input: TInput,
  run: (
    db: Parameters<typeof listHrmCareerPathFrameworksWindowInTx>[0],
    scopedInput: TInput,
  ) => Promise<TResult>,
): Promise<TResult> {
  return runWithOrganizationContext(input.organizationId, (db) => run(db, input));
}

export async function loadEmployeeSkillProficiencyMap(
  input: Parameters<typeof loadEmployeeSkillProficiencyMapInTx>[1],
) {
  return withOrgContext(input, loadEmployeeSkillProficiencyMapInTx);
}

export async function loadEmployeeCompetencyProficiencyMap(
  input: Parameters<typeof loadEmployeeCompetencyProficiencyMapInTx>[1],
) {
  return withOrgContext(input, loadEmployeeCompetencyProficiencyMapInTx);
}

export async function createHrmCareerPathFramework(
  input: Parameters<typeof createHrmCareerPathFrameworkInTx>[1],
) {
  return withOrgContext(input, createHrmCareerPathFrameworkInTx);
}

export async function updateHrmCareerPathFrameworkStatus(
  input: Parameters<typeof updateHrmCareerPathFrameworkStatusInTx>[1],
) {
  return withOrgContext(input, updateHrmCareerPathFrameworkStatusInTx);
}

export async function upsertHrmCareerPathFramework(
  input: Parameters<typeof upsertHrmCareerPathFrameworkInTx>[1],
) {
  return withOrgContext(input, upsertHrmCareerPathFrameworkInTx);
}

export async function createHrmCareerPathStage(
  input: Parameters<typeof createHrmCareerPathStageInTx>[1],
) {
  return withOrgContext(input, createHrmCareerPathStageInTx);
}

export async function updateHrmCareerPathStage(
  input: Parameters<typeof updateHrmCareerPathStageInTx>[1],
) {
  return withOrgContext(input, updateHrmCareerPathStageInTx);
}

export async function deleteHrmCareerPathStage(
  input: Parameters<typeof deleteHrmCareerPathStageInTx>[1],
) {
  return withOrgContext(input, deleteHrmCareerPathStageInTx);
}

export async function upsertHrmEmployeeCareerAspiration(
  input: Parameters<typeof upsertHrmEmployeeCareerAspirationInTx>[1],
) {
  return withOrgContext(input, upsertHrmEmployeeCareerAspirationInTx);
}

export async function upsertHrmEmployeeTargetRole(
  input: Parameters<typeof upsertHrmEmployeeTargetRoleInTx>[1],
) {
  return withOrgContext(input, upsertHrmEmployeeTargetRoleInTx);
}

export async function createHrmDevelopmentPlan(
  input: Parameters<typeof createHrmDevelopmentPlanInTx>[1],
) {
  return withOrgContext(input, createHrmDevelopmentPlanInTx);
}

export async function updateHrmDevelopmentPlanStatus(
  input: Parameters<typeof updateHrmDevelopmentPlanStatusInTx>[1],
) {
  return withOrgContext(input, updateHrmDevelopmentPlanStatusInTx);
}

export async function createHrmDevelopmentGoal(
  input: Parameters<typeof createHrmDevelopmentGoalInTx>[1],
) {
  return withOrgContext(input, createHrmDevelopmentGoalInTx);
}

export async function updateHrmDevelopmentGoalStatus(
  input: Parameters<typeof updateHrmDevelopmentGoalStatusInTx>[1],
) {
  return withOrgContext(input, updateHrmDevelopmentGoalStatusInTx);
}

export async function createHrmDevelopmentMilestone(
  input: Parameters<typeof createHrmDevelopmentMilestoneInTx>[1],
) {
  return withOrgContext(input, createHrmDevelopmentMilestoneInTx);
}

export async function updateHrmDevelopmentMilestoneStatus(
  input: Parameters<typeof updateHrmDevelopmentMilestoneStatusInTx>[1],
) {
  return withOrgContext(input, updateHrmDevelopmentMilestoneStatusInTx);
}

export async function insertHrmEmployeeReadinessSnapshot(
  input: Parameters<typeof insertHrmEmployeeReadinessSnapshotInTx>[1],
) {
  return withOrgContext(input, insertHrmEmployeeReadinessSnapshotInTx);
}

export async function compareEmployeeCurrentRoleToTarget(
  input: Parameters<typeof compareEmployeeCurrentRoleToTargetInTx>[1],
) {
  return withOrgContext(input, compareEmployeeCurrentRoleToTargetInTx);
}

export async function listSkillGapsForEmployee(
  input: Parameters<typeof listSkillGapsForEmployeeInTx>[1],
) {
  return withOrgContext(input, listSkillGapsForEmployeeInTx);
}

export async function listHrmCareerPathFrameworksWindow(
  input: Parameters<typeof listHrmCareerPathFrameworksWindowInTx>[1],
) {
  return withOrgContext(input, listHrmCareerPathFrameworksWindowInTx);
}

export async function listHrmCareerPathStagesWindow(
  input: Parameters<typeof listHrmCareerPathStagesWindowInTx>[1],
) {
  return withOrgContext(input, listHrmCareerPathStagesWindowInTx);
}

export async function listHrmEmployeeCareerAspirationsWindow(
  input: Parameters<typeof listHrmEmployeeCareerAspirationsWindowInTx>[1],
) {
  return withOrgContext(input, listHrmEmployeeCareerAspirationsWindowInTx);
}

export async function listHrmEmployeeTargetRolesWindow(
  input: Parameters<typeof listHrmEmployeeTargetRolesWindowInTx>[1],
) {
  return withOrgContext(input, listHrmEmployeeTargetRolesWindowInTx);
}

export async function listHrmDevelopmentPlansWindow(
  input: Parameters<typeof listHrmDevelopmentPlansWindowInTx>[1],
) {
  return withOrgContext(input, listHrmDevelopmentPlansWindowInTx);
}

export async function listHrmDevelopmentGoalsWindow(
  input: Parameters<typeof listHrmDevelopmentGoalsWindowInTx>[1],
) {
  return withOrgContext(input, listHrmDevelopmentGoalsWindowInTx);
}

export async function listHrmDevelopmentMilestonesWindow(
  input: Parameters<typeof listHrmDevelopmentMilestonesWindowInTx>[1],
) {
  return withOrgContext(input, listHrmDevelopmentMilestonesWindowInTx);
}

export async function listHrmDevelopmentLearningActionsWindow(
  input: Parameters<typeof listHrmDevelopmentLearningActionsWindowInTx>[1],
) {
  return withOrgContext(input, listHrmDevelopmentLearningActionsWindowInTx);
}

export async function listHrmDevelopmentStretchAssignmentsWindow(
  input: Parameters<typeof listHrmDevelopmentStretchAssignmentsWindowInTx>[1],
) {
  return withOrgContext(input, listHrmDevelopmentStretchAssignmentsWindowInTx);
}

export async function listHrmCareerDiscussionsWindow(
  input: Parameters<typeof listHrmCareerDiscussionsWindowInTx>[1],
) {
  return withOrgContext(input, listHrmCareerDiscussionsWindowInTx);
}

export async function listHrmEmployeeReadinessSnapshotsWindow(
  input: Parameters<typeof listHrmEmployeeReadinessSnapshotsWindowInTx>[1],
) {
  return withOrgContext(input, listHrmEmployeeReadinessSnapshotsWindowInTx);
}

export async function listDevelopmentPlanRefsForAppraisal(
  input: Parameters<typeof listDevelopmentPlanRefsForAppraisalInTx>[1],
) {
  return withOrgContext(input, listDevelopmentPlanRefsForAppraisalInTx);
}

export async function listReadinessRefsForSuccession(
  input: Parameters<typeof listReadinessRefsForSuccessionInTx>[1],
) {
  return withOrgContext(input, listReadinessRefsForSuccessionInTx);
}

export async function listDevelopmentLearningRefsForEmployee(
  input: Parameters<typeof listDevelopmentLearningRefsForEmployeeInTx>[1],
) {
  return withOrgContext(input, listDevelopmentLearningRefsForEmployeeInTx);
}

export async function countOverdueHrmDevelopmentMilestones(
  input: Parameters<typeof countOverdueHrmDevelopmentMilestonesInTx>[1],
) {
  return withOrgContext(input, countOverdueHrmDevelopmentMilestonesInTx);
}

export async function countHrmReadinessByLevel(
  input: Parameters<typeof countHrmReadinessByLevelInTx>[1],
) {
  return withOrgContext(input, countHrmReadinessByLevelInTx);
}

export async function createHrmDevelopmentLearningAction(
  input: Parameters<typeof createHrmDevelopmentLearningActionInTx>[1],
) {
  return withOrgContext(input, createHrmDevelopmentLearningActionInTx);
}

export async function createHrmDevelopmentStretchAssignment(
  input: Parameters<typeof createHrmDevelopmentStretchAssignmentInTx>[1],
) {
  return withOrgContext(input, createHrmDevelopmentStretchAssignmentInTx);
}

export async function assignHrmDevelopmentMentor(
  input: Parameters<typeof assignHrmDevelopmentMentorInTx>[1],
) {
  return withOrgContext(input, assignHrmDevelopmentMentorInTx);
}

export async function assignHrmDevelopmentCoach(
  input: Parameters<typeof assignHrmDevelopmentCoachInTx>[1],
) {
  return withOrgContext(input, assignHrmDevelopmentCoachInTx);
}

export async function createHrmDevelopmentSession(
  input: Parameters<typeof createHrmDevelopmentSessionInTx>[1],
) {
  return withOrgContext(input, createHrmDevelopmentSessionInTx);
}

export async function createHrmCareerDiscussion(
  input: Parameters<typeof createHrmCareerDiscussionInTx>[1],
) {
  return withOrgContext(input, createHrmCareerDiscussionInTx);
}

export async function updateHrmCareerDiscussion(
  input: Parameters<typeof updateHrmCareerDiscussionInTx>[1],
) {
  return withOrgContext(input, updateHrmCareerDiscussionInTx);
}

export async function updateHrmDevelopmentLearningAction(
  input: Parameters<typeof updateHrmDevelopmentLearningActionInTx>[1],
) {
  return withOrgContext(input, updateHrmDevelopmentLearningActionInTx);
}

export async function recommendHrmLearningActionsFromGaps(
  input: Parameters<typeof recommendHrmLearningActionsFromGapsInTx>[1],
) {
  return withOrgContext(input, recommendHrmLearningActionsFromGapsInTx);
}

export async function listHrmDevelopmentSessionsWindow(
  input: Parameters<typeof listHrmDevelopmentSessionsWindowInTx>[1],
) {
  return withOrgContext(input, listHrmDevelopmentSessionsWindowInTx);
}

export async function loadHrmDevelopmentMentorAssignmentForPlan(
  input: Parameters<typeof loadHrmDevelopmentMentorAssignmentForPlanInTx>[1],
) {
  return withOrgContext(input, loadHrmDevelopmentMentorAssignmentForPlanInTx);
}

export async function loadHrmDevelopmentCoachAssignmentForPlan(
  input: Parameters<typeof loadHrmDevelopmentCoachAssignmentForPlanInTx>[1],
) {
  return withOrgContext(input, loadHrmDevelopmentCoachAssignmentForPlanInTx);
}

export async function listHrmCareerPathingDueForNotification(
  input: Parameters<typeof listHrmCareerPathingDueForNotificationInTx>[1],
) {
  return withOrgContext(input, listHrmCareerPathingDueForNotificationInTx);
}

export {
  createHrmDevelopmentGoalInTx,
  createHrmDevelopmentMilestoneInTx,
  createHrmDevelopmentPlanInTx,
  updateHrmCareerPathFrameworkStatusInTx,
  updateHrmDevelopmentGoalStatusInTx,
  upsertHrmCareerPathFrameworkInTx,
  upsertHrmEmployeeCareerAspirationInTx,
  upsertHrmEmployeeTargetRoleInTx,
} from "./hr-career-pathing-foundation";
