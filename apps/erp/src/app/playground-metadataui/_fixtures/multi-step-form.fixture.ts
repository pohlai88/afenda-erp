import {
  createMultiStepForm,
  createMultiStepFormStep,
  createFormSection,
  createSelectField,
  createTextField,
  createTextareaField,
  type MetadataUiActionContractInput,
} from "@afenda/metadata-ui";

import { METADATA_UI_PLAYGROUND_FIXTURE_IDS } from "./constants.fixture";
import { METADATA_UI_PLAYGROUND_SAMPLE_LABELS } from "./sample-vocabulary.fixture";

const reviewStepNavigationAction = {
  id: "metadata-ui.playground.action.review-step",
  label: "Review step",
  description: "Navigate within the static multi-step preview.",
  intent: "open",
  tone: "neutral",
  risk: "low",
  visibility: "disabled",
  disabledReason: "Step navigation is inert in this playground.",
  execution: {
    kind: "client-event",
    eventKey: "metadata-ui.playground.event.review-step",
  },
} as const satisfies MetadataUiActionContractInput;

export function createMetadataUiPlaygroundMultiStepForm() {
  return createMultiStepForm({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.multiStepFormMetadata,
    title: "Multi-step form preview",
    description:
      "Static multi-step metadata with active, invalid, and blocked steps.",
    mode: "review",
    state: "invalid",
    activeStepKey: METADATA_UI_PLAYGROUND_FIXTURE_IDS.multiStepFormStepValidate,
    steps: [
      createMultiStepFormStep({
        key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.multiStepFormStepPrepare,
        title: "Prepare sample record",
        description: "Completed setup metadata for the sample record.",
        status: "complete",
        order: 10,
        sections: [
          createFormSection({
            key: "metadata-ui.playground.multi-step.section.prepare",
            title: "Preparation",
            fields: [
              createTextField({
                key: "metadata-ui.playground.multi-step.field.record",
                name: "recordLabel",
                label: "Record label",
                defaultValue: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleRecord} 010`,
                readonly: true,
              }),
            ],
          }),
        ],
        navigationAction: reviewStepNavigationAction,
      }),
      createMultiStepFormStep({
        key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.multiStepFormStepValidate,
        title: "Validate sample metadata",
        description: "Active validation metadata with static sample errors.",
        status: "invalid",
        order: 20,
        sections: [
          createFormSection({
            key: "metadata-ui.playground.multi-step.section.validate",
            title: "Validation",
            fields: [
              createSelectField({
                key: "metadata-ui.playground.multi-step.field.status",
                name: "reviewStatus",
                label: "Review status",
                defaultValue: "needs-note",
                options: [
                  {
                    value: "ready",
                    label: "Ready",
                    description: "The sample metadata can be reviewed.",
                  },
                  {
                    value: "needs-note",
                    label: "Needs note",
                    description: "The sample metadata needs a review note.",
                  },
                ],
                state: {
                  value: "invalid",
                  reason: "Static validation fixture.",
                  errors: [
                    {
                      message: "A review note is required for this status.",
                      severity: "error",
                    },
                  ],
                },
              }),
              createTextareaField({
                key: "metadata-ui.playground.multi-step.field.note",
                name: "reviewNote",
                label: "Review note",
                placeholder: "Add static sample review note",
                defaultValue: "",
              }),
            ],
          }),
        ],
        errorSummary: {
          title: "Review validation",
          errors: [
            {
              fieldKey: "metadata-ui.playground.multi-step.field.status",
              message: "A review note is required for this status.",
              severity: "error",
            },
          ],
        },
        navigationAction: reviewStepNavigationAction,
      }),
      createMultiStepFormStep({
        key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.multiStepFormStepPublish,
        title: "Publish sample metadata",
        description: "Blocked until static validation is resolved.",
        status: "blocked",
        order: 30,
        sections: [
          createFormSection({
            key: "metadata-ui.playground.multi-step.section.publish",
            title: "Publish",
            fields: [
              createTextField({
                key: "metadata-ui.playground.multi-step.field.publish",
                name: "publishState",
                label: "Publish state",
                defaultValue: "Waiting for validation",
                readonly: true,
              }),
            ],
          }),
        ],
        navigationAction: reviewStepNavigationAction,
      }),
    ],
    diagnostics: {
      testId: "metadata-ui-playground-multi-step-form",
    },
  });
}
