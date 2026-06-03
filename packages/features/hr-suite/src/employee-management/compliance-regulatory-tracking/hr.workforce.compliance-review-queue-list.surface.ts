import {
  resolveListSurfaceRowTrailingAction,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import type { HrComplianceReviewQueueWindow } from "@afenda/db";

import { hrEmployeeDetailRoutePath } from "./hr.workforce.compliance-route.contract";
import {
  formatComplianceReviewQueueEntryKindLabel,
  formatComplianceReviewQueueRequiredActionLabel,
  isSensitiveComplianceReviewQueueEntryKind,
} from "./hr.workforce.compliance-review-queue.shared";
import { maskComplianceSensitiveStoredValue } from "./hr.workforce.compliance-sensitive-access.shared";
import {
  buildComplianceListSearchToolbar,
  buildComplianceOperationalListSurface,
  formatComplianceListEnumCell,
} from "./hr.workforce.compliance-list.shared";
import { hrComplianceReviewQueueColumnsId } from "./hr.workforce.compliance-surface-columns.shared";
import { hrComplianceUiCopy } from "./hr.workforce.compliance-ui.copy.shared";

export const hrComplianceReviewQueueSurfaceKey =
  "hr.workforce.compliance.review-queue.list";

export const hrComplianceReviewQueueSearchParam = "complianceReviewQueueSearch";

export function buildHrComplianceReviewQueueListSurface(input: {
  window: HrComplianceReviewQueueWindow;
  searchValue?: string;
  canWrite?: boolean;
  canViewSensitive?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const { window, searchValue, canWrite = false, canViewSensitive = false } =
    input;
  const copy = hrComplianceUiCopy.reviewQueue;

  return buildComplianceOperationalListSurface({
    primaryColumnId: "queuedAt",
    searchToolbar: buildComplianceListSearchToolbar({
      param: hrComplianceReviewQueueSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: searchValue,
    }),
    window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrComplianceReviewQueueColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "queuedAt",
        header: copy.colQueuedAt,
        pin: "start",
        cellKind: { kind: "date" },
        minWidth: 140,
      },
      {
        id: "entryKind",
        header: copy.colEntryKind,
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "title",
        header: copy.colTitle,
        priority: "primary",
        wrap: true,
        minWidth: 220,
      },
      {
        id: "subject",
        header: copy.colSubject,
        wrap: true,
        minWidth: 160,
      },
      {
        id: "area",
        header: copy.colArea,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "sourceStatus",
        header: copy.colSourceStatus,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "requiredAction",
        header: copy.colRequiredAction,
        wrap: true,
        minWidth: 160,
      },
    ],
    rows: window.rows.map((row) => {
      const maskedTitle =
        row.entryKind === "evidence_acknowledgment" &&
        (row.documentClassification === "confidential" ||
          row.documentClassification === "restricted")
          ? maskComplianceSensitiveStoredValue(row.title, canViewSensitive)
          : row.title;

      const rowCanWrite =
        canWrite &&
        (!isSensitiveComplianceReviewQueueEntryKind(row.entryKind) ||
          canViewSensitive);

      return {
        id: row.id,
        rowHref: row.employeeId
          ? hrEmployeeDetailRoutePath(row.employeeId)
          : undefined,
        linkColumnId: row.employeeId ? "subject" : undefined,
        rowTone: "attention",
        trailingAction: rowCanWrite
          ? resolveListSurfaceRowTrailingAction({ visible: true, allowed: true })
          : undefined,
        cells: {
          queuedAt: row.queuedAt.toISOString(),
          entryKind: formatComplianceReviewQueueEntryKindLabel(row.entryKind),
          entryKindValue: row.entryKind,
          sourceRecordIdValue: row.sourceRecordId,
          title: maskedTitle,
          subject: row.subjectLabel ?? copy.orgWideSubjectLabel,
          area: row.complianceArea
            ? formatComplianceListEnumCell(row.complianceArea)
            : "—",
          sourceStatus: formatComplianceListEnumCell(row.sourceStatus),
          storedSourceStatusValue: row.sourceStatus,
          requiredAction: formatComplianceReviewQueueRequiredActionLabel(
            row.entryKind,
          ),
        },
        cellKinds: {
          ...(row.employeeId ? { subject: { kind: "link" as const } } : undefined),
          queuedAt: { kind: "date" as const },
          entryKind: { kind: "badge", tone: "attention" as const },
          area: { kind: "badge", tone: "default" as const },
          sourceStatus: { kind: "badge", tone: "default" as const },
        },
      };
    }),
  });
}
