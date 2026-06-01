"use client";

import { cn } from "@afenda/ui/utils";

import type { AppShellChrome, AppShellUtilityItem } from "../contracts";

export interface AppShellUtilityBarProps {
  chrome: AppShellChrome;
  onCommandOpen: () => void;
}

function UtilityItem({ item }: { item: AppShellUtilityItem }) {
  const content = (
    <>
      <span aria-hidden="true" className="af-appshell__utility-icon">
        {item.iconKey?.slice(0, 2).toUpperCase() ?? item.label.slice(0, 1).toUpperCase()}
      </span>
      <span className="af-appshell__utility-label">{item.label}</span>
      {item.badge ? <span className="af-appshell__badge">{item.badge.label}</span> : null}
    </>
  );

  if (item.href) {
    return (
      <a className="af-appshell__utility-item" href={item.href} title={item.description}>
        {content}
      </a>
    );
  }

  return (
    <span className="af-appshell__utility-item" title={item.description}>
      {content}
    </span>
  );
}

export function AppShellUtilityBar({ chrome, onCommandOpen }: AppShellUtilityBarProps) {
  return (
    <header className="af-appshell__utility-bar" data-appshell="utility-bar">
      <div className="af-appshell__utility-zone af-appshell__utility-zone--left">
        {chrome.utilityBar.left.map((item) => (
          <UtilityItem item={item} key={item.id} />
        ))}
      </div>
      <div className="af-appshell__utility-zone af-appshell__utility-zone--center">
        <button
          className={cn("af-appshell__command-trigger", "af-appshell__command-trigger--centered")}
          onClick={onCommandOpen}
          type="button"
        >
          <span>{chrome.utilityBar.commandTriggerLabel}</span>
          <kbd>Ctrl K</kbd>
        </button>
      </div>
      <div className="af-appshell__utility-zone af-appshell__utility-zone--right">
        {chrome.utilityBar.right.map((item) => (
          <UtilityItem item={item} key={item.id} />
        ))}
      </div>
    </header>
  );
}
