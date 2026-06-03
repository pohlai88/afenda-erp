"use client";

import { useEffect } from "react";

import { useUtilityBarStore } from "./app-utility-bar-store";

export function AppShellUtilityRailHydrator({
  utilityOrder,
}: {
  utilityOrder: readonly string[];
}) {
  const hydrateOrderFromPreference = useUtilityBarStore(
    (state) => state.hydrateOrderFromPreference,
  );

  useEffect(() => {
    if (utilityOrder.length > 0) {
      hydrateOrderFromPreference(utilityOrder);
    }
  }, [hydrateOrderFromPreference, utilityOrder]);

  return null;
}
