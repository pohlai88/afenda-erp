export const HR_SUCCESSION_AUDIT_PREFIX = "hr.talent.succession" as const;

export const hrTalentSuccessionAuditActions = {
  criticalRole: {
    setup: `${HR_SUCCESSION_AUDIT_PREFIX}.critical_role.setup`,
    update: `${HR_SUCCESSION_AUDIT_PREFIX}.critical_role.update`,
  },
  successor: {
    nominate: `${HR_SUCCESSION_AUDIT_PREFIX}.successor.nominate`,
    readinessAssess: `${HR_SUCCESSION_AUDIT_PREFIX}.successor.readiness_assess`,
  },
  calibration: {
    review: `${HR_SUCCESSION_AUDIT_PREFIX}.calibration.review`,
  },
  development: {
    reference: `${HR_SUCCESSION_AUDIT_PREFIX}.development.reference`,
  },
  review: {
    cycle: `${HR_SUCCESSION_AUDIT_PREFIX}.review.cycle`,
    approve: `${HR_SUCCESSION_AUDIT_PREFIX}.review.approve`,
  },
  decision: {
    approveRecommendation: `${HR_SUCCESSION_AUDIT_PREFIX}.decision.approve_recommendation`,
    exposeLifecycle: `${HR_SUCCESSION_AUDIT_PREFIX}.decision.expose_lifecycle`,
  },
} as const;

type NestedAuditActionValues<T> = T extends string
  ? T
  : T extends Record<string, infer Value>
    ? NestedAuditActionValues<Value>
    : never;

export type HrTalentSuccessionAuditAction = NestedAuditActionValues<
  typeof hrTalentSuccessionAuditActions
>;
