import {
  hrGeoPendingColumnsId,
  hrGeoPendingSearchParam,
} from "./hrs-geolocation-contract";
import {
  buildGeoListSearchToolbar,
  buildGeoOperationalListSurface,
  formatGeoEmployeeCell,
  resolveGeoPendingExceptionTrailingAction,
} from "./hr.time.geo-list.shared";
import type { HrGeoPendingExceptionsWindow } from "./hr.time.geo-list-window-types.shared";
import { hrGeoUiCopy } from "./hr.time.geo-ui.copy.shared";

export function buildHrGeoPendingExceptionsListSurface(input: {
  window: HrGeoPendingExceptionsWindow;
  searchValue?: string;
  canWriteGeo?: boolean;
}) {
  const copy = hrGeoUiCopy.pending;
  const canWriteGeo = input.canWriteGeo ?? false;

  return buildGeoOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildGeoListSearchToolbar({
      param: hrGeoPendingSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrGeoPendingColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "employee", header: copy.colEmployee, priority: "primary", wrap: true },
      { id: "reason", header: copy.colReason, wrap: true },
      { id: "flags", header: copy.colFlags, wrap: true },
      {
        id: "submitted",
        header: copy.colSubmitted,
        cellKind: { kind: "date" },
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      rowTone: "attention",
      trailingAction: resolveGeoPendingExceptionTrailingAction(canWriteGeo),
      cells: {
        employee: formatGeoEmployeeCell({
          employeeNumber: row.employeeNumber,
          employeeDisplayName: row.employeeDisplayName,
        }),
        reason: row.submissionReason,
        flags: row.validationFlags.join(", "),
        submitted: row.submittedAt.toISOString(),
      },
    })),
  });
}
