import {
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import type { HrWorkEligibilityWindow } from "@afenda/db";

import { hrEmployeeDetailRoutePath } from "../contracts/hr.workforce.compliance-route.contract";
import { deriveEffectiveWorkEligibilityStatus } from "../data/hr.workforce.compliance-work-eligibility.shared";
import { formatComplianceDateTimeLocalInput } from "../schemas/hr.workforce.compliance-form.shared";
import {
  buildComplianceListSearchToolbar,
  buildComplianceOperationalListSurface,
  formatComplianceEmployeeListCell,
  formatComplianceListEnumCell,
  resolveWorkEligibilityListBadgeTone,
  resolveWorkEligibilityListRowTone,
  resolveWorkEligibilityListTrailingAction,
} from "./hr.workforce.compliance-list.shared";
import { hrComplianceWorkEligibilityColumnsId } from "./hr.workforce.compliance-surface-columns.shared";
import { hrComplianceUiCopy } from "./hr.workforce.compliance-ui.copy.shared";

export const hrComplianceWorkEligibilitySurfaceKey =
  "hr.workforce.compliance.work-eligibility.list";

export const hrComplianceWorkEligibilitySearchParam =
  "complianceWorkEligibilitySearch";

export function buildHrComplianceWorkEligibilityListSurface(input: {
  window: HrWorkEligibilityWindow;
  searchValue?: string;
  canWrite?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const { window, searchValue, canWrite = false } = input;
  const copy = hrComplianceUiCopy.workEligibility;

  return buildComplianceOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildComplianceListSearchToolbar({
      param: hrComplianceWorkEligibilitySearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: searchValue,
    }),
    window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrComplianceWorkEligibilityColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "employee",
        header: copy.colEmployee,
        pin: "start",
        minWidth: 180,
        cellKind: { kind: "link" },
      },
      {
        id: "status",
        header: copy.colStatus,
        priority: "primary",
        cellKind: { kind: "badge", tone: "attention" },
      },
      { id: "verifiedAt", header: copy.colVerified, cellKind: { kind: "date" } },
      { id: "expiresAt", header: copy.colExpires, cellKind: { kind: "date" } },
    ],
    rows: window.rows.map((row) => {
      const effectiveStatus = deriveEffectiveWorkEligibilityStatus({
        status: row.status,
        expiresAt: row.expiresAt,
      });

      return {
        id: row.id,
        rowHref: hrEmployeeDetailRoutePath(row.employeeId),
        linkColumnId: "employee",
        rowTone: resolveWorkEligibilityListRowTone(effectiveStatus),
        cells: {
          employee: formatComplianceEmployeeListCell({
            employeeNumber: row.employeeNumber,
            employeeDisplayName: row.employeeDisplayName,
          }),
          status: formatComplianceListEnumCell(effectiveStatus),
          statusValue: row.status,
          trailingStatusValue: row.status,
          effectiveStatusValue: effectiveStatus,
          verifiedAt: row.verifiedAt?.toISOString() ?? "",
          expiresAt: row.expiresAt?.toISOString() ?? "",
          expiresAtInput: formatComplianceDateTimeLocalInput(row.expiresAt),
          reviewNotesValue: row.reviewNotes ?? "",
        },
        cellKinds: {
          status: {
            kind: "badge",
            tone: resolveWorkEligibilityListBadgeTone(effectiveStatus),
          },
        },
        trailingAction: resolveWorkEligibilityListTrailingAction(
          canWrite,
          effectiveStatus,
        ),
      };
    }),
  });
}
