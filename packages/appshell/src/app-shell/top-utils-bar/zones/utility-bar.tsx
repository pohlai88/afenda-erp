"use client";

import Link from "next/link";
import { useMemo } from "react";

import type {
  AppShellActions,
  AppShellRailMode,
  AppShellUtilityPanelSlots,
  AppShellUtilityBarChrome,
} from "../../appshell-props.shared";
import { Button, Kbd } from "@afenda/ui";
import { AppShellRailTrigger } from "./rail-trigger.client";
import { AppShellUtilityBarConfigPopover } from "../configuration/utility-config-popover.client";
import { AppShellLeftUtilityRail } from "./left-utility-rail.client";
import { AppShellRightUtilityRail } from "./right-utility-rail.client";
import { AppShellUtilityRuntimeProvider } from "../runtime/utility-runtime-core.client";

export function AppShellUtilityBar({
  utilityBar,
  actions,
  railMode,
  onToggleRail,
  utilityPanels,
  onOpenCommand,
}: {
  utilityBar: AppShellUtilityBarChrome;
  actions?: AppShellActions;
  railMode: AppShellRailMode;
  onToggleRail: () => void;
  utilityPanels?: AppShellUtilityPanelSlots;
  onOpenCommand: () => void;
}) {
  const centerItems = useMemo(
    () =>
      utilityBar.metadata.zones
        .find((zone) => zone.id === "center")
        ?.items.filter((item) => item.visible !== false)
        .sort((a, b) => a.priority - b.priority),
    [utilityBar.metadata.zones],
  );

  return (
    <AppShellUtilityRuntimeProvider
      actions={actions}
      utilityBar={utilityBar}
      utilityPanels={utilityPanels}
    >
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
          <AppShellLeftUtilityRail />
        </div>
        <div className="af-appshell__utility-center">
          <Button
            className="af-appshell__command-trigger"
            data-icon="inline-start"
            onClick={onOpenCommand}
            size="sm"
            type="button"
            variant="outline"
          >
            <span>{centerItems?.[0]?.label ?? utilityBar.commandPlaceholder}</span>
            <Kbd>Ctrl K</Kbd>
          </Button>
        </div>
        <div className="af-appshell__utility-zone af-appshell__utility-zone--right">
          <AppShellUtilityBarConfigPopover />
          <AppShellRightUtilityRail />
        </div>
      </header>
    </AppShellUtilityRuntimeProvider>
  );
}
