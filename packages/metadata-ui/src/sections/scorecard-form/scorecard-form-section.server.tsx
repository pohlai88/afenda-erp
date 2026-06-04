import "server-only";

import type { ReactNode } from "react";

import {
  parseMetadataUiScorecardForm,
  type MetadataUiScorecardFormInput,
} from "../../schemas/scorecard-form.schema";
import { MetadataUiSectionShell } from "../../shell/section-shell.server";
import { MetadataUiScorecardFormRenderer } from "./scorecard-form-renderer.server";

export type MetadataUiScorecardFormSectionProps = Readonly<{
  metadata: MetadataUiScorecardFormInput;
  children?: ReactNode;
}>;

export function MetadataUiScorecardFormSection({
  metadata,
  children,
}: MetadataUiScorecardFormSectionProps) {
  const scorecard = parseMetadataUiScorecardForm(metadata);

  return (
    <MetadataUiSectionShell
      id={scorecard.key}
      sectionKind="scorecard-form"
      title={scorecard.title}
      description={scorecard.description}
      presentation={scorecard.presentation}
      diagnostics={scorecard.diagnostics}
    >
      {children ?? <MetadataUiScorecardFormRenderer metadata={scorecard} />}
    </MetadataUiSectionShell>
  );
}

export default MetadataUiScorecardFormSection;
