import {
  listHrEmployeeDirectoryWindow,
  listHrOrgHeadcountWindow,
  listHrOrgPositionsWindow,
  listHrOrgReportingLinesWindow,
  listHrOrgStructureAuditTrailWindow,
  listHrOrgUnitsWindow,
  listHrVacantPositionsWindow,
  loadHrOrgChartTreeNodes,
  loadHrOrgOverviewSnapshot,
  type HrOrgUnitStatus,
  type HrOrgUnitType,
} from "@afenda/db";
import type { EmptyState } from "@afenda/governed-surface/schemas";

import { settleOrgListLoad } from "./hr.workforce.org-list-load.shared";
import { buildHrOrgOverviewStatGroups } from "./hr.workforce.org-overview-stat.surface";
import { buildHrOrgUnitsListSurface } from "./hr.workforce.org-units-list.surface";
import { buildHrOrgPositionsListSurface } from "./hr.workforce.org-positions-list.surface";
import { buildHrOrgReportingLinesListSurface } from "./hr.workforce.org-reporting-lines-list.surface";
import { buildHrOrgVacanciesListSurface } from "./hr.workforce.org-vacancies-list.surface";
import { buildHrOrgHeadcountListSurface } from "./hr.workforce.org-headcount-list.surface";
import { buildHrOrgAuditTrailListSurface } from "./hr.workforce.org-audit-trail-list.surface";
import { hrOrgUiCopy } from "./hr.workforce.org-ui.copy.shared";

