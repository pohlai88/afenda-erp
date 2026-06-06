import { z } from "zod";

import { metadataUiActionContractSchema } from "../contracts/action.contract";
import type { MetadataUiActionContract } from "../contracts/action.contract";
import { metadataUiPermissionContractSchema } from "../contracts/permission.contract";
import type { MetadataUiPermissionContract } from "../contracts/permission.contract";
import { metadataUiPresentationContractSchema } from "../contracts/presentation.contract";
import type { MetadataUiPresentationContract } from "../contracts/presentation.contract";

export const METADATA_UI_FORM_SCHEMA_ID = "metadata-ui.schema.form" as const;
export const METADATA_UI_FORM_SCHEMA_VERSION = 1 as const;

export type MetadataUiFormSchemaStability = "beta";

export const METADATA_UI_FORM_SCHEMA_STABILITY: MetadataUiFormSchemaStability =
  "beta";

const METADATA_UI_FORM_FIELD_KIND_VALUES = [
  "text",
  "textarea",
  "number",
  "currency",
  "percentage",
  "date",
  "datetime",
  "boolean",
  "select",
  "multi-select",
  "radio",
  "checkbox-group",
  "file",
  "hidden",
  "custom",
] as const;

const METADATA_UI_FORM_ACTION_PLACEMENT_VALUES = [
  "primary",
  "secondary",
  "overflow",
] as const;

const METADATA_UI_FORM_MODE_VALUES = [
  "create",
  "edit",
  "view",
  "review",
] as const;

const METADATA_UI_FORM_LAYOUT_VALUES = [
  "single-column",
  "two-column",
  "sectioned",
  "wizard",
] as const;

const METADATA_UI_FORM_STATE_VALUES = [
  "clean",
  "dirty",
  "readonly",
  "review",
  "pending",
  "blocked",
  "invalid",
] as const;

const METADATA_UI_FORM_DEPENDENCY_EFFECT_VALUES = [
  "show",
  "hide",
  "enable",
  "disable",
] as const;

const METADATA_UI_FORM_DEPENDENCY_CONDITION_VALUES = [
  "provided",
  "equals",
  "not-equals",
] as const;

export const METADATA_UI_FORM_KEY_SCHEMA = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .regex(
    /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/,
    "Form keys must use lowercase kebab/dot notation.",
  );

export const METADATA_UI_FORM_FIELD_KIND_SCHEMA = z.enum(
  METADATA_UI_FORM_FIELD_KIND_VALUES,
);

export const METADATA_UI_FORM_STATE_SCHEMA = z.enum(
  METADATA_UI_FORM_STATE_VALUES,
);

export const METADATA_UI_FORM_DEPENDENCY_EFFECT_SCHEMA = z.enum(
  METADATA_UI_FORM_DEPENDENCY_EFFECT_VALUES,
);

export const METADATA_UI_FORM_DEPENDENCY_CONDITION_SCHEMA = z.enum(
  METADATA_UI_FORM_DEPENDENCY_CONDITION_VALUES,
);

export const METADATA_UI_FORM_FIELD_OPTION_SCHEMA = z.object({
  value: z.union([z.string(), z.number(), z.boolean()]),
  label: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(240).optional(),
  disabled: z.boolean().default(false),
});

export const METADATA_UI_FORM_FIELD_VALIDATION_SCHEMA = z.object({
  required: z.boolean().default(false),
  minLength: z.number().int().min(0).max(10000).optional(),
  maxLength: z.number().int().min(1).max(10000).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().trim().min(1).max(500).optional(),
  message: z.string().trim().min(1).max(240).optional(),
});

export const METADATA_UI_FORM_FIELD_ERROR_SCHEMA = z
  .object({
    message: z.string().trim().min(1).max(240),
    severity: z.enum(["info", "warning", "error"]).default("error"),
  })
  .strict();

