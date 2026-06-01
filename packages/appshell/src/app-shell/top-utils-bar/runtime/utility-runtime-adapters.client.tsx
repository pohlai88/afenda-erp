"use client";

import { CircleHelp, Settings } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Alert, AlertDescription, AlertTitle, Button } from "@afenda/ui";
import type { AppShellActions, AppShellUtilityPanelSlots } from "../../appshell-props.shared";
import type { AppShellUtilityBarChrome } from "../../appshell-props.shared";
import type {
  AppShellUtilityAdapterKey,
  AppShellUtilityItemMetadata,
} from "../metadata/utility-bar-metadata.shared";
import type { AppShellUtilityTemplateSurfaceKind } from "../metadata/utility-template.shared";
import { AppShellAccountDropdown } from "../identity/account-dropdown.client";
import { AppShellLauncher } from "../identity/app-launcher.client";
import { AppShellOrgSwitcher } from "../identity/org-switcher.client";
import { UtilityBarConnectivityPanel } from "../utilities/browser/connectivity-panel.client";
import { UtilityBarDiagnosisPanel } from "../utilities/browser/diagnosis-panel.client";
import { UtilityBarScreenshotPanel } from "../utilities/browser/screenshot-panel.client";
import { UtilityBarStoragePanel } from "../utilities/browser/storage-panel.client";
import { UtilityBarUploadPanel } from "../utilities/browser/upload-panel.client";
import { UtilityBarFeedbackPanel } from "../utilities/feature-adapters/feedback.client";
import { UtilityBarLynxPanel } from "../utilities/feature-adapters/lynx.client";
import { UtilityBarMessengerPanel } from "../utilities/feature-adapters/messenger.client";
import { AppShellNexusUtilityNotifications } from "../utilities/feature-adapters/notifications.client";
import { UtilityBarCoordinationPanel } from "../utilities/feature-adapters/coordination.client";
import { UtilityBarQuickCreatePanel } from "../utilities/feature-adapters/quick-create.client";
import { UtilityBarSystemAdminPanel } from "../utilities/feature-adapters/system-admin.client";
import { UtilityBarDensityPanel } from "../utilities/local/density-menu.client";
import { UtilityBarShortcutsPanel } from "../utilities/local/shortcuts-menu.client";
import { AppShellUtilityTriggerTooltip } from "../template/utility-trigger-tooltip.client";

export type AppShellUtilityRuntimeContext = {
  utilityBar: AppShellUtilityBarChrome;
  actions?: AppShellActions;
  utilityPanels?: AppShellUtilityPanelSlots;
};

export type AppShellUtilityRuntimeAdapter = {
  adapterKey: AppShellUtilityAdapterKey;
  surfaceKind: AppShellUtilityTemplateSurfaceKind;
  render: (
    item: AppShellUtilityItemMetadata,
    context: AppShellUtilityRuntimeContext,
  ) => ReactNode;
};

function UtilityUnavailableState({
  title,
}: {
  title: string;
}) {
  return (
    <Alert>
      <AlertTitle>{title} surface unavailable</AlertTitle>
      <AlertDescription>
        The shell runtime is ready, but the ERP app has not published a panel for this utility yet.
      </AlertDescription>
    </Alert>
  );
}

