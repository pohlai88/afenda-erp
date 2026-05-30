import type { HrEmployeeDocumentWindow } from "@afenda/db";

import { hrEmployeeDetailRoutePath } from "../contracts/hr.workforce.documents-route.contract";
import { deriveHrDocumentEffectiveVerificationStatus } from "../data/hr.workforce.documents-status.shared";
import {
  maskHrDocumentSensitiveText,
} from "../data/hr.workforce.documents-sensitive-access.shared";
export const hrDocumentsRepositorySearchParam = "documentsRepositorySearch";
import { formatDocumentsDateTimeLocalInput } from "../schemas/hr.workforce.documents-form.shared";
import {
  buildDocumentsListSearchToolbar,
  buildDocumentsOperationalListSurface,
  formatDocumentsEmployeeListCell,
  formatDocumentsListEnumCell,
  resolveDocumentsRepositoryTrailingAction,
  resolveDocumentsVerificationBadgeTone,
  resolveDocumentsVerificationRowTone,
} from "./hr.workforce.documents-list.shared";
import { hrDocumentsRepositoryColumnsId } from "./hr.workforce.documents-surface-columns.shared";
import { hrDocumentsUiCopy } from "./hr.workforce.documents-ui.copy.shared";

export const hrDocumentsRepositorySurfaceKey =
  "hr.workforce.documents.repository.list";

export function buildHrDocumentsRepositoryListSurface(input: {
  window: HrEmployeeDocumentWindow;
  searchValue?: string;
  canWrite?: boolean;
  canViewSensitive?: boolean;
}) {
  const { window, searchValue, canWrite = false, canViewSensitive = false } =
    input;
  const copy = hrDocumentsUiCopy.repository;

  return buildDocumentsOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildDocumentsListSearchToolbar({
      param: hrDocumentsRepositorySearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: searchValue,
    }),
    window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrDocumentsRepositoryColumnsId,
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
        header: copy.colType,
        priority: "primary",
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "title",
        header: copy.colTitle,
        priority: "primary",
        cellKind: { kind: "text" },
      },
      {
        id: "classification",
        header: copy.colClassification,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "verification",
        header: copy.colVerification,
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "lifecycle",
        header: copy.colLifecycle,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "effectiveTo",
        header: copy.colExpiry,
        cellKind: { kind: "date" },
      },
      {
        id: "uploadedAt",
        header: copy.colUploaded,
        cellKind: { kind: "date" },
      },
    ],
    rows: window.rows.map((row) => {
      const effectiveVerification = deriveHrDocumentEffectiveVerificationStatus({
        verificationStatus: row.verificationStatus,
        effectiveTo: row.effectiveTo,
      });

      return {
        id: row.id,
        rowHref: hrEmployeeDetailRoutePath(row.employeeId),
        linkColumnId: "employee",
        rowTone: resolveDocumentsVerificationRowTone(effectiveVerification),
        cells: {
          employee: formatDocumentsEmployeeListCell({
            employeeNumber: row.employeeNumber,
            employeeDisplayName: row.employeeDisplayName,
          }),
          documentType: formatDocumentsListEnumCell(row.documentType),
          title: maskHrDocumentSensitiveText(row.title, canViewSensitive),
          titleValue: row.title,
          blobUrlValue: row.blobUrl,
          classification: formatDocumentsListEnumCell(row.classification),
          verification: formatDocumentsListEnumCell(effectiveVerification),
          verificationValue: row.verificationStatus,
          effectiveVerificationValue: effectiveVerification,
          lifecycle: formatDocumentsListEnumCell(row.lifecycleStatus),
          effectiveTo: row.effectiveTo?.toISOString() ?? "",
          effectiveToInput: formatDocumentsDateTimeLocalInput(row.effectiveTo),
          uploadedAt: row.uploadedAt.toISOString(),
          versionNumberValue: String(row.versionNumber),
          isLatestActiveValue: row.isLatestActive ? "true" : "false",
          rejectionReasonValue: row.rejectionReason ?? "",
          employeeIdValue: row.employeeId,
          mimeTypeValue: row.mimeType,
          sizeBytesValue: String(row.sizeBytes),
        },
        cellKinds: {
          verification: {
            kind: "badge",
            tone: resolveDocumentsVerificationBadgeTone(effectiveVerification),
          },
        },
        trailingAction: resolveDocumentsRepositoryTrailingAction(
          canWrite,
          effectiveVerification,
        ),
      };
    }),
  });
}
