import "server-only";

import type { ReactNode } from "react";

import { type MetadataUiStatInput, parseMetadataUiStat } from "../../schemas/stat.schema";
import { MetadataUiSectionShell } from "../../shell/section-shell.server";
import { MetadataUiStatRenderer } from "./stat-renderer.server";

export type MetadataUiStatSectionProps = Readonly<{
  metadata: MetadataUiStatInput;
  children?: ReactNode;
}>;

export function MetadataUiStatSection({
  metadata,
  children,
}: MetadataUiStatSectionProps) {
  const stat = parseMetadataUiStat(metadata);

  return (
    <MetadataUiSectionShell
      id={stat.key}
      sectionKind="stat"
      title={stat.title}
      description={stat.description}
      presentation={stat.presentation}
      diagnostics={stat.diagnostics}
    >
      {children ?? <MetadataUiStatRenderer metadata={stat} />}
    </MetadataUiSectionShell>
  );
}

export default MetadataUiStatSection;
