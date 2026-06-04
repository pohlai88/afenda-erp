import type { HrAatAuditTrailWindow } from "./hr.time.aat-audit.server";
import {
  buildAatListSearchToolbar,
  buildAatOperationalListSurface,
} from "./hr.time.aat-list.shared";
import { hrAatUiCopy } from "./hr.time.aat-ui.copy.shared";
import {
  hrAatAuditTrailColumnsId,
  hrAatAuditTrailSearchParam,
  hrAatAuditTrailSurfaceKey,
} from "./hr.time.aat-surface-metadata.shared";

export { hrAatAuditTrailSurfaceKey };

export function buildHrAatAuditTrailListSurface(input: {
  window: HrAatAuditTrailWindow;
  searchValue?: string;
}) {
  const copy = hrAatUiCopy.audit;

  return buildAatOperationalListSurface({
    primaryColumnId: "action",
    searchToolbar: buildAatListSearchToolbar({
      param: hrAatAuditTrailSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrAatAuditTrailColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "action", header: copy.colAction, pin: "start", priority: "primary", wrap: true },
      { id: "target", header: copy.colTarget },
      { id: "when", header: copy.colWhen },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        action: row.action,
        target: row.targetId,
        when: row.occurredAt.toISOString(),
      },
    })),
  });
}
