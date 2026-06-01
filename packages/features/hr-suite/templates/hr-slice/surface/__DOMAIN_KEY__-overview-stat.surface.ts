import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { StatCardConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import { __IDENTIFIER_CAMEL__UiCopy } from "./__DOMAIN_KEY__-ui.copy.shared";

export type __IDENTIFIER__OverviewSnapshot = {
  readonly recordCount: number;
  readonly activeCount: number;
  readonly attentionCount: number;
};

export function build__IDENTIFIER__OverviewStatGrid(input: {
  readonly snapshot: __IDENTIFIER__OverviewSnapshot;
}): StatCardConfigurationResolvedInput {
  const copy = __IDENTIFIER_CAMEL__UiCopy.overview;
  const { snapshot } = input;

  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-kpi-grid",
    stats: [
      {
        label: copy.records,
        value: String(snapshot.recordCount),
        tone: "default",
      },
      {
        label: copy.active,
        value: String(snapshot.activeCount),
        tone: "positive",
      },
      {
        label: copy.attention,
        value: String(snapshot.attentionCount),
        tone: snapshot.attentionCount > 0 ? "attention" : "positive",
      },
    ],
  });
}
