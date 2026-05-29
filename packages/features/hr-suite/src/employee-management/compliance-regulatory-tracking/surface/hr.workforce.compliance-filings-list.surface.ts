import {
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import type { HrComplianceFilingWindow } from "@afenda/db";

import { formatComplianceObligationScope } from "../data/hr.workforce.compliance-obligation.shared";
import { deriveEffectiveFilingStatus, normalizeFilingStatusForTrailingSelect } from "../data/hr.workforce.compliance-filing.shared";
import { formatComplianceDateTimeLocalInput } from "../schemas/hr.workforce.compliance-form.shared";
import {
  buildComplianceListSearchToolbar,
  buildComplianceOperationalListSurface,
  formatComplianceListEnumCell,
  resolveFilingListBadgeTone,
  resolveFilingListRowTone,
  resolveFilingListTrailingAction,
} from "./hr.workforce.compliance-list.shared";
import { hrComplianceFilingsColumnsId } from "./hr.workforce.compliance-surface-columns.shared";
import { hrComplianceUiCopy } from "./hr.workforce.compliance-ui.copy.shared";

export const hrComplianceFilingsSurfaceKey =
  "hr.workforce.compliance.filings.list";

export const hrComplianceFilingSearchParam = "complianceFilingSearch";

export function buildHrComplianceFilingsListSurface(input: {
  window: HrComplianceFilingWindow;
  searchValue?: string;
  canWrite?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const { window, searchValue, canWrite = false } = input;
  const copy = hrComplianceUiCopy.filing;

  return buildComplianceOperationalListSurface({
    primaryColumnId: "filingDeadline",
    searchToolbar: buildComplianceListSearchToolbar({
      param: hrComplianceFilingSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: searchValue,
    }),
    window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrComplianceFilingsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "filingDeadline",
        header: copy.colDeadline,
        pin: "start",
        cellKind: { kind: "date" },
        minWidth: 140,
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
        id: "scope",
        header: copy.colScope,
        wrap: true,
        minWidth: 180,
      },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "submittedAt",
        header: copy.colSubmitted,
        cellKind: { kind: "date" },
      },
      {
        id: "confirmedAt",
        header: copy.colConfirmed,
        cellKind: { kind: "date" },
      },
    ],
    rows: window.rows.map((row) => {
      const effectiveStatus = deriveEffectiveFilingStatus({
        status: row.status,
        filingDeadline: row.filingDeadline,
      });

      return {
        id: row.id,
        rowTone: resolveFilingListRowTone(effectiveStatus),
        cells: {
          requirement: `${row.obligationCode} · ${row.obligationTitle}`,
          area: formatComplianceListEnumCell(row.complianceArea),
          scope: formatComplianceObligationScope({
            countryCode: row.countryCode,
            legalEntityCode: row.legalEntityCode,
            workLocationCode: row.workLocationCode,
            employmentType: row.employmentType,
            workerCategory: row.workerCategory,
            departmentName: row.departmentName,
          }),
          status: formatComplianceListEnumCell(effectiveStatus),
          trailingStatusValue: normalizeFilingStatusForTrailingSelect(row.status),
          effectiveStatusValue: effectiveStatus,
          filingDeadline: row.filingDeadline?.toISOString() ?? "",
          filingDeadlineInput: formatComplianceDateTimeLocalInput(row.filingDeadline),
          submittedAt: row.submittedAt?.toISOString() ?? "",
          confirmedAt: row.confirmedAt?.toISOString() ?? "",
          reviewNotesValue: row.reviewNotes ?? "",
        },
        cellKinds: {
          status: {
            kind: "badge",
            tone: resolveFilingListBadgeTone(effectiveStatus),
          },
        },
        trailingAction: resolveFilingListTrailingAction(canWrite, effectiveStatus),
      };
    }),
  });
}
