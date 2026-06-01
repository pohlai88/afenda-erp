"use client";

import { Grid3X3 } from "lucide-react";
import Link from "next/link";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@afenda/ui";

import type { AppShellLauncherItem } from "../../appshell-props.shared";
import { AppShellUtilityPanel } from "../template/utility-panel.client";
import { AppShellUtilityTriggerTooltip } from "../template/utility-trigger-tooltip.client";

export function AppShellLauncher({
  items,
}: {
  items: readonly AppShellLauncherItem[];
}) {
  if (items.length === 0) {
    return null;
  }

  const groupedItems = items.reduce<Record<string, AppShellLauncherItem[]>>(
    (groups, item) => {
      const group = item.group ?? "Workspace";
      groups[group] ??= [];
      groups[group].push(item);
      return groups;
    },
    {},
  );

  return (
    <Popover>
      <AppShellUtilityTriggerTooltip label="Open workspace launcher">
        <PopoverTrigger asChild>
          <button
            aria-label="Open workspace launcher"
            className="af-appshell__icon-button"
            type="button"
          >
            <Grid3X3 aria-hidden="true" size={16} />
          </button>
        </PopoverTrigger>
      </AppShellUtilityTriggerTooltip>
      <PopoverContent align="start" className="w-80">
        <AppShellUtilityPanel
          title="Workspace launcher"
          description="Approved ERP workspaces and operator destinations."
        >
          <div className="grid gap-3">
            {Object.entries(groupedItems).map(([group, groupItems]) => (
              <div className="grid gap-2" key={group}>
                <div className="text-xs font-medium uppercase text-muted-foreground">
                  {group}
                </div>
                <div className="grid gap-2">
                  {groupItems.map((item) => (
                    <Link
                      className="rounded-card border border-border/60 px-3 py-2 transition-colors hover:border-border hover:bg-accent"
                      href={item.href}
                      key={item.id}
                    >
                      <div className="text-sm font-medium">{item.label}</div>
                      {item.description ? (
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      ) : null}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </AppShellUtilityPanel>
      </PopoverContent>
    </Popover>
  );
}
