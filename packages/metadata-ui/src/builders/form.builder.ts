import { z } from "zod";

import {
  METADATA_UI_FORM_ACTION_SCHEMA,
  METADATA_UI_FORM_FIELD_SCHEMA,
  METADATA_UI_FORM_SCHEMA,
  METADATA_UI_FORM_SECTION_SCHEMA,
  parseMetadataUiForm,
  type MetadataUiForm,
  type MetadataUiFormAction,
  type MetadataUiFormActionForPlacement,
  type MetadataUiFormActionInput,
  type MetadataUiFormActionPlacement,
  type MetadataUiFormField,
  type MetadataUiFormFieldForKind,
  type MetadataUiFormFieldInput,
  type MetadataUiFormFieldKind,
  type MetadataUiFormFieldStateInput,
  type MetadataUiFormFileUploadInput,
  type MetadataUiFormForLayout,
  type MetadataUiFormForMode,
  type MetadataUiFormInput,
  type MetadataUiFormLayout,
  type MetadataUiFormMode,
  type MetadataUiFormSection,
  type MetadataUiFormSectionInput,
} from "../schemas/form.schema";

type MetadataUiFormSystemFields = "schemaId" | "schemaVersion" | "stability";

export type FormBuilderInput = Omit<
  MetadataUiFormInput,
  MetadataUiFormSystemFields
>;

export type MetadataUiFormBuilderResult<Input extends FormBuilderInput> =
  MetadataUiForm &
    (Input extends { mode?: infer Mode extends MetadataUiFormMode }
      ? { mode: Mode }
      : object) &
    (Input extends { layout?: infer Layout extends MetadataUiFormLayout }
      ? { layout: Layout }
      : object);

export type MetadataUiFormFieldBuilderResult<
  Input extends MetadataUiFormFieldInput,
> = Input extends { kind: infer Kind extends MetadataUiFormFieldKind }
  ? MetadataUiFormFieldForKind<Kind>
  : MetadataUiFormField;

export type MetadataUiFormActionBuilderResult<
  Input extends MetadataUiFormActionInput,
> = Input extends {
  placement?: infer Placement extends MetadataUiFormActionPlacement;
}
  ? MetadataUiFormActionForPlacement<Placement>
  : MetadataUiFormAction;

export type MetadataUiFormSectionBuilderResult<
  Input extends MetadataUiFormSectionInput,
> = MetadataUiFormSection & {
  key: Input["key"];
  fields: Input["fields"];
};

export type MetadataUiFormBasicInput<
  Key extends string = string,
  Sections extends readonly MetadataUiFormSectionInput[] = MetadataUiFormSectionInput[],
> = {
  key: Key;
  title?: string;
  description?: string;
  sections: Sections;
};

export type MetadataUiFormFieldBasicInput<
  Key extends string = string,
  Name extends string = string,
  Label extends string = string,
> = {
  key: Key;
  name: Name;
  label: Label;
  description?: string;
  placeholder?: string;
  defaultValue?: unknown;
};

export type MetadataUiFormChoiceFieldInput<
  Key extends string = string,
  Name extends string = string,
  Label extends string = string,
> = MetadataUiFormFieldBasicInput<Key, Name, Label> & {
  options: NonNullable<MetadataUiFormFieldInput["options"]>;
};

export type MetadataUiFormSectionBasicInput<
  Key extends string = string,
  Fields extends readonly MetadataUiFormFieldInput[] = MetadataUiFormFieldInput[],
> = {
  key: Key;
  title?: string;
  description?: string;
  fields: Fields;
};

export type MetadataUiFormSafeCreateResult<
  Data extends MetadataUiForm = MetadataUiForm,
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

function normalizeFormFieldOptionInput(
  option: NonNullable<MetadataUiFormFieldInput["options"]>[number],
): NonNullable<MetadataUiFormFieldInput["options"]>[number] {
  return {
    ...option,
    label: option.label.trim(),
    description: option.description?.trim(),
  };
}

