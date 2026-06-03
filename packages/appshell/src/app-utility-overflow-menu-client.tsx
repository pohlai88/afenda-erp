"use client";

import { MoreHorizontal } from "lucide-react";

import type { AppShellUtilityItemMetadata } from "./app-utility-bar-metadata-shared";
import { AppShellUtilityDropdownTemplate } from "./app-utility-dropdown-template-client";
import {
  renderAppShellUtilityRuntimeItem,
  type AppShellUtilityRuntimeContext,
} from "./app-utility-runtime-adapters-client";

export function AppShellUtilityOverflowMenu({
  items,
  context,
}: {
  items: readonly AppShellUtilityItemMetadata[];
  context: AppShellUtilityRuntimeContext;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <AppShellUtilityDropdownTemplate
      description="Additional workspace utilities that do not fit in the primary bar."
      icon={<MoreHorizontal aria-hidden="true" size={16} />}
      title="More utilities"
      triggerLabel="More utilities"
      triggerTooltip="More utilities"
      contentClassName="w-auto max-w-none p-2"
    >
      <div className="flex flex-wrap items-center gap-1">
        {items.map((item) => (
          <span key={item.id}>{renderAppShellUtilityRuntimeItem(item, context)}</span>
        ))}
      </div>
    </AppShellUtilityDropdownTemplate>
  );
}
