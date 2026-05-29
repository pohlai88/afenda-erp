import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import type { HrComplianceAlertWindow } from "@afenda/db";

import { hrEmployeeDetailRoutePath } from "../contracts/hr.workforce.compliance-route.contract";
import {
  deriveEffectiveWorkAuthDocumentStatus,
  type HrmComplianceWorkAuthDocumentStatus,
} from "../data/hr.workforce.compliance-work-auth-documents.shared";
import {
  deriveRegulatoryCalendarEffectiveSourceStatus,
  deriveRegulatoryCalendarPosture,
} from "../data/hr.workforce.compliance-regulatory-calendar.shared";
import { maskComplianceSensitiveStoredValue } from "../data/hr.workforce.compliance-sensitive-access.shared";
import {
  formatComplianceAlertKindLabel,
  formatComplianceAlertSeverityLabel,
  formatComplianceAlertSourceKindLabel,
} from "../data/hr.workforce.compliance-alerts.shared";
import {
  buildComplianceListSearchToolbar,
  buildComplianceOperationalListSurface,
  formatComplianceListEnumCell,
  resolveComplianceAlertKindBadgeTone,
  resolveComplianceAlertSeverityBadgeTone,
  resolveComplianceAlertSeverityRowTone,
  resolveComplianceAlertSourceKindBadgeTone,
  resolveRegulatoryCalendarSourceStatusBadgeTone,
} from "./hr.workforce.compliance-list.shared";
import { hrComplianceAlertsColumnsId } from "./hr.workforce.compliance-surface-columns.shared";
import { hrComplianceUiCopy } from "./hr.workforce.compliance-ui.copy.shared";

export const hrComplianceAlertsSurfaceKey =
  "hr.workforce.compliance.alerts.list";

export const hrComplianceAlertsSearchParam = "complianceAlertsSearch";

function mapAlertSourceKindToCalendarEntryKind(
  sourceKind: HrComplianceAlertWindow["rows"][number]["sourceKind"],
) {
  if (sourceKind === "work_auth_missing") {
    return "work_auth_renewal" as const;
  }
  return sourceKind;
}

export function buildHrComplianceAlertsListSurface(input: {
  window: HrComplianceAlertWindow;
  searchValue?: string;
  canViewSensitive?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const { window, searchValue, canViewSensitive = false } = input;
  const copy = hrComplianceUiCopy.alerts;

  return buildComplianceOperationalListSurface({
    primaryColumnId: "severity",
    searchToolbar: buildComplianceListSearchToolbar({
      param: hrComplianceAlertsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: searchValue,
    }),
    window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrComplianceAlertsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "severity",
        header: copy.colSeverity,
        pin: "start",
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "alertKind",
        header: copy.colAlertKind,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "triggerAt",
        header: copy.colTriggerAt,
        cellKind: { kind: "date" },
        minWidth: 140,
      },
      {
        id: "title",
        header: copy.colTitle,
        priority: "primary",
        wrap: true,
        minWidth: 220,
      },
      {
        id: "sourceKind",
        header: copy.colSourceKind,
        cellKind: { kind: "badge", tone: "default" },
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
    ],
    rows: window.rows.map((row) => {
      const calendarEntryKind = mapAlertSourceKindToCalendarEntryKind(row.sourceKind);
      const redactedDocumentNumber = maskComplianceSensitiveStoredValue(
        row.documentNumber,
        canViewSensitive,
      );
      const effectiveSourceStatus =
        row.sourceKind === "work_auth_missing"
          ? deriveEffectiveWorkAuthDocumentStatus({
              status: row.sourceStatus as HrmComplianceWorkAuthDocumentStatus,
              documentNumber: redactedDocumentNumber || null,
              expiresAt: null,
              hasLinkedEvidenceDocument: (row.linkedEvidenceCount ?? 0) > 0,
            })
          : row.triggerAt === null
            ? row.sourceStatus
            : deriveRegulatoryCalendarEffectiveSourceStatus({
                entryKind: calendarEntryKind,
                sourceStatus: row.sourceStatus,
                deadlineAt: row.triggerAt,
                requirementKind: row.requirementKind,
                documentNumber: redactedDocumentNumber || null,
                linkedEvidenceCount: row.linkedEvidenceCount,
              });
      const posture =
        row.triggerAt !== null
          ? deriveRegulatoryCalendarPosture({ deadlineAt: row.triggerAt })
          : null;

      return {
        id: row.id,
        rowHref: row.employeeId
          ? hrEmployeeDetailRoutePath(row.employeeId)
          : undefined,
        linkColumnId: row.employeeId ? "subject" : undefined,
        rowTone: resolveComplianceAlertSeverityRowTone(row.severity),
        cells: {
          severity: formatComplianceAlertSeverityLabel(row.severity),
          severityValue: row.severity,
          alertKind: formatComplianceAlertKindLabel(row.alertKind),
          alertKindValue: row.alertKind,
          triggerAt: row.triggerAt?.toISOString() ?? copy.noTriggerDateLabel,
          sourceKind: formatComplianceAlertSourceKindLabel(row.sourceKind),
          sourceKindValue: row.sourceKind,
          subject: row.subjectLabel ?? copy.orgWideSubjectLabel,
          area: row.complianceArea
            ? formatComplianceListEnumCell(row.complianceArea)
            : "—",
          sourceStatus: formatComplianceListEnumCell(effectiveSourceStatus),
          storedSourceStatusValue: row.sourceStatus,
          effectiveSourceStatusValue: effectiveSourceStatus,
          ...(posture ? { postureValue: posture } : undefined),
        },
        cellKinds: {
          ...(row.employeeId ? { subject: { kind: "link" as const } } : undefined),
          severity: {
            kind: "badge",
            tone: resolveComplianceAlertSeverityBadgeTone(row.severity),
          },
          alertKind: {
            kind: "badge",
            tone: resolveComplianceAlertKindBadgeTone(row.alertKind),
          },
          sourceKind: {
            kind: "badge",
            tone: resolveComplianceAlertSourceKindBadgeTone(row.sourceKind),
          },
          ...(row.triggerAt
            ? { triggerAt: { kind: "date" as const } }
            : undefined),
          sourceStatus: {
            kind: "badge",
            tone: resolveRegulatoryCalendarSourceStatusBadgeTone({
              entryKind: calendarEntryKind,
              effectiveSourceStatus,
            }),
          },
        },
      };
    }),
  });
}
