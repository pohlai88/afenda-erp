export const hrIndustryFrmAuditActions = {
  assignmentCreated: "hr.frm.assignment.created",
  assignmentChanged: "hr.frm.assignment.changed",
  mobileCheckInCaptured: "hr.frm.mobile-check-in.captured",
  mobileCheckOutCaptured: "hr.frm.mobile-check-out.captured",
  gpsValidationReferenced: "hr.frm.gps-validation.referenced",
  offlineSyncReconciled: "hr.frm.offline-sync.reconciled",
  travelStatusChanged: "hr.frm.travel-status.changed",
  perDiemReferenced: "hr.frm.per-diem.referenced",
  exceptionHandled: "hr.frm.exception.handled",
  travelApproved: "hr.frm.travel.approved",
  correctionRecorded: "hr.frm.correction.recorded",
  payrollReferenceExposed: "hr.frm.payroll-reference.exposed",
} as const;

export type HrIndustryFrmAuditAction =
  (typeof hrIndustryFrmAuditActions)[keyof typeof hrIndustryFrmAuditActions];
