import {
  buildHrSuiteListSurfaceColumnsByKey,
  buildHrSuiteListSurfaceKeys,
  buildHrSuiteReadOnlyListSurfaceKeys,
  buildHrSuiteSearchParamModelFields,
  buildHrSuiteSearchParamsBySurfaceKey,
  defineHrSuiteListSurfaceRegistry,
  type HrSuiteListSurfaceProfile,
} from "../../../hr-suite-integration/metadata";

export const __IDENTIFIER_CAMEL__OverviewKpiSurfaceKey =
  "__DOMAIN_KEY__.overview.kpi" as const;
export const __IDENTIFIER_CAMEL__WorkbenchSurfaceKey =
  "__DOMAIN_KEY__.workbench.list" as const;
export const __IDENTIFIER_CAMEL__AuditTrailSurfaceKey =
  "__DOMAIN_KEY__.audit-trail.list" as const;

export const __CONSTANT_PREFIX___LIST_SURFACE_REGISTRY =
  defineHrSuiteListSurfaceRegistry([
    {
      surfaceKey: __IDENTIFIER_CAMEL__WorkbenchSurfaceKey,
      param: "__SEARCH_PARAM__",
      modelField: "workbenchSearch",
      label: "Search __CAPABILITY_TITLE__",
      placeholder:
        "Search __CAPABILITY_TITLE__ records by name, owner, status, and update timestamp",
      columns: [
        { id: "name", header: "Name", priority: "primary" },
        { id: "owner", header: "Owner" },
        { id: "updatedAt", header: "Updated" },
        { id: "status", header: "Status" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: __IDENTIFIER_CAMEL__AuditTrailSurfaceKey,
      param: "__IDENTIFIER_CAMEL__AuditTrailSearch",
      modelField: "auditTrailSearch",
      label: "Search __CAPABILITY_TITLE__ audit trail",
      placeholder:
        "Search audit action, actor, target, summary, and occurrence timestamp",
      columns: [
        { id: "summary", header: "Summary", priority: "primary" },
        { id: "action", header: "Action" },
        { id: "actorId", header: "Actor" },
        { id: "targetId", header: "Target" },
        { id: "occurredAt", header: "Occurred" },
      ],
      readOnly: true,
    },
  ] as const);

export const __CONSTANT_PREFIX___LIST_SURFACE_KEYS =
  buildHrSuiteListSurfaceKeys(__CONSTANT_PREFIX___LIST_SURFACE_REGISTRY);

export type __IDENTIFIER__ListSurfaceKey =
  (typeof __CONSTANT_PREFIX___LIST_SURFACE_KEYS)[number];

export const __CONSTANT_PREFIX___READ_ONLY_LIST_SURFACE_KEYS =
  buildHrSuiteReadOnlyListSurfaceKeys(
    __CONSTANT_PREFIX___LIST_SURFACE_REGISTRY,
  );

export const __CONSTANT_PREFIX___LIST_SEARCH_PARAMS_BY_KEY =
  buildHrSuiteSearchParamsBySurfaceKey(
    __CONSTANT_PREFIX___LIST_SURFACE_REGISTRY,
  );

export const __CONSTANT_PREFIX___LIST_SEARCH_PARAM_MODEL_FIELDS =
  buildHrSuiteSearchParamModelFields(__CONSTANT_PREFIX___LIST_SURFACE_REGISTRY);

export const __CONSTANT_PREFIX___LIST_SURFACE_COLUMNS_BY_KEY =
  buildHrSuiteListSurfaceColumnsByKey(
    __CONSTANT_PREFIX___LIST_SURFACE_REGISTRY,
  );

export const __CONSTANT_PREFIX___LIST_SURFACE_PROFILE_BY_KEY = {
  [__IDENTIFIER_CAMEL__WorkbenchSurfaceKey]: "erp-operational-table",
  [__IDENTIFIER_CAMEL__AuditTrailSurfaceKey]: "erp-audit-ledger",
} as const satisfies Record<
  __IDENTIFIER__ListSurfaceKey,
  HrSuiteListSurfaceProfile
>;

export function get__IDENTIFIER__ListSurfaceKeys(): readonly __IDENTIFIER__ListSurfaceKey[] {
  return __CONSTANT_PREFIX___LIST_SURFACE_KEYS;
}
