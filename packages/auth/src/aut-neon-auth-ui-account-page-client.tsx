"use client";

import { AccountView } from "@neondatabase/auth-ui";

import type { NeonAuthUiAccountViewSlug } from "./aut-neon-auth-ui-routes-shared";

export type NeonAuthUiAccountPageProps = {
  view: NeonAuthUiAccountViewSlug;
};

/** Default Neon Auth UI account page — `<AccountView path={…} />`. */
export function NeonAuthUiAccountPage({ view }: NeonAuthUiAccountPageProps) {
  return (
    <main className="neon-auth-ui-page flex w-full min-h-[50vh] items-center justify-center p-4">
      <AccountView path={view} />
    </main>
  );
}
