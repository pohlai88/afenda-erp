"use client";

import { ChevronsUpDown } from "lucide-react";
import { Suspense } from "react";
import { usePathname } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@afenda/ui";

import { AppShellUtilityTriggerTooltip } from "./app-utility-trigger-tooltip-client";
import type { AppShellOrganizationOption } from "./app-appshell-props-shared";

export function AppShellOrgSwitcher({
  organizations,
  action,
}: {
  organizations: readonly AppShellOrganizationOption[];
  action?: (formData: FormData) => Promise<void>;
}) {
  const activeOrganization =
    organizations.find((organization) => organization.active) ??
    organizations[0] ??
    null;

  if (!activeOrganization) {
    return null;
  }

  return (
    <DropdownMenu>
      <AppShellUtilityTriggerTooltip label="Switch organization">
        <DropdownMenuTrigger asChild>
          <button
            aria-label="Switch organization"
            className="af-appshell__org-switcher"
            type="button"
          >
            <span className="af-appshell__org-copy">
              <strong>{activeOrganization.name}</strong>
              <span>
                {activeOrganization.role} · {activeOrganization.slug}
              </span>
            </span>
            <ChevronsUpDown
              aria-hidden="true"
              className="af-appshell__org-chevron"
              size={14}
            />
          </button>
        </DropdownMenuTrigger>
      </AppShellUtilityTriggerTooltip>
      <DropdownMenuContent align="start" sideOffset={8}>
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Suspense fallback={null}>
          <AppShellOrgSwitcherItems action={action} organizations={organizations} />
        </Suspense>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AppShellOrgSwitcherItems({
  organizations,
  action,
}: {
  organizations: readonly AppShellOrganizationOption[];
  action?: (formData: FormData) => Promise<void>;
}) {
  const pathname = usePathname();

  return organizations.map((organization) => (
    <form action={action} key={organization.id}>
      <input name="organizationId" type="hidden" value={organization.id} />
      <input name="returnTo" type="hidden" value={pathname} />
      <DropdownMenuItem asChild>
        <button
          className="w-full justify-between"
          disabled={organization.active}
          type="submit"
        >
          <span className="flex flex-col items-start">
            <span>{organization.name}</span>
            <span className="text-xs text-muted-foreground">
              {organization.role}
            </span>
          </span>
          {organization.active ? (
            <span className="text-xs text-muted-foreground">Active</span>
          ) : null}
        </button>
      </DropdownMenuItem>
    </form>
  ));
}
