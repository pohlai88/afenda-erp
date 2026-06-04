import "server-only";

import type { ReactNode } from "react";

import {
  parseMetadataUiMultiStepForm,
  type MetadataUiMultiStepFormInput,
} from "../../schemas/multi-step-form.schema";
import { MetadataUiSectionShell } from "../../shell/section-shell.server";
import { MetadataUiMultiStepFormRenderer } from "./multi-step-form-renderer.server";

export type MetadataUiMultiStepFormSectionProps = Readonly<{
  metadata: MetadataUiMultiStepFormInput;
  children?: ReactNode;
}>;

export function MetadataUiMultiStepFormSection({
  metadata,
  children,
}: MetadataUiMultiStepFormSectionProps) {
  const form = parseMetadataUiMultiStepForm(metadata);

  return (
    <MetadataUiSectionShell
      id={form.key}
      sectionKind="multi-step-form"
      title={form.title}
      description={form.description}
      presentation={form.presentation}
      diagnostics={form.diagnostics}
    >
      {children ?? <MetadataUiMultiStepFormRenderer metadata={form} />}
    </MetadataUiSectionShell>
  );
}

export default MetadataUiMultiStepFormSection;
