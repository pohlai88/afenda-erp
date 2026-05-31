import {
  countHrGeoKpiStats,
  listHrGeoAuditEventsWindow,
  listHrGeoGeofencesWindow,
  listHrGeoHistoryWindow,
  listHrGeoPendingExceptionsWindow,
  listHrGeoPoliciesWindow,
  listHrGeoRegisteredDevicesWindow,
  summarizeHrGeoReport,
} from "@afenda/db";
import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import type { EmptyState } from "@afenda/governed-surface/schemas";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import { settleHrGeoListLoad } from "./hr.time.geo-list-load.shared";
import {
  listHrGeoLamExposureWindow,
  listHrGeoOvertimeReferenceWindow,
  listHrGeoPayrollReferenceWindow,
  listHrGeoRawVsApprovedWindow,
} from "./hr.time.geo-integration-windows.server";
import type { HrGeoPageModelInput } from "./hr.time.geo-search-params.parse.shared";
import { buildHrGeoAuditTrailListSurface } from "../surface/hr.time.geo-audit-trail-list.surface";
import { buildHrGeoDevicesListSurface } from "../surface/hr.time.geo-devices-list.surface";
import { buildHrGeoGeofencesListSurface } from "../surface/hr.time.geo-geofences-list.surface";
import { buildHrGeoHistoryListSurface } from "../surface/hr.time.geo-history-list.surface";
import { buildHrGeoLamExposureListSurface } from "../surface/hr.time.geo-lam-exposure-list.surface";
import { buildHrGeoOvertimeReferenceListSurface } from "../surface/hr.time.geo-overtime-ref-list.surface";
import { buildHrGeoPayrollReferenceListSurface } from "../surface/hr.time.geo-payroll-ref-list.surface";
import { buildHrGeoPendingExceptionsListSurface } from "../surface/hr.time.geo-pending-list.surface";
import { buildHrGeoPoliciesListSurface } from "../surface/hr.time.geo-policies-list.surface";
import { buildHrGeoRawVsApprovedListSurface } from "../surface/hr.time.geo-raw-vs-approved-list.surface";
import {
  buildGeoListSearchToolbar,
  buildGeoOperationalListSurface,
} from "../surface/hr.time.geo-list.shared";
import { buildHrGeoOverviewStatGrid } from "../surface/hr.time.geo-stats.surface";
import { hrGeoReportGroupByParam } from "../contracts/geolocation.contract";
import { hrGeoReportsColumnsId } from "../surface/hr.time.geo-surface-metadata.shared";
import { hrGeoUiCopy } from "../surface/hr.time.geo-ui.copy.shared";

const DEFAULT_PAGE_SIZE = 25;

function parseReportGroupBy(value?: string) {
  const allowed = [
    "employee",
    "department",
    "manager",
    "location",
    "site",
    "exception",
    "period",
  ] as const;
  if (value && allowed.includes(value as (typeof allowed)[number])) {
    return value as (typeof allowed)[number];
  }
  return "department" as const;
}

export type HrGeoPageModel = {
  canWriteGeo: boolean;
  canReadAudit: boolean;
  stats: StatCardConfigurationResolvedInput;
  geofences?: ListSurfaceRendererConfigurationResolvedInput;
  geofencesLoadError?: EmptyState;
  policies?: ListSurfaceRendererConfigurationResolvedInput;
  policiesLoadError?: EmptyState;
  devices?: ListSurfaceRendererConfigurationResolvedInput;
  devicesLoadError?: EmptyState;
  pending?: ListSurfaceRendererConfigurationResolvedInput;
  pendingLoadError?: EmptyState;
  history?: ListSurfaceRendererConfigurationResolvedInput;
  historyLoadError?: EmptyState;
  reports?: ListSurfaceRendererConfigurationResolvedInput;
  reportsLoadError?: EmptyState;
  rawVsApproved?: ListSurfaceRendererConfigurationResolvedInput;
  rawVsApprovedLoadError?: EmptyState;
  lamExposure?: ListSurfaceRendererConfigurationResolvedInput;
  lamExposureLoadError?: EmptyState;
  overtimeRef?: ListSurfaceRendererConfigurationResolvedInput;
  overtimeRefLoadError?: EmptyState;
  payrollRef?: ListSurfaceRendererConfigurationResolvedInput;
  payrollRefLoadError?: EmptyState;
  auditTrail?: ListSurfaceRendererConfigurationResolvedInput;
  auditTrailLoadError?: EmptyState;
};

