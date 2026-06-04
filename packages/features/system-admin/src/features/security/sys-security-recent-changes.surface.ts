import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface/schemas";
import { buildLinkedControlListSurface, linkCell } from "../overview/sys-control-list.shared";
import type { SystemAdminDiagnosticsRecentChangeRow } from "../diagnostics/sys-diagnostics-coverage.contract";
import { systemAdminSecurityUiCopy } from "./sys-security-ui.copy.shared";

export const systemAdminSecurityRecentChangesSurfaceKey =
  "system-admin.security.recent-changes";

export function buildSystemAdminSecurityRecentChangesListSurface(input: {
  rows: readonly SystemAdminDiagnosticsRecentChangeRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildLinkedControlListSurface({
    key: systemAdminSecurityRecentChangesSurfaceKey,
    title: systemAdminSecurityUiCopy.recentChanges.title,
    object: "security-changes",
    columns: [
      {
        id: "occurredAt",
        header: "When",
        priority: "primary",
        pin: "start",
        cellKind: { kind: "link" },
      },
      { id: "actionLabel", header: "Action" },
      { id: "actorId", header: "Actor" },
      { id: "target", header: "Target" },
      { id: "summary", header: "Summary" },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      rowHref: row.href,
      linkColumnId: "occurredAt",
      cellKinds: {
        occurredAt: linkCell(row.href),
      },
      cells: {
        occurredAt: row.occurredAt,
        actionLabel: row.actionLabel,
        actorId: row.actorId,
        target: row.target,
        summary: row.summary,
      },
    })),
    emptyTitle: systemAdminSecurityUiCopy.recentChanges.emptyTitle,
    emptyDescription: systemAdminSecurityUiCopy.recentChanges.emptyDescription,
    searchPlaceholder: systemAdminSecurityUiCopy.recentChanges.searchPlaceholder,
  });
}
