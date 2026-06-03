import "server-only";

import { connection } from "next/server";
import type { ReactNode } from "react";

import { isNeonAuthUiReady } from "../runtime/neon-auth.server";
import { NeonAuthUiNotReadyPanel } from "./neon-auth-ui-not-ready-panel.server";

export type NeonAuthUiPageGateProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

/** Server gate — render Neon UI pages only when Neon Auth + public UI flag are ready. */
export async function NeonAuthUiPageGate({
  children,
  fallback = <NeonAuthUiNotReadyPanel />,
}: NeonAuthUiPageGateProps) {
  await connection();
  return isNeonAuthUiReady() ? children : fallback;
}
