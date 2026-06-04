import "server-only";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@afenda/ui";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import type { MetadataUiDetailTabs } from "../schemas/detail-tabs.schema";
import { MetadataUiPrimitiveBadge } from "./badge.server";

export type MetadataUiPrimitiveTabsProps = Readonly<{
  detailTabs: MetadataUiDetailTabs;
}>;

function getMetadataUiDefaultTabKey(
  tabs: readonly MetadataUiDetailTabs["tabs"][number][],
): string {
  return tabs.find((tab) => tab.defaultSelected)?.key ?? tabs[0]?.key ?? "";
}

function MetadataUiPrimitiveTabPanel({
  tab,
}: Readonly<{
  tab: MetadataUiDetailTabs["tabs"][number];
}>) {
  return (
    <div className={cn("grid", ui.surfaceGap.xs)}>
      <p className={cn(ui.typography.label, ui.color.ink.foreground)}>
        {tab.label}
      </p>
      {tab.description ? (
        <p className={cn(ui.typography.muted, ui.color.ink.muted)}>
          {tab.description}
        </p>
      ) : null}
    </div>
  );
}

export function MetadataUiPrimitiveTabs({
  detailTabs,
}: MetadataUiPrimitiveTabsProps) {
  return (
    <Tabs
      defaultValue={getMetadataUiDefaultTabKey(detailTabs.tabs)}
      className="metadata-ui-detail-tabs"
    >
      <TabsList variant="line" className="w-full justify-start overflow-x-auto">
        {detailTabs.tabs.map((tab) => (
          <TabsTrigger key={tab.key} value={tab.key}>
            <span>{tab.label}</span>
            {tab.badge ? (
              <MetadataUiPrimitiveBadge tone={tab.badge.tone}>
                {tab.badge.value}
              </MetadataUiPrimitiveBadge>
            ) : null}
          </TabsTrigger>
        ))}
      </TabsList>
      {detailTabs.tabs.map((tab) => (
        <TabsContent
          key={tab.key}
          value={tab.key}
          className={cn(ui.surface.inset, ui.surfaceGap.sm)}
          data-metadata-ui-tab-section={tab.sectionKey}
        >
          <MetadataUiPrimitiveTabPanel tab={tab} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
