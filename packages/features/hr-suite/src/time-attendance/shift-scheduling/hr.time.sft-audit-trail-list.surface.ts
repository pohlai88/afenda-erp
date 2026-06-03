import type { HrShiftAuditTrailWindow } from "@afenda/db";

import {
  buildSftListSearchToolbar,
  buildSftOperationalListSurface,
} from "./hr.time.sft-list.shared";
import { hrSftUiCopy } from "./hr.time.sft-ui.copy.shared";
import {
  hrSftAuditTrailColumnsId,
  hrSftAuditTrailSearchParam,
  hrSftAuditTrailSurfaceKey,
} from "./hr.time.sft-surface-metadata.shared";

export { hrSftAuditTrailSurfaceKey };

export function buildHrSftAuditTrailListSurface(input: {
  window: HrShiftAuditTrailWindow;
  searchValue?: string;
}) {
  const copy = hrSftUiCopy.audit;

  return buildSftOperationalListSurface({
    surfaceKey: hrSftAuditTrailSurfaceKey,
    primaryColumnId: "action",
    searchToolbar: buildSftListSearchToolbar({
      param: hrSftAuditTrailSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrSftAuditTrailColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "action",
        header: copy.colAction,
        pin: "start",
        priority: "primary",
        wrap: true,
      },
      { id: "summary", header: copy.colSummary },
      { id: "when", header: copy.colWhen },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        action: row.action,
        summary: row.summary,
        when: row.occurredAt.toISOString(),
      },
    })),
  });
}
