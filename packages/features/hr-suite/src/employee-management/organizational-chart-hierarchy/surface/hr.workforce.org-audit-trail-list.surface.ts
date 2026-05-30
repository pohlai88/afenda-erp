import type { HrOrgAuditTrailWindow } from "@afenda/db";

import { hrOrgAuditTrailSearchParam } from "../data/hr.workforce.org-search-params.parse.shared";
import {
  buildOrgListSearchToolbar,
  buildOrgOperationalListSurface,
  formatOrgDate,
  formatOrgEnumLabel,
} from "./hr.workforce.org-list.shared";
import { hrOrgAuditTrailColumnsId } from "./hr.workforce.org-surface-columns.shared";
import { hrOrgUiCopy } from "./hr.workforce.org-ui.copy.shared";

export const hrOrgAuditTrailSurfaceKey = "hr.workforce.org.audit-trail.list";

export function buildHrOrgAuditTrailListSurface(input: {
  window: HrOrgAuditTrailWindow;
  searchValue?: string;
}) {
  const copy = hrOrgUiCopy.auditTrail;

  return buildOrgOperationalListSurface({
    primaryColumnId: "entity",
    searchToolbar: buildOrgListSearchToolbar({
      param: hrOrgAuditTrailSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrOrgAuditTrailColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "entity", header: copy.colEntity, pin: "start", minWidth: 180, cellKind: { kind: "text" } },
      { id: "action", header: copy.colAction, cellKind: { kind: "badge", tone: "default" } },
      { id: "effectiveFrom", header: copy.colEffectiveFrom, cellKind: { kind: "date" } },
      { id: "changedAt", header: copy.colChangedAt, cellKind: { kind: "date" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        entity: `${formatOrgEnumLabel(row.entityType)} · ${row.entityId}`,
        action: formatOrgEnumLabel(row.action),
        effectiveFrom: formatOrgDate(row.effectiveFrom),
        changedAt: formatOrgDate(row.createdAt),
      },
    })),
  });
}
