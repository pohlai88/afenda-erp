import "server-only";

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Field,
  FieldLabel,
  RadioGroup,
  RadioGroupItem,
} from "@afenda/ui";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import { MetadataUiPrimitiveActionButton } from "../../primitives/action-button.server";
import { MetadataUiPrimitiveScorecardCriterionCard } from "../../primitives/scorecard-criterion-card.server";
import {
  parseMetadataUiScorecardForm,
  type MetadataUiScorecardFormInput,
} from "../../schemas/scorecard-form.schema";
import { MetadataUiClientForm } from "../form/form.client";

export type MetadataUiScorecardFormRendererProps = Readonly<{
  metadata: MetadataUiScorecardFormInput;
}>;

export function MetadataUiScorecardFormRenderer({
  metadata,
}: MetadataUiScorecardFormRendererProps) {
  const scorecard = parseMetadataUiScorecardForm(metadata);

  return (
    <MetadataUiClientForm
      className="metadata-ui-scorecard-form"
      aria-label={scorecard.title}
      metadataState={scorecard.state}
      noValidate
      data-metadata-ui-scorecard-criterion-count={scorecard.criteria.length}
      data-metadata-ui-scorecard-error-count={scorecard.errorSummary.errors.length}
    >
      {scorecard.errorSummary.errors.length > 0 ? (
        <Alert
          variant="destructive"
          aria-live="polite"
          data-metadata-ui-scorecard-error-summary="true"
        >
          <AlertTitle>{scorecard.errorSummary.title}</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 list-disc pl-5">
              {scorecard.errorSummary.errors.map((error) => (
                <li key={`${error.fieldKey}-${error.message}`}>
                  {error.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      ) : null}
      <div
        className={cn("grid", ui.surfaceGap.sm)}
        role="list"
        aria-label="Scorecard criteria"
      >
        {scorecard.criteria.map((criterion) => (
          <div key={criterion.key} role="listitem">
            <MetadataUiPrimitiveScorecardCriterionCard criterion={criterion}>
              <RadioGroup
                name={criterion.key}
                defaultValue={
                  criterion.selectedValue === null ||
                  criterion.selectedValue === undefined
                    ? undefined
                    : String(criterion.selectedValue)
                }
                disabled={Boolean(criterion.blockedReason || criterion.readonly)}
                className="grid gap-surface-xs sm:grid-cols-2"
                role="radiogroup"
                aria-labelledby={`${criterion.key}-label`}
              >
                {criterion.options.map((option) => (
                  <Field
                    key={option.value}
                    orientation="horizontal"
                    data-metadata-ui-score-selected={
                      criterion.selectedValue === option.value || undefined
                    }
                  >
                    <RadioGroupItem
                      id={`${criterion.key}-${String(option.value)}`}
                      value={option.value}
                      disabled={Boolean(criterion.blockedReason || criterion.readonly)}
                    />
                    <FieldLabel htmlFor={`${criterion.key}-${String(option.value)}`}>
                      {option.label}
                    </FieldLabel>
                  </Field>
                ))}
              </RadioGroup>
              {criterion.reason ? (
                <p className={cn(ui.typography.caption, ui.color.ink.muted)}>
                  {criterion.reason}
                </p>
              ) : null}
              {criterion.blockedReason ? (
                <p className={cn(ui.typography.caption, ui.color.ink.muted)}>
                  {criterion.blockedReason}
                </p>
              ) : null}
            </MetadataUiPrimitiveScorecardCriterionCard>
          </div>
        ))}
      </div>
      {scorecard.submitAction ? (
        <div className="flex justify-end">
          <MetadataUiPrimitiveActionButton action={scorecard.submitAction} priority="primary" />
        </div>
      ) : null}
    </MetadataUiClientForm>
  );
}

export default MetadataUiScorecardFormRenderer;
