import type { HrAatAnalyticsSnapshotWindow } from "./hrs-hr-time-aat-snapshots-server";
import {
  buildAatListSearchToolbar,
  buildAatOperationalListSurface,
} from "./hr.time.aat-list.shared";
import { hrAatUiCopy } from "./hr.time.aat-ui.copy.shared";
import {
  hrAatSnapshotsColumnsId,
  hrAatSnapshotsSearchParam,
  hrAatSnapshotsSurfaceKey,
} from "./hr.time.aat-surface-metadata.shared";

export { hrAatSnapshotsSurfaceKey };

export function buildHrAatSnapshotsListSurface(input: {
  window: HrAatAnalyticsSnapshotWindow;
  searchValue?: string;
}) {
  const copy = hrAatUiCopy.snapshots;

  return buildAatOperationalListSurface({
    primaryColumnId: "period",
    searchToolbar: buildAatListSearchToolbar({
      param: hrAatSnapshotsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrAatSnapshotsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "period", header: copy.colPeriod, pin: "start", priority: "primary" },
      { id: "dimension", header: copy.colDimension },
      { id: "summary", header: copy.colSummary, wrap: true },
      { id: "generated", header: copy.colGenerated },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        period: `${row.periodKind}: ${row.periodStart.toISOString().slice(0, 10)} – ${row.periodEnd.toISOString().slice(0, 10)}`,
        dimension: row.dimension,
        summary: row.totalsSummary,
        generated: row.createdAt.toISOString(),
      },
    })),
  });
}
