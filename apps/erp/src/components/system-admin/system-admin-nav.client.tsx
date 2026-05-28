"use client";

import { systemAdminRoutePaths } from "@afenda/feature-system-admin/client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: systemAdminRoutePaths.hub, label: "Hub", exact: true as const },
  { href: systemAdminRoutePaths.identity, label: "Identity" },
  { href: systemAdminRoutePaths.settings, label: "Settings" },
  { href: systemAdminRoutePaths.audit, label: "Audit" },
  { href: systemAdminRoutePaths.integrations, label: "Integrations" },
  { href: systemAdminRoutePaths.machineLayer, label: "Machine layer" },
  { href: systemAdminRoutePaths.reliability, label: "Reliability" },
  { href: systemAdminRoutePaths.billing, label: "Billing" },
] as const;

export function SystemAdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="System admin"
      className="flex flex-wrap gap-2 border-b border-line pb-4"
    >
      {navItems.map((item) => {
        const active =
          "exact" in item && item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              active
                ? "rounded-md border border-line bg-surface-strong px-3 py-1.5 text-sm font-medium text-foreground"
                : "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-surface-strong hover:text-foreground"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
