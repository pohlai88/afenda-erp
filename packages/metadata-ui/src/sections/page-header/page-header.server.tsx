import "server-only";

import type { ReactNode } from "react";

import {
  parseMetadataUiPageHeader,
  type MetadataUiPageHeaderInput,
} from "../../schemas/page-header.schema";
import { MetadataUiSectionShell } from "../../shell/section-shell.server";
import { MetadataUiPageHeaderRenderer } from "./page-header-renderer.server";

export type MetadataUiPageHeaderProps = Readonly<{
  metadata: MetadataUiPageHeaderInput;
  children?: ReactNode;
}>;

export function MetadataUiPageHeader({
  metadata,
  children,
}: MetadataUiPageHeaderProps) {
  const header = parseMetadataUiPageHeader(metadata);

  return (
    <MetadataUiSectionShell
      id={header.key}
      sectionKind="page-header"
      presentation={header.presentation}
      diagnostics={header.diagnostics}
    >
      {children ?? <MetadataUiPageHeaderRenderer metadata={header} />}
    </MetadataUiSectionShell>
  );
}

export default MetadataUiPageHeader;
