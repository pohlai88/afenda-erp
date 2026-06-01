"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@afenda/ui/utils";

import type { AppShellPrimaryLeftRailConfig } from "../left-rail-bar/appshell-primary-left-rail.schema";
import { isAppShellPrimaryLeftRailNavItemActive } from "../left-rail-bar/appshell-primary-left-rail-raw.shared.client";

export function AppShellSubLayoutLeftRail({
  rail,
}: {
  rail: AppShellPrimaryLeftRailConfig;
}) {
  const pathname = usePathname();

  return (
    <nav className="grid gap-4 p-3" aria-label={rail.labels.ariaLabel}>
      {rail.sections.map((section) => (
        <section className="grid gap-1" key={section.id}>
          {section.label ? (
            <div className="text-[11px] font-medium uppercase text-muted-foreground">
              {section.label}
            </div>
          ) : null}
          {section.items.map((item) => {
            const active = isAppShellPrimaryLeftRailNavItemActive(item, pathname);
            return (
              <Link
                className={cn(
                  "rounded-card px-2 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
                href={item.href}
                key={item.id}
              >
                {item.label}
              </Link>
            );
          })}
        </section>
      ))}
    </nav>
  );
}
