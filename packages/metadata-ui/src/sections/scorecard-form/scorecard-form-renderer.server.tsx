import "server-only";

import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import { MetadataUiPrimitiveActionButton } from "../../primitives/action-button.server";
import { MetadataUiPrimitiveBadge } from "../../primitives/badge.server";
import { MetadataUiPrimitiveCard } from "../../primitives/card.server";
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
    >
      {scorecard.errorSummary.errors.length > 0 ? (
        <section
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900"
          aria-live="polite"
          data-metadata-ui-scorecard-error-summary="true"
        >
          <h3 className="font-medium">{scorecard.errorSummary.title}</h3>
          <ul className="mt-2 list-disc pl-5">
            {scorecard.errorSummary.errors.map((error) => (
              <li key={`${error.fieldKey}-${error.message}`}>{error.message}</li>
            ))}
          </ul>
        </section>
      ) : null}
      <div className={cn("grid", ui.surfaceGap.sm)}>
        {scorecard.criteria.map((criterion) => (
          <MetadataUiPrimitiveCard
            key={criterion.key}
            contentClassName={cn("grid", ui.surfaceGap.sm)}
          >
            <div className="flex flex-wrap items-start justify-between gap-surface-sm">
              <div className="grid gap-surface-2xs">
                <span className={cn(ui.typography.subtitle, ui.color.ink.foreground)}>
                  {criterion.label}
                  {criterion.required ? <span aria-hidden="true">*</span> : null}
                </span>
                {criterion.description ? (
                  <p className={cn(ui.typography.caption, ui.color.ink.muted)}>
                    {criterion.description}
                  </p>
                ) : null}
              </div>
              {criterion.blockedReason ? (
                <MetadataUiPrimitiveBadge tone="warning">Blocked</MetadataUiPrimitiveBadge>
              ) : criterion.readonly ? (
                <MetadataUiPrimitiveBadge tone="neutral">Readonly</MetadataUiPrimitiveBadge>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-surface-xs" role="radiogroup">
              {criterion.options.map((option) => (
                <label
                  key={option.value}
                  className="inline-flex items-center gap-surface-2xs text-sm"
                  data-metadata-ui-score-selected={
                    criterion.selectedValue === option.value || undefined
                  }
                >
                  <input
                    type="radio"
                    name={criterion.key}
                    value={option.value}
                    defaultChecked={criterion.selectedValue === option.value}
                    disabled={Boolean(criterion.blockedReason || criterion.readonly)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
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
          </MetadataUiPrimitiveCard>
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
