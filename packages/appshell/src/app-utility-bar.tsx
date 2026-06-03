"use client";

import Link from "next/link";

import type {
  AppShellActions,
  AppShellRailMode,
  AppShellUtilityPanelSlots,
  AppShellUtilityBarChrome,
} from "./app-appshell-props-shared";
import { AppShellCommandCenterTrigger } from "./app-command-center-trigger-client";
import { AppShellRailTrigger } from "./app-rail-trigger-client";
import { AppShellAccountDropdown } from "./app-account-dropdown-client";
import { AppShellUtilityBarConfigPopover } from "./app-utility-config-popover-client";
import { AppShellLeftUtilityRail } from "./app-left-utility-rail-client";
import { AppShellRightUtilityRail } from "./app-right-utility-rail-client";
import { AppShellUtilityRuntimeProvider } from "./app-utility-runtime-core-client";

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
  return (
    <AppShellUtilityRuntimeProvider
      actions={actions}
      utilityBar={utilityBar}
      utilityPanels={utilityPanels}
    >
      <header className="af-appshell__utility" aria-label="Workspace utilities">
        <div className="af-appshell__utility-zone">
          <AppShellRailTrigger
            label={
              railMode === "collapsed" || railMode === "hover"
                ? "Expand navigation rail"
                : "Collapse navigation rail"
            }
            onToggle={onToggleRail}
            railMode={railMode}
          />
          <Link
            aria-label="Afenda home"
            className="af-appshell__brand"
            href={utilityBar.brandHomeHref}
          >
            {utilityBar.brandIconSrc ? (
              <img
                alt=""
                className="af-appshell__brand-icon"
                height={30}
                src={utilityBar.brandIconSrc}
                width={30}
              />
            ) : (
              "A"
            )}
          </Link>
          <AppShellLeftUtilityRail />
        </div>
        <div className="af-appshell__utility-center">
          <AppShellCommandCenterTrigger
            onOpen={onOpenCommand}
            placeholder={utilityBar.commandPlaceholder}
          />
        </div>
        <div className="af-appshell__utility-zone af-appshell__utility-zone--right">
          <div className="af-appshell__utility-scroll">
            <AppShellRightUtilityRail />
          </div>
          <AppShellUtilityBarConfigPopover />
          <AppShellAccountDropdown
            account={utilityBar.account}
            signOutAction={actions?.signOutAction}
          />
        </div>
      </header>
    </AppShellUtilityRuntimeProvider>
  );
}