export const METADATA_UI_FORM_FIELD_STATE_SCHEMA = z
  .object({
    value: METADATA_UI_FORM_STATE_SCHEMA.default("clean"),
    reason: z.string().trim().min(1).max(240).optional(),
    errors: z.array(METADATA_UI_FORM_FIELD_ERROR_SCHEMA).max(12).default([]),
  })
  .strict()
  .superRefine((state, ctx) => {
    if (state.value === "blocked" && !state.reason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reason"],
        message: "Blocked form fields must provide a reason.",
      });
    }

    if (state.value === "invalid" && state.errors.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["errors"],
        message: "Invalid form fields must provide at least one error.",
      });
    }
  });

export const METADATA_UI_FORM_FIELD_DEPENDENCY_SCHEMA = z
  .object({
    sourceField: z.string().trim().min(1).max(160),
    condition: METADATA_UI_FORM_DEPENDENCY_CONDITION_SCHEMA,
    value: z.union([z.string(), z.number(), z.boolean()]).optional(),
    effect: METADATA_UI_FORM_DEPENDENCY_EFFECT_SCHEMA,
    reason: z.string().trim().min(1).max(240).optional(),
  })
  .strict();

export const METADATA_UI_FORM_FILE_UPLOAD_SCHEMA = z
  .object({
    hostUploadKey: z.string().trim().min(1).max(160),
    accept: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
    maxSizeBytes: z.number().int().positive().max(1024 * 1024 * 1024).optional(),
    multiple: z.boolean().default(false),
    description: z.string().trim().min(1).max(240).optional(),
    status: z
      .enum(["empty", "selected", "uploading", "uploaded", "failed", "blocked"])
      .default("empty"),
    existingFiles: z
      .array(
        z
          .object({
            key: z.string().trim().min(1).max(160),
            fileName: z.string().trim().min(1).max(240),
            sizeBytes: z.number().int().positive().optional(),
            downloadAction: metadataUiActionContractSchema.optional(),
            removeAction: metadataUiActionContractSchema.optional(),
          })
          .strict(),
      )
      .max(20)
      .default([]),
    uploadAction: metadataUiActionContractSchema.optional(),
    blockedReason: z.string().trim().min(1).max(240).optional(),
  })
  .strict()
  .superRefine((upload, ctx) => {
    if (
      (upload.status === "blocked" || upload.status === "failed") &&
      !upload.blockedReason
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["blockedReason"],
        message:
          "Blocked and failed upload descriptors must provide blockedReason.",
      });
    }
  });

export const METADATA_UI_FORM_FIELD_SCHEMA = z.object({
  key: METADATA_UI_FORM_KEY_SCHEMA,

  name: z.string().trim().min(1).max(160),

  label: z.string().trim().min(1).max(160),

  description: z.string().trim().min(1).max(320).optional(),

  kind: METADATA_UI_FORM_FIELD_KIND_SCHEMA,

  placeholder: z.string().trim().min(1).max(160).optional(),

  defaultValue: z.unknown().optional(),

  options: z.array(METADATA_UI_FORM_FIELD_OPTION_SCHEMA).max(200).default([]),

  validation: METADATA_UI_FORM_FIELD_VALIDATION_SCHEMA.optional(),

  state: METADATA_UI_FORM_FIELD_STATE_SCHEMA.default({
    value: "clean",
    errors: [],
  }),

  readonly: z.boolean().default(false),

  disabled: z
    .object({
      value: z.boolean(),
      reason: z.string().trim().min(1).max(240).optional(),
    })
    .optional(),

  dependencies: z
    .array(METADATA_UI_FORM_FIELD_DEPENDENCY_SCHEMA)
    .max(12)
    .default([]),

  fileUpload: METADATA_UI_FORM_FILE_UPLOAD_SCHEMA.optional(),

  hidden: z.boolean().default(false),

  permission: metadataUiPermissionContractSchema.optional(),

  diagnostics: z
    .object({
      testId: z.string().trim().min(1).max(160).optional(),
      telemetryKey: z.string().trim().min(1).max(160).optional(),
    })
    .optional(),
})
  .strict()
  .superRefine((field, ctx) => {
    if (field.disabled?.value && !field.disabled.reason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["disabled", "reason"],
        message: "Disabled form fields must provide a reason.",
      });
    }

    if (field.kind === "file" && !field.fileUpload) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fileUpload"],
        message: "File fields must declare a host upload descriptor.",
      });
    }

    if (field.kind !== "file" && field.fileUpload) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fileUpload"],
        message: "Only file fields may declare a host upload descriptor.",
      });
    }
  });

