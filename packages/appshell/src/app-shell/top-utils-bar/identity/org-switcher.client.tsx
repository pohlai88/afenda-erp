"use client";

import { ChevronsUpDown } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@afenda/ui";

import { AppShellUtilityTriggerTooltip } from "../template/utility-trigger-tooltip.client";
import type { AppShellOrganizationOption } from "../../appshell-props.shared";

export function AppShellOrgSwitcher({
  organizations,
  action,
}: {
  organizations: readonly AppShellOrganizationOption[];
  action?: (formData: FormData) => Promise<void>;
}) {
  const pathname = usePathname();
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
          <Button
            aria-label="Switch organization"
            className="af-appshell__icon-button"
            size="icon-sm"
            type="button"
            variant="outline"
          >
            <ChevronsUpDown aria-hidden="true" size={16} />
          </Button>
        </DropdownMenuTrigger>
      </AppShellUtilityTriggerTooltip>
      <DropdownMenuContent align="start" sideOffset={8}>
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((organization) => (
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
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
