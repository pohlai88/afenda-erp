import {
  listHrTimeClockAuditEventsWindow,
  listHrTimeClockDevicesWindow,
  listHrTimeClockEmployeeMappingsWindow,
  listHrTimeClockPunchExceptionsWindow,
  listHrTimeClockRawPunchesWindow,
  listHrTimeClockSyncBatchesWindow,
  loadHrTimeClockOverviewSnapshot,
  summarizeHrTimeClockReport,
  type HrTimeClockReportGroupBy,
} from "@afenda/db";
import type { EmptyState } from "@afenda/governed-surface/schemas";
import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface/schemas";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import { buildHrTimeClockAuditTrailListSurface } from "../surface/hr.time.clock-integration-audit-trail-list.surface";
import { buildHrTimeClockDevicesListSurface } from "../surface/hr.time.clock-integration-devices-list.surface";
import { buildHrTimeClockEmployeeMappingsListSurface } from "../surface/hr.time.clock-integration-employee-mappings-list.surface";
import { buildHrTimeClockLamExportListSurface } from "../surface/hr.time.clock-integration-lam-export-list.surface";
import { buildHrTimeClockOvertimeRefsListSurface } from "../surface/hr.time.clock-integration-overtime-refs-list.surface";
import { buildHrTimeClockPayrollRefsListSurface } from "../surface/hr.time.clock-integration-payroll-refs-list.surface";
import { buildHrTimeClockPunchExceptionsListSurface } from "../surface/hr.time.clock-integration-punch-exceptions-list.surface";
import { buildHrTimeClockRawPunchesListSurface } from "../surface/hr.time.clock-integration-raw-punches-list.surface";
import { buildHrTimeClockReportsListSurface } from "../surface/hr.time.clock-integration-reports-list.surface";
import { buildHrTimeClockSyncBatchesListSurface } from "../surface/hr.time.clock-integration-sync-batches-list.surface";
import { buildHrTimeClockOverviewStatGrid } from "../surface/hr.time.clock-integration-overview-stat.surface";
import {
  HR_TIME_CLOCK_LIST_SURFACE_COLUMNS_BY_KEY,
  hrTimeClockAuditTrailSearchParam,
  hrTimeClockAuditTrailSurfaceKey,
  hrTimeClockDevicesSearchParam,
  hrTimeClockDevicesSurfaceKey,
  hrTimeClockEmployeeMappingsSearchParam,
  hrTimeClockEmployeeMappingsSurfaceKey,
  hrTimeClockLamExportSearchParam,
  hrTimeClockLamExportSurfaceKey,
  hrTimeClockOvertimeRefsSearchParam,
  hrTimeClockOvertimeRefsSurfaceKey,
  hrTimeClockPayrollRefsSearchParam,
  hrTimeClockPayrollRefsSurfaceKey,
  hrTimeClockPunchExceptionsSearchParam,
  hrTimeClockPunchExceptionsSurfaceKey,
  hrTimeClockRawPunchesSearchParam,
  hrTimeClockRawPunchesSurfaceKey,
  hrTimeClockSyncBatchesSearchParam,
  hrTimeClockSyncBatchesSurfaceKey,
} from "../surface/hr.time.clock-integration-surface-metadata.shared";
import { hrTimeClockReportGroupByParam } from "../surface/hr.time.clock-integration-reports-list.surface";
import { hrTimeClockReportsColumnsId } from "../surface/hr.time.clock-integration-surface-columns.shared";
import { hrTimeClockUiCopy } from "../surface/hr.time.clock-integration-ui.copy.shared";
import { loadHrTimeClockLamExportWindow } from "./hr.time.clock-integration-lam-export.shared.server";
import {
  buildTimeClockListLoadErrorPlaceholder,
  normalizeTimeClockWindow,
  settleTimeClockListLoad,
} from "./hr.time.clock-integration-list-load.shared";
import { listHrTimeClockOvertimeReferenceRows } from "./hr.time.clock-integration-overtime-refs.shared.server";
import { listHrTimeClockPayrollReferenceRows } from "./hr.time.clock-integration-payroll-refs.shared.server";
import { listHrTimeClockSyncAlerts } from "./hr.time.clock-integration-sync-alerts.shared.server";
import type { HrTimeClockPageModelInput } from "./hr.time.clock-integration-search-params.parse.shared";

const DEFAULT_PAGE_SIZE = 25;

const emptyOverviewSnapshot = {
  deviceCount: 0,
  activeDeviceCount: 0,
  openExceptionCount: 0,
  failedSyncCount: 0,
  validPunchCount24h: 0,
  pendingValidationCount: 0,
} as const;

function parseReportGroupBy(value?: string): HrTimeClockReportGroupBy {
  const allowed = [
    "employee",
    "device",
    "location",
    "department",
    "date",
    "exception",
    "sync_status",
  ] as const;
  if (value && allowed.includes(value as HrTimeClockReportGroupBy)) {
    return value as HrTimeClockReportGroupBy;
  }
  return "employee";
}

