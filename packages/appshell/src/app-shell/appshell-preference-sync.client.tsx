"use client";

import { useEffect, useRef } from "react";

import type { AppShellActions, AppShellPreferenceSnapshot } from "./appshell-props.shared";
import type { AppShellPreferenceUpdateInput } from "./appshell-props.shared";
import { useAppShellRuntime } from "./appshell.client";
import {
  areAppShellPreferenceUpdatesEqual,
  toAppShellPreferenceUpdate,
} from "./data/appshell-preferences.shared";

export function AppShellPreferenceSync({
  actions,
  preferences,
}: {
  actions?: AppShellActions;
  preferences: AppShellPreferenceSnapshot;
}) {
  const runtime = useAppShellRuntime();
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
    runtime.setUtilityOrder([...preferences.utilityOrder]);
    runtime.setCommandRecents([...preferences.commandRecents]);
    lastSavedRef.current = toAppShellPreferenceUpdate(preferences);
    hydratedRef.current = true;
  }, [preferences, runtime]);

  useEffect(() => {
    if (!actions?.persistPreferencesAction || !hydratedRef.current) {
      return;
    }

    const next: AppShellPreferenceUpdateInput = {
      railMode: runtime.railMode,
      density: runtime.density,
      utilityOrder: [...runtime.utilityOrder],
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
  }, [actions, runtime]);

  return null;
}
