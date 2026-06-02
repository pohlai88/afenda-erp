"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { AppShellPrimaryLeftRailConfig } from "./appshell-primary-left-rail.schema";
import { filterAppShellPrimaryLeftRailNavSections } from "./appshell-primary-left-rail.shared";
import { AppShellPrimaryLeftRailRaw } from "./appshell-primary-left-rail-raw.client";

export type AppShellPrimaryLeftRailDisplayMode = "full" | "compact";

export function AppShellPrimaryLeftRail({
  config,
  displayMode,
}: {
  config: AppShellPrimaryLeftRailConfig;
  displayMode: AppShellPrimaryLeftRailDisplayMode;
}) {
  const [query, setQuery] = useState("");
  const sections = useMemo(
    () => filterAppShellPrimaryLeftRailNavSections(config.sections, query),
    [config.sections, query],
  );

  const identity = config.identity.href ? (
    <Link className="af-appshell__identity" href={config.identity.href}>
      <span className="af-appshell__identity-copy">
        <span className="af-appshell__identity-primary">{config.identity.primary}</span>
        {config.identity.secondary ? (
          <span className="af-appshell__identity-secondary">
            {config.identity.secondary}
          </span>
        ) : null}
      </span>
    </Link>
  ) : (
    <div className="af-appshell__identity">
      <span className="af-appshell__identity-copy">
        <span className="af-appshell__identity-primary">{config.identity.primary}</span>
        {config.identity.secondary ? (
          <span className="af-appshell__identity-secondary">
            {config.identity.secondary}
          </span>
        ) : null}
      </span>
    </div>
  );

  return (
    <>
      {identity}
      <div className="af-appshell__rail-search">
        <Search aria-hidden="true" className="af-appshell__rail-search-icon" size={14} />
        <input
          aria-label={config.labels.searchAriaLabel}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={config.labels.searchPlaceholder}
          spellCheck={false}
          type="search"
          value={query}
        />
      </div>
      <nav className="af-appshell__nav">
        {sections.length > 0 ? (
          sections.map((section) => (
            <section className="af-appshell__nav-section" key={section.id}>
              {section.label ? (
                <div className="af-appshell__nav-heading">{section.label}</div>
              ) : null}
              <div className="af-appshell__nav-list">
                {section.items.map((item) => (
                  <AppShellPrimaryLeftRailRaw
                    displayMode={displayMode}
                    item={item}
                    key={item.id}
                  />
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="af-appshell__rail-empty">{config.labels.emptyState}</div>
        )}
      </nav>
    </>
  );
}
