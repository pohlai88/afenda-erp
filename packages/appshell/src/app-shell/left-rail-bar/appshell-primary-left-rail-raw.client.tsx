"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Suspense, useState } from "react";
import { usePathname } from "next/navigation";

import { Button } from "@afenda/ui";
import { cn } from "@afenda/ui/utils";

import type { AppShellPrimaryLeftRailNavItem } from "./appshell-primary-left-rail.schema";
import type { AppShellPrimaryLeftRailDisplayMode } from "./appshell-primary-left-rail.client";
import {
  APP_SHELL_PRIMARY_LEFT_RAIL_RAW_NAV_ICON_MAP,
  childItemsForNavItem,
  isAppShellPrimaryLeftRailNavItemActive,
  isChildNavItemActive,
} from "./appshell-primary-left-rail-raw.shared.client";

export function AppShellPrimaryLeftRailRaw({
  item,
  displayMode,
}: {
  item: AppShellPrimaryLeftRailNavItem;
  displayMode: AppShellPrimaryLeftRailDisplayMode;
}) {
  const compact = displayMode === "compact";
  const Icon = APP_SHELL_PRIMARY_LEFT_RAIL_RAW_NAV_ICON_MAP[item.icon];

  return (
    <Suspense
      fallback={
        <div className="af-appshell__nav-item">
          <Link
            className="af-appshell__nav-link"
            href={item.href}
            title={item.description}
          >
            <Icon aria-hidden="true" className="af-appshell__nav-icon" size={16} />
            {!compact ? (
              <span className="af-appshell__nav-copy">
                <span className="af-appshell__nav-label">{item.label}</span>
                {item.description ? (
                  <span className="af-appshell__nav-description">{item.description}</span>
                ) : null}
              </span>
            ) : null}
          </Link>
        </div>
      }
    >
      <AppShellPrimaryLeftRailRawInner displayMode={displayMode} item={item} />
    </Suspense>
  );
}

function AppShellPrimaryLeftRailRawInner({
  item,
  displayMode,
}: {
  item: AppShellPrimaryLeftRailNavItem;
  displayMode: AppShellPrimaryLeftRailDisplayMode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const Icon = APP_SHELL_PRIMARY_LEFT_RAIL_RAW_NAV_ICON_MAP[item.icon];
  const childItems = childItemsForNavItem(item);
  const compact = displayMode === "compact";
  const active =
    isAppShellPrimaryLeftRailNavItemActive(item, pathname) ||
    childItems.some((child) => isChildNavItemActive(child, pathname));

  return (
    <div className="af-appshell__nav-item">
      <div className="relative">
        <Link
          aria-current={active ? "page" : undefined}
          className={cn("af-appshell__nav-link", active && "is-active")}
          href={item.href}
          title={item.description}
        >
          <Icon aria-hidden="true" className="af-appshell__nav-icon" size={16} />
          <span className="af-appshell__nav-copy">
            <span className="af-appshell__nav-label">{item.label}</span>
            {item.description && !compact ? (
              <span className="af-appshell__nav-description">{item.description}</span>
            ) : null}
          </span>
          {item.badge ? (
            <span className="af-appshell__nav-badge" data-tone={item.badge.tone}>
              {item.badge.label}
            </span>
          ) : null}
        </Link>
        {childItems.length > 0 && !compact ? (
          <Button
            aria-label={open ? `Collapse ${item.label}` : `Expand ${item.label}`}
            className="af-appshell__nav-toggle"
            onClick={() => setOpen((current) => !current)}
            size="icon-xs"
            type="button"
            variant="ghost"
          >
            <ChevronRight
              aria-hidden="true"
              className={cn(open && "rotate-90")}
              size={14}
            />
          </Button>
        ) : null}
      </div>
      {childItems.length > 0 && open && !compact ? (
        <div className="af-appshell__nav-children">
          {childItems.map((child) => {
            const childActive = isChildNavItemActive(child, pathname);
            return (
              <Link
                aria-current={childActive ? "page" : undefined}
                className={cn(
                  "af-appshell__nav-child-link",
                  childActive && "is-active",
                )}
                href={child.href}
                key={child.id}
                title={child.description}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
