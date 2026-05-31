import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import {
  buildCpmParticipantDisplayFields,
  type HrCpmParticipantContextInput,
} from "../data/hr.payroll.cpm-participant-display.shared";
import { hrCpmParticipantContextSurfaceKey } from "./hr.payroll.cpm-surface-columns.shared";

export { hrCpmParticipantContextSurfaceKey };

export function buildHrCpmParticipantContextStatGrid(input: {
  participant: HrCpmParticipantContextInput;
}): StatCardConfigurationResolvedInput {
  const fields = buildCpmParticipantDisplayFields(input.participant);

  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-kpi-grid",
    stats: [
      { label: "Employee", value: fields.employee, tone: "default" },
      { label: "Current salary", value: fields.currentSalary, tone: "default" },
      { label: "Grade", value: fields.currentGrade, tone: "default" },
      { label: "Job level", value: fields.currentLevel, tone: "default" },
      { label: "Department", value: fields.department, tone: "default" },
      { label: "Manager", value: fields.manager, tone: "default" },
      {
        label: "Salary effective date",
        value: fields.salaryEffectiveDate,
        tone: "default",
      },
    ],
  });
}

export function buildHrCpmParticipantContextStatGroups(input: {
  participant: HrCpmParticipantContextInput;
}) {
  return [
    {
      groupKey: "snapshot",
      label: "Employee snapshot",
      configuration: buildHrCpmParticipantContextStatGrid(input),
    },
  ] as const;
}
