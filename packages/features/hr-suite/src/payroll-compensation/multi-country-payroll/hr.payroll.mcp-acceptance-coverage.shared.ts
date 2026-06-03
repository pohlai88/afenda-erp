/** HRM-MCP-001 … HRM-MCP-028 requirement coverage (code-verified). */
export type McpCoverageStatus = "shipped" | "partial" | "deferred";

export type McpRequirementCoverage = {
  readonly code: `HRM-MCP-${string}`;
  readonly status: McpCoverageStatus;
  readonly evidence: readonly string[];
};

export const MCP_REQUIREMENT_COVERAGE: readonly McpRequirementCoverage[] = [
  {
    code: "HRM-MCP-001",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-multi-country-payroll.ts (hr_mcp_country_configs)",
      "packages/db/src/hr-multi-country-payroll.ts (createHrMcpCountryConfigInTx, listHrMcpCountryConfigsWindow)",
      "packages/features/hr-suite/.../actions/hr.payroll.mcp.actions.server.ts (createCountryConfigAction)",
    ],
  },
  {
    code: "HRM-MCP-002",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-multi-country-payroll.ts (hr_mcp_legal_entity_setups)",
      "packages/db/src/hr-multi-country-payroll.ts (createHrMcpLegalEntitySetupInTx, listHrMcpLegalEntitySetupsWindow)",
    ],
  },
  {
    code: "HRM-MCP-003",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-multi-country-payroll.ts (hr_mcp_tax_rules)",
      "packages/db/src/hr-multi-country-payroll.ts (upsertHrMcpTaxRuleInTx, listHrMcpTaxRules)",
      "packages/features/hr-suite/.../actions/hr.payroll.mcp.actions.server.ts (upsertTaxRuleAction)",
    ],
  },
  {
    code: "HRM-MCP-004",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-multi-country-payroll.ts (hr_mcp_statutory_contribution_rules)",
      "packages/db/src/hr-multi-country-payroll.ts (upsertHrMcpStatutoryContributionRuleInTx)",
    ],
  },
  {
    code: "HRM-MCP-005",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-multi-country-payroll.ts (hr_mcp_employer_contribution_rules)",
      "packages/db/src/hr-multi-country-payroll.ts (upsertHrMcpEmployerContributionRuleInTx)",
    ],
  },
  {
    code: "HRM-MCP-006",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-multi-country-payroll.ts (hr_mcp_pay_component_treatments)",
      "packages/db/src/hr-multi-country-payroll.ts (upsertHrMcpPayComponentTreatmentInTx)",
    ],
  },
  {
    code: "HRM-MCP-007",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-multi-country-payroll.ts (tax/contribution/pension treatment enums)",
      "packages/db/src/hr-multi-country-payroll.ts (upsertHrMcpPayComponentTreatmentInTx)",
    ],
  },
  {
    code: "HRM-MCP-008",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-multi-country-payroll.ts (hr_mcp_currency_configs)",
      "packages/db/src/hr-multi-country-payroll.ts (listHrMcpCrossCountryReportingScopeWindow)",
    ],
  },
  {
    code: "HRM-MCP-009",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-multi-country-payroll.ts (hr_mcp_exchange_rates)",
      "packages/db/src/hr-multi-country-payroll.ts (upsertHrMcpExchangeRateInTx)",
    ],
  },
  {
    code: "HRM-MCP-010",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-multi-country-payroll.ts (calendars, periods, holidays, deadlines)",
      "packages/db/src/hr-multi-country-payroll.ts (listHrMcpPayrollCalendars, listHrMcpCalendarPeriods)",
    ],
  },
  {
    code: "HRM-MCP-011",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-multi-country-payroll.ts (hr_mcp_proration_rules)",
      "packages/db/src/hr-multi-country-payroll.ts (listHrMcpProrationRules)",
    ],
  },
  {
    code: "HRM-MCP-012",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-multi-country-payroll.ts (hr_mcp_overtime_rules)",
      "packages/db/src/hr-multi-country-payroll.ts (listHrMcpOvertimeRules)",
    ],
  },
  {
    code: "HRM-MCP-013",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-multi-country-payroll.ts (hr_mcp_leave_payroll_treatments)",
      "packages/db/src/hr-multi-country-payroll.ts (listHrMcpLeavePayrollTreatments)",
    ],
  },
  {
    code: "HRM-MCP-014",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-multi-country-payroll.ts (hr_mcp_employee_classifications)",
      "packages/db/src/hr-multi-country-payroll.ts (upsertHrMcpEmployeeClassificationInTx)",
      "packages/features/hr-suite/.../schemas/hr.payroll.mcp-validation.schema.ts",
    ],
  },
  {
    code: "HRM-MCP-015",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../data/hr.payroll.mcp-statutory-readiness.shared.ts",
      "packages/features/hr-suite/.../tests/mcp-statutory-readiness.test.ts",
    ],
  },
  {
    code: "HRM-MCP-016",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../data/hr.payroll.mcp-threshold-validation.shared.ts",
      "packages/features/hr-suite/.../tests/mcp-threshold-validation.test.ts",
    ],
  },
  {
    code: "HRM-MCP-017",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../data/hr.payroll.mcp-statutory-reports.shared.ts",
      "packages/db/src/schema/hr-multi-country-payroll.ts (hr_mcp_report_configs, hr_mcp_report_generations)",
    ],
  },
  {
    code: "HRM-MCP-018",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../data/hr.payroll.mcp-tax-reports.shared.ts",
    ],
  },
  {
    code: "HRM-MCP-019",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../data/hr.payroll.mcp-contribution-reports.shared.ts",
    ],
  },
  {
    code: "HRM-MCP-020",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../data/hr.payroll.mcp-payslip-fields.shared.ts",
      "packages/db/src/schema/hr-multi-country-payroll.ts (hr_mcp_payslip_field_configs)",
    ],
  },
  {
    code: "HRM-MCP-021",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../data/hr.payroll.mcp-bank-export.shared.ts",
      "packages/db/src/schema/hr-multi-country-payroll.ts (hr_mcp_bank_export_configs)",
    ],
  },
  {
    code: "HRM-MCP-022",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../data/hr.payroll.mcp-vendor-export.shared.ts",
      "packages/features/hr-suite/.../tests/mcp-report-export.test.ts",
    ],
  },
  {
    code: "HRM-MCP-023",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-multi-country-payroll.ts (hr_mcp_rule_versions)",
      "packages/db/src/hr-multi-country-payroll.ts (createHrMcpRuleVersionInTx, publishHrMcpRuleVersionInTx, listHrMcpRuleVersionsWindow)",
      "packages/features/hr-suite/.../data/hr.payroll.mcp-rule-versioning.shared.ts",
      "packages/features/hr-suite/.../tests/mcp-rule-versioning.test.ts",
    ],
  },
  {
    code: "HRM-MCP-024",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-multi-country-payroll.ts (hr_mcp_finalized_rule_snapshots)",
      "packages/db/src/hr-multi-country-payroll.ts (persistHrMcpFinalizedRuleSnapshotInTx, lookupHrMcpFinalizedRuleSnapshot)",
      "packages/features/hr-suite/.../data/hr.payroll.mcp-rule-versioning.shared.ts (buildHrMcpRuleVersionSnapshotPayload)",
      "packages/features/hr-suite/.../actions/hr.payroll.mcp.actions.server.ts (persistFinalizedRuleSnapshotAction)",
    ],
  },
  {
    code: "HRM-MCP-025",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../policies/hr.payroll.mcp-statutory-admin.policy.server.ts",
      "packages/auth/src/index.ts (hr.mcp.statutory.admin capability)",
      "packages/features/hr-suite/.../tests/mcp-access-control.test.ts",
    ],
  },
  {
    code: "HRM-MCP-026",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-multi-country-payroll.ts (listHrMcpCrossCountryCostAggregateWindow, listHrMcpCrossCountryReportingScopeWindow)",
      "packages/features/hr-suite/.../data/hr.payroll.mcp-cross-country-reports.shared.ts",
      "packages/features/hr-suite/.../surface/hr.payroll.mcp-governed-lists.surface.ts",
    ],
  },
  {
    code: "HRM-MCP-027",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../data/hr.payroll.mcp-cross-country-reports.shared.ts (computeConsolidatedEmployerCostTotals)",
      "packages/features/hr-suite/.../actions/hr.payroll.mcp.actions.server.ts (exportCrossCountryCostReportAction)",
    ],
  },
  {
    code: "HRM-MCP-028",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-multi-country-payroll.ts (hr_mcp_audit_events)",
      "packages/db/src/hr-multi-country-payroll.ts (appendHrMcpAuditEventInTx, listHrMcpAuditTrailWindow)",
      "packages/features/hr-suite/.../events/hr.payroll.mcp.event.ts",
      "packages/features/hr-suite/.../data/hr.payroll.mcp-audit.shared.ts",
      "packages/features/hr-suite/.../tests/mcp-audit-trail.test.ts",
    ],
  },
];

