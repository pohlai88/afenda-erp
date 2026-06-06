import "server-only";

import type { ReactNode } from "react";
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
  title?: ReactNode;
  description?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  footer?: ReactNode;
  shellClassName?: string;
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
  title,
  description,
  leading,
  trailing,
  footer,
  shellClassName,
}: MetadataUiPrimitiveTabsProps) {
  const hasHeaderContent = Boolean(title || description);
  const hasShell = Boolean(hasHeaderContent || leading || trailing || footer || shellClassName);

  const tabsNode = (
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

  if (!hasShell) {
    return tabsNode;
  }

  return (
    <section className={cn("metadata-ui-detail-tabs-shell grid", ui.surfaceGap.sm, shellClassName)}>
      {hasHeaderContent ? (
        <div className="flex flex-wrap items-start justify-between gap-surface-sm">
          <div className="grid min-w-0 gap-surface-2xs">
            {title ? (
              <h2 className={cn(ui.typography.sectionTitle, ui.color.ink.foreground)}>
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className={cn(ui.typography.caption, ui.color.ink.muted)}>
                {description}
              </p>
            ) : null}
          </div>
          {(leading || trailing) ? (
            <div className="flex flex-wrap items-center gap-surface-xs">
              {leading ? <div className="min-w-0">{leading}</div> : null}
              {trailing ? <div className="min-w-0">{trailing}</div> : null}
            </div>
          ) : null}
        </div>
      ) : leading || trailing ? (
        <div className="flex flex-wrap items-center justify-end gap-surface-xs">
          {leading ? <div className="min-w-0">{leading}</div> : null}
          {trailing ? <div className="min-w-0">{trailing}</div> : null}
        </div>
      ) : null}
      {tabsNode}
      {footer ? <div className="flex flex-wrap items-center gap-surface-xs">{footer}</div> : null}
    </section>
  );
}
