import type { HrAatAbsenceRiskIndicatorsResult } from "./hr.time.aat-risk.schema";
import {
  buildAatListSearchToolbar,
  buildAatOperationalListSurface,
  formatAatRiskLevelLabel,
} from "./hr.time.aat-list.shared";
import { hrAatUiCopy } from "./hr.time.aat-ui.copy.shared";
import {
  hrAatRiskIndicatorsColumnsId,
  hrAatRiskIndicatorsSearchParam,
  hrAatRiskIndicatorsSurfaceKey,
} from "./hr.time.aat-surface-metadata.shared";

export { hrAatRiskIndicatorsSurfaceKey };

export function buildHrAatRiskIndicatorsListSurface(input: {
  result: HrAatAbsenceRiskIndicatorsResult;
  searchValue?: string;
}) {
  const copy = hrAatUiCopy.riskIndicators;
  const elevated = input.result.indicators.filter(
    (row) => row.riskLevel !== "normal",
  );

  return buildAatOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildAatListSearchToolbar({
      param: hrAatRiskIndicatorsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: {
      pageSize: 25,
      totalCount: elevated.length,
      hasNextPage: false,
    },
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrAatRiskIndicatorsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "employee", header: copy.colEmployee, pin: "start", priority: "primary" },
      { id: "riskLevel", header: copy.colRiskLevel },
      { id: "absenceRate", header: copy.colAbsenceRate },
      { id: "frequency", header: copy.colFrequency },
      { id: "lostWorkdays", header: copy.colLostWorkdays },
    ],
    rows: elevated.map((row) => ({
      id: row.employeeId,
      cells: {
        employee: `${row.employeeDisplayName} (${row.employeeNumber})`,
        riskLevel: formatAatRiskLevelLabel(row.riskLevel),
        absenceRate: `${row.absenceRatePercent}%`,
        frequency: String(row.absenceFrequency),
        lostWorkdays: String(row.lostWorkdays),
      },
    })),
  });
}
