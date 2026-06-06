import { z } from "zod";

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

export type MetadataUiMultiStepFormBuilderResult<
  Input extends MultiStepFormBuilderInput,
> = MetadataUiMultiStepForm & {
  key: Input["key"];
  activeStepKey?: Input["activeStepKey"];
};

export type MetadataUiMultiStepFormBasicInput<
  Key extends string = string,
  Steps extends readonly MetadataUiMultiStepFormStepInput[] = MetadataUiMultiStepFormStepInput[],
> = Omit<MultiStepFormBuilderInput, "activeStepKey" | "key" | "steps"> & {
  key: Key;
  steps: Steps;
  activeStepKey?: Steps[number]["key"];
};

export type MetadataUiMultiStepFormSafeCreateResult<
  Data extends MetadataUiMultiStepForm = MetadataUiMultiStepForm,
> =
  | {
      success: true;
      data: Data;
      error?: never;
    }
  | {
      success: false;
      data?: never;
      error: z.ZodError;
    };

export function createMultiStepForm<const Input extends MultiStepFormBuilderInput>(
  input: Input,
): MetadataUiMultiStepFormBuilderResult<Input> {
  return parseMetadataUiMultiStepForm(input) as MetadataUiMultiStepForm & {
    key: Input["key"];
  } & MetadataUiMultiStepFormBuilderResult<Input>;
}

export function createMultiStepFormStep<
  const Input extends MetadataUiMultiStepFormStepInput,
>(input: Input): MetadataUiMultiStepFormStep & { key: Input["key"] } {
  return METADATA_UI_MULTI_STEP_FORM_STEP_SCHEMA.parse(
    input,
  ) as MetadataUiMultiStepFormStep & { key: Input["key"] };
}

export function withMultiStepFormActiveStep<
  const Input extends MetadataUiMultiStepFormBasicInput,
>(
  form: Input,
  activeStepKey: NonNullable<Input["activeStepKey"]>,
): MetadataUiMultiStepFormBuilderResult<Input> {
  return createMultiStepForm({
    ...form,
    activeStepKey,
  }) as MetadataUiMultiStepFormBuilderResult<Input>;
}

export function appendMultiStepFormStep<
  const Input extends MultiStepFormBuilderInput,
>(
  form: Input,
  step: MetadataUiMultiStepFormStepInput,
): MetadataUiMultiStepFormBuilderResult<Input> {
  return createMultiStepForm({
    ...form,
    steps: [...form.steps, step],
  }) as MetadataUiMultiStepFormBuilderResult<Input>;
}

export function safeCreateMultiStepForm(
  input: unknown,
): MetadataUiMultiStepFormSafeCreateResult {
  const result = METADATA_UI_MULTI_STEP_FORM_SCHEMA.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true as const,
    data: parseMetadataUiMultiStepForm(result.data),
  };
}
