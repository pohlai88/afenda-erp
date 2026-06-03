/** HRM-OTM-029 — overtime audit action strings. */
export const hrTimeOtmAuditActions = {
  request: {
    create: "erp.hrm.overtime.request.create",
    draftSave: "erp.hrm.overtime.request.draft_save",
    submit: "erp.hrm.overtime.request.submit",
    cancel: "erp.hrm.overtime.request.cancel",
    approve: "erp.hrm.overtime.request.approve",
    reject: "erp.hrm.overtime.request.reject",
    return: "erp.hrm.overtime.request.return",
    adjust: "erp.hrm.overtime.request.adjust",
  },
  eligibility: {
    validate: "erp.hrm.overtime.eligibility.validate",
  },
  exception: {
    approve: "erp.hrm.overtime.exception.approve",
    reject: "erp.hrm.overtime.exception.reject",
  },
  calculation: {
    apply: "erp.hrm.overtime.calculation.apply",
  },
  compensatory: {
    create: "erp.hrm.overtime.compensatory_leave.create",
  },
  payroll: {
    export: "erp.hrm.overtime.payroll.export",
    ready: "erp.hrm.overtime.payroll.ready",
    paid: "erp.hrm.overtime.payroll.paid",
  },
} as const;

export const HRM_OTM_AUDIT = hrTimeOtmAuditActions;