export type HrOrgPageModelInput = {
  organizationId: string;
  canWrite: boolean;
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

const ORG_DEFAULT_PAGE_SIZE = 25;
const ORG_EMPLOYEE_PICKER_LIMIT = 200;

const ORG_UNIT_TYPES = [
  "legal_entity",
  "business_unit",
  "department",
  "sub_department",
  "team",
  "location",
] as const satisfies readonly HrOrgUnitType[];

const ORG_UNIT_STATUSES = [
  "active",
  "planned",
  "frozen",
  "closed",
] as const satisfies readonly HrOrgUnitStatus[];

function parseOrgUnitTypeFilter(value: string | undefined): HrOrgUnitType | undefined {
  if (!value) return undefined;
  return ORG_UNIT_TYPES.includes(value as HrOrgUnitType)
    ? (value as HrOrgUnitType)
    : undefined;
}

function parseOrgStatusFilter(value: string | undefined): HrOrgUnitStatus | undefined {
  if (!value) return undefined;
  return ORG_UNIT_STATUSES.includes(value as HrOrgUnitStatus)
    ? (value as HrOrgUnitStatus)
    : undefined;
}

async function loadOrgEmployeePickerOptions(organizationId: string) {
  try {
    const directory = await listHrEmployeeDirectoryWindow({
      organizationId,
      limit: ORG_EMPLOYEE_PICKER_LIMIT,
    });
    return directory.rows
      .filter((employee) => employee.employmentStatus === "active")
      .map((employee) => ({
        value: employee.id,
        label: `${employee.displayName} (${employee.employeeNumber})`,
      }));
  } catch {
    return [] as Array<{ value: string; label: string }>;
  }
}

async function loadOrgUnitPickerOptions(organizationId: string) {
  try {
    const window = await listHrOrgUnitsWindow({
      organizationId,
      limit: ORG_EMPLOYEE_PICKER_LIMIT,
    });
    return window.rows.map((unit) => ({
      value: unit.id,
      label: `${unit.name} (${unit.code})`,
    }));
  } catch {
    return [] as Array<{ value: string; label: string }>;
  }
}

export type HrOrgPageModel = {
  canWrite: boolean;
  overviewStatGroups: ReturnType<typeof buildHrOrgOverviewStatGroups>;
  orgChartNodes: Awaited<ReturnType<typeof loadHrOrgChartTreeNodes>>;
  unitsList: ReturnType<typeof buildHrOrgUnitsListSurface>;
  positionsList: ReturnType<typeof buildHrOrgPositionsListSurface>;
  reportingLinesList: ReturnType<typeof buildHrOrgReportingLinesListSurface>;
  vacanciesList: ReturnType<typeof buildHrOrgVacanciesListSurface>;
  headcountList: ReturnType<typeof buildHrOrgHeadcountListSurface>;
  auditTrailList: ReturnType<typeof buildHrOrgAuditTrailListSurface>;
  unitsLoadError?: EmptyState;
  positionsLoadError?: EmptyState;
  reportingLinesLoadError?: EmptyState;
  vacanciesLoadError?: EmptyState;
  headcountLoadError?: EmptyState;
  auditTrailLoadError?: EmptyState;
  employeePickerOptions: Array<{ value: string; label: string }>;
  orgUnitPickerOptions: Array<{ value: string; label: string }>;
};

export async function buildHrOrgPageModel(
  input: HrOrgPageModelInput,
): Promise<HrOrgPageModel> {
  const unitType = parseOrgUnitTypeFilter(input.unitTypeFilter);
  const orgUnitStatus = parseOrgStatusFilter(input.statusFilter);
  const locationCode = input.locationFilter;
  const legalEntityCode = input.legalEntityFilter;

  const [
    snapshotResult,
    orgChartResult,
    unitsResult,
    positionsResult,
    reportingLinesResult,
    vacanciesResult,
    headcountResult,
    auditTrailResult,
    employeePickerOptions,
    orgUnitPickerOptions,
  ] = await Promise.all([
    settleOrgListLoad({
      sectionTitle: hrOrgUiCopy.overview.structureLabel,
      load: () =>
        loadHrOrgOverviewSnapshot({ organizationId: input.organizationId }),
    }),
    settleOrgListLoad({
      sectionTitle: hrOrgUiCopy.orgChart.title,
      load: () =>
        loadHrOrgChartTreeNodes({ organizationId: input.organizationId }),
    }),
    settleOrgListLoad({
      sectionTitle: hrOrgUiCopy.units.surfaceHeaderTitle,
      load: () =>
        listHrOrgUnitsWindow({
          organizationId: input.organizationId,
          limit: ORG_DEFAULT_PAGE_SIZE,
          search: input.unitsSearch,
          unitType,
          orgUnitStatus,
          locationCode,
          legalEntityCode,
        }),
    }),
    settleOrgListLoad({
      sectionTitle: hrOrgUiCopy.positions.surfaceHeaderTitle,
      load: () =>
        listHrOrgPositionsWindow({
          organizationId: input.organizationId,
          limit: ORG_DEFAULT_PAGE_SIZE,
          search: input.positionsSearch,
          locationCode,
        }),
    }),
    settleOrgListLoad({
      sectionTitle: hrOrgUiCopy.reportingLines.surfaceHeaderTitle,
      load: () =>
        listHrOrgReportingLinesWindow({
          organizationId: input.organizationId,
          limit: ORG_DEFAULT_PAGE_SIZE,
          search: input.reportingLinesSearch,
        }),
    }),
    settleOrgListLoad({
      sectionTitle: hrOrgUiCopy.vacancies.surfaceHeaderTitle,
      load: () =>
        listHrVacantPositionsWindow({
          organizationId: input.organizationId,
          limit: ORG_DEFAULT_PAGE_SIZE,
          search: input.vacanciesSearch,
          locationCode,
        }),
    }),
    settleOrgListLoad({
      sectionTitle: hrOrgUiCopy.headcount.surfaceHeaderTitle,
      load: () =>
        listHrOrgHeadcountWindow({
          organizationId: input.organizationId,
          limit: ORG_DEFAULT_PAGE_SIZE,
          search: input.headcountSearch,
          unitType,
          locationCode,
          legalEntityCode,
        }),
    }),
    settleOrgListLoad({
      sectionTitle: hrOrgUiCopy.auditTrail.surfaceHeaderTitle,
      load: () =>
        listHrOrgStructureAuditTrailWindow({
          organizationId: input.organizationId,
          limit: ORG_DEFAULT_PAGE_SIZE,
          search: input.auditTrailSearch,
        }),
    }),
    loadOrgEmployeePickerOptions(input.organizationId),
    loadOrgUnitPickerOptions(input.organizationId),
  ]);

  const snapshot = snapshotResult.value ?? {
    orgUnitCount: 0,
    positionCount: 0,
    filledPositionCount: 0,
    vacantPositionCount: 0,
    activeEmployeeCount: 0,
    plannedOrgUnitCount: 0,
  };

  const emptyUnitsWindow = {
    rows: [],
    pageSize: ORG_DEFAULT_PAGE_SIZE,
    totalCount: 0,
    hasNextPage: false,
  };

  return {
    canWrite: input.canWrite,
    overviewStatGroups: buildHrOrgOverviewStatGroups({ snapshot }),
    orgChartNodes: orgChartResult.value ?? [],
    unitsList: buildHrOrgUnitsListSurface({
      window: unitsResult.value ?? emptyUnitsWindow,
      searchValue: input.unitsSearch,
    }),
    positionsList: buildHrOrgPositionsListSurface({
      window: positionsResult.value ?? emptyUnitsWindow,
      searchValue: input.positionsSearch,
    }),
    reportingLinesList: buildHrOrgReportingLinesListSurface({
      window: reportingLinesResult.value ?? {
        ...emptyUnitsWindow,
        rows: [],
      },
      searchValue: input.reportingLinesSearch,
    }),
    vacanciesList: buildHrOrgVacanciesListSurface({
      window: vacanciesResult.value ?? emptyUnitsWindow,
      searchValue: input.vacanciesSearch,
    }),
    headcountList: buildHrOrgHeadcountListSurface({
      window: headcountResult.value ?? {
        ...emptyUnitsWindow,
        rows: [],
      },
      searchValue: input.headcountSearch,
    }),
    auditTrailList: buildHrOrgAuditTrailListSurface({
      window: auditTrailResult.value ?? {
        ...emptyUnitsWindow,
        rows: [],
      },
      searchValue: input.auditTrailSearch,
    }),
    unitsLoadError: unitsResult.loadError,
    positionsLoadError: positionsResult.loadError,
    reportingLinesLoadError: reportingLinesResult.loadError,
    vacanciesLoadError: vacanciesResult.loadError,
    headcountLoadError: headcountResult.loadError,
    auditTrailLoadError: auditTrailResult.loadError,
    employeePickerOptions,
    orgUnitPickerOptions,
  };
}
