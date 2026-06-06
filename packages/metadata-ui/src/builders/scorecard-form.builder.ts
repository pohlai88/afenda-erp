import { z } from "zod";

import {
  METADATA_UI_SCORECARD_CRITERION_SCHEMA,
  METADATA_UI_SCORECARD_FORM_SCHEMA,
  parseMetadataUiScorecardForm,
  type MetadataUiScorecardCriterion,
  type MetadataUiScorecardCriterionInput,
  type MetadataUiScorecardForm,
  type MetadataUiScorecardFormInput,
} from "../schemas/scorecard-form.schema";

type MetadataUiScorecardFormSystemFields =
  | "schemaId"
  | "schemaVersion"
  | "stability";

export type ScorecardFormBuilderInput = Omit<
  MetadataUiScorecardFormInput,
  MetadataUiScorecardFormSystemFields
>;

export type MetadataUiScorecardFormBuilderResult<
  Input extends ScorecardFormBuilderInput,
> = MetadataUiScorecardForm & {
  key: Input["key"];
};

export type MetadataUiScorecardCriterionBuilderResult<
  Input extends MetadataUiScorecardCriterionInput,
> = MetadataUiScorecardCriterion & {
  key: Input["key"];
};

export type MetadataUiScorecardFormSafeCreateResult<
  Data extends MetadataUiScorecardForm = MetadataUiScorecardForm,
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

export function createScorecardForm<const Input extends ScorecardFormBuilderInput>(
  input: Input,
): MetadataUiScorecardFormBuilderResult<Input> {
  return parseMetadataUiScorecardForm(input) as MetadataUiScorecardFormBuilderResult<Input>;
}

export function createScorecardCriterion<
  const Input extends MetadataUiScorecardCriterionInput,
>(input: Input): MetadataUiScorecardCriterionBuilderResult<Input> {
  return METADATA_UI_SCORECARD_CRITERION_SCHEMA.parse(
    input,
  ) as MetadataUiScorecardCriterionBuilderResult<Input>;
}

export function appendScorecardCriterion<
  const Input extends ScorecardFormBuilderInput,
>(
  scorecard: Input,
  criterion: MetadataUiScorecardCriterionInput,
): MetadataUiScorecardFormBuilderResult<Input> {
  return createScorecardForm({
    ...scorecard,
    criteria: [...scorecard.criteria, criterion],
  }) as MetadataUiScorecardFormBuilderResult<Input>;
}

export function safeCreateScorecardForm(
  input: unknown,
): MetadataUiScorecardFormSafeCreateResult {
  const result = METADATA_UI_SCORECARD_FORM_SCHEMA.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true as const,
    data: parseMetadataUiScorecardForm(result.data),
  };
}
