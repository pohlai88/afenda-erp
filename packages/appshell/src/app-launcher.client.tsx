"use client";

import { Grid3X3 } from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@afenda/ui";

import type { AppShellLauncherItem } from "./app-appshell-props-shared";
import { AppShellUtilityPanel } from "./app-utility-panel-client";
import { AppShellUtilityTriggerTooltip } from "./app-utility-trigger-tooltip-client";

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
                    <Link className="block" href={item.href} key={item.id}>
                      <Card
                        className="gap-2 py-0 transition-colors hover:bg-accent hover:ring-border"
                        size="sm"
                      >
                        <CardContent className="px-3 py-2">
                          <div className="text-sm font-medium">{item.label}</div>
                          {item.description ? (
                            <div className="text-xs text-muted-foreground">
                              {item.description}
                            </div>
                          ) : null}
                        </CardContent>
                      </Card>
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
