export function toHrOrgPageModelInput(input: {
  organizationId: string;
  canWrite: boolean;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return {
    organizationId: input.organizationId,
    canWrite: input.canWrite,
    ...parseHrOrgSearchParams(input.searchParams),
  };
}

export type HrOrgSearchParams = {
  unitsSearch?: string;
  positionsSearch?: string;
  reportingLinesSearch?: string;
  vacanciesSearch?: string;
  headcountSearch?: string;
  auditTrailSearch?: string;
  unitTypeFilter?: string;
  statusFilter?: string;
  locationFilter?: string;
  legalEntityFilter?: string;
};

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = searchParams[key];
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  if (Array.isArray(value)) {
    const first = value.find((entry) => entry.trim().length > 0);
    return first?.trim();
  }
  return undefined;
}

export const hrOrgUnitsSearchParam = "orgUnitsSearch";
export const hrOrgPositionsSearchParam = "orgPositionsSearch";
export const hrOrgReportingLinesSearchParam = "orgReportingLinesSearch";
export const hrOrgVacanciesSearchParam = "orgVacanciesSearch";
export const hrOrgHeadcountSearchParam = "orgHeadcountSearch";
export const hrOrgAuditTrailSearchParam = "orgAuditTrailSearch";
export const hrOrgUnitTypeFilterParam = "orgUnitTypeFilter";
export const hrOrgStatusFilterParam = "orgStatusFilter";
export const hrOrgLocationFilterParam = "orgLocationFilter";
export const hrOrgLegalEntityFilterParam = "orgLegalEntityFilter";

export const HR_ORG_LIST_SURFACE_KEYS = [
  "hr.workforce.org.units.list",
  "hr.workforce.org.positions.list",
  "hr.workforce.org.reporting-lines.list",
  "hr.workforce.org.vacancies.list",
  "hr.workforce.org.headcount.list",
  "hr.workforce.org.audit-trail.list",
] as const;

export type HrOrgListSurfaceKey = (typeof HR_ORG_LIST_SURFACE_KEYS)[number];

export const HR_ORG_LIST_SEARCH_PARAMS_BY_KEY: Record<
  HrOrgListSurfaceKey,
  string
> = {
  "hr.workforce.org.units.list": hrOrgUnitsSearchParam,
  "hr.workforce.org.positions.list": hrOrgPositionsSearchParam,
  "hr.workforce.org.reporting-lines.list": hrOrgReportingLinesSearchParam,
  "hr.workforce.org.vacancies.list": hrOrgVacanciesSearchParam,
  "hr.workforce.org.headcount.list": hrOrgHeadcountSearchParam,
  "hr.workforce.org.audit-trail.list": hrOrgAuditTrailSearchParam,
};

export const HR_ORG_LIST_SEARCH_PARAM_MODEL_FIELDS: Record<
  string,
  keyof HrOrgSearchParams
> = {
  [hrOrgUnitsSearchParam]: "unitsSearch",
  [hrOrgPositionsSearchParam]: "positionsSearch",
  [hrOrgReportingLinesSearchParam]: "reportingLinesSearch",
  [hrOrgVacanciesSearchParam]: "vacanciesSearch",
  [hrOrgHeadcountSearchParam]: "headcountSearch",
  [hrOrgAuditTrailSearchParam]: "auditTrailSearch",
  [hrOrgUnitTypeFilterParam]: "unitTypeFilter",
  [hrOrgStatusFilterParam]: "statusFilter",
  [hrOrgLocationFilterParam]: "locationFilter",
  [hrOrgLegalEntityFilterParam]: "legalEntityFilter",
};

export const HR_ORG_WORKBENCH_READ_ONLY_SURFACE_KEYS = new Set<
  HrOrgListSurfaceKey
>([
  "hr.workforce.org.vacancies.list",
  "hr.workforce.org.headcount.list",
  "hr.workforce.org.audit-trail.list",
]);

export function getHrOrgListSurfaceKeys(): readonly HrOrgListSurfaceKey[] {
  return HR_ORG_LIST_SURFACE_KEYS;
}

export function parseHrOrgSearchParams(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): HrOrgSearchParams {
  if (!searchParams) {
    return {};
  }

  const parsed: HrOrgSearchParams = {};
  for (const [paramKey, modelField] of Object.entries(
    HR_ORG_LIST_SEARCH_PARAM_MODEL_FIELDS,
  )) {
    parsed[modelField] = readSearchParam(searchParams, paramKey);
  }
  return parsed;
}

export const hrOrgUnitsSurfaceKey = "hr.workforce.org.units.list";
export const hrOrgPositionsSurfaceKey = "hr.workforce.org.positions.list";
export const hrOrgReportingLinesSurfaceKey =
  "hr.workforce.org.reporting-lines.list";
export const hrOrgVacanciesSurfaceKey = "hr.workforce.org.vacancies.list";
export const hrOrgHeadcountSurfaceKey = "hr.workforce.org.headcount.list";
export const hrOrgAuditTrailSurfaceKey = "hr.workforce.org.audit-trail.list";

export const HR_ORG_LIST_SURFACE_COLUMNS_BY_KEY: Record<
  HrOrgListSurfaceKey,
  string
> = {
  "hr.workforce.org.units.list": "hr.workforce.org.units",
  "hr.workforce.org.positions.list": "hr.workforce.org.positions",
  "hr.workforce.org.reporting-lines.list": "hr.workforce.org.reporting-lines",
  "hr.workforce.org.vacancies.list": "hr.workforce.org.vacancies",
  "hr.workforce.org.headcount.list": "hr.workforce.org.headcount",
  "hr.workforce.org.audit-trail.list": "hr.workforce.org.audit-trail",
};
