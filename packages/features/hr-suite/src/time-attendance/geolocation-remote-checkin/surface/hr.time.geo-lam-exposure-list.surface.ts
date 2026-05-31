import type { HrGeoIntegrationFindingWindow } from "../data/hr.time.geo-integration-windows.server";
import {
  hrGeoLamExposureColumnsId,
  hrGeoLamExposureSearchParam,
} from "../contracts/geolocation.contract";
import {
  buildGeoListSearchToolbar,
  buildGeoOperationalListSurface,
  formatGeoEmployeeCell,
  formatGeoEnumCell,
  resolveGeoIntegrationExposureRowTone,
} from "./hr.time.geo-list.shared";
import { hrGeoUiCopy } from "./hr.time.geo-ui.copy.shared";

/** HRM-GEO-024 — LAM attendance handoff exposure. */
export function buildHrGeoLamExposureListSurface(input: {
  window: HrGeoIntegrationFindingWindow;
  searchValue?: string;
}) {
  const copy = hrGeoUiCopy.lamExposure;

  return buildGeoOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildGeoListSearchToolbar({
      param: hrGeoLamExposureSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrGeoLamExposureColumnsId,
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
      { id: "lamRef", header: copy.colLamRef, wrap: true },
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
        lamRef: row.detail,
      },
    })),
  });
}
