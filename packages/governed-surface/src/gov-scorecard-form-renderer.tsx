import { GovernedEmpty } from "./gov-governed-empty";
import {
  GOVERNED_SCORECARD_FORM_SCHEMA_ID,
  parseGovernedScorecardFormConfiguration,
} from "./gov-scorecard-form-schema";
import { resolveGovernedServerAction } from "./gov-server-actions-shared";
import { governedParseErrorCopy } from "./gov-governed-renderer-copy-shared";
import { diagnosticsDataAttributes } from "./gov-governed-diagnostics-shared";
import {
  governedIdentityAttributes,
  governedTestId,
} from "./gov-governed-identity-shared";

import type { RendererProps } from "./gov-governed-renderer-dispatch";

import { ScorecardFormSurface } from "./gov-scorecard-form-client";

export function ScorecardFormRenderer({
  configuration,
  diagnostics = "user",
  surfaceKey,
  sectionKey,
  componentKey,
  componentType = "governed:scorecard-form",
}: RendererProps) {
  const resolvedComponentKey =
    componentKey ?? sectionKey ?? surfaceKey ?? "scorecard-form";
  const parsed = parseGovernedScorecardFormConfiguration(configuration);

  if (!parsed.success) {
    const copy = governedParseErrorCopy(
      diagnostics,
      "scorecardForm",
      `${GOVERNED_SCORECARD_FORM_SCHEMA_ID} failed validation.`,
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
        testId: governedTestId("scorecard-form", resolvedComponentKey),
        componentType,
      })}
    >
      <ScorecardFormSurface form={parsed.data} action={action} />
    </div>
  );
}
