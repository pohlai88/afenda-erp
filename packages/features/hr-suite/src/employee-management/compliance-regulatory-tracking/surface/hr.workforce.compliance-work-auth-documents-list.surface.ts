import {
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import type { HrWorkAuthorizationDocumentWindow } from "@afenda/db";

import { hrEmployeeDetailRoutePath } from "../contracts/hr.workforce.compliance-route.contract";
import { deriveEffectiveWorkAuthDocumentStatus, normalizeWorkAuthStatusForTrailingSelect } from "../data/hr.workforce.compliance-work-auth-documents.shared";
import { formatComplianceDateTimeLocalInput } from "../schemas/hr.workforce.compliance-form.shared";
import {
  buildComplianceListSearchToolbar,
  buildComplianceOperationalListSurface,
  formatComplianceEmployeeListCell,
  formatComplianceListEnumCell,
  resolveWorkAuthDocumentListBadgeTone,
  resolveWorkAuthDocumentListRowTone,
  resolveWorkAuthDocumentListTrailingAction,
} from "./hr.workforce.compliance-list.shared";
import { hrComplianceWorkAuthDocumentsColumnsId } from "./hr.workforce.compliance-surface-columns.shared";
import { hrComplianceUiCopy } from "./hr.workforce.compliance-ui.copy.shared";

export const hrComplianceWorkAuthDocumentsSurfaceKey =
  "hr.workforce.compliance.work-auth-documents.list";

export const hrComplianceWorkAuthDocumentSearchParam =
  "complianceWorkAuthDocumentSearch";

export function buildHrComplianceWorkAuthDocumentsListSurface(input: {
  window: HrWorkAuthorizationDocumentWindow;
  searchValue?: string;
  canWrite?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const { window, searchValue, canWrite = false } = input;
  const copy = hrComplianceUiCopy.workAuthDocuments;

  return buildComplianceOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildComplianceListSearchToolbar({
      param: hrComplianceWorkAuthDocumentSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: searchValue,
    }),
    window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrComplianceWorkAuthDocumentsColumnsId,
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
        id: "documentType",
        header: copy.colDocumentType,
        priority: "primary",
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "status",
        header: copy.colStatus,
        priority: "primary",
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "documentNumber",
        header: copy.colDocumentNumber,
        cellKind: { kind: "text" },
      },
      { id: "issuedAt", header: copy.colIssued, cellKind: { kind: "date" } },
      { id: "expiresAt", header: copy.colExpires, cellKind: { kind: "date" } },
      { id: "verifiedAt", header: copy.colVerified, cellKind: { kind: "date" } },
    ],
    rows: window.rows.map((row) => {
      const effectiveStatus = deriveEffectiveWorkAuthDocumentStatus({
        status: row.status,
        documentNumber: row.documentNumber,
        expiresAt: row.expiresAt,
      });

      return {
        id: row.id,
        rowHref: hrEmployeeDetailRoutePath(row.employeeId),
        linkColumnId: "employee",
        rowTone: resolveWorkAuthDocumentListRowTone(effectiveStatus),
        cells: {
          employee: formatComplianceEmployeeListCell({
            employeeNumber: row.employeeNumber,
            employeeDisplayName: row.employeeDisplayName,
          }),
          documentType: formatComplianceListEnumCell(row.documentType),
          status: formatComplianceListEnumCell(effectiveStatus),
          statusValue: row.status,
          effectiveStatusValue: effectiveStatus,
          trailingStatusValue: normalizeWorkAuthStatusForTrailingSelect({
            effectiveStatus,
            storedStatus: row.status,
          }),
          documentNumber: row.documentNumber ?? "—",
          documentNumberValue: row.documentNumber ?? "",
          issuedAt: row.issuedAt?.toISOString() ?? "",
          issuedAtInput: formatComplianceDateTimeLocalInput(row.issuedAt),
          expiresAt: row.expiresAt?.toISOString() ?? "",
          expiresAtInput: formatComplianceDateTimeLocalInput(row.expiresAt),
          verifiedAt: row.verifiedAt?.toISOString() ?? "",
          reviewNotesValue: row.reviewNotes ?? "",
        },
        cellKinds: {
          documentType: { kind: "badge", tone: "default" },
          status: {
            kind: "badge",
            tone: resolveWorkAuthDocumentListBadgeTone(effectiveStatus),
          },
        },
        trailingAction: resolveWorkAuthDocumentListTrailingAction(
          canWrite,
          effectiveStatus,
        ),
      };
    }),
  });
}