export const APP_SHELL_UTILITY_RUNTIME_ADAPTERS: readonly AppShellUtilityRuntimeAdapter[] =
  [
    {
      adapterKey: "org-switcher",
      surfaceKind: "dropdown",
      render: (_item, context) => (
        <AppShellOrgSwitcher
          action={context.actions?.switchOrganizationAction}
          organizations={context.utilityBar.organizations}
        />
      ),
    },
    {
      adapterKey: "app-launcher",
      surfaceKind: "popover",
      render: (_item, context) => <AppShellLauncher items={context.utilityBar.launcherItems} />,
    },
    {
      adapterKey: "density",
      surfaceKind: "dropdown",
      render: () => <UtilityBarDensityPanel />,
    },
    {
      adapterKey: "shortcuts",
      surfaceKind: "dropdown",
      render: () => <UtilityBarShortcutsPanel />,
    },
    {
      adapterKey: "connectivity",
      surfaceKind: "popover",
      render: () => <UtilityBarConnectivityPanel />,
    },
    {
      adapterKey: "storage",
      surfaceKind: "popover",
      render: () => <UtilityBarStoragePanel />,
    },
    {
      adapterKey: "diagnosis",
      surfaceKind: "popover",
      render: () => <UtilityBarDiagnosisPanel />,
    },
    {
      adapterKey: "upload",
      surfaceKind: "popover",
      render: (_item, context) => (
        <UtilityBarUploadPanel>{context.utilityPanels?.upload}</UtilityBarUploadPanel>
      ),
    },
    {
      adapterKey: "screenshot",
      surfaceKind: "popover",
      render: (_item, context) => (
        <UtilityBarScreenshotPanel>
          {context.utilityPanels?.screenshot}
        </UtilityBarScreenshotPanel>
      ),
    },
    {
      adapterKey: "lynx",
      surfaceKind: "popover",
      render: (_item, context) => (
        <UtilityBarLynxPanel>
          {context.utilityPanels?.lynx ?? (
            <UtilityUnavailableState title="Lynx" />
          )}
        </UtilityBarLynxPanel>
      ),
    },
    {
      adapterKey: "notifications",
      surfaceKind: "popover",
      render: (_item, context) => (
        <AppShellNexusUtilityNotifications>
          {context.utilityPanels?.notifications ?? (
            <UtilityUnavailableState title="Notifications" />
          )}
        </AppShellNexusUtilityNotifications>
      ),
    },
    {
      adapterKey: "messenger",
      surfaceKind: "popover",
      render: (_item, context) => (
        <UtilityBarMessengerPanel>
          {context.utilityPanels?.messenger ?? (
            <UtilityUnavailableState title="Messages" />
          )}
        </UtilityBarMessengerPanel>
      ),
    },
    {
      adapterKey: "coordination",
      surfaceKind: "popover",
      render: (_item, context) => (
        <UtilityBarCoordinationPanel>
          {context.utilityPanels?.coordination ?? (
            <UtilityUnavailableState title="Coordination" />
          )}
        </UtilityBarCoordinationPanel>
      ),
    },
    {
      adapterKey: "feedback",
      surfaceKind: "popover",
      render: (_item, context) => (
        <UtilityBarFeedbackPanel>
          {context.utilityPanels?.feedback ?? (
            <UtilityUnavailableState title="Feedback" />
          )}
        </UtilityBarFeedbackPanel>
      ),
    },
    {
      adapterKey: "system-admin",
      surfaceKind: "popover",
      render: (_item, context) => (
        <UtilityBarSystemAdminPanel>
          {context.utilityPanels?.["system-admin"] ?? (
            <UtilityUnavailableState title="System admin" />
          )}
        </UtilityBarSystemAdminPanel>
      ),
    },
    {
      adapterKey: "quick-create",
      surfaceKind: "popover",
      render: (_item, context) => (
        <UtilityBarQuickCreatePanel>
          {context.utilityPanels?.["quick-create"] ?? (
            <UtilityUnavailableState title="Quick create" />
          )}
        </UtilityBarQuickCreatePanel>
      ),
    },
    {
      adapterKey: "help",
      surfaceKind: "button",
      render: (item) =>
        item.href ? (
          <AppShellUtilityTriggerTooltip label={item.tooltip ?? item.label}>
            <Button
              aria-label={item.ariaLabel}
              asChild
              className="af-appshell__icon-button"
              size="icon-sm"
              variant="outline"
            >
              <Link href={item.href}>
                <CircleHelp aria-hidden="true" size={16} />
              </Link>
            </Button>
          </AppShellUtilityTriggerTooltip>
        ) : null,
    },
    {
      adapterKey: "settings",
      surfaceKind: "button",
      render: (item) =>
        item.href ? (
          <AppShellUtilityTriggerTooltip label={item.tooltip ?? item.label}>
            <Button
              aria-label={item.ariaLabel}
              asChild
              className="af-appshell__icon-button"
              size="icon-sm"
              variant="outline"
            >
              <Link href={item.href}>
                <Settings aria-hidden="true" size={16} />
              </Link>
            </Button>
          </AppShellUtilityTriggerTooltip>
        ) : null,
    },
    {
      adapterKey: "account",
      surfaceKind: "dropdown",
      render: (_item, context) => (
        <AppShellAccountDropdown
          account={context.utilityBar.account}
          signOutAction={context.actions?.signOutAction}
        />
      ),
    },
  ];

const ADAPTER_BY_KEY = new Map<AppShellUtilityAdapterKey, AppShellUtilityRuntimeAdapter>(
  APP_SHELL_UTILITY_RUNTIME_ADAPTERS.map((adapter) => [adapter.adapterKey, adapter]),
);

export function renderAppShellUtilityRuntimeItem(
  item: AppShellUtilityItemMetadata,
  context: AppShellUtilityRuntimeContext,
) {
  return ADAPTER_BY_KEY.get(item.adapterKey)?.render(item, context) ?? null;
}
