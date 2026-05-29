import {
  resolveListSurfaceRowTrailingAction,
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
} from "./hr.workforce.compliance-list.shared";
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
      columnsId: "hr.workforce.compliance.work-eligibility",
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
        rowTone: resolveWorkEligibilityListBadgeTone(effectiveStatus),
        cells: {
          employee: formatComplianceEmployeeListCell({
            employeeNumber: row.employeeNumber,
            employeeDisplayName: row.employeeDisplayName,
          }),
          status: formatComplianceListEnumCell(effectiveStatus),
          statusValue: row.status,
          verifiedAt: row.verifiedAt?.toISOString() ?? "",
          expiresAt: row.expiresAt?.toISOString() ?? "",
          expiresAtInput: formatComplianceDateTimeLocalInput(row.expiresAt),
        },
        cellKinds: {
          status: {
            kind: "badge",
            tone: resolveWorkEligibilityListBadgeTone(effectiveStatus),
          },
        },
        trailingAction: canWrite
          ? resolveListSurfaceRowTrailingAction({
              visible:
                effectiveStatus !== "eligible" &&
                effectiveStatus !== "not_applicable",
              allowed: true,
            })
          : undefined,
      };
    }),
  });
}
