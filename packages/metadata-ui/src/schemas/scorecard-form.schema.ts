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
  METADATA_UI_FORM_STATE_SCHEMA,
  type MetadataUiFormState,
} from "./form.schema";

export const METADATA_UI_SCORECARD_FORM_SCHEMA_ID =
  "metadata-ui.schema.scorecard-form" as const;

export const METADATA_UI_SCORECARD_FORM_SCHEMA_VERSION = 1 as const;

export type MetadataUiScorecardFormSchemaStability = "beta";

export const METADATA_UI_SCORECARD_FORM_SCHEMA_STABILITY: MetadataUiScorecardFormSchemaStability =
  "beta";

export const METADATA_UI_SCORECARD_SCORE_OPTION_SCHEMA = z
  .object({
    value: z.string().trim().min(1).max(80),
    label: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(240).optional(),
    weight: z.number().min(0).max(100).optional(),
  })
  .strict();

export const METADATA_UI_SCORECARD_CRITERION_SCHEMA = z
  .object({
    key: METADATA_UI_FORM_KEY_SCHEMA,
    label: z.string().trim().min(1).max(160),
    description: z.string().trim().min(1).max(320).optional(),
    required: z.boolean().default(false),
    readonly: z.boolean().default(false),
    blockedReason: z.string().trim().min(1).max(240).optional(),
    selectedValue: z.string().trim().min(1).max(80).optional(),
    reason: z.string().trim().min(1).max(500).optional(),
    requireReasonWhenSelected: z
      .array(z.string().trim().min(1).max(80))
      .max(20)
      .default([]),
    options: z.array(METADATA_UI_SCORECARD_SCORE_OPTION_SCHEMA).min(1).max(20),
    permission: metadataUiPermissionContractSchema.optional(),
  })
  .strict()
  .superRefine((criterion, ctx) => {
    if (criterion.blockedReason && criterion.selectedValue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["selectedValue"],
        message: "Blocked scorecard criteria must not declare a selected value.",
      });
    }

    if (
      criterion.selectedValue &&
      !criterion.options.some((option) => option.value === criterion.selectedValue)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["selectedValue"],
        message: "Scorecard selectedValue must match a declared score option.",
      });
    }

    if (
      criterion.selectedValue &&
      criterion.requireReasonWhenSelected.includes(criterion.selectedValue) &&
      !criterion.reason
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reason"],
        message: "Selected score option requires a reason.",
      });
    }
  });

export const METADATA_UI_SCORECARD_FORM_SCHEMA = z
  .object({
    schemaId: z
      .literal(METADATA_UI_SCORECARD_FORM_SCHEMA_ID)
      .default(METADATA_UI_SCORECARD_FORM_SCHEMA_ID),
    schemaVersion: z
      .literal(METADATA_UI_SCORECARD_FORM_SCHEMA_VERSION)
      .default(METADATA_UI_SCORECARD_FORM_SCHEMA_VERSION),
    stability: z
      .literal(METADATA_UI_SCORECARD_FORM_SCHEMA_STABILITY)
      .default(METADATA_UI_SCORECARD_FORM_SCHEMA_STABILITY),
    key: METADATA_UI_FORM_KEY_SCHEMA,
    title: z.string().trim().min(1).max(120).default("Scorecard"),
    description: z.string().trim().min(1).max(320).optional(),
    state: METADATA_UI_FORM_STATE_SCHEMA.default("clean"),
    criteria: z.array(METADATA_UI_SCORECARD_CRITERION_SCHEMA).min(1).max(80),
    errorSummary: METADATA_UI_FORM_ERROR_SUMMARY_SCHEMA.default({
      title: "Review scorecard",
      errors: [],
    }),
    submitAction: metadataUiActionContractSchema.optional(),
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
  .superRefine((scorecard, ctx) => {
    if (
      scorecard.state === "invalid" &&
      scorecard.errorSummary.errors.length === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["errorSummary", "errors"],
        message: "Invalid scorecard forms must provide error summary metadata.",
      });
    }
  });

type MetadataUiScorecardFormSchemaOutput = z.output<
  typeof METADATA_UI_SCORECARD_FORM_SCHEMA
>;

type MetadataUiScorecardCriterionSchemaOutput = z.output<
  typeof METADATA_UI_SCORECARD_CRITERION_SCHEMA
>;

export type MetadataUiScorecardFormInput = z.input<
  typeof METADATA_UI_SCORECARD_FORM_SCHEMA
>;

export type MetadataUiScorecardCriterionInput = z.input<
  typeof METADATA_UI_SCORECARD_CRITERION_SCHEMA
>;

declare const metadataUiScorecardFormKeyBrand: unique symbol;

export type MetadataUiScorecardFormKey = string & {
  readonly [metadataUiScorecardFormKeyBrand]: true;
};

export type MetadataUiScorecardCriterion = Omit<
  MetadataUiScorecardCriterionSchemaOutput,
  "key" | "permission"
> & {
  key: MetadataUiScorecardFormKey;
  permission?: MetadataUiPermissionContract;
};

export type MetadataUiScorecardForm = Omit<
  MetadataUiScorecardFormSchemaOutput,
  | "criteria"
  | "key"
  | "permission"
  | "presentation"
  | "submitAction"
> & {
  key: MetadataUiScorecardFormKey;
  state: MetadataUiFormState;
  criteria: MetadataUiScorecardCriterion[];
  submitAction?: MetadataUiActionContract;
  presentation?: MetadataUiPresentationContract;
  permission?: MetadataUiPermissionContract;
};

function assertMetadataUiScorecardFormInvariants(
  scorecard: MetadataUiScorecardFormSchemaOutput,
): asserts scorecard is MetadataUiScorecardFormSchemaOutput &
  MetadataUiScorecardForm {
  const keys = new Set(scorecard.criteria.map((criterion) => criterion.key));
  if (keys.size !== scorecard.criteria.length) {
    throw new Error("Scorecard criterion keys must be unique.");
  }
}

export function parseMetadataUiScorecardForm(
  input: unknown,
): MetadataUiScorecardForm {
  const scorecard = METADATA_UI_SCORECARD_FORM_SCHEMA.parse(input);
  assertMetadataUiScorecardFormInvariants(scorecard);
  return scorecard;
}
