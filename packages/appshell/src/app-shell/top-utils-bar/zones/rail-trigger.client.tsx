"use client";

import { PanelLeft } from "lucide-react";

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
      <button
        aria-label={label}
        className="af-appshell__icon-button"
        onClick={onToggle}
        type="button"
      >
        <PanelLeft aria-hidden="true" size={16} />
      </button>
    </AppShellUtilityTriggerTooltip>
  );
}
