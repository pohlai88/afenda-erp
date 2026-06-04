import { z } from "zod";

import { metadataUiActionContractSchema } from "../contracts/action.contract";
import type { MetadataUiActionContract } from "../contracts/action.contract";
import { metadataUiPermissionContractSchema } from "../contracts/permission.contract";
import type { MetadataUiPermissionContract } from "../contracts/permission.contract";
import { metadataUiPresentationContractSchema } from "../contracts/presentation.contract";
import type { MetadataUiPresentationContract } from "../contracts/presentation.contract";
import {
  METADATA_UI_FORM_ERROR_SUMMARY_SCHEMA,
  METADATA_UI_FORM_KEY_SCHEMA,
  METADATA_UI_FORM_SECTION_SCHEMA,
  METADATA_UI_FORM_STATE_SCHEMA,
  type MetadataUiFormSection,
  type MetadataUiFormState,
} from "./form.schema";

export const METADATA_UI_MULTI_STEP_FORM_SCHEMA_ID =
  "metadata-ui.schema.multi-step-form" as const;

export const METADATA_UI_MULTI_STEP_FORM_SCHEMA_VERSION = 1 as const;

export type MetadataUiMultiStepFormSchemaStability = "beta";

export const METADATA_UI_MULTI_STEP_FORM_SCHEMA_STABILITY: MetadataUiMultiStepFormSchemaStability =
  "beta";

const METADATA_UI_MULTI_STEP_FORM_STEP_STATUS_VALUES = [
  "available",
  "active",
  "complete",
  "blocked",
  "readonly",
  "invalid",
] as const;

export const METADATA_UI_MULTI_STEP_FORM_STEP_STATUS_SCHEMA = z.enum(
  METADATA_UI_MULTI_STEP_FORM_STEP_STATUS_VALUES,
);

export const METADATA_UI_MULTI_STEP_FORM_STEP_SCHEMA = z
  .object({
    key: METADATA_UI_FORM_KEY_SCHEMA,
    title: z.string().min(1).max(120),
    description: z.string().min(1).max(320).optional(),
    status: METADATA_UI_MULTI_STEP_FORM_STEP_STATUS_SCHEMA.default("available"),
    order: z.number().int().min(0).max(100),
    sections: z.array(METADATA_UI_FORM_SECTION_SCHEMA).min(1).max(12),
    errorSummary: METADATA_UI_FORM_ERROR_SUMMARY_SCHEMA.default({
      title: "Review step",
      errors: [],
    }),
    navigationAction: metadataUiActionContractSchema.optional(),
    permission: metadataUiPermissionContractSchema.optional(),
  })
  .strict()
  .superRefine((step, ctx) => {
    if (step.status === "blocked" && !step.description) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["description"],
        message: "Blocked multi-step form steps must provide a reason.",
      });
    }

    if (step.status === "invalid" && step.errorSummary.errors.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["errorSummary", "errors"],
        message: "Invalid multi-step form steps must provide error metadata.",
      });
    }
  });

export const METADATA_UI_MULTI_STEP_FORM_SCHEMA = z
  .object({
    schemaId: z
      .literal(METADATA_UI_MULTI_STEP_FORM_SCHEMA_ID)
      .default(METADATA_UI_MULTI_STEP_FORM_SCHEMA_ID),
    schemaVersion: z
      .literal(METADATA_UI_MULTI_STEP_FORM_SCHEMA_VERSION)
      .default(METADATA_UI_MULTI_STEP_FORM_SCHEMA_VERSION),
    stability: z
      .literal(METADATA_UI_MULTI_STEP_FORM_SCHEMA_STABILITY)
      .default(METADATA_UI_MULTI_STEP_FORM_SCHEMA_STABILITY),
    key: METADATA_UI_FORM_KEY_SCHEMA,
    title: z.string().min(1).max(120).default("Form"),
    description: z.string().min(1).max(320).optional(),
    mode: z.enum(["create", "edit", "view", "review"]).default("view"),
    state: METADATA_UI_FORM_STATE_SCHEMA.default("clean"),
    activeStepKey: METADATA_UI_FORM_KEY_SCHEMA.optional(),
    steps: z.array(METADATA_UI_MULTI_STEP_FORM_STEP_SCHEMA).min(1).max(24),
    submitAction: metadataUiActionContractSchema.optional(),
    presentation: metadataUiPresentationContractSchema.optional(),
    permission: metadataUiPermissionContractSchema.optional(),
    diagnostics: z
      .object({
        componentKey: z.string().min(1).max(160).optional(),
        sectionKey: z.string().min(1).max(160).optional(),
        rendererKey: z.string().min(1).max(160).optional(),
        testId: z.string().min(1).max(160).optional(),
      })
      .optional(),
  })
  .strict();

type MetadataUiMultiStepFormSchemaOutput = z.output<
  typeof METADATA_UI_MULTI_STEP_FORM_SCHEMA
>;

type MetadataUiMultiStepFormStepSchemaOutput = z.output<
  typeof METADATA_UI_MULTI_STEP_FORM_STEP_SCHEMA
>;

export type MetadataUiMultiStepFormInput = z.input<
  typeof METADATA_UI_MULTI_STEP_FORM_SCHEMA
>;

export type MetadataUiMultiStepFormStepInput = z.input<
  typeof METADATA_UI_MULTI_STEP_FORM_STEP_SCHEMA
>;

export type MetadataUiMultiStepFormStepStatus =
  (typeof METADATA_UI_MULTI_STEP_FORM_STEP_STATUS_VALUES)[number];

declare const metadataUiMultiStepFormKeyBrand: unique symbol;

export type MetadataUiMultiStepFormKey = string & {
  readonly [metadataUiMultiStepFormKeyBrand]: true;
};

export type MetadataUiMultiStepFormStep = Omit<
  MetadataUiMultiStepFormStepSchemaOutput,
  "key" | "navigationAction" | "permission" | "sections"
> & {
  key: MetadataUiMultiStepFormKey;
  sections: MetadataUiFormSection[];
  navigationAction?: MetadataUiActionContract;
  permission?: MetadataUiPermissionContract;
};

export type MetadataUiMultiStepForm = Omit<
  MetadataUiMultiStepFormSchemaOutput,
  | "activeStepKey"
  | "key"
  | "permission"
  | "presentation"
  | "steps"
  | "submitAction"
> & {
  key: MetadataUiMultiStepFormKey;
  activeStepKey?: MetadataUiMultiStepFormKey;
  steps: MetadataUiMultiStepFormStep[];
  state: MetadataUiFormState;
  submitAction?: MetadataUiActionContract;
  presentation?: MetadataUiPresentationContract;
  permission?: MetadataUiPermissionContract;
};

function assertMetadataUiMultiStepFormInvariants(
  form: MetadataUiMultiStepFormSchemaOutput,
): asserts form is MetadataUiMultiStepFormSchemaOutput & MetadataUiMultiStepForm {
  const keys = new Set(form.steps.map((step) => step.key));
  if (keys.size !== form.steps.length) {
    throw new Error("Multi-step form step keys must be unique.");
  }

  if (form.activeStepKey && !keys.has(form.activeStepKey)) {
    throw new Error("Multi-step form activeStepKey must reference a declared step.");
  }
}

export function parseMetadataUiMultiStepForm(
  input: unknown,
): MetadataUiMultiStepForm {
  const form = METADATA_UI_MULTI_STEP_FORM_SCHEMA.parse(input);
  assertMetadataUiMultiStepFormInvariants(form);
  return form;
}