export const METADATA_UI_FORM_SECTION_SCHEMA = z.object({
  key: METADATA_UI_FORM_KEY_SCHEMA,

  title: z.string().trim().min(1).max(120).optional(),

  description: z.string().trim().min(1).max(320).optional(),

  fields: z.array(METADATA_UI_FORM_FIELD_SCHEMA).min(1).max(80),

  collapsible: z.boolean().default(false),

  defaultCollapsed: z.boolean().default(false),

  permission: metadataUiPermissionContractSchema.optional(),
});

export const METADATA_UI_FORM_ACTION_SCHEMA = z.object({
  action: metadataUiActionContractSchema,

  placement: z.enum(METADATA_UI_FORM_ACTION_PLACEMENT_VALUES).default("secondary"),

  permission: metadataUiPermissionContractSchema.optional(),
});

export const METADATA_UI_FORM_MODE_SCHEMA = z.enum(METADATA_UI_FORM_MODE_VALUES);

export const METADATA_UI_FORM_LAYOUT_SCHEMA = z.enum(
  METADATA_UI_FORM_LAYOUT_VALUES,
);

export const METADATA_UI_FORM_ERROR_SUMMARY_SCHEMA = z
  .object({
    title: z.string().trim().min(1).max(120).default("Review fields"),
    errors: z
      .array(
        z
          .object({
            fieldKey: METADATA_UI_FORM_KEY_SCHEMA,
            message: z.string().trim().min(1).max(240),
            severity: z.enum(["info", "warning", "error"]).default("error"),
          })
          .strict(),
      )
      .max(48)
      .default([]),
  })
  .strict();

export const METADATA_UI_FORM_SCHEMA = z.object({
  schemaId: z.literal(METADATA_UI_FORM_SCHEMA_ID).default(
    METADATA_UI_FORM_SCHEMA_ID,
  ),

  schemaVersion: z.literal(METADATA_UI_FORM_SCHEMA_VERSION).default(
    METADATA_UI_FORM_SCHEMA_VERSION,
  ),

  stability: z
    .literal(METADATA_UI_FORM_SCHEMA_STABILITY)
    .default(METADATA_UI_FORM_SCHEMA_STABILITY),

  key: METADATA_UI_FORM_KEY_SCHEMA,

  title: z.string().trim().min(1).max(120).optional(),

  description: z.string().trim().min(1).max(320).optional(),

  mode: METADATA_UI_FORM_MODE_SCHEMA.default("view"),

  layout: METADATA_UI_FORM_LAYOUT_SCHEMA.default("sectioned"),

  state: METADATA_UI_FORM_STATE_SCHEMA.default("clean"),

  errorSummary: METADATA_UI_FORM_ERROR_SUMMARY_SCHEMA.default({
    title: "Review fields",
    errors: [],
  }),

  submitAction: metadataUiActionContractSchema.optional(),

  sections: z.array(METADATA_UI_FORM_SECTION_SCHEMA).min(1).max(24),

  actions: z.array(METADATA_UI_FORM_ACTION_SCHEMA).max(12).default([]),

  presentation: metadataUiPresentationContractSchema.optional(),

  permission: metadataUiPermissionContractSchema.optional(),

  diagnostics: z
    .object({
      componentKey: z.string().trim().min(1).max(160).optional(),
      sectionKey: z.string().trim().min(1).max(160).optional(),
      rendererKey: z.string().trim().min(1).max(160).optional(),
      testId: z.string().trim().min(1).max(160).optional(),
    })
    .optional(),
})
  .strict()
  .superRefine((form, ctx) => {
    if (form.state === "invalid" && form.errorSummary.errors.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["errorSummary", "errors"],
        message: "Invalid forms must provide error summary metadata.",
      });
    }
  });

