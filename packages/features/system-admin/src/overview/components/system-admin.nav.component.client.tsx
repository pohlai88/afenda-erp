"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SystemAdminNavItemProps = {
  href: string;
  label: string;
  exact?: boolean;
};

export function SystemAdminNav({
  items,
}: {
  items: readonly SystemAdminNavItemProps[];
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="System admin"
      className="flex flex-wrap gap-2 border-b border-line pb-surface-lg"
    >
      {items.map((item) => {
        const active =
          item.exact === true
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              active
                ? "rounded-control border border-line bg-surface-strong px-3 py-1.5 type-control font-medium text-foreground"
                : "rounded-control px-3 py-1.5 type-control text-muted-foreground transition hover:bg-surface-strong hover:text-foreground"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
