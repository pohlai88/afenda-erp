import type { HrGeoIntegrationFindingWindow } from "./hrs-hr-time-geo-integration-windows-server";
import {
  hrGeoRawVsApprovedColumnsId,
  hrGeoRawVsApprovedSearchParam,
} from "./hrs-geolocation-contract";
import {
  buildGeoListSearchToolbar,
  buildGeoOperationalListSurface,
  formatGeoEmployeeCell,
  formatGeoEnumCell,
  resolveGeoIntegrationExposureRowTone,
} from "./hr.time.geo-list.shared";
import { hrGeoUiCopy } from "./hr.time.geo-ui.copy.shared";

/** HRM-GEO-023 — raw capture ledger vs approved outcomes. */
export function buildHrGeoRawVsApprovedListSurface(input: {
  window: HrGeoIntegrationFindingWindow;
  searchValue?: string;
}) {
  const copy = hrGeoUiCopy.rawVsApproved;

  return buildGeoOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildGeoListSearchToolbar({
      param: hrGeoRawVsApprovedSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrGeoRawVsApprovedColumnsId,
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
        id: "relationship",
        header: copy.colRelationship,
        cellKind: { kind: "badge", tone: "attention" },
      },
      { id: "rawCount", header: copy.colRawCount },
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
        relationship: formatGeoEnumCell(row.exposureStatus),
        rawCount: row.detail,
      },
    })),
  });
}
