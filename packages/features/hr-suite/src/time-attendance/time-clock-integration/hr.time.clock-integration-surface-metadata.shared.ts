import {
  hrTimeClockAuditTrailColumnsId,
  hrTimeClockDevicesColumnsId,
  hrTimeClockEmployeeMappingsColumnsId,
  hrTimeClockLamExportColumnsId,
  hrTimeClockOvertimeRefsColumnsId,
  hrTimeClockPayrollRefsColumnsId,
  hrTimeClockPunchExceptionsColumnsId,
  hrTimeClockRawPunchesColumnsId,
  hrTimeClockReportsColumnsId,
  hrTimeClockSyncBatchesColumnsId,
} from "./hr.time.clock-integration-surface-columns.shared";
import {
  hrTimeClockAuditTrailSearchParam,
  hrTimeClockAuditTrailSurfaceKey,
} from "./hr.time.clock-integration-audit-trail-list.surface";
import {
  hrTimeClockDevicesSearchParam,
  hrTimeClockDevicesSurfaceKey,
} from "./hr.time.clock-integration-devices-list.surface";
import {
  hrTimeClockEmployeeMappingsSearchParam,
  hrTimeClockEmployeeMappingsSurfaceKey,
} from "./hr.time.clock-integration-employee-mappings-list.surface";
import {
  hrTimeClockLamExportSearchParam,
  hrTimeClockLamExportSurfaceKey,
} from "./hr.time.clock-integration-lam-export-list.surface";
import { hrTimeClockOverviewStatSurfaceKey } from "./hr.time.clock-integration-overview-stat.surface";
import {
  hrTimeClockOvertimeRefsSearchParam,
  hrTimeClockOvertimeRefsSurfaceKey,
} from "./hr.time.clock-integration-overtime-refs-list.surface";
import {
  hrTimeClockPayrollRefsSearchParam,
  hrTimeClockPayrollRefsSurfaceKey,
} from "./hr.time.clock-integration-payroll-refs-list.surface";
import {
  hrTimeClockPunchExceptionsSearchParam,
  hrTimeClockPunchExceptionsSurfaceKey,
} from "./hr.time.clock-integration-punch-exceptions-list.surface";
import {
  hrTimeClockRawPunchesSearchParam,
  hrTimeClockRawPunchesSurfaceKey,
} from "./hr.time.clock-integration-raw-punches-list.surface";
import {
  hrTimeClockReportGroupByParam,
  hrTimeClockReportsSurfaceKey,
} from "./hr.time.clock-integration-reports-list.surface";
import {
  hrTimeClockSyncBatchesSearchParam,
  hrTimeClockSyncBatchesSurfaceKey,
} from "./hr.time.clock-integration-sync-batches-list.surface";

export {
  hrTimeClockDevicesSurfaceKey,
  hrTimeClockDevicesSearchParam,
  hrTimeClockEmployeeMappingsSurfaceKey,
  hrTimeClockEmployeeMappingsSearchParam,
  hrTimeClockRawPunchesSurfaceKey,
  hrTimeClockRawPunchesSearchParam,
  hrTimeClockPunchExceptionsSurfaceKey,
  hrTimeClockPunchExceptionsSearchParam,
  hrTimeClockSyncBatchesSurfaceKey,
  hrTimeClockSyncBatchesSearchParam,
  hrTimeClockAuditTrailSurfaceKey,
  hrTimeClockAuditTrailSearchParam,
  hrTimeClockReportsSurfaceKey,
  hrTimeClockReportGroupByParam,
  hrTimeClockOverviewStatSurfaceKey,
  hrTimeClockLamExportSurfaceKey,
  hrTimeClockLamExportSearchParam,
  hrTimeClockOvertimeRefsSurfaceKey,
  hrTimeClockOvertimeRefsSearchParam,
  hrTimeClockPayrollRefsSurfaceKey,
  hrTimeClockPayrollRefsSearchParam,
  hrTimeClockReportsColumnsId,
};

/** Canonical Pattern C list surface keys (ARCH-1003 registry). */
export const HR_TIME_CLOCK_LIST_SURFACE_KEYS = [
  hrTimeClockDevicesSurfaceKey,
  hrTimeClockEmployeeMappingsSurfaceKey,
  hrTimeClockRawPunchesSurfaceKey,
  hrTimeClockPunchExceptionsSurfaceKey,
  hrTimeClockSyncBatchesSurfaceKey,
  hrTimeClockLamExportSurfaceKey,
  hrTimeClockOvertimeRefsSurfaceKey,
  hrTimeClockPayrollRefsSurfaceKey,
  hrTimeClockAuditTrailSurfaceKey,
] as const;

