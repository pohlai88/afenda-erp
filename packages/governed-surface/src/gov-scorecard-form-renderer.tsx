import { GovernedEmpty } from "./client";
import {
  GOVERNED_SCORECARD_FORM_SCHEMA_ID,
  parseGovernedScorecardFormConfiguration,
} from "../../schemas/scorecard-form.schema";
import { resolveGovernedServerAction } from "../../schemas/server-actions.shared";
import { governedParseErrorCopy } from "../../i18n/governed-renderer-copy.shared";
import { diagnosticsDataAttributes } from "../../utils/governed-diagnostics.shared";
import {
  governedIdentityAttributes,
  governedTestId,
} from "../../utils/governed-identity.shared";

import type { RendererProps } from "../governed-renderer-dispatch";

import { ScorecardFormSurface } from "./scorecard-form.client";

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
