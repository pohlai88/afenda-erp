import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import { hrIndustryMscUiCopy } from "./hr.industry.msc-ui.copy.shared";

export type HrIndustryMscOverviewSnapshot = {
  readonly requiredTrainingCount: number;
  readonly overdueTrainingCount: number;
  readonly expiringCertificationCount: number;
  readonly activeRestrictionCount: number;
  readonly openIncidentCount: number;
  readonly overdueCorrectiveActionCount: number;
};

export function buildHrIndustryMscOverviewStatGrid(input: {
  readonly snapshot: HrIndustryMscOverviewSnapshot;
}): StatCardConfigurationResolvedInput {
  const copy = hrIndustryMscUiCopy.overview;
  const { snapshot } = input;

  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-kpi-grid",
    stats: [
      {
        label: copy.requiredTraining,
        value: String(snapshot.requiredTrainingCount),
        tone: "default",
      },
      {
        label: copy.overdueTraining,
        value: String(snapshot.overdueTrainingCount),
        tone: snapshot.overdueTrainingCount > 0 ? "critical" : "positive",
      },
      {
        label: copy.expiringCertifications,
        value: String(snapshot.expiringCertificationCount),
        tone:
          snapshot.expiringCertificationCount > 0 ? "attention" : "positive",
      },
      {
        label: copy.activeRestrictions,
        value: String(snapshot.activeRestrictionCount),
        tone: snapshot.activeRestrictionCount > 0 ? "critical" : "positive",
      },
      {
        label: copy.openIncidents,
        value: String(snapshot.openIncidentCount),
        tone: snapshot.openIncidentCount > 0 ? "attention" : "positive",
      },
      {
        label: copy.overdueActions,
        value: String(snapshot.overdueCorrectiveActionCount),
        tone:
          snapshot.overdueCorrectiveActionCount > 0
            ? "critical"
            : "positive",
      },
    ],
  });
}
