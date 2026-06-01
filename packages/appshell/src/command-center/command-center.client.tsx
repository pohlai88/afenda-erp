"use client";

import { useMemo, useState } from "react";

import type { AppShellCommandItem, AppShellCommandModel } from "../contracts";

export interface AppShellCommandCenterProps {
  model: AppShellCommandModel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDismiss: () => void;
}

function CommandItem({ item }: { item: AppShellCommandItem }) {
  const content = (
    <>
      <span className="af-appshell__command-item-title">{item.label}</span>
      {item.description ? <span className="af-appshell__command-item-description">{item.description}</span> : null}
      {item.shortcut ? <kbd>{item.shortcut}</kbd> : null}
    </>
  );

  if (item.href) {
    return (
      <a className="af-appshell__command-item" href={item.href}>
        {content}
      </a>
    );
  }

  return <span className="af-appshell__command-item">{content}</span>;
}

export function AppShellCommandCenter({
  model,
  open,
  onOpenChange,
  onDismiss,
}: AppShellCommandCenterProps) {
  const [query, setQuery] = useState("");
  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery.length === 0) {
      return model.items;
    }

    return model.items.filter((item) => {
      const haystack = [item.label, item.description, item.group, ...item.keywords]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [model.items, query]);

  if (!open) {
    return null;
  }

  return (
    <div className="af-appshell__command-layer" data-appshell="command-center">
      <button
        aria-label="Close AppShell command center"
        className="af-appshell__command-backdrop"
        onClick={() => {
          onOpenChange(false);
          onDismiss();
        }}
        type="button"
      />
      <section aria-label="AppShell command center" className="af-appshell__command-panel">
        <input
          autoFocus
          className="af-appshell__command-input"
          onChange={(event) => setQuery(event.target.value)}
          placeholder={model.placeholder}
          value={query}
        />
        <div className="af-appshell__command-results">
          {visibleItems.length > 0 ? (
            visibleItems.map((item) => <CommandItem item={item} key={item.id} />)
          ) : (
            <p>{model.emptyLabel}</p>
          )}
        </div>
      </section>
    </div>
  );
}
