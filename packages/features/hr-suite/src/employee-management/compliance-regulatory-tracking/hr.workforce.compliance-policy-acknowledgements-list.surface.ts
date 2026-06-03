import {
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import type { HrEmployeePolicyAcknowledgementWindow } from "@afenda/db";

import { hrEmployeeDetailRoutePath } from "./hr.workforce.compliance-route.contract";
import {
  deriveEffectivePolicyAcknowledgementStatus,
  normalizeRequirementStatusForTrailingSelect,
} from "./hr.workforce.compliance-status.shared";
import {
  buildComplianceListSearchToolbar,
  buildComplianceOperationalListSurface,
  formatComplianceEmployeeListCell,
  formatComplianceListEnumCell,
  resolvePolicyAcknowledgementListBadgeTone,
  resolvePolicyAcknowledgementListTrailingAction,
  resolveRequirementListRowTone,
} from "./hr.workforce.compliance-list.shared";
import { hrCompliancePolicyAcknowledgementsColumnsId } from "./hr.workforce.compliance-surface-columns.shared";
import { hrComplianceUiCopy } from "./hr.workforce.compliance-ui.copy.shared";

export const hrCompliancePolicyAcknowledgementsSurfaceKey =
  "hr.workforce.compliance.policy-acknowledgements.list";

export const hrCompliancePolicyAcknowledgementSearchParam =
  "compliancePolicyAcknowledgementSearch";

export function buildHrCompliancePolicyAcknowledgementsListSurface(input: {
  window: HrEmployeePolicyAcknowledgementWindow;
  searchValue?: string;
  canWrite?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const { window, searchValue, canWrite = false } = input;
  const copy = hrComplianceUiCopy.policyAcknowledgement;

  return buildComplianceOperationalListSurface({
    primaryColumnId: "policy",
    searchToolbar: buildComplianceListSearchToolbar({
      param: hrCompliancePolicyAcknowledgementSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: searchValue,
    }),
    window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrCompliancePolicyAcknowledgementsColumnsId,
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
        id: "policy",
        header: copy.colPolicy,
        priority: "primary",
        wrap: true,
        minWidth: 200,
      },
      {
        id: "policyVersion",
        header: copy.colPolicyVersion,
        minWidth: 120,
      },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "attention" },
      },
      { id: "dueDate", header: copy.colDue, cellKind: { kind: "date" } },
      { id: "acknowledgedAt", header: copy.colAcknowledged, cellKind: { kind: "date" } },
    ],
    rows: window.rows.map((row) => {
      const effectiveStatus = deriveEffectivePolicyAcknowledgementStatus({
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
          policy: row.obligationTitle,
          policyVersion: row.obligationCode,
          status: formatComplianceListEnumCell(effectiveStatus),
          statusValue: row.status,
          trailingStatusValue: normalizeRequirementStatusForTrailingSelect(
            row.status,
          ),
          effectiveStatusValue: effectiveStatus,
          dueDate: row.dueDate?.toISOString() ?? "",
          acknowledgedAt: row.completedAt?.toISOString() ?? "",
          reviewNotesValue: row.reviewNotes ?? "",
        },
        cellKinds: {
          status: {
            kind: "badge",
            tone: resolvePolicyAcknowledgementListBadgeTone(effectiveStatus),
          },
        },
        trailingAction: resolvePolicyAcknowledgementListTrailingAction(
          canWrite,
          effectiveStatus,
        ),
      };
    }),
  });
}
