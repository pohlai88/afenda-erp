"use client";

import { useMemo, type ReactNode } from "react";
import {
  Bell,
  CircleHelp,
  Database,
  FileUp,
  Keyboard,
  MessageSquare,
  PenLine,
  ScanSearch,
  Settings,
  Sparkles,
  Wifi,
} from "lucide-react";
import Link from "next/link";

import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@afenda/ui";

import type { AppShellActions, AppShellUtilityPanelSlots } from "../../appshell-props.shared";
import type { AppShellUtilityBarChrome } from "../../appshell-props.shared";
import { AppShellAccountDropdown } from "../identity/account-dropdown.client";
import { AppShellLauncher } from "../identity/app-launcher.client";
import { AppShellOrgSwitcher } from "../identity/org-switcher.client";
import { AppShellUtilityPanel } from "../template/utility-panel.client";
import { AppShellUtilityTriggerTooltip } from "../template/utility-trigger-tooltip.client";

export type AppShellUtilityRuntimeCallbacks = {
  density: "comfortable" | "compact";
  onDensityChange: (density: "comfortable" | "compact") => void;
};

export function AppShellUtilityRuntimeItems({
  utilityBar,
  actions,
  utilityPanels,
  callbacks,
}: {
  utilityBar: AppShellUtilityBarChrome;
  actions?: AppShellActions;
  utilityPanels?: AppShellUtilityPanelSlots;
  callbacks: AppShellUtilityRuntimeCallbacks;
}) {
  const items = useMemo(
    () =>
      utilityBar.metadata.zones
        .flatMap((zone) => zone.items)
        .filter((item) => item.visible !== false)
        .sort((a, b) => a.priority - b.priority),
    [utilityBar.metadata.zones],
  );

  return items.map((item) => {
    switch (item.adapterKey) {
      case "org-switcher":
        return (
          <AppShellOrgSwitcher
            action={actions?.switchOrganizationAction}
            key={item.id}
            organizations={utilityBar.organizations}
          />
        );
      case "app-launcher":
        return <AppShellLauncher items={utilityBar.launcherItems} key={item.id} />;
      case "density":
        return (
          <UtilityPopover
            description={item.description}
            icon={<Settings aria-hidden="true" size={16} />}
            key={item.id}
            label={item.label}
            title={item.label}
          >
            <div className="flex gap-2">
              <Button
                onClick={() => callbacks.onDensityChange("comfortable")}
                size="sm"
                type="button"
                variant={
                  callbacks.density === "comfortable" ? "default" : "outline"
                }
              >
                Comfortable
              </Button>
              <Button
                onClick={() => callbacks.onDensityChange("compact")}
                size="sm"
                type="button"
                variant={callbacks.density === "compact" ? "default" : "outline"}
              >
                Compact
              </Button>
            </div>
          </UtilityPopover>
        );
      case "shortcuts":
        return (
          <UtilityPopover
            description={item.description}
            icon={<Keyboard aria-hidden="true" size={16} />}
            key={item.id}
            label={item.label}
            title={item.label}
          >
            <ShortcutList />
          </UtilityPopover>
        );
      case "connectivity":
        return (
          <UtilityPopover
            description={item.description}
            icon={<Wifi aria-hidden="true" size={16} />}
            key={item.id}
            label={item.label}
            title={item.label}
          >
            <div className="text-sm text-muted-foreground">
              Browser connectivity diagnostics stay local to the operator session.
            </div>
          </UtilityPopover>
        );
      case "storage":
        return (
          <UtilityPopover
            description={item.description}
            icon={<Database aria-hidden="true" size={16} />}
            key={item.id}
            label={item.label}
            title={item.label}
          >
            <div className="text-sm text-muted-foreground">
              Browser cache, cookies, and storage inspection can be attached here.
            </div>
          </UtilityPopover>
        );
      case "upload":
        return (
          <UtilityPopover
            description={item.description}
            icon={<FileUp aria-hidden="true" size={16} />}
            key={item.id}
            label={item.label}
            title={item.label}
          >
            {utilityPanels?.upload ?? (
              <div className="text-sm text-muted-foreground">
                Upload flows are wired from the ERP app where route ownership lives.
              </div>
            )}
          </UtilityPopover>
        );
      case "screenshot":
        return (
          <UtilityPopover
            description={item.description}
            icon={<ScanSearch aria-hidden="true" size={16} />}
            key={item.id}
            label={item.label}
            title={item.label}
          >
            {utilityPanels?.screenshot ?? (
              <div className="text-sm text-muted-foreground">
                Screenshot capture is available through the browser integration layer.
              </div>
            )}
          </UtilityPopover>
        );
      case "diagnosis":
        return (
          <UtilityPopover
            description={item.description}
            icon={<CircleHelp aria-hidden="true" size={16} />}
            key={item.id}
            label={item.label}
            title={item.label}
          >
            <div className="text-sm text-muted-foreground">
              Diagnostics panels can surface cache, network, and route state here.
            </div>
          </UtilityPopover>
        );
      case "lynx":
      case "notifications":
      case "feedback":
      case "system-admin":
      case "quick-create":
        return (
          <UtilityPopover
            description={item.description}
            icon={featureIconForAdapter(item.adapterKey)}
            key={item.id}
            label={item.label}
            title={item.label}
          >
            {utilityPanels?.[item.adapterKey] ?? (
              <div className="text-sm text-muted-foreground">
                No ERP panel is published for this utility yet.
              </div>
            )}
          </UtilityPopover>
        );
      case "help":
      case "settings":
        if (item.href) {
          return (
            <AppShellUtilityTriggerTooltip key={item.id} label={item.label}>
              <Link
                aria-label={item.ariaLabel}
                className="af-appshell__icon-button"
                href={item.href}
                title={item.tooltip ?? item.description ?? item.label}
              >
                {item.adapterKey === "help" ? (
                  <CircleHelp aria-hidden="true" size={16} />
                ) : (
                  <Settings aria-hidden="true" size={16} />
                )}
              </Link>
            </AppShellUtilityTriggerTooltip>
          );
        }
        return null;
      case "account":
        return (
          <AppShellAccountDropdown
            account={utilityBar.account}
            key={item.id}
            signOutAction={actions?.signOutAction}
          />
        );
      default:
        return null;
    }
  });
}

