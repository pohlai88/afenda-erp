export const hrPayrollSbsAuditActions = {
  survey: {
    upload: "hr.sbs.survey.upload",
  },
  version: {
    create: "hr.sbs.version.create",
    update: "hr.sbs.version.update",
  },
  entry: {
    create: "hr.sbs.entry.create",
    update: "hr.sbs.entry.update",
  },
  mapping: {
    create: "hr.sbs.mapping.create",
    submit: "hr.sbs.mapping.submit",
    approved: "hr.sbs.mapping.approved",
    rejected: "hr.sbs.mapping.rejected",
  },
  analysis: {
    run: "hr.sbs.analysis.run",
  },
  recommendation: {
    generate: "hr.sbs.recommendation.generate",
  },
  report: {
    export: "hr.sbs.report.export",
  },
} as const;
