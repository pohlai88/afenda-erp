import {
  listHrMcpAuditTrailWindow,
  listHrMcpCountryConfigsWindow,
  listHrMcpCrossCountryCostAggregateWindow,
  listHrMcpRuleVersionsWindow,
} from "@afenda/db";

import {
  buildHrMcpAuditTrailListSurface,
  buildHrMcpCountryConfigsListSurface,
  buildHrMcpCrossCountryCostListSurface,
  buildHrMcpRuleVersionsListSurface,
} from "./hr.payroll.mcp-governed-lists.surface";
import {
  hrMcpAuditTrailSurfaceKey,
  hrMcpCountryConfigsSurfaceKey,
  hrMcpCrossCountryCostSurfaceKey,
  hrMcpRuleVersionsSurfaceKey,
} from "./hr.payroll.mcp-search-params.parse.shared";

const MCP_DEFAULT_PAGE_SIZE = 25;
const MCP_DEFAULT_PERIOD_REF = "current";

export type HrMcpHubPageModel = {
  countryConfigsList: ReturnType<typeof buildHrMcpCountryConfigsListSurface>;
  surfaceKeys: { countryConfigs: typeof hrMcpCountryConfigsSurfaceKey };
};

export type HrMcpCountryDetailPageModel = {
  countryConfigId: string;
  ruleVersionsList: ReturnType<typeof buildHrMcpRuleVersionsListSurface>;
  surfaceKeys: { ruleVersions: typeof hrMcpRuleVersionsSurfaceKey };
};

export type HrMcpCrossCountryReportsPageModel = {
  periodRef: string;
  crossCountryCostList: ReturnType<typeof buildHrMcpCrossCountryCostListSurface>;
  surfaceKeys: { crossCountryCost: typeof hrMcpCrossCountryCostSurfaceKey };
};

export type HrMcpAuditPageModel = {
  auditList: ReturnType<typeof buildHrMcpAuditTrailListSurface>;
  surfaceKeys: { auditTrail: typeof hrMcpAuditTrailSurfaceKey };
};

export async function buildHrMcpHubPageModel(input: {
  organizationId: string;
  countryConfigsSearch?: string;
}): Promise<HrMcpHubPageModel> {
  const countryConfigsWindow = await listHrMcpCountryConfigsWindow({
    organizationId: input.organizationId,
    limit: MCP_DEFAULT_PAGE_SIZE,
    search: input.countryConfigsSearch,
  });

  return {
    countryConfigsList: buildHrMcpCountryConfigsListSurface({
      window: {
        ...countryConfigsWindow,
        rows: [...countryConfigsWindow.rows],
      },
      searchValue: input.countryConfigsSearch,
    }),
    surfaceKeys: { countryConfigs: hrMcpCountryConfigsSurfaceKey },
  };
}

export async function buildHrMcpCountryDetailPageModel(input: {
  organizationId: string;
  countryConfigId: string;
  ruleVersionsSearch?: string;
}): Promise<HrMcpCountryDetailPageModel> {
  const ruleVersionsWindow = await listHrMcpRuleVersionsWindow({
    organizationId: input.organizationId,
    countryConfigId: input.countryConfigId,
    limit: MCP_DEFAULT_PAGE_SIZE,
  });

  return {
    countryConfigId: input.countryConfigId,
    ruleVersionsList: buildHrMcpRuleVersionsListSurface({
      window: {
        ...ruleVersionsWindow,
        rows: [...ruleVersionsWindow.rows],
      },
      searchValue: input.ruleVersionsSearch,
    }),
    surfaceKeys: { ruleVersions: hrMcpRuleVersionsSurfaceKey },
  };
}

export async function buildHrMcpCrossCountryReportsPageModel(input: {
  organizationId: string;
  periodRef?: string;
  crossCountryCostSearch?: string;
}): Promise<HrMcpCrossCountryReportsPageModel> {
  const periodRef = input.periodRef ?? MCP_DEFAULT_PERIOD_REF;

  const costWindow = await listHrMcpCrossCountryCostAggregateWindow({
    organizationId: input.organizationId,
    periodRef,
    limit: MCP_DEFAULT_PAGE_SIZE,
  });

  return {
    periodRef,
    crossCountryCostList: buildHrMcpCrossCountryCostListSurface({
      window: {
        ...costWindow,
        rows: [...costWindow.rows],
      },
      searchValue: input.crossCountryCostSearch,
    }),
    surfaceKeys: { crossCountryCost: hrMcpCrossCountryCostSurfaceKey },
  };
}

export async function buildHrMcpAuditPageModel(input: {
  organizationId: string;
  auditSearch?: string;
  countryConfigId?: string;
  legalEntitySetupId?: string;
  ruleVersionId?: string;
}): Promise<HrMcpAuditPageModel> {
  const auditWindow = await listHrMcpAuditTrailWindow({
    organizationId: input.organizationId,
    limit: MCP_DEFAULT_PAGE_SIZE,
    search: input.auditSearch,
    countryConfigId: input.countryConfigId,
    legalEntitySetupId: input.legalEntitySetupId,
    ruleVersionId: input.ruleVersionId,
  });

  return {
    auditList: buildHrMcpAuditTrailListSurface({
      window: {
        ...auditWindow,
        rows: [...auditWindow.rows],
      },
      searchValue: input.auditSearch,
    }),
    surfaceKeys: { auditTrail: hrMcpAuditTrailSurfaceKey },
  };
}
