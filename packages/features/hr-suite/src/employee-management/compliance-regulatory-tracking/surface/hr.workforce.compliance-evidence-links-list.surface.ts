import type { HrComplianceEvidenceLinkWindow } from "@afenda/db";
import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";

import { hrEmployeeDetailRoutePath } from "../contracts/hr.workforce.compliance-route.contract";
import {
  buildComplianceListSearchToolbar,
  buildComplianceOperationalListSurface,
  formatComplianceEmployeeListCell,
  formatComplianceListEnumCell,
  resolveEvidenceLinkListBadgeTone,
  resolveEvidenceLinkListRowTone,
  resolveEvidenceLinkListTrailingAction,
} from "./hr.workforce.compliance-list.shared";
import {
  isComplianceEvidenceLinkSensitive,
  maskComplianceSensitiveDisplayText,
  maskComplianceSensitiveStoredValue,
} from "../data/hr.workforce.compliance-sensitive-access.shared";
import { hrComplianceEvidenceLinksColumnsId } from "./hr.workforce.compliance-surface-columns.shared";
import { hrComplianceUiCopy } from "./hr.workforce.compliance-ui.copy.shared";

export const hrComplianceEvidenceLinksSurfaceKey =
  "hr.workforce.compliance.evidence-links.list";

export const hrComplianceEvidenceLinksSearchParam =
  "complianceEvidenceLinksSearch";

export function buildHrComplianceEvidenceLinksListSurface(input: {
  window: HrComplianceEvidenceLinkWindow;
  searchValue?: string;
  canWrite?: boolean;
  canViewSensitive?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const { window, searchValue, canWrite = false, canViewSensitive = false } =
    input;
  const copy = hrComplianceUiCopy.evidenceLinks;

  return buildComplianceOperationalListSurface({
    primaryColumnId: "recordLabel",
    searchToolbar: buildComplianceListSearchToolbar({
      param: hrComplianceEvidenceLinksSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: searchValue,
    }),
    window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrComplianceEvidenceLinksColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "recordLabel",
        header: copy.colRecord,
        pin: "start",
        minWidth: 200,
        cellKind: { kind: "text" },
      },
      {
        id: "recordKind",
        header: copy.colRecordKind,
        priority: "primary",
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "documentTitle",
        header: copy.colDocument,
        priority: "primary",
        cellKind: { kind: "text" },
      },
      {
        id: "documentType",
        header: copy.colDocumentType,
        priority: "secondary",
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "employee",
        header: copy.colEmployee,
        cellKind: { kind: "link" },
      },
      {
        id: "submissionState",
        header: copy.colSubmissionState,
        cellKind: { kind: "badge", tone: "attention" },
      },
      { id: "linkedAt", header: copy.colLinkedAt, cellKind: { kind: "date" } },
    ],
    rows: window.rows.map((row) => {
      const isSensitiveRow = isComplianceEvidenceLinkSensitive({
        documentClassification: row.documentClassification,
      });

      return {
      id: row.id,
      rowHref: row.employeeId
        ? hrEmployeeDetailRoutePath(row.employeeId)
        : undefined,
      linkColumnId: row.employeeId ? "employee" : undefined,
      rowTone: resolveEvidenceLinkListRowTone(row.submissionState),
      cells: {
        recordLabel: row.recordLabel,
        recordKind: formatComplianceListEnumCell(row.recordKind),
        recordKindValue: row.recordKind,
        recordIdValue: row.recordId,
        documentTitle: maskComplianceSensitiveDisplayText(
          row.documentTitle,
          canViewSensitive || !isSensitiveRow,
        ),
        documentType: formatComplianceListEnumCell(row.documentType),
        documentTypeValue: row.documentType,
        employeeDocumentIdValue: row.employeeDocumentId,
        employee: row.employeeId
          ? formatComplianceEmployeeListCell({
              employeeNumber: row.employeeNumber,
              employeeDisplayName: row.employeeDisplayName,
            })
          : copy.orgWideSubjectLabel,
        employeeIdValue: row.employeeId ?? "",
        submissionState: formatComplianceListEnumCell(row.submissionState),
        submissionStateValue: row.submissionState,
        trailingSubmissionStateValue: row.submissionState,
        notesValue: maskComplianceSensitiveStoredValue(
          row.notes,
          canViewSensitive || !isSensitiveRow,
        ),
        linkedAt: row.createdAt.toISOString(),
      },
      cellKinds: {
        recordKind: { kind: "badge", tone: "default" },
        documentType: { kind: "badge", tone: "default" },
        submissionState: {
          kind: "badge",
          tone: resolveEvidenceLinkListBadgeTone(row.submissionState),
        },
      },
      trailingAction: resolveEvidenceLinkListTrailingAction(
        canWrite,
        isSensitiveRow,
        canViewSensitive,
      ),
    };
    }),
  });
}
