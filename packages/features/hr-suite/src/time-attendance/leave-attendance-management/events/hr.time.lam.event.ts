export const hrTimeLamAuditActions = {
  attendanceDay: {
    upserted: "hr.lam.attendance_day.upserted",
  },
  leaveApplication: {
    submitted: "hr.lam.leave_application.submitted",
  },
  leaveTypeConfig: {
    upserted: "hr.lam.leave_type_config.upserted",
  },
  entitlementRule: {
    created: "hr.lam.entitlement_rule.created",
  },
} as const;

export type HrTimeLamAuditAction =
  | (typeof hrTimeLamAuditActions.attendanceDay)[keyof typeof hrTimeLamAuditActions.attendanceDay]
  | (typeof hrTimeLamAuditActions.leaveApplication)[keyof typeof hrTimeLamAuditActions.leaveApplication]
  | (typeof hrTimeLamAuditActions.leaveTypeConfig)[keyof typeof hrTimeLamAuditActions.leaveTypeConfig]
  | (typeof hrTimeLamAuditActions.entitlementRule)[keyof typeof hrTimeLamAuditActions.entitlementRule];
