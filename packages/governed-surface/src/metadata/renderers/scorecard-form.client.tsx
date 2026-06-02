"use client";

import { useActionState, useState } from "react";

import { Badge } from "@afenda/ui/badge";
import { Button } from "@afenda/ui/button";
import { FieldGroup } from "@afenda/ui/field";
import { Label } from "@afenda/ui/label";
import { Progress } from "@afenda/ui/progress";
import { RadioGroup, RadioGroupItem } from "@afenda/ui/radio-group";
import { Textarea } from "@afenda/ui/textarea";
import { GovernedEmpty } from "../../client";
import { ActionFormErrors } from "../../components/action-form-errors";
import { governedRendererCopy } from "../../i18n/governed-renderer-copy.shared";
import {
  actionFailure,
  type ActionResult,
} from "../../schemas/action-result.shared";
import type {
  GovernedScorecardFormConfiguration,
  ScorecardCriterion,
  ScorecardFormDataNature,
} from "../../schemas/scorecard-form.schema";
import type { GovernedServerActionHandler } from "../../schemas/server-actions.shared";
import { densityGapClass } from "../../schemas/surface-chrome.classes";
import { cn } from "@afenda/ui/utils";

const DATA_NATURE_CLASS: Record<ScorecardFormDataNature, string> = {
  scoring: "@container flex flex-col gap-surface-lg",
};

const missingGovernedScorecardAction: GovernedServerActionHandler = async () =>
  actionFailure(
    "This scorecard form is not connected to a registered server action.",
    undefined,
    "governed.action.unregistered",
  );

function summarizeScores(
  criteria: readonly ScorecardCriterion[],
  scores: Readonly<Record<string, number>>,
) {
  const scored = criteria.filter((criterion) => (scores[criterion.id] ?? 0) > 0);
  const maxTotal = criteria.reduce(
    (sum, criterion) => sum + criterion.maxScore,
    0,
  );
  const scoreTotal = criteria.reduce(
    (sum, criterion) => sum + (scores[criterion.id] ?? 0),
    0,
  );

  return {
    completion: Math.round((scored.length / Math.max(criteria.length, 1)) * 100),
    maxTotal,
    scoreTotal,
    average:
      scored.length > 0
        ? Math.round((scoreTotal / scored.length) * 10) / 10
        : 0,
  };
}

export function ScorecardFormSurface({
  form,
  action,
}: {
  form: GovernedScorecardFormConfiguration;
  action?: GovernedServerActionHandler<FormData, void>;
}) {
  const [result, formAction, pending] = useActionState<
    ActionResult<void> | undefined,
    FormData
  >(action ?? missingGovernedScorecardAction, undefined);
  const [scores, setScores] = useState<Record<string, number>>(() =>
    Object.fromEntries(form.criteria.map((c) => [c.id, 0])),
  );
  const summary = summarizeScores(form.criteria, scores);
  const actionRegistered = Boolean(action);

  if (form.criteria.length === 0) {
    return (
      <section
        aria-label={form.title}
        className={DATA_NATURE_CLASS[form.dataNature]}
      >
        <GovernedEmpty
          model={{
            variant: "muted",
            title: governedRendererCopy.empty.scorecardForm.title,
            description: governedRendererCopy.empty.scorecardForm.description,
          }}
        />
      </section>
    );
  }

  return (
    <section
      aria-label={form.title}
      className={DATA_NATURE_CLASS[form.dataNature]}
    >
      <form
        action={formAction}
        className={cn("flex flex-col", densityGapClass(form.chrome?.density))}
        data-form-id={form.formId}
        data-action-id={form.actionId}
        data-action-resolution={actionRegistered ? "registered" : "missing"}
      >
        <input type="hidden" name="__governedFormId" value={form.formId} />
        <input type="hidden" name="__governedActionId" value={form.actionId} />
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="type-card-title">{form.title}</h3>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="outline">
                {summary.scoreTotal}/{summary.maxTotal}
              </Badge>
              <Badge
                variant={summary.completion === 100 ? "success" : "warning"}
              >
                {summary.completion}% complete
              </Badge>
              {summary.average > 0 ? (
                <Badge variant="secondary">Avg {summary.average}</Badge>
              ) : null}
            </div>
          </div>
          <Progress
            value={summary.completion}
            aria-label="Scorecard completion"
          />
        </div>

        <FieldGroup className="gap-surface-lg">
          <ul className="flex flex-col gap-surface-lg">
            {form.criteria.map((criterion) => (
              <li key={criterion.id}>
                <CriterionRow
                  criterion={criterion}
                  value={scores[criterion.id] ?? 0}
                  onSelect={(score) =>
                    setScores((prev) => ({ ...prev, [criterion.id]: score }))
                  }
                />
              </li>
            ))}
          </ul>
        </FieldGroup>
        {form.notesFieldId ? (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={form.notesFieldId}>Notes</Label>
            <Textarea id={form.notesFieldId} name={form.notesFieldId} rows={3} />
          </div>
        ) : null}
        <Button
          type="submit"
          size="sm"
          className="w-fit"
          data-form-id={form.formId}
          data-action-id={form.actionId}
          disabled={!actionRegistered || pending || summary.completion < 100}
        >
          {pending ? "Submitting..." : form.submitLabel}
        </Button>
        {!actionRegistered ? (
          <p className="type-caption text-critical" role="status">
            Server action is not registered for this scorecard form.
          </p>
        ) : null}
        <ActionFormErrors result={result} />
      </form>
    </section>
  );
}

function CriterionRow({
  criterion,
  value,
  onSelect,
}: {
  criterion: ScorecardCriterion;
  value: number;
  onSelect: (score: number) => void;
}) {
  const max = criterion.maxScore;

  return (
    <div className="flex flex-col gap-2 border-b border-border/60 pb-surface-lg last:border-0 last:pb-0">
      <div className="flex flex-col gap-0.5">
        <p className="type-body font-medium">{criterion.label}</p>
        {criterion.description ? (
          <p className="type-caption">
            {criterion.description}
          </p>
        ) : null}
      </div>
      <RadioGroup
        className="flex flex-wrap gap-1"
        aria-label={`Score for ${criterion.label}`}
        name={criterion.id}
        required
        value={value > 0 ? String(value) : undefined}
        onValueChange={(next) => onSelect(Number(next))}
      >
        {Array.from({ length: max }, (_, index) => {
          const score = index + 1;
          const optionId = `scorecard-${criterion.id}-${score}`;

          return (
            <div
              key={score}
              className={cn(
                "flex h-8 min-w-8 items-center justify-center rounded-control border px-2 type-caption",
                value === score
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground",
              )}
            >
              <RadioGroupItem
                id={optionId}
                value={String(score)}
              />
              <Label htmlFor={optionId} className="cursor-pointer">
                {score}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}
