import {
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import type { HrEmployeeSafetyTrainingRequirementWindow } from "@afenda/db";

import { hrEmployeeDetailRoutePath } from "./hr.workforce.compliance-route.contract";
import {
  deriveEffectiveSafetyTrainingRequirementStatus,
  normalizeRequirementStatusForTrailingSelect,
} from "./hr.workforce.compliance-status.shared";
import { formatComplianceDateTimeLocalInput } from "./hr.workforce.compliance-form.shared";
import {
  buildComplianceListSearchToolbar,
  buildComplianceOperationalListSurface,
  formatComplianceEmployeeListCell,
  formatComplianceListEnumCell,
  resolveCertificationTrackedListTrailingAction,
  resolveRequirementListRowTone,
  resolveSafetyTrainingRequirementListBadgeTone,
} from "./hr.workforce.compliance-list.shared";
import { hrComplianceSafetyTrainingRequirementsColumnsId } from "./hr.workforce.compliance-surface-columns.shared";
import { hrComplianceUiCopy } from "./hr.workforce.compliance-ui.copy.shared";

export const hrComplianceSafetyTrainingRequirementsSurfaceKey =
  "hr.workforce.compliance.safety-training-requirements.list";

export const hrComplianceSafetyTrainingSearchParam =
  "complianceSafetyTrainingSearch";

export function buildHrComplianceSafetyTrainingRequirementsListSurface(input: {
  window: HrEmployeeSafetyTrainingRequirementWindow;
  searchValue?: string;
  canWrite?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const { window, searchValue, canWrite = false } = input;
  const copy = hrComplianceUiCopy.safetyTraining;

  return buildComplianceOperationalListSurface({
    primaryColumnId: "requirement",
    searchToolbar: buildComplianceListSearchToolbar({
      param: hrComplianceSafetyTrainingSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: searchValue,
    }),
    window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrComplianceSafetyTrainingRequirementsColumnsId,
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
      { id: "dueDate", header: copy.colDue, cellKind: { kind: "date" } },
      {
        id: "completedAt",
        header: copy.colCompleted,
        cellKind: { kind: "date" },
      },
    ],
    rows: window.rows.map((row) => {
      const effectiveStatus = deriveEffectiveSafetyTrainingRequirementStatus({
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
          kind: formatComplianceListEnumCell(row.requirementKind),
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
            tone: resolveSafetyTrainingRequirementListBadgeTone(effectiveStatus),
          },
        },
        trailingAction: resolveCertificationTrackedListTrailingAction(canWrite),
      };
    }),
  });
}
