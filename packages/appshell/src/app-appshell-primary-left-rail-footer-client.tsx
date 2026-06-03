"use client";

import { Check, PanelLeft } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@afenda/ui";

import { useAppShellRuntime } from "./app-client";
import { AppShellUtilityTriggerTooltip } from "./app-utility-trigger-tooltip-client";

const RAIL_MODES = [
  {
    mode: "expanded" as const,
    label: "Expanded",
    description: "Always show the full rail.",
  },
  {
    mode: "hover" as const,
    label: "Hover",
    description: "Keep the rail compact until hovered.",
  },
  {
    mode: "collapsed" as const,
    label: "Collapsed",
    description: "Show the compact icon rail.",
  },
];

export function AppShellPrimaryLeftRailFooter({
  label = "Rail mode",
}: {
  label?: string;
}) {
  const runtime = useAppShellRuntime();

  return (
    <DropdownMenu>
      <AppShellUtilityTriggerTooltip label={label}>
        <DropdownMenuTrigger asChild>
          <button
            aria-label={label}
            className="af-appshell__rail-footer-button"
            type="button"
          >
            <PanelLeft aria-hidden="true" size={15} />
            <span>{RAIL_MODES.find((item) => item.mode === runtime.railMode)?.label}</span>
          </button>
        </DropdownMenuTrigger>
      </AppShellUtilityTriggerTooltip>
      <DropdownMenuContent align="start" sideOffset={8}>
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        {RAIL_MODES.map((item) => (
          <DropdownMenuItem
            key={item.mode}
            onClick={() => runtime.setRailMode(item.mode)}
          >
            <span className="flex min-w-0 flex-1 flex-col">
              <span>{item.label}</span>
              <span className="text-xs text-muted-foreground">
                {item.description}
              </span>
            </span>
            {runtime.railMode === item.mode ? (
              <Check aria-hidden="true" className="ml-2" size={14} />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
