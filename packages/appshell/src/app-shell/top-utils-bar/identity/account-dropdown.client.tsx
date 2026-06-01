"use client";

import Link from "next/link";

import {
  Avatar,
  AvatarFallback,
  Button,
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
          <Button
            aria-label={account.title}
            className="af-appshell__account-button"
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <Avatar className="size-8">
              <AvatarFallback>{account.initials}</AvatarFallback>
            </Avatar>
          </Button>
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
