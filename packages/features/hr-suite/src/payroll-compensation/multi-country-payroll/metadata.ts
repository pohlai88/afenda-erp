import { HR_MCP_LIST_SURFACE_KEYS } from "./hr.payroll.mcp-search-params.parse.shared";

export {
  HR_MCP_LIST_SURFACE_KEYS,
  hrMcpAuditTrailSearchParam,
  hrMcpAuditTrailSurfaceKey,
  hrMcpCountryConfigIdParam,
  hrMcpCountryConfigsSearchParam,
  hrMcpCountryConfigsSurfaceKey,
  hrMcpCrossCountryCostSearchParam,
  hrMcpCrossCountryCostSurfaceKey,
  hrMcpPeriodRefParam,
  hrMcpRuleVersionsSearchParam,
  hrMcpRuleVersionsSurfaceKey,
  parseHrMcpSearchParams,
  toHrMcpAuditPageModelInput,
  toHrMcpCountryDetailPageModelInput,
  toHrMcpCrossCountryReportsPageModelInput,
  toHrMcpHubPageModelInput,
  type HrMcpListSurfaceKey,
  type HrMcpSearchParams,
} from "./hr.payroll.mcp-search-params.parse.shared";

export {
  hrMcpAuditTrailColumnsId,
  hrMcpCountryConfigsColumnsId,
  hrMcpCrossCountryCostColumnsId,
  hrMcpRuleVersionsColumnsId,
  HR_MCP_LIST_SURFACE_COLUMNS_BY_KEY,
} from "./hr.payroll.mcp-surface-columns.shared";

export { hrMcpUiCopy } from "./hr.payroll.mcp-ui.copy.shared";

export {
  buildHrMcpAuditTrailListSurface,
  buildHrMcpCountryConfigsListSurface,
  buildHrMcpCrossCountryCostListSurface,
  buildHrMcpRuleVersionsListSurface,
} from "./hr.payroll.mcp-governed-lists.surface";

export {
  hrMcpRoutePaths,
  type HrMcpRoutePath,
} from "./hr.payroll.mcp-route.contract";

export function getHrMcpListSurfaceKeys() {
  return HR_MCP_LIST_SURFACE_KEYS;
}