function normalizeFormFieldInput(
  input: MetadataUiFormFieldInput,
): MetadataUiFormFieldInput {
  return {
    ...input,
    key: input.key.trim(),
    name: input.name.trim(),
    label: input.label.trim(),
    description: input.description?.trim(),
    placeholder: input.placeholder?.trim(),
    options: (input.options ?? []).map((option) =>
      normalizeFormFieldOptionInput(option),
    ),
    validation: input.validation
      ? {
          ...input.validation,
          message: input.validation.message?.trim(),
        }
      : input.validation,
    state: input.state
      ? {
          ...input.state,
          reason: input.state.reason?.trim(),
          errors: (input.state.errors ?? []).map((error) => ({
            ...error,
            message: error.message.trim(),
          })),
        }
      : input.state,
    disabled: input.disabled
      ? {
          ...input.disabled,
          reason: input.disabled.reason?.trim(),
        }
      : input.disabled,
    dependencies: (input.dependencies ?? []).map((dependency) => ({
      ...dependency,
      sourceField: dependency.sourceField.trim(),
      reason: dependency.reason?.trim(),
    })),
    fileUpload: input.fileUpload
      ? {
          ...input.fileUpload,
          hostUploadKey: input.fileUpload.hostUploadKey.trim(),
          description: input.fileUpload.description?.trim(),
          blockedReason: input.fileUpload.blockedReason?.trim(),
          existingFiles: (input.fileUpload.existingFiles ?? []).map((file) => ({
            ...file,
            key: file.key.trim(),
            fileName: file.fileName.trim(),
          })),
        }
      : input.fileUpload,
    diagnostics: input.diagnostics
      ? {
          ...input.diagnostics,
          testId: input.diagnostics.testId?.trim(),
          telemetryKey: input.diagnostics.telemetryKey?.trim(),
        }
      : input.diagnostics,
  };
}

function normalizeFormSectionInput(
  input: MetadataUiFormSectionInput,
): MetadataUiFormSectionInput {
  return {
    ...input,
    key: input.key.trim(),
    title: input.title?.trim(),
    description: input.description?.trim(),
    fields: input.fields.map((field) => normalizeFormFieldInput(field)),
  };
}

function normalizeFormInput(input: FormBuilderInput): FormBuilderInput {
  const errorSummaryTitle = input.errorSummary?.title ?? "Review fields";
  const errorSummaryErrors = input.errorSummary?.errors ?? [];

  return {
    ...input,
    key: input.key.trim(),
    title: input.title?.trim(),
    description: input.description?.trim(),
    sections: input.sections.map((section) => normalizeFormSectionInput(section)),
    errorSummary: {
      title: errorSummaryTitle.trim(),
      errors: errorSummaryErrors.map((error) => ({
        ...error,
        fieldKey: error.fieldKey.trim(),
        message: error.message.trim(),
      })),
    },
    diagnostics: input.diagnostics
      ? {
          ...input.diagnostics,
          componentKey: input.diagnostics.componentKey?.trim(),
          sectionKey: input.diagnostics.sectionKey?.trim(),
          rendererKey: input.diagnostics.rendererKey?.trim(),
          testId: input.diagnostics.testId?.trim(),
        }
      : input.diagnostics,
  };
}

export function createForm<const Input extends FormBuilderInput>(
  input: Input,
): MetadataUiFormBuilderResult<Input> {
  return parseMetadataUiForm(
    normalizeFormInput(input),
  ) as MetadataUiFormBuilderResult<Input>;
}

export function createFormForMode<const Mode extends MetadataUiFormMode>(
  input: Omit<FormBuilderInput, "mode">,
  mode: Mode,
): MetadataUiFormForMode<Mode> {
  return createForm({
    ...input,
    mode,
  });
}

export function createFormForLayout<const Layout extends MetadataUiFormLayout>(
  input: Omit<FormBuilderInput, "layout">,
  layout: Layout,
): MetadataUiFormForLayout<Layout> {
  return createForm({
    ...input,
    layout,
  });
}

export function createSectionedForm<
  const Input extends MetadataUiFormBasicInput,
>(input: Input): MetadataUiFormForLayout<"sectioned"> {
  return createForm({
    key: input.key,
    title: input.title,
    description: input.description,
    mode: "view",
    layout: "sectioned",
    sections: input.sections,
    actions: [],
  });
}

export function createFormField<const Input extends MetadataUiFormFieldInput>(
  input: Input,
): MetadataUiFormFieldBuilderResult<Input> {
  return METADATA_UI_FORM_FIELD_SCHEMA.parse(
    normalizeFormFieldInput(input),
  ) as MetadataUiFormFieldBuilderResult<Input>;
}

export function createTextField<
  const Input extends MetadataUiFormFieldBasicInput,
>(input: Input): MetadataUiFormFieldForKind<"text"> {
  return createFormField({
    ...input,
    kind: "text",
    options: [],
    readonly: false,
    hidden: false,
  });
}

export function createTextareaField<
  const Input extends MetadataUiFormFieldBasicInput,
>(input: Input): MetadataUiFormFieldForKind<"textarea"> {
  return createFormField({
    ...input,
    kind: "textarea",
    options: [],
    readonly: false,
    hidden: false,
  });
}

export function createNumberField<
  const Input extends MetadataUiFormFieldBasicInput,
>(input: Input): MetadataUiFormFieldForKind<"number"> {
  return createFormField({
    ...input,
    kind: "number",
    options: [],
    readonly: false,
    hidden: false,
  });
}

export function createBooleanField<
  const Input extends MetadataUiFormFieldBasicInput,
