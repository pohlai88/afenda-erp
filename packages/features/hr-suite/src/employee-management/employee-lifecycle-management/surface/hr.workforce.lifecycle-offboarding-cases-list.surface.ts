import type { HrOffboardingCaseWindow } from "@afenda/db";
import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";

import {
  buildLifecycleListSearchToolbar,
  buildLifecycleOperationalListSurface,
  formatLifecycleEmploymentStatusLabel,
} from "./hr.workforce.lifecycle-list.shared";
import { hrLifecycleOffboardingCasesColumnsId } from "./hr.workforce.lifecycle-surface-columns.shared";
import { hrLifecycleUiCopy } from "./hr.workforce.lifecycle-ui.copy.shared";

export const hrLifecycleOffboardingCasesSurfaceKey =
  "hr.workforce.lifecycle.offboarding-cases.list";

export const hrLifecycleOffboardingCasesSearchParam =
  "lifecycleOffboardingCasesSearch";

function formatCaseStatus(status: string): string {
  return status.replaceAll("_", " ");
}

export function buildHrLifecycleOffboardingCasesListSurface(input: {
  window: HrOffboardingCaseWindow;
  searchValue?: string;
}): ListSurfaceRendererConfigurationResolvedInput {
  const copy = hrLifecycleUiCopy.offboardingCases;

  return buildLifecycleOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildLifecycleListSearchToolbar({
      param: hrLifecycleOffboardingCasesSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrLifecycleOffboardingCasesColumnsId,
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
        id: "caseStatus",
        header: copy.colCaseStatus,
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "lastWorking",
        header: copy.colLastWorking,
        cellKind: { kind: "date" },
        minWidth: 140,
      },
      {
        id: "priorStage",
        header: copy.colPriorStage,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: `${row.employeeNumber} · ${row.employeeDisplayName}`,
        employeeIdValue: row.employeeId,
        caseStatus: formatCaseStatus(row.status),
        lastWorking: row.lastWorkingDate?.toISOString() ?? "",
        priorStage: formatLifecycleEmploymentStatusLabel(
          row.priorEmploymentStatus,
        ),
      },
    })),
  });
}
