import "server-only";

import { MetadataUiPrimitiveActionButton } from "../../primitives/action-button.server";
import { MetadataUiPrimitiveTabs } from "../../primitives/tabs.server";
import {
  type MetadataUiDetailTabsInput,
  parseMetadataUiDetailTabs,
} from "../../schemas/detail-tabs.schema";

export type MetadataUiDetailTabsRendererProps = Readonly<{
  metadata: MetadataUiDetailTabsInput;
}>;

export function MetadataUiDetailTabsRenderer({
  metadata,
}: MetadataUiDetailTabsRendererProps) {
  const detailTabs = parseMetadataUiDetailTabs(metadata);
  const headerActions = detailTabs.actions.filter(
    (action) => action.placement === "header",
  );

  return (
    <div className="grid gap-surface-sm">
      {headerActions.length > 0 ? (
        <div className="flex flex-wrap justify-end gap-surface-xs">
          {headerActions.map((action) => (
            <MetadataUiPrimitiveActionButton
              key={action.action.id}
              action={action.action}
              priority="secondary"
            />
          ))}
        </div>
      ) : null}
      <MetadataUiPrimitiveTabs detailTabs={detailTabs} />
    </div>
  );
}

export default MetadataUiDetailTabsRenderer;
