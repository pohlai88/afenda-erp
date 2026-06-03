"use client";

import { NeonAuthUIProvider } from "@neondatabase/auth-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { neonAuthClient } from "../runtime/neon-auth.client";
import { resolveNeonAuthUiProviderOptions } from "./neon-auth-ui.config.shared";

export type NeonAuthUiProviderProps = {
  children: ReactNode;
};

/** Wrap ERP `(auth)` / account routes — required for `@neondatabase/auth-ui` components. */
export function NeonAuthUiProvider({ children }: NeonAuthUiProviderProps) {
  const router = useRouter();
  const options = resolveNeonAuthUiProviderOptions();

  return (
    <NeonAuthUIProvider
      authClient={neonAuthClient}
      Link={Link}
      navigate={(href) => router.push(href)}
      {...options}
    >
      {children}
    </NeonAuthUIProvider>
  );
}
