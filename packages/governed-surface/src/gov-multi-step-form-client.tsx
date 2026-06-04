"use client";

import { useActionState, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@afenda/ui/alert";
import { Badge } from "@afenda/ui/badge";
import { Button } from "@afenda/ui/button";
import { Checkbox } from "@afenda/ui/checkbox";
import { FieldGroup } from "@afenda/ui/field";
import { Input } from "@afenda/ui/input";
import { Label } from "@afenda/ui/label";
import { Progress } from "@afenda/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@afenda/ui/select";
import { Textarea } from "@afenda/ui/textarea";
import { GovernedEmpty } from "./gov-governed-empty";
import {
  resolveFormFieldRuleState,
  type FormRuleValues,
} from "./form-rules.evaluate.shared";
import { ActionFormErrors } from "./gov-action-form-errors";
import { governedRendererCopy } from "./gov-governed-renderer-copy-shared";
import {
  GovernedFileUploadField,
  resolveGovernedFormModuleId,
} from "./gov-governed-file-upload-field-client";
import type {
  GovernedFormField,
  GovernedMultiStepFormConfiguration,
  MultiStepFormDataNature,
} from "./gov-multi-step-form-schema";
import {
  actionFailure,
  type ActionResult,
} from "./gov-action-result-shared";
import type { GovernedServerActionHandler } from "./gov-server-actions-shared";
import { densityGapClass } from "./gov-surface-chrome-classes";
import { cn } from "@afenda/ui/utils";

const DATA_NATURE_CLASS: Record<MultiStepFormDataNature, string> = {
  wizard: "@container flex flex-col gap-surface-lg",
};

const missingGovernedFormAction: GovernedServerActionHandler = async () =>
  actionFailure(
    "This governed form is not connected to a registered server action.",
    undefined,
    "governed.action.unregistered",
  );

function buildInitialWizardValues(
  form: GovernedMultiStepFormConfiguration,
): FormRuleValues {
  const initial: FormRuleValues = {};
  for (const step of form.steps) {
    for (const field of step.fields) {
      initial[field.id] =
        field.kind === "checkbox"
          ? false
          : field.kind === "file-upload"
            ? ""
            : "";
    }
  }
  return initial;
}

function countRequiredFields(
  fields: readonly GovernedFormField[],
  values: FormRuleValues,
): number {
  return fields.filter((field) => {
    const { visible } = resolveFormFieldRuleState(field.rules, values);
    return visible && field.required;
  }).length;
}

export function MultiStepFormSurface({
  form,
  action,
}: {
  form: GovernedMultiStepFormConfiguration;
  action?: GovernedServerActionHandler<FormData, void>;
}) {
  const [result, formAction, pending] = useActionState<
    ActionResult<void> | undefined,
    FormData
  >(action ?? missingGovernedFormAction, undefined);
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<FormRuleValues>(() =>
    buildInitialWizardValues(form),
  );
  const step = form.steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === form.steps.length - 1;
  const progress = Math.round(
    ((stepIndex + 1) / Math.max(form.steps.length, 1)) * 100,
  );

  if (form.steps.length === 0) {
    return (
      <section
        aria-label="Multi-step form"
        className={DATA_NATURE_CLASS[form.dataNature]}
      >
        <GovernedEmpty
          model={{
            variant: "muted",
            title: governedRendererCopy.empty.multiStepForm.title,
            description: governedRendererCopy.empty.multiStepForm.description,
          }}
        />
      </section>
    );
  }

  if (!step) {
    return (
      <section
        aria-label="Multi-step form"
        className={DATA_NATURE_CLASS[form.dataNature]}
      >
        <GovernedEmpty
          model={{
            variant: "error",
            title: governedRendererCopy.parseError.multiStepForm.userTitle,
            description:
              governedRendererCopy.parseError.multiStepForm.userDescription,
            emptyId: "multi-step-form-invalid-step",
          }}
        />
      </section>
    );
  }

  function setFieldValue(fieldId: string, next: unknown) {
    setValues((prev) => ({ ...prev, [fieldId]: next }));
  }

  const requiredFieldCount = countRequiredFields(step.fields, values);
  const actionRegistered = Boolean(action);

  return (
    <section
      aria-label="Multi-step form"
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
            <div className="min-w-0">
              <p className="type-caption">
                Step {stepIndex + 1} of {form.steps.length}
              </p>
              <h3 className="type-card-title">{step.title}</h3>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="outline">{step.fields.length} fields</Badge>
              {requiredFieldCount > 0 ? (
                <Badge variant="warning">{requiredFieldCount} required</Badge>
              ) : null}
            </div>
          </div>
          {step.description ? (
            <p className="type-muted">{step.description}</p>
          ) : null}
          <Progress value={progress} aria-label="Form progress" />
        </div>

        <ol className="flex flex-wrap gap-2" aria-label="Form steps">
          {form.steps.map((s, index) => (
            <li key={s.id}>
              <Button
                type="button"
                size="sm"
                variant={index === stepIndex ? "default" : "outline"}
                className="type-caption h-7"
                onClick={() => setStepIndex(index)}
                aria-current={index === stepIndex ? "step" : undefined}
              >
                {s.title}
              </Button>
            </li>
          ))}
        </ol>
        <FieldGroup className={cn(densityGapClass(form.chrome?.density))}>
          {step.fields.map((field) => (
            <WizardField
              key={field.id}
              field={field}
              formModuleId={form.moduleId}
              values={values}
              onValueChange={setFieldValue}
            />
          ))}
        </FieldGroup>
        <div className="flex flex-wrap gap-2 border-t border-border/60 pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isFirst}
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          >
            Back
          </Button>
          {isLast ? (
            <Button
              type="submit"
              size="sm"
              data-form-id={form.formId}
              data-action-id={form.actionId}
              disabled={!actionRegistered || pending}
            >
              {pending ? "Submitting..." : form.submitLabel}
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={() =>
                setStepIndex((i) => Math.min(form.steps.length - 1, i + 1))
              }
            >
              Next
            </Button>
          )}
        </div>
        {!actionRegistered ? (
          <p className="type-caption text-critical" role="status">
            Server action is not registered for this governed form.
          </p>
        ) : null}
        <ActionFormErrors result={result} />
      </form>
    </section>
  );
}

function WizardField({
  field,
  formModuleId,
  values,
  onValueChange,
}: {
  field: GovernedFormField;
  formModuleId?: string;
  values: FormRuleValues;
  onValueChange: (fieldId: string, next: unknown) => void;
}) {
  const id = `wizard-field-${field.id}`;
  const { visible, enabled } = resolveFormFieldRuleState(field.rules, values);
  const uploadModuleId = resolveGovernedFormModuleId(formModuleId);

  if (!visible) {
    return null;
  }

  if (field.kind === "file-upload") {
    if (!uploadModuleId) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Upload unavailable</AlertTitle>
          <AlertDescription>
            File upload requires a valid form moduleId.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id}>
          {field.label}
          {field.required ? (
            <span className="text-critical" aria-hidden>
              {" "}
              *
            </span>
          ) : null}
        </Label>
        <GovernedFileUploadField
          field={field}
          moduleId={uploadModuleId}
          enabled={enabled}
          value={values[field.id]}
          onValueChange={(next) => onValueChange(field.id, next)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {field.kind === "checkbox" ? (
        <div className="flex items-center gap-2">
          <Checkbox
            id={id}
            name={field.id}
            required={field.required}
            disabled={!enabled}
            checked={Boolean(values[field.id])}
            onCheckedChange={(checked) =>
              onValueChange(field.id, checked === true)
            }
          />
          <Label htmlFor={id}>{field.label}</Label>
        </div>
      ) : (
        <>
          <Label htmlFor={id}>
            {field.label}
            {field.required ? (
              <span className="text-critical" aria-hidden>
                {" "}
                *
              </span>
            ) : null}
          </Label>
          {field.kind === "textarea" ? (
            <Textarea
              id={id}
              name={field.id}
              placeholder={field.placeholder}
              required={field.required}
              disabled={!enabled}
              value={String(values[field.id] ?? "")}
              onChange={(event) => onValueChange(field.id, event.target.value)}
            />
          ) : field.kind === "select" ? (
            <Select
              name={field.id}
              required={field.required}
              disabled={!enabled}
              value={String(values[field.id] ?? "")}
              onValueChange={(next) => onValueChange(field.id, next)}
            >
              <SelectTrigger id={id} className="w-full">
                <SelectValue placeholder={field.placeholder ?? "Select…"} />
              </SelectTrigger>
              <SelectContent>
                {(field.options ?? []).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={id}
              name={field.id}
              type={field.kind === "email" ? "email" : "text"}
              placeholder={field.placeholder}
              required={field.required}
              disabled={!enabled}
              value={String(values[field.id] ?? "")}
              onChange={(event) => onValueChange(field.id, event.target.value)}
            />
          )}
        </>
      )}
    </div>
  );
}
