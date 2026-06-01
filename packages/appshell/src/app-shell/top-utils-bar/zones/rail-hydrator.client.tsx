"use client";

import { useEffect } from "react";

import { useAppShellRuntime } from "../../appshell.client";

export function AppShellUtilityRailHydrator({
  utilityOrder,
}: {
  utilityOrder: readonly string[];
}) {
  const runtime = useAppShellRuntime();

  useEffect(() => {
    if (utilityOrder.length > 0) {
      runtime.setUtilityOrder([...utilityOrder]);
    }
  }, [runtime, utilityOrder]);

  return null;
}
