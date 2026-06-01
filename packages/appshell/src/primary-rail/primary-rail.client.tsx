"use client";

import { cn } from "@afenda/ui/utils";

import type {
  AppShellActionQueueItem,
  AppShellNavItem,
  AppShellPrimaryRailModel,
} from "../contracts";

export interface AppShellPrimaryRailProps {
  model: AppShellPrimaryRailModel;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

function RailItem({ item, compact }: { item: AppShellNavItem; compact: boolean }) {
  return (
    <a className={cn("af-appshell__rail-item", compact && "af-appshell__rail-item--compact")} href={item.href}>
      <span aria-hidden="true" className="af-appshell__rail-icon">
        {item.iconKey?.slice(0, 2).toUpperCase() ?? item.label.slice(0, 1).toUpperCase()}
      </span>
      {!compact ? (
        <span className="af-appshell__rail-label">
          <span>{item.label}</span>
          {item.badge ? <span className="af-appshell__badge">{item.badge.label}</span> : null}
        </span>
      ) : null}
    </a>
  );
}

function QueueItem({ item, compact }: { item: AppShellActionQueueItem; compact: boolean }) {
  const content = (
    <>
      <span aria-hidden="true" className="af-appshell__queue-dot" data-tone={item.tone} />
      {!compact ? (
        <span className="af-appshell__queue-label">
          <span>{item.label}</span>
          {typeof item.count === "number" ? <span className="af-appshell__count">{item.count}</span> : null}
        </span>
      ) : null}
    </>
  );

  if (item.href) {
    return (
      <a className="af-appshell__queue-item" href={item.href} title={item.description}>
        {content}
      </a>
    );
  }

  return (
    <span className="af-appshell__queue-item" title={item.description}>
      {content}
    </span>
  );
}

export function AppShellPrimaryRail({ model, collapsed, onCollapsedChange }: AppShellPrimaryRailProps) {
  return (
    <aside
      className={cn("af-appshell__primary-rail", collapsed && "af-appshell__primary-rail--collapsed")}
      data-appshell="primary-rail"
    >
      <div className="af-appshell__rail-header">
        {!collapsed ? <strong>{model.workspaceLabel}</strong> : null}
        <button
          aria-label={collapsed ? model.collapsedLabel : model.expandedLabel}
          className="af-appshell__rail-toggle"
          onClick={() => onCollapsedChange(!collapsed)}
          type="button"
        >
          {collapsed ? ">" : "<"}
        </button>
      </div>
      <nav className="af-appshell__rail-nav" aria-label="AppShell navigation">
        {model.pinned.length > 0 ? (
          <section className="af-appshell__rail-section" aria-label="Pinned">
            {model.pinned.map((item) => (
              <RailItem compact={collapsed} item={item} key={item.id} />
            ))}
          </section>
        ) : null}
        {model.sections.map((section) => (
          <section className="af-appshell__rail-section" aria-label={section.label} key={section.id}>
            {!collapsed ? <h2>{section.label}</h2> : null}
            {section.items.map((item) => (
              <RailItem compact={collapsed} item={item} key={item.id} />
            ))}
          </section>
        ))}
      </nav>
      {model.actionQueue.length > 0 ? (
        <div className="af-appshell__queue" aria-label="Action queue">
          {model.actionQueue.map((item) => (
            <QueueItem compact={collapsed} item={item} key={item.id} />
          ))}
        </div>
      ) : null}
    </aside>
  );
}
