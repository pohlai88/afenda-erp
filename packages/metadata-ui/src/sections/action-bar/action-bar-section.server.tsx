import "server-only";

import type { ReactNode } from "react";

import { type MetadataUiActionBarInput, parseMetadataUiActionBar } from "../../schemas/action-bar.schema";
import { MetadataUiSectionShell } from "../../shell/section-shell.server";
import { MetadataUiActionBarRenderer } from "./action-bar-renderer.server";

export type MetadataUiActionBarSectionProps = Readonly<{
  metadata: MetadataUiActionBarInput;
  children?: ReactNode;
}>;

export function MetadataUiActionBarSection({
  metadata,
  children,
}: MetadataUiActionBarSectionProps) {
  const actionBar = parseMetadataUiActionBar(metadata);

  return (
    <MetadataUiSectionShell
      id={actionBar.key}
      sectionKind="action-bar"
      title={actionBar.title}
      description={actionBar.description}
      presentation={actionBar.presentation}
      diagnostics={actionBar.diagnostics}
    >
      {children ?? <MetadataUiActionBarRenderer metadata={actionBar} />}
    </MetadataUiSectionShell>
  );
}

export default MetadataUiActionBarSection;
