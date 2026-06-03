export const hrTalentCsfAssessmentAuditActions = {
  profile: {
    competencyCreate: "hr.csf.profile.competency.create",
    competencyUpdate: "hr.csf.profile.competency.update",
    skillCreate: "hr.csf.profile.skill.create",
    skillUpdate: "hr.csf.profile.skill.update",
  },
  assessment: {
    selfSubmit: "hr.csf.assessment.self.submit",
    managerSubmit: "hr.csf.assessment.manager.submit",
    validate: "hr.csf.assessment.validate",
    evidenceAdd: "hr.csf.assessment.evidence.add",
  },
} as const;
