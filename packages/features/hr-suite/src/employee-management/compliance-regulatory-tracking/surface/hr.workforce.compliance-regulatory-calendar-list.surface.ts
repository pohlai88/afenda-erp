import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import type { HrComplianceRegulatoryCalendarWindow } from "@afenda/db";

import { hrEmployeeDetailRoutePath } from "../contracts/hr.workforce.compliance-route.contract";
import {
  deriveRegulatoryCalendarEffectiveSourceStatus,
  deriveRegulatoryCalendarPosture,
  formatRegulatoryCalendarEntryKindLabel,
} from "../data/hr.workforce.compliance-regulatory-calendar.shared";
import {
  buildComplianceListSearchToolbar,
  buildComplianceOperationalListSurface,
  formatComplianceListEnumCell,
  resolveRegulatoryCalendarEntryKindBadgeTone,
  resolveRegulatoryCalendarPostureBadgeTone,
  resolveRegulatoryCalendarPostureRowTone,
  resolveRegulatoryCalendarSourceStatusBadgeTone,
} from "./hr.workforce.compliance-list.shared";
import { hrComplianceRegulatoryCalendarColumnsId } from "./hr.workforce.compliance-surface-columns.shared";
import { hrComplianceUiCopy } from "./hr.workforce.compliance-ui.copy.shared";

export const hrComplianceRegulatoryCalendarSurfaceKey =
  "hr.workforce.compliance.regulatory-calendar.list";

export const hrComplianceRegulatoryCalendarSearchParam =
  "complianceRegulatoryCalendarSearch";

export function buildHrComplianceRegulatoryCalendarListSurface(input: {
  window: HrComplianceRegulatoryCalendarWindow;
  searchValue?: string;
}): ListSurfaceRendererConfigurationResolvedInput {
  const { window, searchValue } = input;
  const copy = hrComplianceUiCopy.regulatoryCalendar;

  return buildComplianceOperationalListSurface({
    primaryColumnId: "deadlineAt",
    searchToolbar: buildComplianceListSearchToolbar({
      param: hrComplianceRegulatoryCalendarSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: searchValue,
    }),
    window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrComplianceRegulatoryCalendarColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "deadlineAt",
        header: copy.colDeadline,
        pin: "start",
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
        id: "entryKind",
        header: copy.colKind,
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
        id: "posture",
        header: copy.colPosture,
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "sourceStatus",
        header: copy.colSourceStatus,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: window.rows.map((row) => {
      const posture = deriveRegulatoryCalendarPosture({
        deadlineAt: row.deadlineAt,
      });
      const effectiveSourceStatus = deriveRegulatoryCalendarEffectiveSourceStatus(
        {
          entryKind: row.entryKind,
          sourceStatus: row.sourceStatus,
          deadlineAt: row.deadlineAt,
          requirementKind: row.requirementKind,
          documentNumber: row.documentNumber,
        },
      );

      return {
        id: row.id,
        rowHref: row.employeeId
          ? hrEmployeeDetailRoutePath(row.employeeId)
          : undefined,
        linkColumnId: row.employeeId ? "subject" : undefined,
        rowTone: resolveRegulatoryCalendarPostureRowTone(posture),
        cells: {
          deadlineAt: row.deadlineAt.toISOString(),
          title: row.title,
          entryKind: formatRegulatoryCalendarEntryKindLabel(row.entryKind),
          entryKindValue: row.entryKind,
          subject: row.subjectLabel ?? copy.orgWideSubjectLabel,
          area: row.complianceArea
            ? formatComplianceListEnumCell(row.complianceArea)
            : "—",
          posture: formatComplianceListEnumCell(posture),
          postureValue: posture,
          sourceStatus: formatComplianceListEnumCell(effectiveSourceStatus),
          storedSourceStatusValue: row.sourceStatus,
          effectiveSourceStatusValue: effectiveSourceStatus,
        },
        cellKinds: {
          ...(row.employeeId
            ? { subject: { kind: "link" as const } }
            : undefined),
          entryKind: {
            kind: "badge",
            tone: resolveRegulatoryCalendarEntryKindBadgeTone(row.entryKind),
          },
          posture: {
            kind: "badge",
            tone: resolveRegulatoryCalendarPostureBadgeTone(posture),
          },
          sourceStatus: {
            kind: "badge",
            tone: resolveRegulatoryCalendarSourceStatusBadgeTone({
              entryKind: row.entryKind,
              effectiveSourceStatus,
            }),
          },
        },
      };
    }),
  });
}
