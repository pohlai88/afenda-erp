import {
  buildHeatmapCells,
  buildHeatmapVizConfig,
  hrAatHeatmapQuerySchema,
  type HrAatHeatmapResult,
  type HrAatHeatmapRowAxis,
} from "./hr.time.aat-comparison.schema";
import {
  loadHrAatHeatmapSourceFacts,
  type HrAatHeatmapSourceFact,
} from "./hrs-hr-time-aat-comparison-server";

/** HRM-AAT-016 — absence heatmap by date, team, department, location, or leave type. */
export async function loadHrAatAbsenceHeatmap(
  input: unknown,
): Promise<HrAatHeatmapResult> {
  const query = hrAatHeatmapQuerySchema.parse(input);
  const facts = await loadHrAatHeatmapSourceFacts({
    organizationId: query.organizationId,
    periodStart: query.periodStart,
    periodEnd: query.periodEnd,
    departmentId: query.departmentId,
    managerEmployeeId: query.managerEmployeeId,
    workLocationCode: query.workLocationCode,
  });

  const merged = mergeHeatmapRows(
    facts.map((fact) => projectHeatmapFact(fact, query.rowAxis)),
  );
  const cells = buildHeatmapCells(merged);

  return {
    requirementCode: "HRM-AAT-016",
    viz: buildHeatmapVizConfig({
      rowAxis: query.rowAxis,
      periodStart: query.periodStart,
      periodEnd: query.periodEnd,
      cells,
    }),
  };
}

export function projectHeatmapFact(
  fact: HrAatHeatmapSourceFact,
  rowAxis: HrAatHeatmapRowAxis,
): {
  rowKey: string;
  rowLabel: string;
  colKey: string;
  colLabel: string;
  value: number;
} {
  if (rowAxis === "date") {
    return {
      rowKey: fact.dateKey,
      rowLabel: fact.dateKey,
      colKey: fact.leaveTypeKey,
      colLabel: fact.leaveTypeLabel,
      value: fact.lostWorkdays,
    };
  }

  const row = resolveHeatmapRow(fact, rowAxis);
  return {
    ...row,
    colKey: fact.dateKey,
    colLabel: fact.dateKey,
    value: fact.lostWorkdays,
  };
}

function resolveHeatmapRow(
  fact: HrAatHeatmapSourceFact,
  rowAxis: HrAatHeatmapRowAxis,
): { rowKey: string; rowLabel: string } {
  switch (rowAxis) {
    case "date":
      return { rowKey: fact.dateKey, rowLabel: fact.dateKey };
    case "team":
      return { rowKey: fact.teamKey, rowLabel: fact.teamLabel };
    case "department":
      return { rowKey: fact.departmentKey, rowLabel: fact.departmentLabel };
    case "location":
      return { rowKey: fact.locationKey, rowLabel: fact.locationLabel };
    case "leave_type":
      return { rowKey: fact.leaveTypeKey, rowLabel: fact.leaveTypeLabel };
  }
}

function mergeHeatmapRows(
  rows: readonly {
    rowKey: string;
    rowLabel: string;
    colKey: string;
    colLabel: string;
    value: number;
  }[],
) {
  const merged = new Map<
    string,
    {
      rowKey: string;
      rowLabel: string;
      colKey: string;
      colLabel: string;
      value: number;
    }
  >();

  for (const row of rows) {
    const key = `${row.rowKey}::${row.colKey}`;
    const existing = merged.get(key);
    if (existing) {
      existing.value += row.value;
    } else {
      merged.set(key, { ...row });
    }
  }

  return [...merged.values()];
}
