export const hrTimeFwaAuditActions = {
  request: {
    submitted: "hr.time.fwa.request.submitted",
    cancelled: "hr.time.fwa.request.cancelled",
  },
  approval: {
    approved: "hr.time.fwa.approval.approved",
    rejected: "hr.time.fwa.approval.rejected",
    returned: "hr.time.fwa.approval.returned",
    exceptionApproved: "hr.time.fwa.approval.exception_approved",
  },
  arrangement: {
    renewed: "hr.time.fwa.arrangement.renewed",
    suspended: "hr.time.fwa.arrangement.suspended",
    terminated: "hr.time.fwa.arrangement.terminated",
  },
  schedule: {
    created: "hr.time.fwa.schedule.created",
    updated: "hr.time.fwa.schedule.updated",
  },
  location: {
    upserted: "hr.time.fwa.location.upserted",
    approved: "hr.time.fwa.location.approved",
  },
} as const;

export type HrTimeFwaAuditAction =
  | (typeof hrTimeFwaAuditActions.request)[keyof typeof hrTimeFwaAuditActions.request]
  | (typeof hrTimeFwaAuditActions.approval)[keyof typeof hrTimeFwaAuditActions.approval]
  | (typeof hrTimeFwaAuditActions.arrangement)[keyof typeof hrTimeFwaAuditActions.arrangement]
  | (typeof hrTimeFwaAuditActions.schedule)[keyof typeof hrTimeFwaAuditActions.schedule]
  | (typeof hrTimeFwaAuditActions.location)[keyof typeof hrTimeFwaAuditActions.location];