type MetadataUiFormSchemaOutput = z.output<typeof METADATA_UI_FORM_SCHEMA>;

type MetadataUiFormSectionSchemaOutput = z.output<
  typeof METADATA_UI_FORM_SECTION_SCHEMA
>;

type MetadataUiFormFieldSchemaOutput = z.output<
  typeof METADATA_UI_FORM_FIELD_SCHEMA
>;

type MetadataUiFormFieldOptionSchemaOutput = z.output<
  typeof METADATA_UI_FORM_FIELD_OPTION_SCHEMA
>;

type MetadataUiFormFieldValidationSchemaOutput = z.output<
  typeof METADATA_UI_FORM_FIELD_VALIDATION_SCHEMA
>;

type MetadataUiFormFieldStateSchemaOutput = z.output<
  typeof METADATA_UI_FORM_FIELD_STATE_SCHEMA
>;

type MetadataUiFormFileUploadSchemaOutput = z.output<
  typeof METADATA_UI_FORM_FILE_UPLOAD_SCHEMA
>;

type MetadataUiFormActionSchemaOutput = z.output<
  typeof METADATA_UI_FORM_ACTION_SCHEMA
>;

type MetadataUiFormDiagnosticsSchemaOutput = NonNullable<
  MetadataUiFormSchemaOutput["diagnostics"]
>;

export type MetadataUiFormInput = z.input<typeof METADATA_UI_FORM_SCHEMA>;

export type MetadataUiFormSectionInput = z.input<
  typeof METADATA_UI_FORM_SECTION_SCHEMA
>;

export type MetadataUiFormFieldInput = z.input<
  typeof METADATA_UI_FORM_FIELD_SCHEMA
>;

export type MetadataUiFormActionInput = z.input<
  typeof METADATA_UI_FORM_ACTION_SCHEMA
>;

export type MetadataUiFormFieldStateInput = z.input<
  typeof METADATA_UI_FORM_FIELD_STATE_SCHEMA
>;

export type MetadataUiFormFileUploadInput = z.input<
  typeof METADATA_UI_FORM_FILE_UPLOAD_SCHEMA
>;

export type MetadataUiFormMode =
  (typeof METADATA_UI_FORM_MODE_VALUES)[number];

export type MetadataUiFormLayout =
  (typeof METADATA_UI_FORM_LAYOUT_VALUES)[number];

export type MetadataUiFormFieldKind =
  (typeof METADATA_UI_FORM_FIELD_KIND_VALUES)[number];

export type MetadataUiFormState =
  (typeof METADATA_UI_FORM_STATE_VALUES)[number];

export type MetadataUiFormActionPlacement =
  (typeof METADATA_UI_FORM_ACTION_PLACEMENT_VALUES)[number];

declare const metadataUiFormKeyBrand: unique symbol;
declare const metadataUiFormFieldNameBrand: unique symbol;
declare const metadataUiFormDiagnosticKeyBrand: unique symbol;
declare const metadataUiFormBoundedSectionsBrand: unique symbol;
declare const metadataUiFormBoundedActionsBrand: unique symbol;
declare const metadataUiFormBoundedFieldsBrand: unique symbol;
declare const metadataUiFormBoundedOptionsBrand: unique symbol;

type MetadataUiFormTupleBetween<
  Value,
  Min extends number,
  Max extends number,
  Accumulator extends Value[] = [],
