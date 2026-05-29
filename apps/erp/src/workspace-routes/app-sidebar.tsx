"use client";

import type { ErpModuleDefinition, NavigationExtension } from "@afenda/kernel";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@afenda/ui/sidebar";
import { cn } from "@afenda/ui/utils";

function NavItem({
  href,
  label,
  description,
  statusLabel,
  isActive,
}: {
  href: string;
  label: string;
  description: string;
  statusLabel: string;
  isActive: boolean;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} size="lg">
        <Link href={href}>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
            <span className="truncate font-semibold">{label}</span>
            <span
              className={cn(
                "truncate text-xs leading-5 font-normal",
                isActive ? "text-sidebar-accent-foreground/80" : "text-muted-foreground",
              )}
            >
              {description}
            </span>
          </span>
        </Link>
      </SidebarMenuButton>
      <SidebarMenuBadge>{statusLabel}</SidebarMenuBadge>
    </SidebarMenuItem>
  );
}

export function AppSidebar({
  modules,
  extensions = [],
}: {
  modules: readonly ErpModuleDefinition[];
  extensions?: readonly NavigationExtension[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {modules.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <NavItem
                key={item.href}
                description={item.description}
                href={item.href}
                isActive={isActive}
                label={item.navigationLabel}
                statusLabel={item.status.label}
              />
            );
          })}
          {extensions.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <NavItem
                key={item.id}
                description={item.description}
                href={item.href}
                isActive={isActive}
                label={item.label}
                statusLabel={item.status.label}
              />
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
