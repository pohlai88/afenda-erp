import "server-only";

import { createMetadataUiSectionIdentity } from "../../identity/identity.shared";
import { MetadataUiPrimitivePageHeader } from "../../primitives/page-header.server";
import {
  parseMetadataUiPageHeader,
  type MetadataUiPageHeaderInput,
} from "../../schemas/page-header.schema";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

export type MetadataUiPageHeaderRendererProps = Readonly<{
  metadata: MetadataUiPageHeaderInput;
}>;

export function MetadataUiPageHeaderRenderer({
  metadata,
}: MetadataUiPageHeaderRendererProps) {
  const header = parseMetadataUiPageHeader(metadata);
  const identity = createMetadataUiSectionIdentity({
    sectionKind: "page-header",
    key: header.key,
    id: header.key,
    diagnostics: header.diagnostics,
  });

  return (
    <div className={cn("metadata-ui-page-header grid", ui.surfaceGap.md)}>
      <MetadataUiPrimitivePageHeader
        {...identity.domAttributes}
        header={header}
      />
    </div>
  );
}

export default MetadataUiPageHeaderRenderer;
