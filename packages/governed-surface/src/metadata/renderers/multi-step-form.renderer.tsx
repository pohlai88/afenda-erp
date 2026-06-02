import { GovernedEmpty } from "../../client";
import {
  GOVERNED_MULTI_STEP_FORM_SCHEMA_ID,
  parseGovernedMultiStepFormConfiguration,
} from "../../schemas/multi-step-form.schema";
import { resolveGovernedServerAction } from "../../schemas/server-actions.shared";
import { governedParseErrorCopy } from "../../i18n/governed-renderer-copy.shared";
import { diagnosticsDataAttributes } from "../../utils/governed-diagnostics.shared";
import {
  governedIdentityAttributes,
  governedTestId,
} from "../../utils/governed-identity.shared";

import type { RendererProps } from "../governed-renderer-dispatch";

import { MultiStepFormSurface } from "./multi-step-form.client";

export function MultiStepFormRenderer({
  configuration,
  diagnostics = "user",
  surfaceKey,
  sectionKey,
  componentKey,
  componentType = "governed:multi-step-form",
}: RendererProps) {
  const resolvedComponentKey =
    componentKey ?? sectionKey ?? surfaceKey ?? "multi-step-form";
  const parsed = parseGovernedMultiStepFormConfiguration(configuration);

  if (!parsed.success) {
    const copy = governedParseErrorCopy(
      diagnostics,
      "multiStepForm",
      `${GOVERNED_MULTI_STEP_FORM_SCHEMA_ID} failed validation.`,
    );
    return (
      <GovernedEmpty
        model={{
          variant: "error",
          title: copy.title,
          description: copy.description,
        }}
        surfaceKey={surfaceKey}
        sectionKey={sectionKey}
        componentKey={resolvedComponentKey}
        renderState="invalid"
      />
    );
  }

  const action = resolveGovernedServerAction(parsed.data.actionId);

  return (
    <div
      className="@container min-w-0"
      {...governedIdentityAttributes({
        surfaceKey,
        sectionKey,
        componentKey: resolvedComponentKey,
      })}
      {...diagnosticsDataAttributes({
        state: "ready",
        testId: governedTestId("multi-step-form", resolvedComponentKey),
        componentType,
      })}
    >
      <MultiStepFormSurface form={parsed.data} action={action} />
    </div>
  );
}