export type HrTimeClockPageModel = {
  canWrite: boolean;
  canAdmin: boolean;
  syncAlertCount: number;
  overviewStats: StatCardConfigurationResolvedInput;
  overviewLoadError?: EmptyState;
  devicesList: ListSurfaceRendererConfigurationResolvedInput;
  devicesLoadError?: EmptyState;
  mappingsList: ListSurfaceRendererConfigurationResolvedInput;
  mappingsLoadError?: EmptyState;
  rawPunchesList: ListSurfaceRendererConfigurationResolvedInput;
  rawPunchesLoadError?: EmptyState;
  punchExceptionsList: ListSurfaceRendererConfigurationResolvedInput;
  punchExceptionsLoadError?: EmptyState;
  syncBatchesList: ListSurfaceRendererConfigurationResolvedInput;
  syncBatchesLoadError?: EmptyState;
  lamExportList: ListSurfaceRendererConfigurationResolvedInput;
  lamExportLoadError?: EmptyState;
  overtimeRefsList: ListSurfaceRendererConfigurationResolvedInput;
  overtimeRefsLoadError?: EmptyState;
  payrollRefsList: ListSurfaceRendererConfigurationResolvedInput;
  payrollRefsLoadError?: EmptyState;
  reportsList: ListSurfaceRendererConfigurationResolvedInput;
  reportsLoadError?: EmptyState;
  auditTrailList?: ListSurfaceRendererConfigurationResolvedInput;
  auditTrailLoadError?: EmptyState;
};

