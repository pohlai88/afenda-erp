import {
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import type { HrEmployeeLaborLawRequirementWindow } from "@afenda/db";

import { hrEmployeeDetailRoutePath } from "../contracts/hr.workforce.compliance-route.contract";
import {
  deriveEffectiveLaborLawRequirementStatus,
  normalizeRequirementStatusForTrailingSelect,
} from "../data/hr.workforce.compliance-status.shared";
import {
  buildComplianceListSearchToolbar,
  buildComplianceOperationalListSurface,
  formatComplianceEmployeeListCell,
  formatComplianceListEnumCell,
  resolveLaborLawRequirementListBadgeTone,
  resolveLaborLawRequirementListTrailingAction,
  resolveRequirementListRowTone,
} from "./hr.workforce.compliance-list.shared";
import { hrComplianceLaborLawRequirementsColumnsId } from "./hr.workforce.compliance-surface-columns.shared";
import { hrComplianceUiCopy } from "./hr.workforce.compliance-ui.copy.shared";

export const hrComplianceLaborLawRequirementsSurfaceKey =
  "hr.workforce.compliance.labor-law-requirements.list";

export const hrComplianceLaborLawSearchParam = "complianceLaborLawSearch";

export function buildHrComplianceLaborLawRequirementsListSurface(input: {
  window: HrEmployeeLaborLawRequirementWindow;
  searchValue?: string;
  canWrite?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const { window, searchValue, canWrite = false } = input;
  const copy = hrComplianceUiCopy.laborLaw;

  return buildComplianceOperationalListSurface({
    primaryColumnId: "requirement",
    searchToolbar: buildComplianceListSearchToolbar({
      param: hrComplianceLaborLawSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: searchValue,
    }),
    window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrComplianceLaborLawRequirementsColumnsId,
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
      const effectiveStatus = deriveEffectiveLaborLawRequirementStatus({
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
          completedAt: row.completedAt?.toISOString() ?? "",
          reviewNotesValue: row.reviewNotes ?? "",
        },
        cellKinds: {
          status: {
            kind: "badge",
            tone: resolveLaborLawRequirementListBadgeTone(effectiveStatus),
          },
        },
        trailingAction: resolveLaborLawRequirementListTrailingAction(
          canWrite,
          effectiveStatus,
        ),
      };
    }),
  });
}