export const MCP_ACCEPTANCE_CRITERIA_COVERAGE = [
  { criterion: 1, requirements: ["HRM-MCP-001", "HRM-MCP-002"], status: "shipped" as const },
  { criterion: 2, requirements: ["HRM-MCP-010"], status: "shipped" as const },
  { criterion: 3, requirements: ["HRM-MCP-003"], status: "shipped" as const },
  { criterion: 4, requirements: ["HRM-MCP-004"], status: "shipped" as const },
  { criterion: 5, requirements: ["HRM-MCP-005"], status: "shipped" as const },
  { criterion: 6, requirements: ["HRM-MCP-006", "HRM-MCP-007"], status: "shipped" as const },
  { criterion: 7, requirements: ["HRM-MCP-014"], status: "shipped" as const },
  { criterion: 8, requirements: ["HRM-MCP-015"], status: "shipped" as const },
  { criterion: 9, requirements: ["HRM-MCP-016"], status: "shipped" as const },
  { criterion: 10, requirements: ["HRM-MCP-008"], status: "shipped" as const },
  { criterion: 11, requirements: ["HRM-MCP-009"], status: "shipped" as const },
  { criterion: 12, requirements: ["HRM-MCP-011"], status: "shipped" as const },
  { criterion: 13, requirements: ["HRM-MCP-012", "HRM-MCP-013"], status: "shipped" as const },
  { criterion: 14, requirements: ["HRM-MCP-017"], status: "shipped" as const },
  { criterion: 15, requirements: ["HRM-MCP-018"], status: "shipped" as const },
  { criterion: 16, requirements: ["HRM-MCP-019"], status: "shipped" as const },
  { criterion: 17, requirements: ["HRM-MCP-020"], status: "shipped" as const },
  { criterion: 18, requirements: ["HRM-MCP-021", "HRM-MCP-022"], status: "shipped" as const },
  { criterion: 19, requirements: ["HRM-MCP-023", "HRM-MCP-024"], status: "shipped" as const },
  { criterion: 20, requirements: ["HRM-MCP-026", "HRM-MCP-027"], status: "shipped" as const },
  { criterion: 21, requirements: ["HRM-MCP-025"], status: "shipped" as const },
  { criterion: 22, requirements: ["HRM-MCP-028"], status: "shipped" as const },
] as const;
