"use client";

import Link from "next/link";

import type {
  AppShellActions,
  AppShellRailMode,
  AppShellUtilityPanelSlots,
  AppShellUtilityBarChrome,
} from "../../appshell-props.shared";
import { AppShellRailTrigger } from "./rail-trigger.client";
import { AppShellUtilityRuntimeItems } from "../runtime/utility-runtime-core.client";

export function AppShellUtilityBar({
  utilityBar,
  actions,
  railMode,
  onToggleRail,
  density,
  onDensityChange,
  utilityPanels,
  onOpenCommand,
}: {
  utilityBar: AppShellUtilityBarChrome;
  actions?: AppShellActions;
  railMode: AppShellRailMode;
  onToggleRail: () => void;
  density: "comfortable" | "compact";
  onDensityChange: (density: "comfortable" | "compact") => void;
  utilityPanels?: AppShellUtilityPanelSlots;
  onOpenCommand: () => void;
}) {
  const leftItems = utilityBar.metadata.zones
    .find((zone) => zone.id === "left")
    ?.items.filter((item) => item.visible !== false)
    .sort((a, b) => a.priority - b.priority);
  const centerItems = utilityBar.metadata.zones
    .find((zone) => zone.id === "center")
    ?.items.filter((item) => item.visible !== false)
    .sort((a, b) => a.priority - b.priority);
  const rightItems = utilityBar.metadata.zones
    .find((zone) => zone.id === "right")
    ?.items.filter((item) => item.visible !== false)
    .sort((a, b) => a.priority - b.priority);

  const leftMetadata = { ...utilityBar, metadata: { ...utilityBar.metadata, zones: [{ id: "left" as const, items: leftItems ?? [] }] } };
  const rightMetadata = { ...utilityBar, metadata: { ...utilityBar.metadata, zones: [{ id: "right" as const, items: rightItems ?? [] }] } };

  return (
    <header className="af-appshell__utility" aria-label="Workspace utilities">
      <div className="af-appshell__utility-zone">
        <Link
          aria-label="Workspace home"
          className="af-appshell__brand"
          href={utilityBar.brandHomeHref}
        >
          {utilityBar.account.initials}
        </Link>
        <AppShellRailTrigger
          label={
            railMode === "collapsed"
              ? "Expand navigation rail"
              : "Collapse navigation rail"
          }
          onToggle={onToggleRail}
        />
        <AppShellUtilityRuntimeItems
          actions={actions}
          callbacks={{ density, onDensityChange }}
          utilityBar={leftMetadata}
          utilityPanels={utilityPanels}
        />
      </div>
      <div className="af-appshell__utility-center">
        <button
          className="af-appshell__command-trigger"
          onClick={onOpenCommand}
          type="button"
        >
          <span>{centerItems?.[0]?.label ?? utilityBar.commandPlaceholder}</span>
          <kbd>Ctrl K</kbd>
        </button>
      </div>
      <div className="af-appshell__utility-zone af-appshell__utility-zone--right">
        <AppShellUtilityRuntimeItems
          actions={actions}
          callbacks={{ density, onDensityChange }}
          utilityBar={rightMetadata}
          utilityPanels={utilityPanels}
        />
      </div>
    </header>
  );
}
