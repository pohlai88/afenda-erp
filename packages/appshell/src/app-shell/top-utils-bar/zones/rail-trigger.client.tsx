"use client";

import { PanelLeft } from "lucide-react";

import { Button } from "@afenda/ui";

import { AppShellUtilityTriggerTooltip } from "../template/utility-trigger-tooltip.client";

export function AppShellRailTrigger({
  label,
  onToggle,
}: {
  label: string;
  onToggle: () => void;
}) {
  return (
    <AppShellUtilityTriggerTooltip label={label}>
      <Button
        aria-label={label}
        className="af-appshell__icon-button"
        onClick={onToggle}
        size="icon-sm"
        type="button"
        variant="outline"
      >
        <PanelLeft aria-hidden="true" size={16} />
      </Button>
    </AppShellUtilityTriggerTooltip>
  );
}
