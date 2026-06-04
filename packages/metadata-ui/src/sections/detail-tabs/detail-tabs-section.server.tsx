import "server-only";

import type { ReactNode } from "react";

import { type MetadataUiDetailTabsInput, parseMetadataUiDetailTabs } from "../../schemas/detail-tabs.schema";
import { MetadataUiSectionShell } from "../../shell/section-shell.server";
import { MetadataUiDetailTabsRenderer } from "./detail-tabs-renderer.server";

export type MetadataUiDetailTabsSectionProps = Readonly<{
  metadata: MetadataUiDetailTabsInput;
  children?: ReactNode;
}>;

export function MetadataUiDetailTabsSection({
  metadata,
  children,
}: MetadataUiDetailTabsSectionProps) {
  const detailTabs = parseMetadataUiDetailTabs(metadata);

  return (
    <MetadataUiSectionShell
      id={detailTabs.key}
      sectionKind="detail-tabs"
      title={detailTabs.title}
      description={detailTabs.description}
      presentation={detailTabs.presentation}
      diagnostics={detailTabs.diagnostics}
    >
      {children ?? <MetadataUiDetailTabsRenderer metadata={detailTabs} />}
    </MetadataUiSectionShell>
  );
}

export default MetadataUiDetailTabsSection;
