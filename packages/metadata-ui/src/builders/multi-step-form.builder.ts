import {
  METADATA_UI_MULTI_STEP_FORM_SCHEMA,
  METADATA_UI_MULTI_STEP_FORM_STEP_SCHEMA,
  parseMetadataUiMultiStepForm,
  type MetadataUiMultiStepForm,
  type MetadataUiMultiStepFormInput,
  type MetadataUiMultiStepFormStep,
  type MetadataUiMultiStepFormStepInput,
} from "../schemas/multi-step-form.schema";

type MetadataUiMultiStepFormSystemFields =
  | "schemaId"
  | "schemaVersion"
  | "stability";

export type MultiStepFormBuilderInput = Omit<
  MetadataUiMultiStepFormInput,
  MetadataUiMultiStepFormSystemFields
>;

export function createMultiStepForm<const Input extends MultiStepFormBuilderInput>(
  input: Input,
): MetadataUiMultiStepForm & { key: Input["key"] } {
  return parseMetadataUiMultiStepForm(input) as MetadataUiMultiStepForm & {
    key: Input["key"];
  };
}

export function createMultiStepFormStep<
  const Input extends MetadataUiMultiStepFormStepInput,
>(input: Input): MetadataUiMultiStepFormStep & { key: Input["key"] } {
  return METADATA_UI_MULTI_STEP_FORM_STEP_SCHEMA.parse(
    input,
  ) as MetadataUiMultiStepFormStep & { key: Input["key"] };
}

export function withMultiStepFormActiveStep(
  form: MetadataUiMultiStepFormInput,
  activeStepKey: string,
): MetadataUiMultiStepForm {
  return createMultiStepForm({
    ...form,
    activeStepKey,
  });
}

export function appendMultiStepFormStep(
  form: MetadataUiMultiStepFormInput,
  step: MetadataUiMultiStepFormStepInput,
): MetadataUiMultiStepForm {
  return createMultiStepForm({
    ...form,
    steps: [...form.steps, step],
  });
}

export function safeCreateMultiStepForm(input: unknown) {
  const result = METADATA_UI_MULTI_STEP_FORM_SCHEMA.safeParse(input);

  if (!result.success) {
    return result;
  }

  return {
    success: true as const,
    data: parseMetadataUiMultiStepForm(result.data),
  };
}