function UtilityPopover({
  label,
  title,
  description,
  icon,
  children,
}: {
  label: string;
  title: string;
  description?: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Popover>
      <AppShellUtilityTriggerTooltip label={label}>
        <PopoverTrigger asChild>
          <button aria-label={label} className="af-appshell__icon-button" type="button">
            {icon}
          </button>
        </PopoverTrigger>
      </AppShellUtilityTriggerTooltip>
      <PopoverContent align="end" className="w-80">
        <AppShellUtilityPanel description={description} title={title}>
          {children}
        </AppShellUtilityPanel>
      </PopoverContent>
    </Popover>
  );
}

function ShortcutList() {
  return (
    <div className="grid gap-2">
      <ShortcutRow command="Open command center" shortcut="Ctrl K" />
      <ShortcutRow command="Toggle primary rail" shortcut="Alt [" />
      <ShortcutRow command="Focus workspace canvas" shortcut="Shift Esc" />
    </div>
  );
}

function ShortcutRow({
  command,
  shortcut,
}: {
  command: string;
  shortcut: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span>{command}</span>
      <kbd>{shortcut}</kbd>
    </div>
  );
}

function featureIconForAdapter(adapterKey: string) {
  switch (adapterKey) {
    case "lynx":
      return <Sparkles aria-hidden="true" size={16} />;
    case "notifications":
      return <Bell aria-hidden="true" size={16} />;
    case "feedback":
      return <PenLine aria-hidden="true" size={16} />;
    case "system-admin":
      return <Settings aria-hidden="true" size={16} />;
    case "quick-create":
      return <MessageSquare aria-hidden="true" size={16} />;
    default:
      return <CircleHelp aria-hidden="true" size={16} />;
  }
}
