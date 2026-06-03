import type { HrOnboardingCaseWindow } from "@afenda/db";
import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";

import {
  buildLifecycleListSearchToolbar,
  buildLifecycleOperationalListSurface,
  formatLifecycleEmploymentStatusLabel,
} from "./hr.workforce.lifecycle-list.shared";
import { hrLifecycleOnboardingCasesColumnsId } from "./hr.workforce.lifecycle-surface-columns.shared";
import { hrLifecycleUiCopy } from "./hr.workforce.lifecycle-ui.copy.shared";

export const hrLifecycleOnboardingCasesSurfaceKey =
  "hr.workforce.lifecycle.onboarding-cases.list";

export const hrLifecycleOnboardingCasesSearchParam =
  "lifecycleOnboardingCasesSearch";

function formatCaseStatus(status: string): string {
  return status.replaceAll("_", " ");
}

export function buildHrLifecycleOnboardingCasesListSurface(input: {
  window: HrOnboardingCaseWindow;
  searchValue?: string;
}): ListSurfaceRendererConfigurationResolvedInput {
  const copy = hrLifecycleUiCopy.onboardingCases;

  return buildLifecycleOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildLifecycleListSearchToolbar({
      param: hrLifecycleOnboardingCasesSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrLifecycleOnboardingCasesColumnsId,
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
        id: "targetStatus",
        header: copy.colTargetStatus,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "startedAt",
        header: copy.colStarted,
        cellKind: { kind: "date" },
        minWidth: 140,
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: `${row.employeeNumber} · ${row.employeeDisplayName}`,
        employeeIdValue: row.employeeId,
        caseStatus: formatCaseStatus(row.status),
        targetStatus: formatLifecycleEmploymentStatusLabel(row.targetStatus),
        startedAt: row.startedAt.toISOString(),
      },
    })),
  });
}
