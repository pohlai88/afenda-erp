"use client";

import { useActionState, useState } from "react";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { type ActionResult } from "@afenda/governed-surface/schemas";
import { Button } from "@afenda/ui/button";
import { Field, FieldGroup, FieldLabel } from "@afenda/ui/field";
import { Input } from "@afenda/ui/input";
import { Textarea } from "@afenda/ui/textarea";

import { createCompensationRecommendationFormAction } from "../actions/hr.payroll.cpm.actions.server";
import { HR_CPM_MANAGER_ADJUSTMENT_TYPES } from "../data/hr.payroll.cpm-participant-display.shared";
import { hrCpmUiCopy } from "../surface/hr.payroll.cpm-ui.copy.shared";

const cpmSelectClass =
  "min-h-field w-full rounded-control border border-transparent bg-input/50 px-field-px py-field-py type-control";

export function HrCpmRecommendationCreateForm({
  cycleId,
  participantId,
  employeeId,
  currentSalary,
  budgetPoolId,
  grade,
  legalEntityCode,
  canWrite,
}: {
  cycleId: string;
  participantId: string;
  employeeId: string;
  currentSalary: number;
  budgetPoolId?: string | null;
  grade?: string | null;
  legalEntityCode?: string | null;
  canWrite: boolean;
}) {
  const copy = hrCpmUiCopy.recommendationForm;
  const [adjustmentType, setAdjustmentType] = useState<
    (typeof HR_CPM_MANAGER_ADJUSTMENT_TYPES)[number]
  >("merit");
  const [increaseMode, setIncreaseMode] = useState<"amount" | "percent">(
    "percent",
  );
  const [state, action, pending] = useActionState(
    createCompensationRecommendationFormAction,
    undefined as ActionResult | undefined,
  );

  if (!canWrite) {
    return null;
  }

  return (
    <form action={action} className="rounded-card border p-4">
      <input type="hidden" name="cycleId" value={cycleId} />
      <input type="hidden" name="participantId" value={participantId} />
      <input type="hidden" name="employeeId" value={employeeId} />
      <input type="hidden" name="currentSalary" value={String(currentSalary)} />
      <input type="hidden" name="increaseMode" value={increaseMode} />
      {budgetPoolId ? (
        <input type="hidden" name="budgetPoolId" value={budgetPoolId} />
      ) : null}
      {grade ? <input type="hidden" name="grade" value={grade} /> : null}
      {legalEntityCode ? (
        <input type="hidden" name="legalEntityCode" value={legalEntityCode} />
      ) : null}

      <FieldGroup>
        <div>
          <h3 className="type-card-title">{copy.title}</h3>
          <p className="type-muted">{copy.description}</p>
        </div>

        <Field>
          <FieldLabel htmlFor="cpm-adjustment-type">
            {copy.adjustmentTypeLabel}
          </FieldLabel>
          <select
            id="cpm-adjustment-type"
            name="adjustmentType"
            className={cpmSelectClass}
            value={adjustmentType}
            onChange={(event) =>
              setAdjustmentType(
                event.target.value as (typeof HR_CPM_MANAGER_ADJUSTMENT_TYPES)[number],
              )
            }
          >
            {HR_CPM_MANAGER_ADJUSTMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </Field>

        <Field>
          <FieldLabel htmlFor="cpm-increase-mode">Increase mode</FieldLabel>
          <select
            id="cpm-increase-mode"
            className={cpmSelectClass}
            value={increaseMode}
            onChange={(event) =>
              setIncreaseMode(event.target.value as "amount" | "percent")
            }
          >
            <option value="percent">{copy.increaseModePercent}</option>
            <option value="amount">{copy.increaseModeAmount}</option>
          </select>
        </Field>

        {increaseMode === "amount" ? (
          <Field>
            <FieldLabel htmlFor="cpm-increase-amount">
              {copy.increaseAmountLabel}
            </FieldLabel>
            <Input
              id="cpm-increase-amount"
              name="increaseAmount"
              type="number"
              min={0}
              step="0.01"
              required
            />
          </Field>
        ) : (
          <Field>
            <FieldLabel htmlFor="cpm-increase-percent">
              {copy.increasePercentLabel}
            </FieldLabel>
            <Input
              id="cpm-increase-percent"
              name="increasePercent"
              type="number"
              min={0}
              step="0.01"
              required
            />
          </Field>
        )}

        {adjustmentType === "promotion" ? (
          <>
            <Field>
              <FieldLabel htmlFor="cpm-proposed-grade">
                {copy.promotionGradeLabel}
              </FieldLabel>
              <Input id="cpm-proposed-grade" name="proposedGrade" />
            </Field>
            <Field>
              <FieldLabel htmlFor="cpm-proposed-level">
                {copy.promotionLevelLabel}
              </FieldLabel>
              <Input id="cpm-proposed-level" name="proposedLevel" />
            </Field>
          </>
        ) : null}

        {adjustmentType === "market" ? (
          <Field>
            <FieldLabel htmlFor="cpm-market-percentile">
              {copy.marketPercentileLabel}
            </FieldLabel>
            <Input
              id="cpm-market-percentile"
              name="marketReferencePercentile"
              type="number"
              min={0}
              max={100}
              step="1"
            />
          </Field>
        ) : null}

        {adjustmentType === "equity" ? (
          <Field>
            <FieldLabel htmlFor="cpm-equity-gap">
              {copy.equityGapLabel}
            </FieldLabel>
            <Input id="cpm-equity-gap" name="equityGapReference" />
          </Field>
        ) : null}

        {adjustmentType === "retention" ? (
          <Field>
            <FieldLabel htmlFor="cpm-retention-risk">
              {copy.retentionRiskLabel}
            </FieldLabel>
            <select
              id="cpm-retention-risk"
              name="retentionRiskLevel"
              className={cpmSelectClass}
              defaultValue="high"
            >
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </Field>
        ) : null}

        <Field>
          <FieldLabel htmlFor="cpm-manager-comments">
            {copy.managerCommentsLabel}
          </FieldLabel>
          <Textarea id="cpm-manager-comments" name="managerComments" rows={3} />
        </Field>

        <Field>
          <FieldLabel htmlFor="cpm-justification">
            {copy.justificationLabel}
          </FieldLabel>
          <Textarea id="cpm-justification" name="justification" rows={3} />
        </Field>

        <ActionFormErrors result={state} />
        <Button type="submit" disabled={pending}>
          {copy.submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
