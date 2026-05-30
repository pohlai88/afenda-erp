import type { HrLifecycleOverviewWindow } from "@afenda/db";
import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import { resolveListSurfaceRowTrailingAction } from "@afenda/governed-surface";

import { HR_LIFECYCLE_EMPLOYMENT_STATUSES } from "../schemas/hr.workforce.lifecycle-employment-status.schema";
import {
  buildLifecycleListSearchToolbar,
  buildLifecycleOperationalListSurface,
  formatLifecycleEmploymentStatusLabel,
} from "./hr.workforce.lifecycle-list.shared";
import { hrLifecycleOverviewColumnsId } from "./hr.workforce.lifecycle-surface-columns.shared";
import { hrLifecycleUiCopy } from "./hr.workforce.lifecycle-ui.copy.shared";

export const hrLifecycleOverviewSurfaceKey =
  "hr.workforce.lifecycle.overview.list";

export const hrLifecycleOverviewSearchParam = "lifecycleOverviewSearch";

export const hrLifecycleEmploymentStatusFilterParam =
  "lifecycleEmploymentStatus";

function resolveOverviewListTrailingAction(canWrite: boolean) {
  if (!canWrite) {
    return undefined;
  }

  return resolveListSurfaceRowTrailingAction({
    visible: true,
    allowed: true,
  });
}

export function buildHrLifecycleOverviewListSurface(input: {
  window: HrLifecycleOverviewWindow;
  searchValue?: string;
  canWrite?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const { window, searchValue, canWrite = false } = input;
  const copy = hrLifecycleUiCopy.overview;

  return buildLifecycleOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildLifecycleListSearchToolbar({
      param: hrLifecycleOverviewSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: searchValue,
    }),
    window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrLifecycleOverviewColumnsId,
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
        id: "stage",
        header: copy.colStage,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "probationEnd",
        header: copy.colProbationEnd,
        cellKind: { kind: "date" },
        minWidth: 140,
      },
      {
        id: "confirmation",
        header: copy.colConfirmation,
        cellKind: { kind: "date" },
        minWidth: 140,
      },
      {
        id: "pendingTransitions",
        header: copy.colPending,
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "nextEffective",
        header: copy.colNextEffective,
        cellKind: { kind: "date" },
        minWidth: 140,
      },
    ],
    rows: window.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: `${row.employeeNumber} · ${row.displayName}`,
        employeeIdValue: row.id,
        stage: formatLifecycleEmploymentStatusLabel(row.employmentStatus),
        currentStatusValue: row.employmentStatus,
        allowedToStatusOptions: HR_LIFECYCLE_EMPLOYMENT_STATUSES.join(","),
        probationEnd: row.probationEndDate?.toISOString() ?? "",
        confirmation: row.confirmationDate?.toISOString() ?? "",
        pendingTransitions: String(row.pendingTransitionCount),
        nextEffective: row.nextEffectiveDate?.toISOString() ?? "",
      },
      cellKinds: {
        stage: {
          kind: "badge",
          tone: row.employmentStatus === "suspended" ? "attention" : "default",
        },
        pendingTransitions: {
          kind: "badge",
          tone: row.pendingTransitionCount > 0 ? "attention" : "default",
        },
      },
      trailingAction: resolveOverviewListTrailingAction(canWrite),
    })),
  });
}
