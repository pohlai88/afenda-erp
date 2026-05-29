import { GovernedEmpty } from "../../client";
import {
  GOVERNED_MULTI_STEP_FORM_SCHEMA_ID,
  parseGovernedMultiStepFormConfiguration,
} from "../../schemas/multi-step-form.schema";
import { governedParseErrorCopy } from "../../i18n/governed-renderer-copy.shared";

import type { GovernedComponentRendererDiagnostics } from "../registry";

import { MultiStepFormSurface } from "./multi-step-form.client";

export function MultiStepFormRenderer({
  configuration,
  diagnostics = "user",
}: {
  configuration: unknown;
  diagnostics?: GovernedComponentRendererDiagnostics;
}) {
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
      />
    );
  }

  return <MultiStepFormSurface form={parsed.data} />;
}
