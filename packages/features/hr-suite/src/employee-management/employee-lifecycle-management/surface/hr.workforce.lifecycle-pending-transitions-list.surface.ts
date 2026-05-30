import type { HrLifecyclePendingTransitionWindow } from "@afenda/db";
import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import { resolveListSurfaceRowTrailingAction } from "@afenda/governed-surface";

import { derivePendingTransitionDuePosture } from "../data/hr.workforce.lifecycle-transition.shared";
import {
  buildLifecycleListSearchToolbar,
  buildLifecycleOperationalListSurface,
  formatLifecycleEmploymentStatusLabel,
} from "./hr.workforce.lifecycle-list.shared";
import { hrLifecyclePendingTransitionsColumnsId } from "./hr.workforce.lifecycle-surface-columns.shared";
import { hrLifecycleUiCopy } from "./hr.workforce.lifecycle-ui.copy.shared";

export const hrLifecyclePendingTransitionsSurfaceKey =
  "hr.workforce.lifecycle.pending-transitions.list";

export const hrLifecyclePendingTransitionsSearchParam =
  "lifecyclePendingTransitionsSearch";

function resolvePendingTransitionListTrailingAction(canWrite: boolean) {
  if (!canWrite) {
    return undefined;
  }

  return resolveListSurfaceRowTrailingAction({
    visible: true,
    allowed: true,
  });
}

export function buildHrLifecyclePendingTransitionsListSurface(input: {
  window: HrLifecyclePendingTransitionWindow;
  searchValue?: string;
  canWrite?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const { window, searchValue, canWrite = false } = input;
  const copy = hrLifecycleUiCopy.pendingTransitions;
  const now = new Date();

  return buildLifecycleOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildLifecycleListSearchToolbar({
      param: hrLifecyclePendingTransitionsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: searchValue,
    }),
    window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrLifecyclePendingTransitionsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "employee",
        header: copy.colEmployee,
        priority: "primary",
        wrap: true,
        minWidth: 200,
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
        id: "effectiveDate",
        header: copy.colEffective,
        cellKind: { kind: "date" },
        minWidth: 140,
      },
      {
        id: "duePosture",
        header: copy.colDue,
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "reason",
        header: copy.colReason,
        wrap: true,
        minWidth: 160,
      },
    ],
    rows: window.rows.map((row) => {
      const duePosture = derivePendingTransitionDuePosture(
        row.effectiveDate,
        now,
      );

      return {
        id: row.id,
        rowTone: duePosture === "due" ? ("attention" as const) : undefined,
        cells: {
          employee: `${row.employeeNumber} · ${row.displayName}`,
          employeeIdValue: row.employeeId,
          fromStatus: formatLifecycleEmploymentStatusLabel(row.fromStatus),
          toStatus: formatLifecycleEmploymentStatusLabel(row.toStatus),
          toStatusValue: row.toStatus,
          fromStatusValue: row.fromStatus,
          effectiveDate: row.effectiveDate.toISOString(),
          effectiveDateInput: row.effectiveDate.toISOString().slice(0, 16),
          duePosture: duePosture === "due" ? "Due" : "Scheduled",
          reason: row.reason ?? "",
          approvalReferenceValue: row.approvalReference ?? "",
        },
        cellKinds: {
          duePosture: {
            kind: "badge",
            tone: duePosture === "due" ? "critical" : "default",
          },
        },
        trailingAction: resolvePendingTransitionListTrailingAction(canWrite),
      };
    }),
  });
}
