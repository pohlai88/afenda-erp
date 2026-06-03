export const hrMcpCountryConfigsSearchParam = "mcpCountryConfigsSearch";
export const hrMcpRuleVersionsSearchParam = "mcpRuleVersionsSearch";
export const hrMcpCrossCountryCostSearchParam = "mcpCrossCountryCostSearch";
export const hrMcpAuditTrailSearchParam = "mcpAuditTrailSearch";
export const hrMcpCountryConfigIdParam = "mcpCountryConfigId";
export const hrMcpPeriodRefParam = "mcpPeriodRef";

export const hrMcpCountryConfigsSurfaceKey = "hr.payroll.mcp.country-configs.list";
export const hrMcpRuleVersionsSurfaceKey = "hr.payroll.mcp.rule-versions.list";
export const hrMcpCrossCountryCostSurfaceKey = "hr.payroll.mcp.cross-country-cost.list";
export const hrMcpAuditTrailSurfaceKey = "hr.payroll.mcp.audit-trail.list";

export const HR_MCP_LIST_SURFACE_KEYS = [
  hrMcpCountryConfigsSurfaceKey,
  hrMcpRuleVersionsSurfaceKey,
  hrMcpCrossCountryCostSurfaceKey,
  hrMcpAuditTrailSurfaceKey,
] as const;

export type HrMcpListSurfaceKey = (typeof HR_MCP_LIST_SURFACE_KEYS)[number];

export type HrMcpSearchParams = {
  countryConfigsSearch?: string;
  ruleVersionsSearch?: string;
  crossCountryCostSearch?: string;
  auditSearch?: string;
  countryConfigId?: string;
  periodRef?: string;
};

export const HR_MCP_LIST_SEARCH_PARAMS_BY_KEY: Record<
  HrMcpListSurfaceKey,
  string
> = {
  [hrMcpCountryConfigsSurfaceKey]: hrMcpCountryConfigsSearchParam,
  [hrMcpRuleVersionsSurfaceKey]: hrMcpRuleVersionsSearchParam,
  [hrMcpCrossCountryCostSurfaceKey]: hrMcpCrossCountryCostSearchParam,
  [hrMcpAuditTrailSurfaceKey]: hrMcpAuditTrailSearchParam,
};

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = searchParams[key];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function parseHrMcpSearchParams(
  searchParams?: Record<string, string | string[] | undefined>,
): HrMcpSearchParams {
  if (!searchParams) {
    return {};
  }

  return {
    countryConfigsSearch: readSearchParam(
      searchParams,
      hrMcpCountryConfigsSearchParam,
    ),
    ruleVersionsSearch: readSearchParam(
      searchParams,
      hrMcpRuleVersionsSearchParam,
    ),
    crossCountryCostSearch: readSearchParam(
      searchParams,
      hrMcpCrossCountryCostSearchParam,
    ),
    auditSearch: readSearchParam(searchParams, hrMcpAuditTrailSearchParam),
    countryConfigId: readSearchParam(searchParams, hrMcpCountryConfigIdParam),
    periodRef: readSearchParam(searchParams, hrMcpPeriodRefParam),
  };
}

export function toHrMcpHubPageModelInput(
  organizationId: string,
  searchParams?: Record<string, string | string[] | undefined>,
) {
  const parsed = parseHrMcpSearchParams(searchParams);
  return {
    organizationId,
    countryConfigsSearch: parsed.countryConfigsSearch,
  };
}

export function toHrMcpCountryDetailPageModelInput(
  organizationId: string,
  countryConfigId: string,
  searchParams?: Record<string, string | string[] | undefined>,
) {
  const parsed = parseHrMcpSearchParams(searchParams);
  return {
    organizationId,
    countryConfigId,
    ruleVersionsSearch: parsed.ruleVersionsSearch,
  };
}

export function toHrMcpCrossCountryReportsPageModelInput(
  organizationId: string,
  searchParams?: Record<string, string | string[] | undefined>,
) {
  const parsed = parseHrMcpSearchParams(searchParams);
  return {
    organizationId,
    periodRef: parsed.periodRef,
    crossCountryCostSearch: parsed.crossCountryCostSearch,
  };
}

export function toHrMcpAuditPageModelInput(
  organizationId: string,
  searchParams?: Record<string, string | string[] | undefined>,
) {
  const parsed = parseHrMcpSearchParams(searchParams);
  return {
    organizationId,
    auditSearch: parsed.auditSearch,
    countryConfigId: parsed.countryConfigId,
  };
}
