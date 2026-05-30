import type { HrLifecycleNoticePeriodWindow } from "@afenda/db";
import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import { resolveListSurfaceRowTrailingAction } from "@afenda/governed-surface";

import {
  buildLifecycleListSearchToolbar,
  buildLifecycleOperationalListSurface,
} from "./hr.workforce.lifecycle-list.shared";
import { hrLifecycleNoticePeriodColumnsId } from "./hr.workforce.lifecycle-surface-columns.shared";
import { hrLifecycleUiCopy } from "./hr.workforce.lifecycle-ui.copy.shared";

export const hrLifecycleNoticePeriodSurfaceKey =
  "hr.workforce.lifecycle.notice-period.list";

export const hrLifecycleNoticePeriodSearchParam = "lifecycleNoticePeriodSearch";

export function buildHrLifecycleNoticePeriodListSurface(input: {
  window: HrLifecycleNoticePeriodWindow;
  searchValue?: string;
  canWrite?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const copy = hrLifecycleUiCopy.noticePeriod;

  return buildLifecycleOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildLifecycleListSearchToolbar({
      param: hrLifecycleNoticePeriodSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrLifecycleNoticePeriodColumnsId,
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
        id: "lastWorking",
        header: copy.colLastWorking,
        cellKind: { kind: "date" },
        minWidth: 140,
      },
      {
        id: "offboardingCase",
        header: copy.colOffboardingCase,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      rowTone: row.offboardingCaseId ? undefined : ("attention" as const),
      cells: {
        employee: `${row.employeeNumber} · ${row.displayName}`,
        employeeIdValue: row.id,
        lastWorking: row.lastWorkingDate?.toISOString() ?? "",
        offboardingCase: row.offboardingCaseId ? "In progress" : "Not started",
      },
      cellKinds: {
        offboardingCase: {
          kind: "badge",
          tone: row.offboardingCaseId ? "default" : "attention",
        },
      },
      trailingAction: input.canWrite
        ? resolveListSurfaceRowTrailingAction({
            visible: true,
            allowed: !row.offboardingCaseId,
          })
        : undefined,
    })),
  });
}
