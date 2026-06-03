import "server-only";

import type { ReactNode } from "react";

import { AppShellClient } from "./app-client";
import {
  parseAppShellChrome,
  type AppShellActions,
  type AppShellChrome,
  type AppShellOverlaySlots,
  type AppShellUtilityPanelSlots,
} from "./app-appshell-props-shared";

export type AppShellProps = {
  chrome: AppShellChrome;
  actions?: AppShellActions;
  utilityPanels?: AppShellUtilityPanelSlots;
  overlays?: AppShellOverlaySlots;
  children: ReactNode;
};

export function AppShell({
  chrome,
  actions,
  utilityPanels,
  overlays,
  children,
}: AppShellProps) {
  return (
    <AppShellClient
      actions={actions}
      chrome={parseAppShellChrome(chrome)}
      overlays={overlays}
      utilityPanels={utilityPanels}
    >
      {children}
    </AppShellClient>
  );
}
