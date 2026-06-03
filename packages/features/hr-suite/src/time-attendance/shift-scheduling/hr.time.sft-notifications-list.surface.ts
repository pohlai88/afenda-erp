import type { HrShiftNotificationWindow } from "@afenda/db";

import {
  buildSftListSearchToolbar,
  buildSftOperationalListSurface,
} from "./hr.time.sft-list.shared";
import { hrSftUiCopy } from "./hr.time.sft-ui.copy.shared";
import {
  hrSftNotificationsColumnsId,
  hrSftNotificationsSearchParam,
  hrSftNotificationsSurfaceKey,
} from "./hr.time.sft-surface-metadata.shared";

export { hrSftNotificationsSurfaceKey };

export function buildHrSftNotificationsListSurface(input: {
  window: HrShiftNotificationWindow;
  searchValue?: string;
}) {
  const copy = hrSftUiCopy.notifications;

  return buildSftOperationalListSurface({
    surfaceKey: hrSftNotificationsSurfaceKey,
    primaryColumnId: "title",
    searchToolbar: buildSftListSearchToolbar({
      param: hrSftNotificationsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrSftNotificationsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "title",
        header: copy.colTitle,
        pin: "start",
        priority: "primary",
        wrap: true,
      },
      { id: "kind", header: copy.colKind },
      { id: "when", header: copy.colWhen },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        title: row.title,
        kind: row.kind,
        when: row.createdAt.toISOString(),
      },
    })),
  });
}
