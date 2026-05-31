/** HRM-MCP-028 audit verbs for multi-country payroll. */
export const hrPayrollMcpAuditActions = {
  countryConfig: {
    created: "hr.mcp.country_config.create",
    updated: "hr.mcp.country_config.update",
  },
  legalEntity: {
    created: "hr.mcp.legal_entity.create",
    updated: "hr.mcp.legal_entity.update",
  },
  ruleVersion: {
    created: "hr.mcp.rule_version.create",
    published: "hr.mcp.rule_version.publish",
  },
  taxRule: {
    upserted: "hr.mcp.tax_rule.upsert",
  },
  statutoryRule: {
    upserted: "hr.mcp.statutory_rule.upsert",
  },
  employerRule: {
    upserted: "hr.mcp.employer_rule.upsert",
  },
  payComponentTreatment: {
    upserted: "hr.mcp.pay_component_treatment.upsert",
  },
  ruleSnapshot: {
    persisted: "hr.mcp.rule_snapshot.persist",
  },
  employeeClassification: {
    upserted: "hr.mcp.employee_classification.upsert",
  },
  report: {
    generated: "hr.mcp.report.generate",
    exported: "hr.mcp.report.export",
  },
  export: {
    bankFile: "hr.mcp.export.bank_file",
    vendorFile: "hr.mcp.export.vendor_file",
    statutoryPortal: "hr.mcp.export.statutory_portal",
  },
  localization: {
    updated: "hr.mcp.localization.update",
  },
  statutoryCalculation: {
    recorded: "hr.mcp.statutory_calculation.record",
  },
  crossCountryReport: {
    exported: "hr.mcp.cross_country.export",
  },
} as const;

export const HR_MCP_AUDIT_ACTION_VALUES = Object.values(
  hrPayrollMcpAuditActions,
).flatMap((group) => Object.values(group));

export type HrPayrollMcpAuditAction =
  (typeof HR_MCP_AUDIT_ACTION_VALUES)[number];
