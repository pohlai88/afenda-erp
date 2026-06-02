"use client";

import { useEffect, useRef } from "react";

import type { AppShellActions, AppShellPreferenceSnapshot } from "./appshell-props.shared";
import type { AppShellPreferenceUpdateInput } from "./appshell-props.shared";
import { useAppShellRuntime } from "./appshell.client";
import {
  areAppShellPreferenceUpdatesEqual,
} from "./data/appshell-preferences.shared";
import {
  selectAllItemsOrdered,
  useUtilityBarStore,
} from "../stores/utility-bar.store";

export function AppShellPreferenceSync({
  actions,
  preferences,
}: {
  actions?: AppShellActions;
  preferences: AppShellPreferenceSnapshot;
}) {
  const runtime = useAppShellRuntime();
  const utilityItems = useUtilityBarStore((state) => state.items);
  const hydrateUtilityOrder = useUtilityBarStore((state) => state.hydrateOrderFromPreference);
  const hydratedRef = useRef(false);
  const lastSavedRef = useRef<AppShellPreferenceUpdateInput | null>(null);

  useEffect(() => {
    if (hydratedRef.current) {
      return;
    }

    runtime.setRailMode(preferences.railMode);
    runtime.setDensity(
      preferences.density === "compact" ? "compact" : "comfortable",
    );
    hydrateUtilityOrder(preferences.utilityOrder);
    runtime.setCommandRecents([...preferences.commandRecents]);

    const hydratedUtilityOrder = selectAllItemsOrdered(
      useUtilityBarStore.getState().items,
    ).map((item) => item.id);

    lastSavedRef.current = {
      railMode: preferences.railMode,
      density: preferences.density,
      utilityOrder: hydratedUtilityOrder,
      commandRecents: [...preferences.commandRecents],
    };
    hydratedRef.current = true;
  }, [hydrateUtilityOrder, preferences, runtime]);

  useEffect(() => {
    if (!actions?.persistPreferencesAction || !hydratedRef.current) {
      return;
    }

    const utilityOrder = selectAllItemsOrdered(utilityItems).map((item) => item.id);
    const next: AppShellPreferenceUpdateInput = {
      railMode: runtime.railMode,
      density: runtime.density,
      utilityOrder,
      commandRecents: [...runtime.commandRecents],
    };

    if (
      lastSavedRef.current &&
      areAppShellPreferenceUpdatesEqual(lastSavedRef.current, next)
    ) {
      return;
    }

    const timeout = window.setTimeout(() => {
      lastSavedRef.current = next;
      void actions.persistPreferencesAction?.(next);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [actions, runtime.commandRecents, runtime.density, runtime.railMode, utilityItems]);

  return null;
}
