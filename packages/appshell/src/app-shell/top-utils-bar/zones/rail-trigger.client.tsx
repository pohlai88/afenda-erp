"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import type { AppShellRailMode } from "../../appshell-props.shared";
import { AppShellUtilityTriggerTooltip } from "../template/utility-trigger-tooltip.client";

export function AppShellRailTrigger({
  label,
  railMode,
  onToggle,
}: {
  label: string;
  railMode: AppShellRailMode;
  onToggle: () => void;
}) {
  const collapsed = railMode === "collapsed" || railMode === "hover";
  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <AppShellUtilityTriggerTooltip label={label}>
      <button
        aria-label={label}
        className="af-appshell__rail-trigger"
        onClick={onToggle}
        type="button"
      >
        <Icon aria-hidden="true" size={16} />
      </button>
    </AppShellUtilityTriggerTooltip>
  );
}
