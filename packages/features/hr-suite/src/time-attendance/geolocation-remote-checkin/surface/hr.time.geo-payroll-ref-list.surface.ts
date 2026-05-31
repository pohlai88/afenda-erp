import type { HrGeoIntegrationFindingWindow } from "../data/hr.time.geo-integration-windows.server";
import {
  hrGeoPayrollRefColumnsId,
  hrGeoPayrollRefSearchParam,
} from "../contracts/geolocation.contract";
import {
  buildGeoListSearchToolbar,
  buildGeoOperationalListSurface,
  formatGeoEmployeeCell,
  formatGeoEnumCell,
  resolveGeoIntegrationExposureRowTone,
} from "./hr.time.geo-list.shared";
import { hrGeoUiCopy } from "./hr.time.geo-ui.copy.shared";

/** HRM-GEO-026 — Payroll Processing attendance reference rows. */
export function buildHrGeoPayrollReferenceListSurface(input: {
  window: HrGeoIntegrationFindingWindow;
  searchValue?: string;
}) {
  const copy = hrGeoUiCopy.payrollRef;

  return buildGeoOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildGeoListSearchToolbar({
      param: hrGeoPayrollRefSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrGeoPayrollRefColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "employee", header: copy.colEmployee, priority: "primary", wrap: true },
      {
        id: "workDate",
        header: copy.colWorkDate,
        cellKind: { kind: "date" },
      },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "reference", header: copy.colReference, wrap: true },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      rowTone: resolveGeoIntegrationExposureRowTone(row.exposureStatus),
      cells: {
        employee: formatGeoEmployeeCell({
          employeeNumber: row.employeeNumber,
          employeeDisplayName: row.employeeDisplayName,
        }),
        workDate: row.workDate.toISOString(),
        status: formatGeoEnumCell(row.exposureStatus),
        reference: row.detail,
      },
    })),
  });
}
