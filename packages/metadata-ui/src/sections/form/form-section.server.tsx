import "server-only";

import type { ReactNode } from "react";

import { type MetadataUiFormInput, parseMetadataUiForm } from "../../schemas/form.schema";
import { MetadataUiSectionShell } from "../../shell/section-shell.server";
import { MetadataUiFormRenderer } from "./form-renderer.server";

export type MetadataUiFormSectionProps = Readonly<{
  metadata: MetadataUiFormInput;
  children?: ReactNode;
}>;

export function MetadataUiFormSection({
  metadata,
  children,
}: MetadataUiFormSectionProps) {
  const form = parseMetadataUiForm(metadata);

  return (
    <MetadataUiSectionShell
      id={form.key}
      sectionKind="form"
      title={form.title}
      description={form.description}
      presentation={form.presentation}
      diagnostics={form.diagnostics}
    >
      {children ?? <MetadataUiFormRenderer metadata={form} />}
    </MetadataUiSectionShell>
  );
}

export default MetadataUiFormSection;