export async function buildHrTimeClockPageModel(
  input: HrTimeClockPageModelInput,
): Promise<HrTimeClockPageModel> {
  const copy = hrTimeClockUiCopy;
  const reportGroupBy = parseReportGroupBy(input.reportGroupBy);

  const [
    overviewResult,
    devicesResult,
    mappingsResult,
    rawPunchesResult,
    exceptionsResult,
    syncBatchesResult,
    lamExportResult,
    overtimeRefsResult,
    payrollRefsResult,
    reportsResult,
    auditTrailResult,
    syncAlerts,
  ] = await Promise.all([
    settleTimeClockListLoad({
      sectionTitle: copy.overview.sectionTitle,
      load: () =>
        loadHrTimeClockOverviewSnapshot({
          organizationId: input.organizationId,
        }),
    }),
    settleTimeClockListLoad({
      sectionTitle: copy.devices.sectionTitle,
      load: () =>
        listHrTimeClockDevicesWindow({
          organizationId: input.organizationId,
          limit: DEFAULT_PAGE_SIZE,
          search: input.devicesSearch ?? input.search,
        }),
    }),
    settleTimeClockListLoad({
      sectionTitle: copy.mappings.sectionTitle,
      load: () =>
        listHrTimeClockEmployeeMappingsWindow({
          organizationId: input.organizationId,
          limit: DEFAULT_PAGE_SIZE,
        }),
    }),
    settleTimeClockListLoad({
      sectionTitle: copy.rawPunches.sectionTitle,
      load: () =>
        listHrTimeClockRawPunchesWindow({
          organizationId: input.organizationId,
          limit: DEFAULT_PAGE_SIZE,
          search: input.rawPunchesSearch ?? input.search,
        }),
    }),
    settleTimeClockListLoad({
      sectionTitle: copy.exceptions.sectionTitle,
      load: () =>
        listHrTimeClockPunchExceptionsWindow({
          organizationId: input.organizationId,
          limit: DEFAULT_PAGE_SIZE,
          search: input.punchExceptionsSearch ?? input.search,
        }),
    }),
    settleTimeClockListLoad({
      sectionTitle: copy.syncBatches.sectionTitle,
      load: () =>
        listHrTimeClockSyncBatchesWindow({
          organizationId: input.organizationId,
          limit: DEFAULT_PAGE_SIZE,
          search: input.syncBatchesSearch ?? input.search,
        }),
    }),
    settleTimeClockListLoad({
      sectionTitle: copy.lamExport.sectionTitle,
      load: () =>
        loadHrTimeClockLamExportWindow({
          organizationId: input.organizationId,
          limit: DEFAULT_PAGE_SIZE,
          search: input.lamExportSearch ?? input.search,
        }),
    }),
    settleTimeClockListLoad({
      sectionTitle: copy.overtimeRefs.sectionTitle,
      load: () =>
        listHrTimeClockOvertimeReferenceRows({
          organizationId: input.organizationId,
          limit: DEFAULT_PAGE_SIZE,
          search: input.overtimeRefsSearch ?? input.search,
        }),
    }),
    settleTimeClockListLoad({
      sectionTitle: copy.payrollRefs.sectionTitle,
      load: () =>
        listHrTimeClockPayrollReferenceRows({
          organizationId: input.organizationId,
          limit: DEFAULT_PAGE_SIZE,
          search: input.payrollRefsSearch ?? input.search,
        }),
    }),
    settleTimeClockListLoad({
      sectionTitle: copy.reports.sectionTitle,
      load: () =>
        summarizeHrTimeClockReport({
          organizationId: input.organizationId,
          groupBy: reportGroupBy,
        }),
    }),
    input.canReadAudit
      ? settleTimeClockListLoad({
          sectionTitle: copy.auditTrail.sectionTitle,
          load: () =>
            listHrTimeClockAuditEventsWindow({
              organizationId: input.organizationId,
              limit: DEFAULT_PAGE_SIZE,
              search: input.auditTrailSearch ?? input.search,
            }),
        })
      : Promise.resolve({
          data: undefined,
          loadError: undefined as EmptyState | undefined,
        }),
    listHrTimeClockSyncAlerts({
      organizationId: input.organizationId,
      limit: 25,
    }).catch(() => [] as const),
  ]);

  return {
    canWrite: input.canWrite,
    canAdmin: input.canAdmin,
    syncAlertCount: syncAlerts.length,
    overviewStats: buildHrTimeClockOverviewStatGrid({
      snapshot: overviewResult.data ?? emptyOverviewSnapshot,
    }),
    overviewLoadError: overviewResult.loadError,
    devicesList: devicesResult.data
      ? buildHrTimeClockDevicesListSurface({
          window: {
            ...devicesResult.data,
            ...normalizeTimeClockWindow(devicesResult.data),
          },
          searchValue: input.devicesSearch ?? input.search,
          canAdmin: input.canAdmin,
        })
      : buildTimeClockListLoadErrorPlaceholder({
          columnsId:
            HR_TIME_CLOCK_LIST_SURFACE_COLUMNS_BY_KEY[hrTimeClockDevicesSurfaceKey],
          searchParam: hrTimeClockDevicesSearchParam,
          searchLabel: copy.devices.searchLabel,
          searchPlaceholder: copy.devices.searchPlaceholder,
          surfaceHeaderTitle: copy.devices.surfaceHeaderTitle,
        }),
    devicesLoadError: devicesResult.loadError,
    mappingsList: mappingsResult.data
      ? buildHrTimeClockEmployeeMappingsListSurface({
          window: {
            ...mappingsResult.data,
            ...normalizeTimeClockWindow(mappingsResult.data),
          },
          searchValue: input.mappingsSearch ?? input.search,
          canAdmin: input.canAdmin,
        })
      : buildTimeClockListLoadErrorPlaceholder({
          columnsId:
            HR_TIME_CLOCK_LIST_SURFACE_COLUMNS_BY_KEY[
              hrTimeClockEmployeeMappingsSurfaceKey
            ],
          searchParam: hrTimeClockEmployeeMappingsSearchParam,
          searchLabel: copy.mappings.searchLabel,
          searchPlaceholder: copy.mappings.searchPlaceholder,
          surfaceHeaderTitle: copy.mappings.surfaceHeaderTitle,
        }),
    mappingsLoadError: mappingsResult.loadError,
    rawPunchesList: rawPunchesResult.data
      ? buildHrTimeClockRawPunchesListSurface({
          window: rawPunchesResult.data,
          searchValue: input.rawPunchesSearch ?? input.search,
        })
      : buildTimeClockListLoadErrorPlaceholder({
          columnsId:
            HR_TIME_CLOCK_LIST_SURFACE_COLUMNS_BY_KEY[
              hrTimeClockRawPunchesSurfaceKey
            ],
          searchParam: hrTimeClockRawPunchesSearchParam,
          searchLabel: copy.rawPunches.searchLabel,
          searchPlaceholder: copy.rawPunches.searchPlaceholder,
          surfaceHeaderTitle: copy.rawPunches.surfaceHeaderTitle,
        }),
    rawPunchesLoadError: rawPunchesResult.loadError,
    punchExceptionsList: exceptionsResult.data
      ? buildHrTimeClockPunchExceptionsListSurface({
          window: exceptionsResult.data,
          searchValue: input.punchExceptionsSearch ?? input.search,
          canWrite: input.canWrite,
        })
      : buildTimeClockListLoadErrorPlaceholder({
          columnsId:
            HR_TIME_CLOCK_LIST_SURFACE_COLUMNS_BY_KEY[
              hrTimeClockPunchExceptionsSurfaceKey
            ],
          searchParam: hrTimeClockPunchExceptionsSearchParam,
          searchLabel: copy.exceptions.searchLabel,
          searchPlaceholder: copy.exceptions.searchPlaceholder,
          surfaceHeaderTitle: copy.exceptions.surfaceHeaderTitle,
        }),
    punchExceptionsLoadError: exceptionsResult.loadError,
    syncBatchesList: syncBatchesResult.data
      ? buildHrTimeClockSyncBatchesListSurface({
          window: syncBatchesResult.data,
          searchValue: input.syncBatchesSearch ?? input.search,
        })
      : buildTimeClockListLoadErrorPlaceholder({
          columnsId:
            HR_TIME_CLOCK_LIST_SURFACE_COLUMNS_BY_KEY[
              hrTimeClockSyncBatchesSurfaceKey
            ],
          searchParam: hrTimeClockSyncBatchesSearchParam,
          searchLabel: copy.syncBatches.searchLabel,
          searchPlaceholder: copy.syncBatches.searchPlaceholder,
          surfaceHeaderTitle: copy.syncBatches.surfaceHeaderTitle,
        }),
    syncBatchesLoadError: syncBatchesResult.loadError,
    lamExportList: lamExportResult.data
      ? buildHrTimeClockLamExportListSurface({
          window: lamExportResult.data,
          searchValue: input.lamExportSearch ?? input.search,
        })
      : buildTimeClockListLoadErrorPlaceholder({
          columnsId:
            HR_TIME_CLOCK_LIST_SURFACE_COLUMNS_BY_KEY[hrTimeClockLamExportSurfaceKey],
          searchParam: hrTimeClockLamExportSearchParam,
          searchLabel: copy.lamExport.searchLabel,
          searchPlaceholder: copy.lamExport.searchPlaceholder,
          surfaceHeaderTitle: copy.lamExport.surfaceHeaderTitle,
        }),
    lamExportLoadError: lamExportResult.loadError,
    overtimeRefsList: overtimeRefsResult.data
      ? buildHrTimeClockOvertimeRefsListSurface({
          rows: overtimeRefsResult.data,
          searchValue: input.overtimeRefsSearch ?? input.search,
        })
      : buildTimeClockListLoadErrorPlaceholder({
          columnsId:
            HR_TIME_CLOCK_LIST_SURFACE_COLUMNS_BY_KEY[
              hrTimeClockOvertimeRefsSurfaceKey
            ],
          searchParam: hrTimeClockOvertimeRefsSearchParam,
          searchLabel: copy.overtimeRefs.searchLabel,
          searchPlaceholder: copy.overtimeRefs.searchPlaceholder,
          surfaceHeaderTitle: copy.overtimeRefs.surfaceHeaderTitle,
        }),
    overtimeRefsLoadError: overtimeRefsResult.loadError,
    payrollRefsList: payrollRefsResult.data
      ? buildHrTimeClockPayrollRefsListSurface({
          rows: payrollRefsResult.data,
          searchValue: input.payrollRefsSearch ?? input.search,
        })
      : buildTimeClockListLoadErrorPlaceholder({
          columnsId:
            HR_TIME_CLOCK_LIST_SURFACE_COLUMNS_BY_KEY[
              hrTimeClockPayrollRefsSurfaceKey
            ],
          searchParam: hrTimeClockPayrollRefsSearchParam,
          searchLabel: copy.payrollRefs.searchLabel,
          searchPlaceholder: copy.payrollRefs.searchPlaceholder,
          surfaceHeaderTitle: copy.payrollRefs.surfaceHeaderTitle,
        }),
    payrollRefsLoadError: payrollRefsResult.loadError,
    reportsList: reportsResult.data
      ? buildHrTimeClockReportsListSurface({
          rows: reportsResult.data,
          groupBy: reportGroupBy,
        })
      : buildTimeClockListLoadErrorPlaceholder({
          columnsId: hrTimeClockReportsColumnsId,
          searchParam: hrTimeClockReportGroupByParam,
          searchLabel: copy.reports.searchLabel,
          searchPlaceholder: copy.reports.searchPlaceholder,
          surfaceHeaderTitle: copy.reports.surfaceHeaderTitle,
        }),
    reportsLoadError: reportsResult.loadError,
    auditTrailList: auditTrailResult.data
      ? buildHrTimeClockAuditTrailListSurface({
          window: auditTrailResult.data,
          searchValue: input.auditTrailSearch ?? input.search,
        })
      : input.canReadAudit
        ? buildTimeClockListLoadErrorPlaceholder({
            columnsId:
              HR_TIME_CLOCK_LIST_SURFACE_COLUMNS_BY_KEY[
                hrTimeClockAuditTrailSurfaceKey
              ],
            searchParam: hrTimeClockAuditTrailSearchParam,
            searchLabel: copy.auditTrail.searchLabel,
            searchPlaceholder: copy.auditTrail.searchPlaceholder,
            surfaceHeaderTitle: copy.auditTrail.surfaceHeaderTitle,
          })
        : undefined,
    auditTrailLoadError: auditTrailResult.loadError,
  };
}
