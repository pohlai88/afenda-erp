import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";

import type { HrLamAuditTrailWindow } from "./hr.time.attendance.lam-audit-trail.shared.server";
import {
  buildLamListSearchToolbar,
  buildLamOperationalListSurface,
} from "./hr.time.lam-list.shared";
import { hrLamUiCopy } from "./hr.time.lam-ui.copy.shared";
import { hrLamAuditTrailColumnsId } from "./hr.time.lam-surface-metadata.shared";

export const hrLamAuditTrailSurfaceKey = "hr.time.lam.audit-trail.list";

export function buildHrLamAuditTrailListSurface(input: {
  window: HrLamAuditTrailWindow;
}): ListSurfaceRendererConfigurationResolvedInput {
  const copy = hrLamUiCopy.audit;

  return buildLamOperationalListSurface({
    primaryColumnId: "action",
    searchToolbar: buildLamListSearchToolbar({
      param: "lamAuditTrailSearch",
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrLamAuditTrailColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "action", header: copy.colAction, priority: "primary", pin: "start", wrap: true },
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
