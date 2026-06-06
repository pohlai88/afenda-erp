import {
  createApprovalFlowTimeline,
  createApprovalTimelineStep,
} from "@afenda/metadata-ui";

import {
  METADATA_UI_PLAYGROUND_FIXTURE_IDS,
  METADATA_UI_PLAYGROUND_FIXTURE_TIMESTAMPS,
} from "./constants.fixture";
import { METADATA_UI_PLAYGROUND_SAMPLE_LABELS } from "./sample-vocabulary.fixture";

export function createMetadataUiPlaygroundTimeline() {
  return createApprovalFlowTimeline({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.timelineMetadata,
    title: "Approval timeline preview",
    description:
      "Static approval-like state history without workflow or tenant reads.",
    currentStepKey: METADATA_UI_PLAYGROUND_FIXTURE_IDS.timelineStepReview,
    steps: [
      createApprovalTimelineStep({
        key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.timelineStepPrepared,
        label: "Sample record prepared",
        description: "Initial fixture state for the sample approval path.",
        status: "approved",
        actor: {
          actorId: "metadata-ui.playground.actor.sample-operator",
          actorType: "user",
          displayName: METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleOperator,
        },
        occurredAt: METADATA_UI_PLAYGROUND_FIXTURE_TIMESTAMPS.baseline,
        comment: "Static sample record moved into review.",
        order: 10,
      }),
      createApprovalTimelineStep({
        key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.timelineStepReview,
        label: "Approval timeline preview: sample review in progress",
        description: "Current fixture state for timeline renderer review.",
        status: "pending",
        actor: {
          actorId: "metadata-ui.playground.actor.sample-review-group",
          actorType: "group",
          displayName: "Sample Review Group",
        },
        dueAt: METADATA_UI_PLAYGROUND_FIXTURE_TIMESTAMPS.reviewWindowEnd,
        comment: "Static due timestamp for screenshot-safe review.",
        order: 20,
      }),
      createApprovalTimelineStep({
        key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.timelineStepBlocked,
        label: "Sample follow-up blocked",
        description: "Blocked fixture state with required reason metadata.",
        status: "blocked",
        actor: {
          actorId: "metadata-ui.playground.actor.sample-system",
          actorType: "system",
          displayName: "Sample System",
        },
        reason:
          "Blocked by static playground metadata; no workflow lookup is performed.",
        order: 30,
      }),
    ],
  });
}
