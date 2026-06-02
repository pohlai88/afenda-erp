"use client";

import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@afenda/ui";

import type { AppShellAccountSummary } from "../../appshell-props.shared";
import { AppShellUtilityTriggerTooltip } from "../template/utility-trigger-tooltip.client";

export function AppShellAccountDropdown({
  account,
  signOutAction,
}: {
  account: AppShellAccountSummary;
  signOutAction?: () => Promise<void>;
}) {
  return (
    <DropdownMenu>
      <AppShellUtilityTriggerTooltip label={account.title}>
        <DropdownMenuTrigger asChild>
          <button
            aria-label={account.title}
            className={
              account.avatarSrc
                ? "af-appshell__account-avatar"
                : "af-appshell__brand"
            }
            type="button"
          >
            {account.avatarSrc ? (
              <img
                alt=""
                className="af-appshell__account-avatar-image"
                decoding="async"
                src={account.avatarSrc}
              />
            ) : (
              account.initials
            )}
          </button>
        </DropdownMenuTrigger>
      </AppShellUtilityTriggerTooltip>
      <DropdownMenuContent align="end" sideOffset={8}>
        <DropdownMenuLabel className="grid gap-1">
          <span className="font-medium">{account.title}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {account.email}
          </span>
          {account.subtitle ? (
            <span className="text-xs font-normal text-muted-foreground">
              {account.subtitle}
            </span>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {account.href ? (
            <DropdownMenuItem asChild>
              <Link href={account.href}>Profile</Link>
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <form action={signOutAction}>
          <DropdownMenuItem asChild variant="destructive">
            <button className="w-full justify-start" type="submit">
              Sign out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