> = Accumulator["length"] extends Max
  ? Accumulator
  : Accumulator["length"] extends Min
    ? Accumulator | MetadataUiFormTupleBetween<Value, Min, Max, [...Accumulator, Value]>
    : MetadataUiFormTupleBetween<Value, Min, Max, [...Accumulator, Value]>;

type MetadataUiFormTupleUpTo<
  Value,
  Max extends number,
  Accumulator extends Value[] = [],
> = Accumulator["length"] extends Max
  ? Accumulator
  : Accumulator | MetadataUiFormTupleUpTo<Value, Max, [...Accumulator, Value]>;

export type MetadataUiFormKey = string & {
  readonly [metadataUiFormKeyBrand]: true;
};

export type MetadataUiFormKeyFor<
  Namespace extends string,
  Name extends string,
> = `${Lowercase<Namespace>}.${Lowercase<Name>}` & MetadataUiFormKey;

export type MetadataUiFormFieldName = string & {
  readonly [metadataUiFormFieldNameBrand]: true;
};

export type MetadataUiFormDiagnosticKey = string & {
  readonly [metadataUiFormDiagnosticKeyBrand]: true;
};

export type MetadataUiFormFieldValue = unknown;

export type MetadataUiFormFieldOptionValue = string | number | boolean;

export type MetadataUiFormFieldOption = Omit<
  MetadataUiFormFieldOptionSchemaOutput,
  "value"
> & {
  value: MetadataUiFormFieldOptionValue;
};

export type MetadataUiFormFieldBoundedOptions =
  MetadataUiFormFieldOption[] & {
    readonly [metadataUiFormBoundedOptionsBrand]: true;
  };

export type MetadataUiFormFieldValidation =
  MetadataUiFormFieldValidationSchemaOutput;

export type MetadataUiFormFieldState =
  MetadataUiFormFieldStateSchemaOutput;

export type MetadataUiFormFileUpload =
  MetadataUiFormFileUploadSchemaOutput;

export type MetadataUiFormFieldDisabledState =
  | {
      disabled?: undefined;
    }
  | {
      disabled: {
        value: false;
        reason?: string;
      };
    }
  | {
      disabled: {
        value: true;
        reason?: string;
      };
    };

export type MetadataUiFormFieldForKind<
  Kind extends MetadataUiFormFieldKind,
> = Omit<
  MetadataUiFormFieldSchemaOutput,
  "disabled" | "key" | "kind" | "name" | "options" | "permission" | "validation"
> &
  MetadataUiFormFieldDisabledState & {
    key: MetadataUiFormKey;
    name: MetadataUiFormFieldName;
    kind: Kind;
    options: MetadataUiFormFieldBoundedOptions;
    validation?: MetadataUiFormFieldValidation;
    state: MetadataUiFormFieldState;
    fileUpload?: MetadataUiFormFileUpload;
    permission?: MetadataUiPermissionContract;
  };

export type MetadataUiFormField = {
  [Kind in MetadataUiFormFieldKind]: MetadataUiFormFieldForKind<Kind>;
}[MetadataUiFormFieldKind];

export type MetadataUiFormFieldsByKind<
  Fields extends readonly MetadataUiFormField[],
> = {
  [Kind in MetadataUiFormFieldKind]: Extract<Fields[number], { kind: Kind }>[];
};

export type MetadataUiFormRequiredFields<
  Fields extends readonly MetadataUiFormField[],
> = Extract<Fields[number], { validation: { required: true } }>;

export type MetadataUiFormBoundedFields = MetadataUiFormField[] & {
  readonly [metadataUiFormBoundedFieldsBrand]: true;
};

export type MetadataUiFormSection = Omit<
  MetadataUiFormSectionSchemaOutput,
  "fields" | "key" | "permission"
> & {
  key: MetadataUiFormKey;
  fields: MetadataUiFormBoundedFields;
  permission?: MetadataUiPermissionContract;
};

