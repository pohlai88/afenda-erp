import type { HrShiftRosterReportDefinitionWindow } from "@afenda/db";

import {
  buildSftListSearchToolbar,
  buildSftOperationalListSurface,
} from "./hr.time.sft-list.shared";
import { hrSftUiCopy } from "./hr.time.sft-ui.copy.shared";
import {
  hrSftReportDefinitionsColumnsId,
  hrSftReportDefinitionsSearchParam,
  hrSftReportDefinitionsSurfaceKey,
} from "./hr.time.sft-surface-metadata.shared";

export { hrSftReportDefinitionsSurfaceKey };

export function buildHrSftReportDefinitionsListSurface(input: {
  window: HrShiftRosterReportDefinitionWindow;
  searchValue?: string;
}) {
  const copy = hrSftUiCopy.reports;

  return buildSftOperationalListSurface({
    surfaceKey: hrSftReportDefinitionsSurfaceKey,
    primaryColumnId: "name",
    searchToolbar: buildSftListSearchToolbar({
      param: hrSftReportDefinitionsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrSftReportDefinitionsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "code", header: copy.colCode },
      {
        id: "name",
        header: copy.colName,
        pin: "start",
        priority: "primary",
      },
      { id: "created", header: copy.colCreated },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        name: row.name,
        created: row.createdAt.toISOString(),
      },
    })),
  });
}
