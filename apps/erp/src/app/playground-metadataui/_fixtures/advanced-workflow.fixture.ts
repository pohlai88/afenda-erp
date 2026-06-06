import "server-only";

import {
  createFormSection,
  createMultiStepForm,
  createMultiStepFormStep,
  createScorecardCriterion,
  createScorecardForm,
  createSelectField,
  createTextField,
  createTextareaField,
  type MetadataUiActionContractInput,
} from "@afenda/metadata-ui";

import { METADATA_UI_ADVANCED_WORKFLOW_STEPS } from "./advanced-seed.fixture";
import { METADATA_UI_PLAYGROUND_FIXTURE_IDS } from "./constants.fixture";
import { METADATA_UI_PLAYGROUND_SAMPLE_LABELS } from "./sample-vocabulary.fixture";

const advancedWorkflowStepAction = {
  id: "metadata-ui.playground.advanced.workflow.action.review-step",
  label: "Review workflow step",
  description: "Preview workflow step navigation without mutating ERP state.",
  intent: "open",
  tone: "neutral",
  risk: "low",
  visibility: "disabled",
  disabledReason: "Workflow navigation is inert in this playground.",
  execution: {
    kind: "client-event",
    eventKey: "metadata-ui.playground.advanced.workflow.event.review-step",
  },
} as const satisfies MetadataUiActionContractInput;

const scoreOptions = [
  {
    value: "met",
    label: "Met",
    description: "The advanced workflow criterion is satisfied.",
    weight: 100,
  },
  {
    value: "review",
    label: "Review",
    description: "The advanced workflow criterion requires review.",
    weight: 50,
  },
  {
    value: "blocked",
    label: "Blocked",
    description: "The advanced workflow criterion is blocked.",
    weight: 0,
  },
] as const;

function createScoreOptions() {
  return scoreOptions.map((option) => ({ ...option }));
}

const [prepareStep, reviewStep, publishStep] = METADATA_UI_ADVANCED_WORKFLOW_STEPS;

if (!prepareStep || !reviewStep || !publishStep) {
  throw new Error(
    "Metadata UI advanced workflow fixture requires prepare, review, and publish step seeds.",
  );
}

export function createMetadataUiAdvancedWorkflowMultiStepForm() {
  return createMultiStepForm({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedWorkflowMultiStepMetadata,
    title: "Advanced workflow form",
    description:
      "Seeded workflow form with complete, active review, and blocked publish steps.",
    mode: "review",
    state: "invalid",
    activeStepKey: reviewStep.id,
    steps: [
      createMultiStepFormStep({
        key: prepareStep.id,
        title: prepareStep.label,
        description:
          "Completed setup metadata for the advanced sample workflow.",
        status: "complete",
        order: 10,
        sections: [
          createFormSection({
            key: "metadata-ui.playground.advanced.workflow.section.prepare",
            title: "Prepare",
            fields: [
              createTextField({
                key: "metadata-ui.playground.advanced.workflow.field.record",
                name: "recordLabel",
                label: "Record label",
                defaultValue: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleRecord} Workflow`,
                readonly: true,
              }),
              createTextField({
                key: "metadata-ui.playground.advanced.workflow.field.location",
                name: "locationLabel",
                label: "Location",
                defaultValue: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleLocation} Review`,
                readonly: true,
              }),
            ],
          }),
        ],
        navigationAction: advancedWorkflowStepAction,
      }),
      createMultiStepFormStep({
        key: reviewStep.id,
        title: reviewStep.label,
        description:
          "Active advanced review step with static validation metadata.",
        status: "invalid",
        order: 20,
        sections: [
          createFormSection({
            key: "metadata-ui.playground.advanced.workflow.section.review",
            title: "Review",
            fields: [
              createSelectField({
                key: "metadata-ui.playground.advanced.workflow.field.review-band",
                name: "reviewBand",
                label: "Review band",
                defaultValue: "restricted",
                options: [
                  {
                    value: "standard",
                    label: "Standard",
                    description: "Standard static review path.",
                  },
                  {
                    value: "restricted",
                    label: "Restricted",
                    description: "Restricted static review path.",
                  },
                ],
                state: {
                  value: "invalid",
                  reason: "Restricted reviews require a static reason.",
                  errors: [
                    {
                      message: "Add a sample reason before publishing.",
                      severity: "error",
                    },
                  ],
                },
              }),
              createTextareaField({
                key: "metadata-ui.playground.advanced.workflow.field.reason",
                name: "staticReason",
                label: "Static reason",
                placeholder: "Add deterministic sample reason",
                defaultValue: "",
              }),
            ],
          }),
        ],
        errorSummary: {
          title: "Advanced workflow validation",
          errors: [
            {
              fieldKey:
                "metadata-ui.playground.advanced.workflow.field.review-band",
              message: "Add a sample reason before publishing.",
              severity: "error",
            },
          ],
        },
        navigationAction: advancedWorkflowStepAction,
      }),
      createMultiStepFormStep({
        key: publishStep.id,
        title: publishStep.label,
        description: "Blocked publish step with no ERP mutation behavior.",
        status: "blocked",
        order: 30,
        sections: [
          createFormSection({
            key: "metadata-ui.playground.advanced.workflow.section.publish",
            title: "Publish",
            fields: [
              createTextField({
                key: "metadata-ui.playground.advanced.workflow.field.publish-state",
                name: "publishState",
                label: "Publish state",
                defaultValue: "Blocked until static validation resolves",
                readonly: true,
              }),
            ],
          }),
        ],
        navigationAction: advancedWorkflowStepAction,
      }),
    ],
    diagnostics: {
      testId: "metadata-ui-playground-advanced-workflow-multi-step",
    },
  });
}

export function createMetadataUiAdvancedWorkflowScorecardForm() {
  return createScorecardForm({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedWorkflowScorecardMetadata,
    title: "Advanced workflow scorecard",
    description:
      "Static scorecard for workflow readiness, validation, and blocked states.",
    state: "invalid",
    criteria: [
      createScorecardCriterion({
        key: "metadata-ui.playground.advanced.workflow.scorecard.criterion.prepared",
        label: "Preparation complete",
        description: "Completed advanced workflow preparation criterion.",
        required: true,
        readonly: true,
        selectedValue: "met",
        options: createScoreOptions(),
      }),
      createScorecardCriterion({
        key: "metadata-ui.playground.advanced.workflow.scorecard.criterion.review",
        label: "Review evidence",
        description: "Static review evidence requires a reason.",
        required: true,
        selectedValue: "review",
        reason: "Static review evidence remains under inspection.",
        requireReasonWhenSelected: ["review"],
        options: createScoreOptions(),
      }),
      createScorecardCriterion({
        key: "metadata-ui.playground.advanced.workflow.scorecard.criterion.publish",
        label: "Publish readiness",
        description: "Blocked publish criterion without capability reads.",
        required: false,
        blockedReason:
          "Blocked by deterministic advanced workflow fixture metadata.",
        options: createScoreOptions(),
      }),
    ],
    errorSummary: {
      title: "Advanced workflow scorecard review",
      errors: [
        {
          fieldKey:
            "metadata-ui.playground.advanced.workflow.scorecard.criterion.review",
          message: "Review evidence remains in static review.",
          severity: "warning",
        },
      ],
    },
    diagnostics: {
      testId: "metadata-ui-playground-advanced-workflow-scorecard",
    },
  });
}