>(input: Input): MetadataUiFormFieldForKind<"boolean"> {
  return createFormField({
    ...input,
    kind: "boolean",
    options: [],
    readonly: false,
    hidden: false,
  });
}

export function createFileField<
  const Input extends MetadataUiFormFieldBasicInput & {
    fileUpload: MetadataUiFormFileUploadInput;
  },
>(input: Input): MetadataUiFormFieldForKind<"file"> {
  return createFormField({
    ...input,
    kind: "file",
    options: [],
    readonly: false,
    hidden: false,
  });
}

export function createSelectField<
  const Input extends MetadataUiFormChoiceFieldInput,
>(input: Input): MetadataUiFormFieldForKind<"select"> {
  return createFormField({
    ...input,
    kind: "select",
    readonly: false,
    hidden: false,
  });
}

export function createMultiSelectField<
  const Input extends MetadataUiFormChoiceFieldInput,
>(input: Input): MetadataUiFormFieldForKind<"multi-select"> {
  return createFormField({
    ...input,
    kind: "multi-select",
    readonly: false,
    hidden: false,
  });
}

export function createHiddenField<
  const Input extends Omit<MetadataUiFormFieldBasicInput, "label"> & {
    label?: string;
  },
>(input: Input): MetadataUiFormFieldForKind<"hidden"> {
  return createFormField({
    key: input.key,
    name: input.name,
    label: input.label ?? input.name,
    description: input.description,
    defaultValue: input.defaultValue,
    kind: "hidden",
    options: [],
    readonly: true,
    hidden: true,
  });
}

export function createFormSection<
  const Input extends MetadataUiFormSectionInput,
>(input: Input): MetadataUiFormSectionBuilderResult<Input> {
  return METADATA_UI_FORM_SECTION_SCHEMA.parse(
    normalizeFormSectionInput(input),
  ) as MetadataUiFormSectionBuilderResult<Input>;
}

export function createBasicFormSection<
  const Input extends MetadataUiFormSectionBasicInput,
>(input: Input): MetadataUiFormSectionBuilderResult<Input> {
  return createFormSection({
    key: input.key,
    title: input.title,
    description: input.description,
    fields: input.fields,
    collapsible: false,
    defaultCollapsed: false,
  });
}

export function createFormAction<const Input extends MetadataUiFormActionInput>(
  input: Input,
): MetadataUiFormActionBuilderResult<Input> {
  return METADATA_UI_FORM_ACTION_SCHEMA.parse(
    input,
  ) as MetadataUiFormActionBuilderResult<Input>;
}

export function withFormSections(
  form: MetadataUiFormInput,
  sections: MetadataUiFormSectionInput[],
): MetadataUiForm {
  return createForm({
    ...form,
    sections,
  });
}

export function appendFormSection(
  form: MetadataUiFormInput,
  section: MetadataUiFormSectionInput,
): MetadataUiForm {
  return createForm({
    ...form,
    sections: [...form.sections, section],
  });
}

export function withFormActions(
  form: MetadataUiFormInput,
  actions: MetadataUiFormActionInput[],
): MetadataUiForm {
  return createForm({
    ...form,
    actions,
  });
}

export function withFormState(
  form: MetadataUiFormInput,
  state: NonNullable<MetadataUiFormInput["state"]>,
): MetadataUiForm {
  return createForm({
    ...form,
    state,
  });
}

export function withFormErrorSummary(
  form: MetadataUiFormInput,
  errorSummary: NonNullable<MetadataUiFormInput["errorSummary"]>,
): MetadataUiForm {
  return createForm({
    ...form,
    errorSummary,
  });
}

export function withFormFieldState(
  field: MetadataUiFormFieldInput,
  state: MetadataUiFormFieldStateInput,
): MetadataUiFormField {
  return createFormField({
    ...field,
    state,
  });
}

export function withFormFieldDisabled(
  field: MetadataUiFormFieldInput,
  disabled: NonNullable<MetadataUiFormFieldInput["disabled"]>,
): MetadataUiFormField {
  return createFormField({
    ...field,
    disabled,
  });
}

export function withFormFieldDependencies(
  field: MetadataUiFormFieldInput,
  dependencies: NonNullable<MetadataUiFormFieldInput["dependencies"]>,
): MetadataUiFormField {
  return createFormField({
    ...field,
    dependencies,
  });
}

export function appendFormAction(
  form: MetadataUiFormInput,
  action: MetadataUiFormActionInput,
): MetadataUiForm {
  return createForm({
    ...form,
    actions: [...(form.actions ?? []), action],
  });
}

export function safeCreateForm(input: unknown): MetadataUiFormSafeCreateResult {
  const result = METADATA_UI_FORM_SCHEMA.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true as const,
    data: parseMetadataUiForm(result.data),
  };
}
