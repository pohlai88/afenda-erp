import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import { hrIndustryFhcUiCopy } from "./hr.industry.fhc-ui.copy.shared";

export type HrIndustryFhcOverviewSnapshot = {
  readonly requiredEmployeeCount: number;
  readonly eligibleEmployeeCount: number;
  readonly restrictedEmployeeCount: number;
  readonly expiringCertificateCount: number;
  readonly overdueTrainingCount: number;
  readonly openAlertCount: number;
};

export function buildHrIndustryFhcOverviewStatGrid(input: {
  readonly snapshot: HrIndustryFhcOverviewSnapshot;
}): StatCardConfigurationResolvedInput {
  const copy = hrIndustryFhcUiCopy.overview;
  const { snapshot } = input;

  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-kpi-grid",
    stats: [
      {
        label: copy.requiredEmployees,
        value: String(snapshot.requiredEmployeeCount),
        tone: "default",
      },
      {
        label: copy.eligibleEmployees,
        value: String(snapshot.eligibleEmployeeCount),
        tone: "positive",
      },
      {
        label: copy.restrictedEmployees,
        value: String(snapshot.restrictedEmployeeCount),
        tone: snapshot.restrictedEmployeeCount > 0 ? "critical" : "default",
      },
      {
        label: copy.expiringCertificates,
        value: String(snapshot.expiringCertificateCount),
        tone: snapshot.expiringCertificateCount > 0 ? "attention" : "default",
      },
      {
        label: copy.overdueTraining,
        value: String(snapshot.overdueTrainingCount),
        tone: snapshot.overdueTrainingCount > 0 ? "critical" : "default",
      },
      {
        label: copy.openAlerts,
        value: String(snapshot.openAlertCount),
        tone: snapshot.openAlertCount > 0 ? "attention" : "default",
      },
    ],
  });
}
