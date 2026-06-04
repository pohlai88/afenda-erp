import "server-only";

import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import { MetadataUiPrimitiveActionButton } from "../../primitives/action-button.server";
import {
  MetadataUiPrimitiveField,
  MetadataUiPrimitiveFieldGroup,
} from "../../primitives/field.server";
import {
  parseMetadataUiMultiStepForm,
  type MetadataUiMultiStepFormInput,
} from "../../schemas/multi-step-form.schema";
import { MetadataUiClientForm } from "../form/form.client";

export type MetadataUiMultiStepFormRendererProps = Readonly<{
  metadata: MetadataUiMultiStepFormInput;
}>;

export function MetadataUiMultiStepFormRenderer({
  metadata,
}: MetadataUiMultiStepFormRendererProps) {
  const form = parseMetadataUiMultiStepForm(metadata);
  const orderedSteps = [...form.steps].sort((left, right) => left.order - right.order);
  const activeStep =
    orderedSteps.find((step) => step.key === form.activeStepKey) ??
    orderedSteps.find((step) => step.status === "active") ??
    orderedSteps[0];

  return (
    <MetadataUiClientForm
      className="metadata-ui-multi-step-form"
      aria-label={form.title}
      metadataState={form.state}
      noValidate
      data-metadata-ui-active-step={activeStep?.key}
    >
      <ol className="flex flex-wrap items-center gap-surface-xs">
        {orderedSteps.map((step) => (
          <li key={step.key}>
            <span
              aria-current={step.key === activeStep?.key ? "step" : undefined}
              className={cn(ui.typography.caption, ui.color.ink.muted)}
              data-metadata-ui-step-status={step.status}
            >
              {step.title}
            </span>
          </li>
        ))}
      </ol>
      {activeStep ? (
        <section className={cn("grid", ui.surfaceGap.sm)}>
          {activeStep.errorSummary.errors.length > 0 ? (
            <div
              className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900"
              aria-live="polite"
              data-metadata-ui-step-error-summary="true"
            >
              <h3 className="font-medium">{activeStep.errorSummary.title}</h3>
              <ul className="mt-2 list-disc pl-5">
                {activeStep.errorSummary.errors.map((error) => (
                  <li key={`${error.fieldKey}-${error.message}`}>{error.message}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {activeStep.sections.map((section) => (
            <MetadataUiPrimitiveFieldGroup key={section.key} section={section}>
              {section.fields.map((field) => (
                <MetadataUiPrimitiveField
                  key={field.key}
                  field={field}
                  mode={form.mode}
                />
              ))}
            </MetadataUiPrimitiveFieldGroup>
          ))}
        </section>
      ) : null}
      {form.submitAction ? (
        <div className="flex justify-end">
          <MetadataUiPrimitiveActionButton action={form.submitAction} priority="primary" />
        </div>
      ) : null}
    </MetadataUiClientForm>
  );
}

export default MetadataUiMultiStepFormRenderer;
