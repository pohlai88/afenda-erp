import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface/schemas";
import {
  buildLinkedControlListSurface,
  linkCell,
} from "../../overview/surfaces/system-admin.control-list.shared";
import type { SystemAdminIntegrationsRecentChangeRow } from "../contracts/system-admin.integrations-list.contract";
import { systemAdminIntegrationsUiCopy } from "./system-admin.integrations-ui.copy.shared";

export const systemAdminIntegrationsRecentChangesSurfaceKey =
  "system-admin.integrations.recent-changes";

export function buildSystemAdminIntegrationsRecentChangesListSurface(input: {
  rows: readonly SystemAdminIntegrationsRecentChangeRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildLinkedControlListSurface({
    key: systemAdminIntegrationsRecentChangesSurfaceKey,
    title: systemAdminIntegrationsUiCopy.recentChanges.title,
    object: "integration-changes",
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
    emptyTitle: systemAdminIntegrationsUiCopy.recentChanges.emptyTitle,
    emptyDescription: systemAdminIntegrationsUiCopy.recentChanges.emptyDescription,
    searchPlaceholder: systemAdminIntegrationsUiCopy.recentChanges.searchPlaceholder,
  });
}
