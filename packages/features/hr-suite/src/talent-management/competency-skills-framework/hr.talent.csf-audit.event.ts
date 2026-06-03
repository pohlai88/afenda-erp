/** HRM-CSF-031 — canonical CSF audit action strings. */
export const hrTalentCsfAuditActions = {
  competency: {
    create: "hr.csf.competency.create",
    update: "hr.csf.competency.update",
    archive: "hr.csf.competency.archive",
  },
  skill: {
    create: "hr.csf.skill.create",
    update: "hr.csf.skill.update",
    archive: "hr.csf.skill.archive",
  },
  roleMapping: {
    create: "hr.csf.role_mapping.create",
    update: "hr.csf.role_mapping.update",
    remove: "hr.csf.role_mapping.remove",
  },
  assessment: {
    selfSubmit: "hr.csf.assessment.self_submit",
    managerSubmit: "hr.csf.assessment.manager_submit",
    hrValidate: "hr.csf.assessment.hr_validate",
  },
  gap: {
    analyze: "hr.csf.gap.analyze",
    classify: "hr.csf.gap.classify",
  },
  recommendation: {
    create: "hr.csf.recommendation.create",
    linkTraining: "hr.csf.recommendation.link_training",
  },
  profile: {
    update: "hr.csf.profile.update",
  },
  integration: {
    exposeTraining: "hr.csf.integration.training_expose",
    exposeLms: "hr.csf.integration.lms_expose",
    exposePerformance: "hr.csf.integration.performance_expose",
    exposeSuccession: "hr.csf.integration.succession_expose",
  },
  report: {
    export: "hr.csf.report.export",
  },
  matching: {
    query: "hr.csf.matching.query",
  },
  careerPath: {
    compare: "hr.csf.career_path.compare",
  },
} as const;

export type HrTalentCsfAuditAction =
  (typeof hrTalentCsfAuditActions)[keyof typeof hrTalentCsfAuditActions][keyof (typeof hrTalentCsfAuditActions)[keyof typeof hrTalentCsfAuditActions]];