export async function buildHrGeoPageModel(
  input: HrGeoPageModelInput,
): Promise<HrGeoPageModel> {
  const search = input.searchParams ?? {};
  const visibleEmployeeIds = input.visibleEmployeeIds;

  const [
    stats,
    geofencesResult,
    policiesResult,
    devicesResult,
    pendingResult,
    historyResult,
    reportResult,
    rawVsApprovedResult,
    lamExposureResult,
    overtimeRefResult,
    payrollRefResult,
    auditTrailResult,
  ] = await Promise.all([
      countHrGeoKpiStats({
        organizationId: input.organizationId,
        visibleEmployeeIds,
      }),
      settleHrGeoListLoad({
        sectionTitle: hrGeoUiCopy.geofences.sectionTitle,
        load: () =>
          listHrGeoGeofencesWindow({
            organizationId: input.organizationId,
            limit: DEFAULT_PAGE_SIZE,
            search: search.geoGeofencesSearch,
            visibleEmployeeIds,
          }),
      }),
      settleHrGeoListLoad({
        sectionTitle: hrGeoUiCopy.policies.sectionTitle,
        load: () =>
          listHrGeoPoliciesWindow({
            organizationId: input.organizationId,
            limit: DEFAULT_PAGE_SIZE,
            search: search.geoPoliciesSearch,
          }),
      }),
      settleHrGeoListLoad({
        sectionTitle: hrGeoUiCopy.devices.sectionTitle,
        load: () =>
          listHrGeoRegisteredDevicesWindow({
            organizationId: input.organizationId,
            limit: DEFAULT_PAGE_SIZE,
            search: search.geoDevicesSearch,
            visibleEmployeeIds,
          }),
      }),
      settleHrGeoListLoad({
        sectionTitle: hrGeoUiCopy.pending.sectionTitle,
        load: () =>
          listHrGeoPendingExceptionsWindow({
            organizationId: input.organizationId,
            limit: DEFAULT_PAGE_SIZE,
            search: search.geoPendingSearch,
            visibleEmployeeIds,
          }),
      }),
      settleHrGeoListLoad({
        sectionTitle: hrGeoUiCopy.history.sectionTitle,
        load: () =>
          listHrGeoHistoryWindow({
            organizationId: input.organizationId,
            limit: DEFAULT_PAGE_SIZE,
            search: search.geoHistorySearch,
            visibleEmployeeIds,
            canViewDetailedLocation: input.canViewDetailedLocation,
          }),
      }),
      settleHrGeoListLoad({
        sectionTitle: hrGeoUiCopy.reports.sectionTitle,
        load: () =>
          summarizeHrGeoReport({
            organizationId: input.organizationId,
            groupBy: parseReportGroupBy(search.geoReportGroupBy),
            visibleEmployeeIds,
          }),
      }),
      settleHrGeoListLoad({
        sectionTitle: hrGeoUiCopy.rawVsApproved.sectionTitle,
        load: () =>
          listHrGeoRawVsApprovedWindow({
            organizationId: input.organizationId,
            limit: DEFAULT_PAGE_SIZE,
            search: search.geoRawVsApprovedSearch,
            visibleEmployeeIds,
          }),
      }),
      settleHrGeoListLoad({
        sectionTitle: hrGeoUiCopy.lamExposure.sectionTitle,
        load: () =>
          listHrGeoLamExposureWindow({
            organizationId: input.organizationId,
            limit: DEFAULT_PAGE_SIZE,
            search: search.geoLamExposureSearch,
            visibleEmployeeIds,
          }),
      }),
      settleHrGeoListLoad({
        sectionTitle: hrGeoUiCopy.overtimeRef.sectionTitle,
        load: () =>
          listHrGeoOvertimeReferenceWindow({
            organizationId: input.organizationId,
            limit: DEFAULT_PAGE_SIZE,
            search: search.geoOvertimeRefSearch,
            visibleEmployeeIds,
          }),
      }),
      settleHrGeoListLoad({
        sectionTitle: hrGeoUiCopy.payrollRef.sectionTitle,
        load: () =>
          listHrGeoPayrollReferenceWindow({
            organizationId: input.organizationId,
            limit: DEFAULT_PAGE_SIZE,
            search: search.geoPayrollRefSearch,
            visibleEmployeeIds,
          }),
      }),
      input.canReadAudit
        ? settleHrGeoListLoad({
            sectionTitle: hrGeoUiCopy.auditTrail.sectionTitle,
            load: () =>
              listHrGeoAuditEventsWindow({
                organizationId: input.organizationId,
                limit: DEFAULT_PAGE_SIZE,
                search: search.geoAuditTrailSearch,
                visibleEmployeeIds,
              }),
          })
        : Promise.resolve({ data: undefined, loadError: undefined }),
    ]);

  const reports = reportResult.data
    ? buildGeoOperationalListSurface({
        primaryColumnId: "group",
        searchToolbar: buildGeoListSearchToolbar({
          param: hrGeoReportGroupByParam,
          label: hrGeoUiCopy.reports.searchLabel,
          placeholder: hrGeoUiCopy.reports.searchPlaceholder,
          value: search.geoReportGroupBy,
        }),
        window: {
          pageSize: reportResult.data.length,
          totalCount: reportResult.data.length,
          hasNextPage: false,
        },
        surface: {
          headerTitle: hrGeoUiCopy.reports.surfaceHeaderTitle,
          columnsId: hrGeoReportsColumnsId,
          emptyTitle: hrGeoUiCopy.reports.emptyTitle,
          emptyDescription: hrGeoUiCopy.reports.emptyDescription,
        },
        columns: [
          { id: "group", header: hrGeoUiCopy.reports.colGroup, priority: "primary" },
          { id: "verified", header: hrGeoUiCopy.reports.colVerified },
          { id: "pending", header: hrGeoUiCopy.reports.colPending },
          { id: "exceptions", header: hrGeoUiCopy.reports.colExceptions },
        ],
        rows: reportResult.data.map((row) => ({
          id: row.groupKey,
          cells: {
            group: row.groupLabel,
            verified: String(row.verifiedCount),
            pending: String(row.pendingCount),
            exceptions: String(row.exceptionCount),
          },
        })),
      })
    : undefined;

  return {
    canWriteGeo: input.canWriteGeo,
    canReadAudit: input.canReadAudit,
    stats: buildHrGeoOverviewStatGrid(stats),
    geofences: geofencesResult.data
      ? buildHrGeoGeofencesListSurface({
          window: geofencesResult.data,
          searchValue: search.geoGeofencesSearch,
        })
      : undefined,
    geofencesLoadError: geofencesResult.loadError,
    policies: policiesResult.data
      ? buildHrGeoPoliciesListSurface({
          window: policiesResult.data,
          searchValue: search.geoPoliciesSearch,
        })
      : undefined,
    policiesLoadError: policiesResult.loadError,
    devices: devicesResult.data
      ? buildHrGeoDevicesListSurface({
          window: devicesResult.data,
          searchValue: search.geoDevicesSearch,
        })
      : undefined,
    devicesLoadError: devicesResult.loadError,
    pending: pendingResult.data
      ? buildHrGeoPendingExceptionsListSurface({
          window: pendingResult.data,
          searchValue: search.geoPendingSearch,
          canWriteGeo: input.canWriteGeo,
        })
      : undefined,
    pendingLoadError: pendingResult.loadError,
    history: historyResult.data
      ? buildHrGeoHistoryListSurface({
          window: historyResult.data,
          searchValue: search.geoHistorySearch,
        })
      : undefined,
    historyLoadError: historyResult.loadError,
    reports,
    reportsLoadError: reportResult.loadError,
    rawVsApproved: rawVsApprovedResult.data
      ? buildHrGeoRawVsApprovedListSurface({
          window: rawVsApprovedResult.data,
          searchValue: search.geoRawVsApprovedSearch,
        })
      : undefined,
    rawVsApprovedLoadError: rawVsApprovedResult.loadError,
    lamExposure: lamExposureResult.data
      ? buildHrGeoLamExposureListSurface({
          window: lamExposureResult.data,
          searchValue: search.geoLamExposureSearch,
        })
      : undefined,
    lamExposureLoadError: lamExposureResult.loadError,
    overtimeRef: overtimeRefResult.data
      ? buildHrGeoOvertimeReferenceListSurface({
          window: overtimeRefResult.data,
          searchValue: search.geoOvertimeRefSearch,
        })
      : undefined,
    overtimeRefLoadError: overtimeRefResult.loadError,
    payrollRef: payrollRefResult.data
      ? buildHrGeoPayrollReferenceListSurface({
          window: payrollRefResult.data,
          searchValue: search.geoPayrollRefSearch,
        })
      : undefined,
    payrollRefLoadError: payrollRefResult.loadError,
    auditTrail: auditTrailResult.data
      ? buildHrGeoAuditTrailListSurface({
          window: auditTrailResult.data,
          searchValue: search.geoAuditTrailSearch,
        })
      : undefined,
    auditTrailLoadError: auditTrailResult.loadError,
  };
}
