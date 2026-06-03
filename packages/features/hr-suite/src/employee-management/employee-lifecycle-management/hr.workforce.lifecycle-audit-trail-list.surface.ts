import type { HrLifecycleAuditEventWindow } from "@afenda/db";
import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";

import {
  buildLifecycleListSearchToolbar,
  buildLifecycleOperationalListSurface,
  formatLifecycleEmploymentStatusLabel,
} from "./hr.workforce.lifecycle-list.shared";
import { hrLifecycleAuditTrailColumnsId } from "./hr.workforce.lifecycle-surface-columns.shared";
import { hrLifecycleUiCopy } from "./hr.workforce.lifecycle-ui.copy.shared";

export const hrLifecycleAuditTrailSurfaceKey =
  "hr.workforce.lifecycle.audit-trail.list";

export const hrLifecycleAuditTrailSearchParam = "lifecycleAuditTrailSearch";

function formatEventKindLabel(kind: string): string {
  return kind
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function buildHrLifecycleAuditTrailListSurface(input: {
  window: HrLifecycleAuditEventWindow;
  searchValue?: string;
}): ListSurfaceRendererConfigurationResolvedInput {
  const copy = hrLifecycleUiCopy.auditTrail;

  return buildLifecycleOperationalListSurface({
    primaryColumnId: "effectiveDate",
    searchToolbar: buildLifecycleListSearchToolbar({
      param: hrLifecycleAuditTrailSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrLifecycleAuditTrailColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "effectiveDate",
        header: copy.colEffective,
        pin: "start",
        cellKind: { kind: "date" },
        minWidth: 160,
      },
      {
        id: "employee",
        header: copy.colEmployee,
        priority: "primary",
        wrap: true,
        minWidth: 180,
      },
      {
        id: "kind",
        header: copy.colKind,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "fromStatus",
        header: copy.colFrom,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "toStatus",
        header: copy.colTo,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "reason",
        header: copy.colReason,
        wrap: true,
        minWidth: 160,
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        effectiveDate: row.effectiveDate.toISOString(),
        employee: `${row.employeeNumber} · ${row.displayName}`,
        kind: formatEventKindLabel(row.kind),
        fromStatus: row.previousStatus
          ? formatLifecycleEmploymentStatusLabel(row.previousStatus)
          : "—",
        toStatus: row.newStatus
          ? formatLifecycleEmploymentStatusLabel(row.newStatus)
          : "—",
        reason: row.reason ?? "",
      },
    })),
  });
}
