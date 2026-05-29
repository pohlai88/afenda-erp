import {
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import type { HrEmployeeWorkplaceSafetyRequirementWindow } from "@afenda/db";

import { hrEmployeeDetailRoutePath } from "../contracts/hr.workforce.compliance-route.contract";
import {
  deriveEffectiveWorkplaceSafetyRequirementStatus,
  normalizeRequirementStatusForTrailingSelect,
} from "../data/hr.workforce.compliance-status.shared";
import { formatComplianceDateTimeLocalInput } from "../schemas/hr.workforce.compliance-form.shared";
import {
  buildComplianceListSearchToolbar,
  buildComplianceOperationalListSurface,
  formatComplianceEmployeeListCell,
  formatComplianceListEnumCell,
  resolveCertificationTrackedListTrailingAction,
  resolveRequirementListRowTone,
  resolveWorkplaceSafetyRequirementListBadgeTone,
} from "./hr.workforce.compliance-list.shared";
import { hrComplianceWorkplaceSafetyRequirementsColumnsId } from "./hr.workforce.compliance-surface-columns.shared";
import { hrComplianceUiCopy } from "./hr.workforce.compliance-ui.copy.shared";

export const hrComplianceWorkplaceSafetyRequirementsSurfaceKey =
  "hr.workforce.compliance.workplace-safety-requirements.list";

export const hrComplianceWorkplaceSafetySearchParam =
  "complianceWorkplaceSafetySearch";

export function buildHrComplianceWorkplaceSafetyRequirementsListSurface(input: {
  window: HrEmployeeWorkplaceSafetyRequirementWindow;
  searchValue?: string;
  canWrite?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const { window, searchValue, canWrite = false } = input;
  const copy = hrComplianceUiCopy.workplaceSafety;

  return buildComplianceOperationalListSurface({
    primaryColumnId: "requirement",
    searchToolbar: buildComplianceListSearchToolbar({
      param: hrComplianceWorkplaceSafetySearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: searchValue,
    }),
    window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrComplianceWorkplaceSafetyRequirementsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "employee",
        header: copy.colEmployee,
        pin: "start",
        minWidth: 160,
        cellKind: { kind: "link" },
      },
      {
        id: "requirement",
        header: copy.colRequirement,
        priority: "primary",
        wrap: true,
        minWidth: 220,
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
      { id: "dueDate", header: copy.colDue, cellKind: { kind: "date" } },
      { id: "completedAt", header: copy.colCompleted, cellKind: { kind: "date" } },
    ],
    rows: window.rows.map((row) => {
      const effectiveStatus = deriveEffectiveWorkplaceSafetyRequirementStatus({
        status: row.status,
        dueDate: row.dueDate,
      });

      return {
        id: row.id,
        rowHref: hrEmployeeDetailRoutePath(row.employeeId),
        linkColumnId: "employee",
        rowTone: resolveRequirementListRowTone(effectiveStatus),
        cells: {
          employee: formatComplianceEmployeeListCell({
            employeeNumber: row.employeeNumber,
            employeeDisplayName: row.employeeDisplayName,
          }),
          requirement: `${row.obligationCode} · ${row.obligationTitle}`,
          area: formatComplianceListEnumCell(row.complianceArea),
          status: formatComplianceListEnumCell(effectiveStatus),
          statusValue: row.status,
          trailingStatusValue: normalizeRequirementStatusForTrailingSelect(
            row.status,
          ),
          effectiveStatusValue: effectiveStatus,
          dueDate: row.dueDate?.toISOString() ?? "",
          dueDateInput: formatComplianceDateTimeLocalInput(row.dueDate),
          completedAt: row.completedAt?.toISOString() ?? "",
          reviewNotesValue: row.reviewNotes ?? "",
        },
        cellKinds: {
          status: {
            kind: "badge",
            tone: resolveWorkplaceSafetyRequirementListBadgeTone(effectiveStatus),
          },
        },
        trailingAction: resolveCertificationTrackedListTrailingAction(canWrite),
      };
    }),
  });
}
