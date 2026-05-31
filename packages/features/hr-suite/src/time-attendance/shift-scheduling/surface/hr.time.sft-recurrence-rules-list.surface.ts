import type { HrShiftRecurrenceRuleWindow } from "@afenda/db";

import { hrTimeSftRecurrenceRulesSurfaceKey } from "../contracts/hr.time.sft.contract";
import {
  buildSftListSearchToolbar,
  buildSftOperationalListSurface,
  formatSftEnumCell,
} from "./hr.time.sft-list.shared";
import {
  hrSftRecurrenceRulesColumnsId,
  hrSftRecurrenceRulesSearchParam,
} from "./hr.time.sft-surface-metadata.shared";
import { hrSftUiCopy } from "./hr.time.sft-ui.copy.shared";

export { hrTimeSftRecurrenceRulesSurfaceKey };

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function formatRecurrenceDays(daysOfWeek: readonly number[]): string {
  if (daysOfWeek.length === 0) {
    return "—";
  }
  return daysOfWeek
    .slice()
    .sort((left, right) => left - right)
    .map((day) => DAY_LABELS[day] ?? String(day))
    .join(", ");
}

/** HRM-SFT-007 — Pattern B recurrence rules catalog. */
export function buildHrTimeSftRecurrenceRulesListSurface(input: {
  window: HrShiftRecurrenceRuleWindow;
  searchValue?: string;
}) {
  const copy = hrSftUiCopy.recurrenceRules;

  return buildSftOperationalListSurface({
    surfaceKey: hrTimeSftRecurrenceRulesSurfaceKey,
    primaryColumnId: "code",
    searchToolbar: buildSftListSearchToolbar({
      param: hrSftRecurrenceRulesSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrSftRecurrenceRulesColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "code", header: copy.colCode, pin: "start", priority: "primary" },
      { id: "name", header: copy.colName, wrap: true, minWidth: 180 },
      { id: "days", header: copy.colDays, minWidth: 140 },
      { id: "effective", header: copy.colEffective, minWidth: 180 },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        name: row.name,
        days: formatRecurrenceDays(row.daysOfWeek),
        effective: `${row.effectiveFrom.toISOString().slice(0, 10)}${
          row.effectiveTo ? ` – ${row.effectiveTo.toISOString().slice(0, 10)}` : ""
        }`,
        status: formatSftEnumCell(row.status),
      },
    })),
  });
}
