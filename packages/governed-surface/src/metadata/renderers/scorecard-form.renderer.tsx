import { GovernedEmpty } from "../../client";
import {
  GOVERNED_SCORECARD_FORM_SCHEMA_ID,
  parseGovernedScorecardFormConfiguration,
} from "../../schemas/scorecard-form.schema";
import { governedParseErrorCopy } from "../../i18n/governed-renderer-copy.shared";

import type { GovernedComponentRendererDiagnostics } from "../registry";

import { ScorecardFormSurface } from "./scorecard-form.client";

export function ScorecardFormRenderer({
  configuration,
  diagnostics = "user",
}: {
  configuration: unknown;
  diagnostics?: GovernedComponentRendererDiagnostics;
}) {
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
      />
    );
  }

  return <ScorecardFormSurface form={parsed.data} />;
}
