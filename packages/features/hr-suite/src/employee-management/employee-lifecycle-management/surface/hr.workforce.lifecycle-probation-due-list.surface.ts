import type { HrLifecycleProbationDueWindow } from "@afenda/db";
import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import { resolveListSurfaceRowTrailingAction } from "@afenda/governed-surface";

import { deriveProbationReviewPosture } from "../data/hr.workforce.lifecycle-probation.shared";
import {
  buildLifecycleListSearchToolbar,
  buildLifecycleOperationalListSurface,
  formatLifecycleEmploymentStatusLabel,
} from "./hr.workforce.lifecycle-list.shared";
import { hrLifecycleProbationDueColumnsId } from "./hr.workforce.lifecycle-surface-columns.shared";
import { hrLifecycleUiCopy } from "./hr.workforce.lifecycle-ui.copy.shared";

export const hrLifecycleProbationDueSurfaceKey =
  "hr.workforce.lifecycle.probation-due.list";

export const hrLifecycleProbationDueSearchParam = "lifecycleProbationDueSearch";

export function buildHrLifecycleProbationDueListSurface(input: {
  window: HrLifecycleProbationDueWindow;
  searchValue?: string;
  canWrite?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const { window, searchValue, canWrite = false } = input;
  const copy = hrLifecycleUiCopy.probationDue;
  const now = new Date();

  return buildLifecycleOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildLifecycleListSearchToolbar({
      param: hrLifecycleProbationDueSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: searchValue,
    }),
    window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrLifecycleProbationDueColumnsId,
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
        id: "probationEnd",
        header: copy.colProbationEnd,
        cellKind: { kind: "date" },
        minWidth: 140,
      },
      {
        id: "reviewPosture",
        header: copy.colReviewPosture,
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "stage",
        header: copy.colStage,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: window.rows.map((row) => {
      const posture = deriveProbationReviewPosture(row.probationEndDate, now);

      return {
        id: row.id,
        rowTone:
          posture === "overdue"
            ? ("critical" as const)
            : posture === "due"
              ? ("attention" as const)
              : undefined,
        cells: {
          employee: `${row.employeeNumber} · ${row.displayName}`,
          employeeIdValue: row.id,
          probationEnd: row.probationEndDate.toISOString(),
          probationEndDateInput: row.probationEndDate.toISOString().slice(0, 10),
          reviewPosture:
            posture === "overdue"
              ? "Overdue"
              : posture === "due"
                ? "Due soon"
                : "Upcoming",
          stage: formatLifecycleEmploymentStatusLabel(row.employmentStatus),
        },
        cellKinds: {
          reviewPosture: {
            kind: "badge",
            tone: posture === "overdue" ? "critical" : "attention",
          },
        },
        trailingAction: canWrite
          ? resolveListSurfaceRowTrailingAction({
              visible: true,
              allowed: true,
            })
          : undefined,
      };
    }),
  });
}