export type HrTimeClockListSurfaceKey =
  (typeof HR_TIME_CLOCK_LIST_SURFACE_KEYS)[number];

export const HR_TIME_CLOCK_LIST_SURFACE_COLUMNS_BY_KEY = {
  [hrTimeClockDevicesSurfaceKey]: hrTimeClockDevicesColumnsId,
  [hrTimeClockEmployeeMappingsSurfaceKey]: hrTimeClockEmployeeMappingsColumnsId,
  [hrTimeClockRawPunchesSurfaceKey]: hrTimeClockRawPunchesColumnsId,
  [hrTimeClockPunchExceptionsSurfaceKey]: hrTimeClockPunchExceptionsColumnsId,
  [hrTimeClockSyncBatchesSurfaceKey]: hrTimeClockSyncBatchesColumnsId,
  [hrTimeClockLamExportSurfaceKey]: hrTimeClockLamExportColumnsId,
  [hrTimeClockOvertimeRefsSurfaceKey]: hrTimeClockOvertimeRefsColumnsId,
  [hrTimeClockPayrollRefsSurfaceKey]: hrTimeClockPayrollRefsColumnsId,
  [hrTimeClockAuditTrailSurfaceKey]: hrTimeClockAuditTrailColumnsId,
} as const;

export const HR_TIME_CLOCK_LIST_SEARCH_PARAMS_BY_KEY = {
  [hrTimeClockDevicesSurfaceKey]: hrTimeClockDevicesSearchParam,
  [hrTimeClockEmployeeMappingsSurfaceKey]: hrTimeClockEmployeeMappingsSearchParam,
  [hrTimeClockRawPunchesSurfaceKey]: hrTimeClockRawPunchesSearchParam,
  [hrTimeClockPunchExceptionsSurfaceKey]: hrTimeClockPunchExceptionsSearchParam,
  [hrTimeClockSyncBatchesSurfaceKey]: hrTimeClockSyncBatchesSearchParam,
  [hrTimeClockLamExportSurfaceKey]: hrTimeClockLamExportSearchParam,
  [hrTimeClockOvertimeRefsSurfaceKey]: hrTimeClockOvertimeRefsSearchParam,
  [hrTimeClockPayrollRefsSurfaceKey]: hrTimeClockPayrollRefsSearchParam,
  [hrTimeClockAuditTrailSurfaceKey]: hrTimeClockAuditTrailSearchParam,
} as const;

export const HR_TIME_CLOCK_LIST_SEARCH_PARAM_MODEL_FIELDS = [
  hrTimeClockDevicesSearchParam,
  hrTimeClockEmployeeMappingsSearchParam,
  hrTimeClockRawPunchesSearchParam,
  hrTimeClockPunchExceptionsSearchParam,
  hrTimeClockSyncBatchesSearchParam,
  hrTimeClockLamExportSearchParam,
  hrTimeClockOvertimeRefsSearchParam,
  hrTimeClockPayrollRefsSearchParam,
  hrTimeClockAuditTrailSearchParam,
  hrTimeClockReportGroupByParam,
] as const;

export function getHrTimeClockListSurfaceKeys(): readonly HrTimeClockListSurfaceKey[] {
  return HR_TIME_CLOCK_LIST_SURFACE_KEYS;
}

/** Page model field names keyed by search param (registry ↔ page model tests). */
export const HR_TIME_CLOCK_SEARCH_PARAM_TO_PAGE_MODEL_FIELD = {
  [hrTimeClockDevicesSearchParam]: "devicesSearch",
  [hrTimeClockEmployeeMappingsSearchParam]: "mappingsSearch",
  [hrTimeClockRawPunchesSearchParam]: "rawPunchesSearch",
  [hrTimeClockPunchExceptionsSearchParam]: "punchExceptionsSearch",
  [hrTimeClockSyncBatchesSearchParam]: "syncBatchesSearch",
  [hrTimeClockLamExportSearchParam]: "lamExportSearch",
  [hrTimeClockOvertimeRefsSearchParam]: "overtimeRefsSearch",
  [hrTimeClockPayrollRefsSearchParam]: "payrollRefsSearch",
  [hrTimeClockAuditTrailSearchParam]: "auditTrailSearch",
  [hrTimeClockReportGroupByParam]: "reportGroupBy",
} as const;
