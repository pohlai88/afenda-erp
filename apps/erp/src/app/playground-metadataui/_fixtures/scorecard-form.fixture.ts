import {
  createScorecardCriterion,
  createScorecardForm,
} from "@afenda/metadata-ui";

import { METADATA_UI_PLAYGROUND_FIXTURE_IDS } from "./constants.fixture";

const scoreOptions = [
  {
    value: "met",
    label: "Met",
    description: "The sample criterion is satisfied.",
    weight: 100,
  },
  {
    value: "review",
    label: "Review",
    description: "The sample criterion needs static review.",
    weight: 50,
  },
  {
    value: "blocked",
    label: "Blocked",
    description: "The sample criterion is blocked.",
    weight: 0,
  },
];

export function createMetadataUiPlaygroundScorecardForm() {
  return createScorecardForm({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.scorecardFormMetadata,
    title: "Scorecard form preview",
    description:
      "Static scorecard criteria with readonly, selected, blocked, and validation states.",
    state: "invalid",
    criteria: [
      createScorecardCriterion({
        key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.scorecardCriterionCompleteness,
        label: "Sample completeness",
        description: "Required sample criterion with a static selected value.",
        required: true,
        readonly: true,
        selectedValue: "met",
        options: scoreOptions,
      }),
      createScorecardCriterion({
        key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.scorecardCriterionClarity,
        label: "Sample clarity",
        description: "Static validation criterion requiring a reason.",
        required: true,
        selectedValue: "review",
        reason: "Static reason shown for renderer review.",
        requireReasonWhenSelected: ["review"],
        options: scoreOptions,
      }),
      createScorecardCriterion({
        key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.scorecardCriterionReadiness,
        label: "Sample readiness",
        description: "Blocked criterion display without permission reads.",
        required: false,
        blockedReason:
          "Blocked by static playground metadata; no capability lookup is performed.",
        options: scoreOptions,
      }),
    ],
    errorSummary: {
      title: "Scorecard form preview: review sample scorecard",
      errors: [
        {
          fieldKey:
            METADATA_UI_PLAYGROUND_FIXTURE_IDS.scorecardCriterionClarity,
          message: "Sample clarity remains in review.",
          severity: "warning",
        },
      ],
    },
    diagnostics: {
      testId: "metadata-ui-playground-scorecard-form",
    },
  });
}
