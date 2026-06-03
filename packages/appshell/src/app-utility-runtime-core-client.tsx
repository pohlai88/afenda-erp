"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import type { AppShellActions, AppShellUtilityPanelSlots } from "./app-appshell-props-shared";
import type { AppShellUtilityBarChrome } from "./app-appshell-props-shared";
import type { AppShellUtilityZoneId } from "./app-utility-bar-metadata-shared";
import { renderAppShellUtilityRuntimeItem } from "./app-utility-runtime-adapters-client";

export type AppShellUtilityRuntimeContextValue = {
  utilityBar: AppShellUtilityBarChrome;
  actions?: AppShellActions;
  utilityPanels?: AppShellUtilityPanelSlots;
};

const AppShellUtilityRuntimeContext =
  createContext<AppShellUtilityRuntimeContextValue | null>(null);

export function AppShellUtilityRuntimeProvider({
  utilityBar,
  actions,
  utilityPanels,
  children,
}: AppShellUtilityRuntimeContextValue & {
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({
      utilityBar,
      actions,
      utilityPanels,
    }),
    [actions, utilityBar, utilityPanels],
  );

  return (
    <AppShellUtilityRuntimeContext.Provider value={value}>
      {children}
    </AppShellUtilityRuntimeContext.Provider>
  );
}

export function useAppShellUtilityRuntimeContext() {
  const context = useContext(AppShellUtilityRuntimeContext);
  if (!context) {
    throw new Error(
      "useAppShellUtilityRuntimeContext must be used inside AppShellUtilityRuntimeProvider.",
    );
  }
  return context;
}

export function AppShellUtilityRuntimeItems({
  zoneId,
}: {
  zoneId: AppShellUtilityZoneId;
}) {
  const context = useAppShellUtilityRuntimeContext();
  const items = useMemo(
    () =>
      context.utilityBar.metadata.zones
        .find((zone) => zone.id === zoneId)
        ?.items.filter((item) => item.visible !== false)
        .sort((left, right) => left.priority - right.priority) ?? [],
    [context.utilityBar.metadata.zones, zoneId],
  );

  return items
    .filter((item) => item.adapterKey !== "account")
    .map((item) => (
      <span key={item.id}>{renderAppShellUtilityRuntimeItem(item, context)}</span>
    ));
}
