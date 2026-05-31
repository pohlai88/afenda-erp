import {
  hrGeoGeofencesColumnsId,
  hrGeoGeofencesSearchParam,
} from "../contracts/geolocation.contract";
import type { HrGeoGeofenceWindow } from "./hr.time.geo-list-window-types.shared";
import {
  buildGeoListSearchToolbar,
  buildGeoOperationalListSurface,
  formatGeoEmployeeCell,
  formatGeoEnumCell,
} from "./hr.time.geo-list.shared";
import { hrGeoUiCopy } from "./hr.time.geo-ui.copy.shared";

export function buildHrGeoGeofencesListSurface(input: {
  window: HrGeoGeofenceWindow;
  searchValue?: string;
}) {
  const copy = hrGeoUiCopy.geofences;

  return buildGeoOperationalListSurface({
    primaryColumnId: "label",
    searchToolbar: buildGeoListSearchToolbar({
      param: hrGeoGeofencesSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrGeoGeofencesColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "label", header: copy.colLabel, priority: "primary", wrap: true },
      {
        id: "kind",
        header: copy.colKind,
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "radius", header: copy.colRadius },
      { id: "employee", header: copy.colEmployee, wrap: true },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        label: row.label,
        kind: formatGeoEnumCell(row.geofenceKind),
        radius: String(row.radiusMeters),
        employee: formatGeoEmployeeCell({
          employeeNumber: row.employeeNumber,
          employeeDisplayName: row.employeeDisplayName,
        }),
      },
    })),
  });
}
