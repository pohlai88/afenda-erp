"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import type { AppShellChrome } from "../contracts";
import { AppShellCommandCenter } from "../command-center/command-center.client";
import { AppShellPrimaryRail } from "../primary-rail/primary-rail.client";
import { AppShellUtilityBar } from "../utility-bar/utility-bar.client";

export interface AppShellClientProps {
  chrome: AppShellChrome;
  children: ReactNode;
}

export function AppShellClient({ chrome, children }: AppShellClientProps) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [railCollapsed, setRailCollapsed] = useState(false);
  const commandItems = useMemo(() => {
    const railItems = chrome.primaryRail.sections.flatMap((section) => section.items);
    const pinnedItems = chrome.primaryRail.pinned;
    const recentItems = chrome.primaryRail.recents;

    return [
      ...chrome.command.items,
      ...railItems.map((item) => ({
        id: `rail:${item.id}`,
        label: item.label,
        description: item.description,
        href: item.href,
        iconKey: item.iconKey,
        group: "Navigation",
        keywords: item.keywords,
      })),
      ...pinnedItems.map((item) => ({
        id: `pinned:${item.id}`,
        label: item.label,
        description: item.description,
        href: item.href,
        iconKey: item.iconKey,
        group: "Pinned",
        keywords: item.keywords,
      })),
      ...recentItems.map((item) => ({
        id: `recent:${item.id}`,
        label: item.label,
        description: item.description,
        href: item.href,
        iconKey: item.iconKey,
        group: "Recent",
        keywords: item.keywords,
      })),
    ];
  }, [chrome.command.items, chrome.primaryRail.pinned, chrome.primaryRail.recents, chrome.primaryRail.sections]);

  const openCommand = useCallback(() => setCommandOpen(true), []);
  const closeCommand = useCallback(() => setCommandOpen(false), []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((current) => !current);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      className="af-appshell"
      data-appshell="root"
      data-appshell-rail={railCollapsed ? "collapsed" : "expanded"}
      data-appshell-version={chrome.version}
    >
      <AppShellUtilityBar chrome={chrome} onCommandOpen={openCommand} />
      <div className="af-appshell__workspace">
        <AppShellPrimaryRail
          model={chrome.primaryRail}
          collapsed={railCollapsed}
          onCollapsedChange={setRailCollapsed}
        />
        <main className="af-appshell__main" data-appshell="main">
          {children}
        </main>
      </div>
      {chrome.overlays.commandCenter ? (
        <AppShellCommandCenter
          model={{ ...chrome.command, items: commandItems }}
          open={commandOpen}
          onOpenChange={setCommandOpen}
          onDismiss={closeCommand}
        />
      ) : null}
    </div>
  );
}
