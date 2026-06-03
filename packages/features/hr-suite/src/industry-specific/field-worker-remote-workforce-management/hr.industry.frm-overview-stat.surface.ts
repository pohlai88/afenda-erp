import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import { hrIndustryFrmUiCopy } from "./hr.industry.frm-ui.copy.shared";

export type HrIndustryFrmOverviewSnapshot = {
  readonly activeAssignmentCount: number;
  readonly mobileEventCount: number;
  readonly openExceptionCount: number;
  readonly travelComplianceRiskCount: number;
  readonly approvedPerDiemAmount: number;
  readonly offlineReconciledCount: number;
};

export function buildHrIndustryFrmOverviewStatGrid(input: {
  readonly snapshot: HrIndustryFrmOverviewSnapshot;
}): StatCardConfigurationResolvedInput {
  const copy = hrIndustryFrmUiCopy.overview;
  const { snapshot } = input;

  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-kpi-grid",
    stats: [
      {
        label: copy.activeAssignments,
        value: String(snapshot.activeAssignmentCount),
        tone: "default",
      },
      {
        label: copy.mobileEvents,
        value: String(snapshot.mobileEventCount),
        tone: "default",
      },
      {
        label: copy.openExceptions,
        value: String(snapshot.openExceptionCount),
        tone: snapshot.openExceptionCount > 0 ? "attention" : "default",
      },
      {
        label: copy.travelComplianceRisk,
        value: String(snapshot.travelComplianceRiskCount),
        tone:
          snapshot.travelComplianceRiskCount > 0 ? "critical" : "default",
      },
      {
        label: copy.approvedPerDiem,
        value: `MYR ${snapshot.approvedPerDiemAmount.toLocaleString("en-MY")}`,
        tone: "default",
      },
      {
        label: copy.offlineReconciled,
        value: String(snapshot.offlineReconciledCount),
        tone: snapshot.offlineReconciledCount > 0 ? "attention" : "default",
      },
    ],
  });
}
