import { HRM_EMPLOYEE_ENGAGEMENT_AUDIT } from "./employee-engagement.contract"

/**
 * Audit strings emitted by shipped employee-engagement mutations and crons.
 */
export const HRM_EMPLOYEE_ENGAGEMENT_EMITTED_AUDIT_ACTIONS = [
  HRM_EMPLOYEE_ENGAGEMENT_AUDIT.template.create,
  HRM_EMPLOYEE_ENGAGEMENT_AUDIT.template.update,
  HRM_EMPLOYEE_ENGAGEMENT_AUDIT.template.deprecate,
  HRM_EMPLOYEE_ENGAGEMENT_AUDIT.survey.create,
  HRM_EMPLOYEE_ENGAGEMENT_AUDIT.survey.update,
  HRM_EMPLOYEE_ENGAGEMENT_AUDIT.survey.publish,
  HRM_EMPLOYEE_ENGAGEMENT_AUDIT.survey.close,
  HRM_EMPLOYEE_ENGAGEMENT_AUDIT.invitation.publish,
  HRM_EMPLOYEE_ENGAGEMENT_AUDIT.invitation.remind,
  HRM_EMPLOYEE_ENGAGEMENT_AUDIT.response.draft,
  HRM_EMPLOYEE_ENGAGEMENT_AUDIT.response.submit,
  HRM_EMPLOYEE_ENGAGEMENT_AUDIT.improvementAction.create,
  HRM_EMPLOYEE_ENGAGEMENT_AUDIT.improvementAction.update,
  HRM_EMPLOYEE_ENGAGEMENT_AUDIT.improvementAction.complete,
  HRM_EMPLOYEE_ENGAGEMENT_AUDIT.improvementAction.overdueNotify,
  HRM_EMPLOYEE_ENGAGEMENT_AUDIT.analytics.calculate,
  HRM_EMPLOYEE_ENGAGEMENT_AUDIT.analytics.export,
  HRM_EMPLOYEE_ENGAGEMENT_AUDIT.openText.tag,
] as const
