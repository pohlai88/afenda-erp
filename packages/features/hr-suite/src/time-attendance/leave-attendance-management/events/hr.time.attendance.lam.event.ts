/** Audit action strings for LAM mutations (HRM-LAM-030). */
export const hrTimeAttendanceLamAuditActions = {
  leave: {
    medicalCertificateLinked: "hr.lam.leave.medical_certificate.link",
    submitted: "hr.lam.leave.submit",
    approved: "hr.lam.leave.approve",
    rejected: "hr.lam.leave.reject",
    cancelled: "hr.lam.leave.cancel",
    returned: "hr.lam.leave.return",
  },
  attendance: {
    dayRegenerated: "hr.lam.attendance.day.regenerate",
    exceptionDetected: "hr.lam.attendance.exception.detect",
    correctionSubmitted: "hr.lam.attendance.correction.submit",
    correctionApproved: "hr.lam.attendance.correction.approve",
    correctionRejected: "hr.lam.attendance.correction.reject",
  },
  payroll: {
    referenceExported: "hr.lam.payroll.reference.export",
  },
  notification: {
    enqueued: "hr.lam.notification.enqueue",
  },
  reports: {
    exported: "hr.lam.report.export",
  },
} as const;

export type HrTimeAttendanceLamAuditAction =
  (typeof hrTimeAttendanceLamAuditActions)[keyof typeof hrTimeAttendanceLamAuditActions][keyof (typeof hrTimeAttendanceLamAuditActions)[keyof typeof hrTimeAttendanceLamAuditActions]];
