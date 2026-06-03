import {
  hrGeoAuditTrailColumnsId,
  hrGeoAuditTrailSearchParam,
} from "./hrs-geolocation-contract";
import {
  buildGeoListSearchToolbar,
  buildGeoOperationalListSurface,
  formatGeoEnumCell,
} from "./hr.time.geo-list.shared";
import type { HrGeoAuditEventsWindow } from "./hr.time.geo-list-window-types.shared";
import { hrGeoUiCopy } from "./hr.time.geo-ui.copy.shared";

/** HRM-GEO-032 — IAM-aligned geolocation audit trail. */
export function buildHrGeoAuditTrailListSurface(input: {
  window: HrGeoAuditEventsWindow;
  searchValue?: string;
}) {
  const copy = hrGeoUiCopy.auditTrail;

  return buildGeoOperationalListSurface({
    primaryColumnId: "action",
    searchToolbar: buildGeoListSearchToolbar({
      param: hrGeoAuditTrailSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrGeoAuditTrailColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "action",
        header: copy.colAction,
        priority: "primary",
        wrap: true,
      },
      { id: "auditKey", header: copy.colAuditKey, wrap: true },
      {
        id: "occurred",
        header: copy.colOccurred,
        cellKind: { kind: "date" },
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        action: formatGeoEnumCell(row.action),
        auditKey: row.auditKey,
        occurred: row.occurredAt.toISOString(),
      },
    })),
  });
}
