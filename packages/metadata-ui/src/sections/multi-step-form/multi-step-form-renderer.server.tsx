import "server-only";

import { Alert, AlertDescription, AlertTitle } from "@afenda/ui";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import { MetadataUiPrimitiveActionButton } from "../../primitives/action-button.server";
import { MetadataUiPrimitiveDescriptionList } from "../../primitives/description-list.server";
import {
  MetadataUiPrimitiveField,
  MetadataUiPrimitiveFieldGroup,
} from "../../primitives/field.server";
import { MetadataUiPrimitiveStepper } from "../../primitives/stepper.server";
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
      <MetadataUiPrimitiveStepper
        steps={orderedSteps.map((step) => ({
          key: step.key,
          label: step.title,
          description: step.description,
          status: step.status,
          meta:
            step.key === activeStep?.key
            ? "Current step"
            : `${step.sections.length} section${step.sections.length === 1 ? "" : "s"}`,
        }))}
      />
      <MetadataUiPrimitiveDescriptionList
        title="Workflow metadata"
        description="Step-level status and scope for the current flow."
        columns={3}
        items={[
          {
            key: "mode",
            label: "Mode",
            value: form.mode,
          },
          {
            key: "state",
            label: "State",
            value: form.state,
          },
          {
            key: "steps",
            label: "Steps",
            value: orderedSteps.length,
          },
          {
            key: "active-step",
            label: "Active step",
            value: activeStep?.title ?? "None",
          },
          {
            key: "sections",
            label: "Sections",
            value: activeStep ? activeStep.sections.length : 0,
          },
          {
            key: "errors",
            label: "Errors",
            value: activeStep?.errorSummary.errors.length ?? 0,
          },
        ]}
      />
      {activeStep ? (
        <section className={cn("grid", ui.surfaceGap.sm)}>
          {activeStep.errorSummary.errors.length > 0 ? (
            <Alert
              variant="destructive"
              aria-live="polite"
              data-metadata-ui-step-error-summary="true"
            >
              <AlertTitle>{activeStep.errorSummary.title}</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 list-disc pl-5">
                  {activeStep.errorSummary.errors.map((error) => (
                    <li key={`${error.fieldKey}-${error.message}`}>
                      {error.message}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
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
