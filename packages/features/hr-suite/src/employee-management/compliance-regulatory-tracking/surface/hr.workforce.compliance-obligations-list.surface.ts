import {
  resolveListSurfaceRowTrailingAction,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import type { HrComplianceObligationWindow } from "@afenda/db";

import { formatComplianceObligationScope } from "../data/hr.workforce.compliance-obligation.shared";
import {
  buildComplianceListSearchToolbar,
  buildComplianceOperationalListSurface,
  formatComplianceListEnumCell,
  resolveComplianceObligationStatusBadgeTone,
} from "./hr.workforce.compliance-list.shared";
import { hrComplianceUiCopy } from "./hr.workforce.compliance-ui.copy.shared";

export const hrComplianceObligationsSurfaceKey =
  "hr.workforce.compliance.obligations.list";

export const hrComplianceObligationSearchParam = "complianceObligationSearch";

export function buildHrComplianceObligationsListSurface(input: {
  window: HrComplianceObligationWindow;
  searchValue?: string;
  canWrite?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const { window, searchValue, canWrite = false } = input;
  const copy = hrComplianceUiCopy.obligations;

  return buildComplianceOperationalListSurface({
    primaryColumnId: "title",
    searchToolbar: buildComplianceListSearchToolbar({
      param: hrComplianceObligationSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: searchValue,
    }),
    window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: "hr.workforce.compliance.obligations",
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "code", header: copy.colCode, pin: "start" },
      {
        id: "title",
        header: copy.colTitle,
        priority: "primary",
        wrap: true,
        minWidth: 220,
      },
      {
        id: "kind",
        header: copy.colKind,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "area",
        header: copy.colArea,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "attention" },
      },
      { id: "scope", header: copy.colScope, wrap: true, minWidth: 200 },
      { id: "dueDate", header: copy.colDue, cellKind: { kind: "date" } },
    ],
    rows: window.rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        title: row.title,
        kind: formatComplianceListEnumCell(row.requirementKind),
        area: formatComplianceListEnumCell(row.complianceArea),
        status: formatComplianceListEnumCell(row.status),
        scope: formatComplianceObligationScope({
          countryCode: row.countryCode,
          legalEntityCode: row.legalEntityCode,
          workLocationCode: row.workLocationCode,
          employmentType: row.employmentType,
          workerCategory: row.workerCategory,
          departmentName: row.departmentName,
        }),
        dueDate: row.dueDate?.toISOString() ?? "",
      },
      cellKinds: {
        status: {
          kind: "badge",
          tone: resolveComplianceObligationStatusBadgeTone(row.status),
        },
      },
      trailingAction: canWrite
        ? resolveListSurfaceRowTrailingAction({
            visible: row.status !== "archived",
            allowed: row.status !== "archived",
            disabledReason: copy.trailingArchiveDisabledReason,
          })
        : undefined,
    })),
  });
}
