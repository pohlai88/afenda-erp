import {
  hrGeoPoliciesColumnsId,
  hrGeoPoliciesSearchParam,
} from "./hrs-geolocation-contract";
import {
  buildGeoListSearchToolbar,
  buildGeoOperationalListSurface,
} from "./hr.time.geo-list.shared";
import type { HrGeoPoliciesWindow } from "./hr.time.geo-list-window-types.shared";
import { hrGeoUiCopy } from "./hr.time.geo-ui.copy.shared";

export function buildHrGeoPoliciesListSurface(input: {
  window: HrGeoPoliciesWindow;
  searchValue?: string;
}) {
  const copy = hrGeoUiCopy.policies;

  return buildGeoOperationalListSurface({
    primaryColumnId: "label",
    searchToolbar: buildGeoListSearchToolbar({
      param: hrGeoPoliciesSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrGeoPoliciesColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "label", header: copy.colLabel, priority: "primary", wrap: true },
      { id: "group", header: copy.colGroup },
      { id: "device", header: copy.colDevice },
      { id: "selfie", header: copy.colSelfie },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        label: row.label,
        group: row.policyGroupCode,
        device: row.requireRegisteredDevice ? "Required" : "Optional",
        selfie: row.requireSelfie ? "Required" : "Optional",
      },
    })),
  });
}
