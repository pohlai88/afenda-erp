import type { AppShellAccountSummary } from "./app-appshell-props-shared";

export function accountDropdownPrimaryGroup(account: AppShellAccountSummary) {
  return [
    account.href
      ? {
          id: "profile",
          label: "Profile",
          href: account.href,
        }
      : null,
  ].filter(Boolean) as Array<{ id: string; label: string; href: string }>;
}