export type MetadataUiFormBoundedSections =
  MetadataUiFormTupleBetween<MetadataUiFormSection, 1, 24> & {
    readonly [metadataUiFormBoundedSectionsBrand]: true;
  };

export type MetadataUiFormActionForPlacement<
  Placement extends MetadataUiFormActionPlacement,
> = Omit<
  MetadataUiFormActionSchemaOutput,
  "action" | "permission" | "placement"
> & {
  action: MetadataUiActionContract;
  placement: Placement;
  permission?: MetadataUiPermissionContract;
};

export type MetadataUiFormAction = {
  [Placement in MetadataUiFormActionPlacement]: MetadataUiFormActionForPlacement<Placement>;
}[MetadataUiFormActionPlacement];

export type MetadataUiFormActionsByPlacement<
  Actions extends readonly MetadataUiFormAction[],
> = {
  [Placement in MetadataUiFormActionPlacement]: Extract<
    Actions[number],
    { placement: Placement }
  >[];
};

export type MetadataUiFormBoundedActions =
  MetadataUiFormTupleUpTo<MetadataUiFormAction, 12> & {
    readonly [metadataUiFormBoundedActionsBrand]: true;
  };

export type MetadataUiFormDiagnostics = Omit<
  MetadataUiFormDiagnosticsSchemaOutput,
  "componentKey" | "rendererKey" | "sectionKey" | "testId"
> & {
  componentKey?: MetadataUiFormDiagnosticKey;
  sectionKey?: MetadataUiFormDiagnosticKey;
  rendererKey?: MetadataUiFormDiagnosticKey;
  testId?: MetadataUiFormDiagnosticKey;
};

export type MetadataUiForm = Omit<
  MetadataUiFormSchemaOutput,
  | "actions"
  | "diagnostics"
  | "key"
  | "permission"
  | "presentation"
  | "sections"
  | "submitAction"
> & {
  key: MetadataUiFormKey;
  submitAction?: MetadataUiActionContract;
  sections: MetadataUiFormBoundedSections;
  actions: MetadataUiFormBoundedActions;
  presentation?: MetadataUiPresentationContract;
  permission?: MetadataUiPermissionContract;
  diagnostics?: MetadataUiFormDiagnostics;
};

export type MetadataUiFormForMode<Mode extends MetadataUiFormMode> =
  MetadataUiForm & {
    mode: Mode;
  };

export type MetadataUiFormForLayout<Layout extends MetadataUiFormLayout> =
  MetadataUiForm & {
    layout: Layout;
  };

export type MetadataUiFormParseResult =
  | {
      success: true;
      data: MetadataUiForm;
      error?: never;
    }
  | {
      success: false;
      data?: never;
      error: z.ZodError;
    };

function assertMetadataUiFormInvariants(
  form: MetadataUiFormSchemaOutput,
): asserts form is MetadataUiFormSchemaOutput & MetadataUiForm {
  if (!/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/.test(form.key)) {
    throw new Error("Form keys must use lowercase kebab/dot notation.");
  }

  if (form.sections.length < 1 || form.sections.length > 24) {
    throw new Error("Forms must declare between one and twenty-four sections.");
  }

  if (form.actions.length > 12) {
    throw new Error("Forms may declare at most twelve actions.");
  }
}

export function parseMetadataUiForm(input: unknown): MetadataUiForm {
  const form = METADATA_UI_FORM_SCHEMA.parse(input);
  assertMetadataUiFormInvariants(form);
  return form;
}

export function safeParseMetadataUiForm(
  input: unknown,
): MetadataUiFormParseResult {
  const result = METADATA_UI_FORM_SCHEMA.safeParse(input);
  if (result.success) {
    assertMetadataUiFormInvariants(result.data);
    return {
      success: true,
      data: result.data,
    };
  }
  return result;
}
