import {
  createBasicFormSection,
  createForm,
  createFormField,
  createSelectField,
  createTextareaField,
  createTextField,
  withFormFieldState,
} from "@afenda/metadata-ui";

import { METADATA_UI_PLAYGROUND_FIXTURE_IDS } from "./constants.fixture";
import { METADATA_UI_PLAYGROUND_SAMPLE_LABELS } from "./sample-vocabulary.fixture";

const reviewStatusOptions = [
  {
    value: "ready",
    label: "Ready",
    description: "The sample record is ready for visual review.",
  },
  {
    value: "review",
    label: "Review",
    description: "The sample record needs static review notes.",
  },
  {
    value: "paused",
    label: "Paused",
    description: "The sample record is intentionally paused.",
  },
];

export function createMetadataUiPlaygroundForm() {
  const recordField = createFormField({
    ...createTextField({
      key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.formFieldRecord,
      name: "recordLabel",
      label: "Record label",
      description: "Read-only sample identifier for renderer review.",
      defaultValue: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleRecord} 009`,
    }),
    readonly: true,
    state: {
      value: "readonly",
      reason: "Static playground forms do not accept ERP edits.",
      errors: [],
    },
    validation: {
      required: true,
      message: "Record label is required in production metadata.",
    },
    diagnostics: {
      testId: "metadata-ui-playground-form-record",
    },
  });

  const locationField = createFormField({
    ...createTextField({
      key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.formFieldLocation,
      name: "locationLabel",
      label: "Location",
      description: "Neutral fixture location label.",
      defaultValue: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleLocation} I`,
    }),
    readonly: true,
    state: {
      value: "readonly",
      reason: "Static fixture value.",
      errors: [],
    },
    diagnostics: {
      testId: "metadata-ui-playground-form-location",
    },
  });

  const statusField = withFormFieldState(
    createSelectField({
      key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.formFieldStatus,
      name: "statusLabel",
      label: "Review status",
      description: "Static validation state for renderer inspection.",
      defaultValue: "review",
      options: reviewStatusOptions,
      placeholder: "Select status",
      validation: {
        required: true,
        message: "Choose a review status before submitting.",
      },
      diagnostics: {
        testId: "metadata-ui-playground-form-status",
      },
    }),
    {
      value: "invalid",
      reason: "Static validation display only.",
      errors: [
        {
          message: "Sample status requires a review note.",
          severity: "warning",
        },
      ],
    },
  );

  const notesField = withFormFieldState(
    createTextareaField({
      key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.formFieldNotes,
      name: "reviewNotes",
      label: "Review notes",
      description: "Static validation-display fixture.",
      placeholder: "Add sample review notes",
      defaultValue: "",
      validation: {
        required: true,
        minLength: 12,
        message: "Review notes must describe the static sample outcome.",
      },
      diagnostics: {
        testId: "metadata-ui-playground-form-notes",
      },
    }),
    {
      value: "invalid",
      reason: "Static error fixture; no submit handler is attached.",
      errors: [
        {
          message: "Sample review notes are required.",
          severity: "error",
        },
      ],
    },
  );

  return createForm({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.formMetadata,
    title: "Form preview",
    description:
      "Read-only and validation-display fields rendered without mutation handlers.",
    mode: "review",
    layout: "sectioned",
    state: "invalid",
    errorSummary: {
      title: "Form preview: review sample fields",
      errors: [
        {
          fieldKey: METADATA_UI_PLAYGROUND_FIXTURE_IDS.formFieldStatus,
          message: "Sample status requires a review note.",
          severity: "warning",
        },
        {
          fieldKey: METADATA_UI_PLAYGROUND_FIXTURE_IDS.formFieldNotes,
          message: "Sample review notes are required.",
          severity: "error",
        },
      ],
    },
    sections: [
      createBasicFormSection({
        key: "metadata-ui.playground.form.section.identity",
        title: "Form preview",
        description: "Read-only fixture values.",
        fields: [recordField, locationField],
      }),
      createBasicFormSection({
        key: "metadata-ui.playground.form.section.validation",
        title: "Validation display",
        description: "Static field errors without submit behavior.",
        fields: [statusField, notesField],
      }),
    ],
    actions: [],
    diagnostics: {
      testId: "metadata-ui-playground-form",
    },
  });
}
