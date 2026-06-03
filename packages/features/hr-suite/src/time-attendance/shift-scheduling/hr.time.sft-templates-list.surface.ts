import type { HrShiftTemplateWindow } from "../data/hr.time.sft-template.server";
import {
  buildSftListSearchToolbar,
  buildSftOperationalListSurface,
  formatSftEnumLabel,
  formatSftWorkingHours,
} from "./hr.time.sft-list.shared";
import {
  hrSftTemplatesColumnsId,
  hrSftTemplatesSearchParam,
  hrTimeSftTemplatesSurfaceKey,
} from "./hr.time.sft-surface-metadata.shared";
import { hrSftUiCopy } from "./hr.time.sft-ui.copy.shared";

export { hrTimeSftTemplatesSurfaceKey };

/** HRM-SFT-001 — Pattern B shift types catalog. */
export function buildHrTimeSftTemplatesListSurface(input: {
  window: HrShiftTemplateWindow;
  searchValue?: string;
}) {
  const copy = hrSftUiCopy.templates;

  return buildSftOperationalListSurface({
    surfaceKey: hrTimeSftTemplatesSurfaceKey,
    primaryColumnId: "code",
    searchToolbar: buildSftListSearchToolbar({
      param: hrSftTemplatesSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrSftTemplatesColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "code", header: copy.colCode, pin: "start", priority: "primary" },
      { id: "name", header: copy.colName, wrap: true, minWidth: 180 },
      { id: "hours", header: copy.colHours, minWidth: 100 },
      {
        id: "category",
        header: copy.colCategory,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "pattern",
        header: copy.colPattern,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        name: row.name,
        hours: formatSftWorkingHours(row.workingHoursMinutes),
        category: formatSftEnumLabel(row.shiftCategory),
        pattern: formatSftEnumLabel(row.patternKind),
      },
    })),
  });
}
