import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import {
  buildCpmSalaryBandDisplayFields,
  type HrCpmSalaryBandContextInput,
} from "../data/hr.payroll.cpm-participant-display.shared";
import { hrCpmSalaryBandSurfaceKey } from "./hr.payroll.cpm-surface-columns.shared";
import { hrCpmUiCopy } from "./hr.payroll.cpm-ui.copy.shared";

export { hrCpmSalaryBandSurfaceKey };

export function buildHrCpmSalaryBandStatGrid(input: {
  band: HrCpmSalaryBandContextInput | null;
}): StatCardConfigurationResolvedInput {
  const fields = buildCpmSalaryBandDisplayFields(input.band);

  if (!fields.configured) {
    return buildGovernedStatGrid({
      __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
      dataNature: "snapshot-summary",
      presentationProfile: "erp-kpi-grid",
      stats: [
        {
          label: "Salary band",
          value: hrCpmUiCopy.salaryBand.notConfiguredTitle,
          tone: "default",
        },
      ],
    });
  }

  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-kpi-grid",
    stats: [
      { label: "Grade", value: fields.grade, tone: "default" },
      { label: "Band minimum", value: fields.bandMinimum, tone: "default" },
      { label: "Band midpoint", value: fields.bandMidpoint, tone: "default" },
      { label: "Band maximum", value: fields.bandMaximum, tone: "default" },
      {
        label: "Range position",
        value: fields.rangePosition,
        tone: "default",
      },
      { label: "Compa-ratio", value: fields.compaRatio, tone: "default" },
    ],
  });
}

export function buildHrCpmSalaryBandStatGroups(input: {
  band: HrCpmSalaryBandContextInput | null;
}) {
  return [
    {
      groupKey: "band",
      label: "Salary band",
      configuration: buildHrCpmSalaryBandStatGrid(input),
    },
  ] as const;
}
