"use client";

import { AuthView } from "@neondatabase/auth-ui";

import type { NeonAuthUiAuthViewSlug } from "./aut-neon-auth-ui-routes-shared";

export type NeonAuthUiAuthPageProps = {
  view: NeonAuthUiAuthViewSlug;
};

/** Default Neon Auth UI auth page — `<AuthView path={…} />`. */
export function NeonAuthUiAuthPage({ view }: NeonAuthUiAuthPageProps) {
  return (
    <main className="neon-auth-ui-page flex w-full min-h-[50vh] items-center justify-center p-4">
      <AuthView path={view} />
    </main>
  );
}
