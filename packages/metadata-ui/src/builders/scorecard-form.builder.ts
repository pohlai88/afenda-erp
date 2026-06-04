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

export function createScorecardForm<const Input extends ScorecardFormBuilderInput>(
  input: Input,
): MetadataUiScorecardForm & { key: Input["key"] } {
  return parseMetadataUiScorecardForm(input) as MetadataUiScorecardForm & {
    key: Input["key"];
  };
}

export function createScorecardCriterion<
  const Input extends MetadataUiScorecardCriterionInput,
>(input: Input): MetadataUiScorecardCriterion & { key: Input["key"] } {
  return METADATA_UI_SCORECARD_CRITERION_SCHEMA.parse(
    input,
  ) as MetadataUiScorecardCriterion & { key: Input["key"] };
}

export function appendScorecardCriterion(
  scorecard: MetadataUiScorecardFormInput,
  criterion: MetadataUiScorecardCriterionInput,
): MetadataUiScorecardForm {
  return createScorecardForm({
    ...scorecard,
    criteria: [...scorecard.criteria, criterion],
  });
}

export function safeCreateScorecardForm(input: unknown) {
  const result = METADATA_UI_SCORECARD_FORM_SCHEMA.safeParse(input);

  if (!result.success) {
    return result;
  }

  return {
    success: true as const,
    data: parseMetadataUiScorecardForm(result.data),
  };
}
