import {
  createCompactStatItem,
  createNumberStatItem,
  createPercentageStatItem,
  createStatGroup,
  withStatComparison,
  withStatDisplay,
} from "@afenda/metadata-ui";

import { METADATA_UI_PLAYGROUND_FIXTURE_IDS } from "./constants.fixture";

export function createMetadataUiPlaygroundStats() {
  return createStatGroup({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.statMetadata,
    title: "Renderer summary",
    description:
      "Deterministic preview values for stat cards and compact summary states.",
    dataNature: "snapshot-summary",
    items: [
      withStatDisplay(
        withStatComparison(
          createNumberStatItem({
            key: "metadata-ui.playground.stat.ready-sections",
            label: "Ready sections",
            value: 3,
            description: "Renderer families covered in this slice.",
          }),
          {
            label: "Baseline",
            value: "Slice 03",
            direction: "flat",
            explanation: "Static slice marker for screenshot review.",
          },
        ),
        {
          animation: "off",
          currency: "USD",
          iconKey: "layers",
          progress: {
            value: 3,
            max: 10,
            label: "Slice coverage",
          },
          sparkline: [
            { value: 1, label: "Shell" },
            { value: 2, label: "Fixtures" },
            { value: 3, label: "Gallery" },
          ],
        },
      ),
      withStatDisplay(
        createCompactStatItem({
          key: "metadata-ui.playground.stat.sample-rows",
          label: "Sample rows",
          value: 8,
          description: "Rows in the current server window.",
        }),
        {
          animation: "off",
          currency: "USD",
          iconKey: "rows",
        },
      ),
      withStatDisplay(
        createPercentageStatItem({
          key: "metadata-ui.playground.stat.static-fixtures",
          label: "Static fixtures",
          value: 1,
          description: "No request-bound APIs or generated current time.",
        }),
        {
          animation: "off",
          currency: "USD",
          maximumFractionDigits: 0,
          iconKey: "shield",
        },
      ),
    ],
  });
}
