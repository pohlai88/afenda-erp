export const hrMcpCountryConfigsColumnsId = "hr.payroll.mcp.country-configs";
export const hrMcpRuleVersionsColumnsId = "hr.payroll.mcp.rule-versions";
export const hrMcpCrossCountryCostColumnsId = "hr.payroll.mcp.cross-country-cost";
export const hrMcpAuditTrailColumnsId = "hr.payroll.mcp.audit-trail";

export const HR_MCP_LIST_SURFACE_COLUMNS_BY_KEY = {
  "hr.payroll.mcp.country-configs.list": hrMcpCountryConfigsColumnsId,
  "hr.payroll.mcp.rule-versions.list": hrMcpRuleVersionsColumnsId,
  "hr.payroll.mcp.cross-country-cost.list": hrMcpCrossCountryCostColumnsId,
  "hr.payroll.mcp.audit-trail.list": hrMcpAuditTrailColumnsId,
} as const;
