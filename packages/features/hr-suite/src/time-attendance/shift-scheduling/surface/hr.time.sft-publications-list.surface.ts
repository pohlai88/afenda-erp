import type { HrShiftRosterPublicationWindow } from "@afenda/db";

import {
  buildSftListSearchToolbar,
  buildSftOperationalListSurface,
} from "./hr.time.sft-list.shared";
import { hrSftUiCopy } from "./hr.time.sft-ui.copy.shared";
import {
  hrSftPublicationsColumnsId,
  hrSftPublicationsSearchParam,
  hrSftPublicationsSurfaceKey,
} from "./hr.time.sft-surface-metadata.shared";

export { hrSftPublicationsSurfaceKey };

export function buildHrSftPublicationsListSurface(input: {
  window: HrShiftRosterPublicationWindow;
  searchValue?: string;
}) {
  const copy = hrSftUiCopy.publications;

  return buildSftOperationalListSurface({
    surfaceKey: hrSftPublicationsSurfaceKey,
    primaryColumnId: "period",
    searchToolbar: buildSftListSearchToolbar({
      param: hrSftPublicationsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrSftPublicationsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "period",
        header: copy.colPeriod,
        pin: "start",
        priority: "primary",
      },
      { id: "published", header: copy.colPublished },
      { id: "publisher", header: copy.colPublisher },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        period: `${row.periodStart.toISOString().slice(0, 10)} – ${row.periodEnd.toISOString().slice(0, 10)}`,
        published: row.publishedAt.toISOString(),
        publisher: row.publishedByAuthUserId,
      },
    })),
  });
}
