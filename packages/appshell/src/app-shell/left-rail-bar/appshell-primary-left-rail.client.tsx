"use client";

import { useMemo, useState } from "react";

import { Input } from "@afenda/ui";

import type { AppShellPrimaryLeftRailConfig } from "./appshell-primary-left-rail.schema";
import { filterAppShellPrimaryLeftRailNavSections } from "./appshell-primary-left-rail.shared";
import { AppShellPrimaryLeftRailRaw } from "./appshell-primary-left-rail-raw.client";
import { AppShellPrimaryLeftRailFooter } from "./appshell-primary-left-rail-footer.client";

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

  return (
    <>
      <div className="af-appshell__identity">
        <div className="af-appshell__identity-mark">{config.identity.initials}</div>
        <div className="af-appshell__identity-copy">
          <div className="af-appshell__identity-primary">{config.identity.primary}</div>
          {config.identity.secondary ? (
            <div className="af-appshell__identity-secondary">
              {config.identity.secondary}
            </div>
          ) : null}
        </div>
      </div>
      <div className="af-appshell__rail-search">
        <Input
          aria-label={config.labels.searchAriaLabel}
          className="bg-surface"
          onChange={(event) => setQuery(event.target.value)}
          placeholder={config.labels.searchPlaceholder}
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
      <div className="af-appshell__rail-footer">
        <AppShellPrimaryLeftRailFooter />
      </div>
    </>
  );
}
