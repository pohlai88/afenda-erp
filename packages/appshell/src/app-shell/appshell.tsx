import "server-only";

import type { ReactNode } from "react";

import { AppShellClient } from "./appshell.client";
import {
  parseAppShellChrome,
  type AppShellActions,
  type AppShellChrome,
  type AppShellUtilityPanelSlots,
} from "./appshell-props.shared";

export type AppShellProps = {
  chrome: AppShellChrome;
  actions?: AppShellActions;
  utilityPanels?: AppShellUtilityPanelSlots;
  children: ReactNode;
};

export function AppShell({
  chrome,
  actions,
  utilityPanels,
  children,
}: AppShellProps) {
  return (
    <AppShellClient
      actions={actions}
      chrome={parseAppShellChrome(chrome)}
      utilityPanels={utilityPanels}
    >
      {children}
    </AppShellClient>
  );
}
