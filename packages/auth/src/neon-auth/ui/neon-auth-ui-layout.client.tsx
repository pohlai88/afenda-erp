"use client";

import type { ReactNode } from "react";

import { NeonAuthUiProvider } from "./neon-auth-ui-provider.client";

/** Client layout shell — mount in `apps/erp/src/app/(auth)/layout.tsx` when wiring Neon UI. */
export function NeonAuthUiLayout({ children }: { children: ReactNode }) {
  return <NeonAuthUiProvider>{children}</NeonAuthUiProvider>;
}
