import { HR_CAREER_PATHING_AUDIT_PREFIX } from "./hr.talent.career-pathing-constants.shared";

/** HRM-CAR-031 — career pathing audit action strings. */
export const hrTalentCareerPathAuditActions = {
  framework: {
    create: `${HR_CAREER_PATHING_AUDIT_PREFIX}.framework.create`,
    update: `${HR_CAREER_PATHING_AUDIT_PREFIX}.framework.update`,
    statusChange: `${HR_CAREER_PATHING_AUDIT_PREFIX}.framework.status_change`,
  },
  aspiration: {
    upsert: `${HR_CAREER_PATHING_AUDIT_PREFIX}.aspiration.upsert`,
  },
  targetRole: {
    upsert: `${HR_CAREER_PATHING_AUDIT_PREFIX}.target_role.upsert`,
    recommend: `${HR_CAREER_PATHING_AUDIT_PREFIX}.target_role.recommend`,
  },
  plan: {
    create: `${HR_CAREER_PATHING_AUDIT_PREFIX}.plan.create`,
    statusChange: `${HR_CAREER_PATHING_AUDIT_PREFIX}.plan.status_change`,
    managerReview: `${HR_CAREER_PATHING_AUDIT_PREFIX}.plan.manager_review`,
  },
  goal: {
    create: `${HR_CAREER_PATHING_AUDIT_PREFIX}.goal.create`,
    statusChange: `${HR_CAREER_PATHING_AUDIT_PREFIX}.goal.status_change`,
    progressUpdate: `${HR_CAREER_PATHING_AUDIT_PREFIX}.goal.progress_update`,
  },
  milestone: {
    create: `${HR_CAREER_PATHING_AUDIT_PREFIX}.milestone.create`,
    statusChange: `${HR_CAREER_PATHING_AUDIT_PREFIX}.milestone.status_change`,
  },
  gap: {
    compare: `${HR_CAREER_PATHING_AUDIT_PREFIX}.gap.compare`,
  },
  learning: {
    recommend: `${HR_CAREER_PATHING_AUDIT_PREFIX}.learning.recommend`,
    create: `${HR_CAREER_PATHING_AUDIT_PREFIX}.learning.create`,
    link: `${HR_CAREER_PATHING_AUDIT_PREFIX}.learning.link`,
  },
  mentor: {
    assign: `${HR_CAREER_PATHING_AUDIT_PREFIX}.mentor.assign`,
  },
  coach: {
    assign: `${HR_CAREER_PATHING_AUDIT_PREFIX}.coach.assign`,
  },
  session: {
    log: `${HR_CAREER_PATHING_AUDIT_PREFIX}.session.log`,
  },
  stretch: {
    assign: `${HR_CAREER_PATHING_AUDIT_PREFIX}.stretch.assign`,
  },
  discussion: {
    create: `${HR_CAREER_PATHING_AUDIT_PREFIX}.discussion.create`,
    update: `${HR_CAREER_PATHING_AUDIT_PREFIX}.discussion.update`,
  },
  readiness: {
    compute: `${HR_CAREER_PATHING_AUDIT_PREFIX}.readiness.compute`,
    exportCsv: `${HR_CAREER_PATHING_AUDIT_PREFIX}.readiness.export_csv`,
  },
  integration: {
    exposeAppraisal: `${HR_CAREER_PATHING_AUDIT_PREFIX}.integration.expose_appraisal`,
    exposeSuccession: `${HR_CAREER_PATHING_AUDIT_PREFIX}.integration.expose_succession`,
    exposeLearning: `${HR_CAREER_PATHING_AUDIT_PREFIX}.integration.expose_learning`,
  },
  notification: {
    overdueMilestone: `${HR_CAREER_PATHING_AUDIT_PREFIX}.notification.overdue_milestone`,
    upcomingReview: `${HR_CAREER_PATHING_AUDIT_PREFIX}.notification.upcoming_review`,
    completedGoal: `${HR_CAREER_PATHING_AUDIT_PREFIX}.notification.completed_goal`,
    careerDiscussion: `${HR_CAREER_PATHING_AUDIT_PREFIX}.notification.career_discussion`,
  },
} as const;

/** Alias used by integration, readiness, and notification modules. */
export const hrTalentCareerPathingAuditActions = hrTalentCareerPathAuditActions;

export type HrTalentCareerPathAuditAction =
  (typeof hrTalentCareerPathAuditActions)[keyof typeof hrTalentCareerPathAuditActions][keyof (typeof hrTalentCareerPathAuditActions)[keyof typeof hrTalentCareerPathAuditActions]];

export type HrTalentCareerPathingAuditAction = HrTalentCareerPathAuditAction;

export const HRM_CAR_AUDIT = hrTalentCareerPathAuditActions;
