"use client";

import { Fragment, useDeferredValue, useEffect, useMemo, useState } from "react";
import { ArrowRight, SearchX } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Badge,
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Kbd,
  KbdGroup,
} from "@afenda/ui";
import { cn } from "@afenda/ui/utils";

import {
  appShellCommandSearchText,
  type AppShellCommandItem,
  type AppShellCommandKind,
  type AppShellCommandSection,
} from "../../appshell-props.shared";
import { APP_SHELL_PRIMARY_LEFT_RAIL_RAW_NAV_ICON_MAP } from "../../left-rail-bar/appshell-primary-left-rail-raw.shared.client";
import type { AppShellOperationalContextEntry } from "../../operational-context-stack.shared";

const COMMAND_KIND_LABELS: Record<AppShellCommandKind, string> = {
  navigation: "Navigate",
  create: "Create",
  inspect: "Inspect",
  workflow: "Workflow",
  context: "Context",
};

type CommandPaletteProps = {
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  commands: readonly AppShellCommandSection[];
  contextEntries: readonly AppShellOperationalContextEntry[];
  recentIds: readonly string[];
  onSelectCommand: (id: string) => void;
};

function buildRecentItems(
  commands: readonly AppShellCommandSection[],
  recentIds: readonly string[],
) {
  const commandsById = new Map(
    commands.flatMap((section) => section.items.map((item) => [item.id, item])),
  );

  return recentIds
    .map((id) => commandsById.get(id))
    .filter((item): item is AppShellCommandItem => Boolean(item));
}

function buildContextItems(contextEntries: readonly AppShellOperationalContextEntry[]) {
  return contextEntries
    .filter((entry) => entry.href)
    .map<AppShellCommandItem>((entry) => ({
      id: `context.${entry.level}.${entry.id}`,
      label: entry.label,
      description: entry.description ?? entry.meta ?? entry.level,
      href: entry.href,
      kind: "context",
      keywords: [entry.level, entry.meta ?? ""],
      icon: "scan-search",
    }));
}

function filterCommandItems(
  items: readonly AppShellCommandItem[],
  normalizedQuery: string,
) {
  if (!normalizedQuery) {
    return items;
  }

  return items.filter((item) =>
    appShellCommandSearchText(item).includes(normalizedQuery),
  );
}

function filterCommandSections(
  sections: readonly AppShellCommandSection[],
  normalizedQuery: string,
) {
  if (!normalizedQuery) {
    return sections;
  }

  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        appShellCommandSearchText(item).includes(normalizedQuery),
      ),
    }))
    .filter((section) => section.items.length > 0);
}

export function CommandPalette({
  commandOpen,
  setCommandOpen,
  commands,
  contextEntries,
  recentIds,
  onSelectCommand,
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const showRecent = normalizedQuery.length === 0;

  useEffect(() => {
    if (!commandOpen) {
      setQuery("");
    }
  }, [commandOpen]);

  const contextItems = useMemo(
    () => buildContextItems(contextEntries),
    [contextEntries],
  );
  const filteredContextItems = useMemo(
    () => filterCommandItems(contextItems, normalizedQuery),
    [contextItems, normalizedQuery],
  );
  const filteredSections = useMemo(
    () => filterCommandSections(commands, normalizedQuery),
    [commands, normalizedQuery],
  );

  const recentItems = useMemo(() => {
    if (!showRecent) {
      return [];
    }

    const contextIds = new Set(contextItems.map((item) => item.id));
    return buildRecentItems(commands, recentIds).filter(
      (item) => !contextIds.has(item.id),
    );
  }, [commands, contextItems, recentIds, showRecent]);

  const visibleSections = useMemo(() => {
    const recentIdSet = new Set(recentItems.map((item) => item.id));

    return filteredSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => !recentIdSet.has(item.id)),
      }))
      .filter((section) => section.items.length > 0);
  }, [filteredSections, recentItems]);

  const hasVisibleResults =
    recentItems.length > 0 ||
    filteredContextItems.length > 0 ||
    visibleSections.length > 0;

  const handleSelect = (item: AppShellCommandItem) => {
    if (item.disabledReason) {
      return;
    }

    onSelectCommand(item.id);
    setCommandOpen(false);

    if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <CommandDialog
      description="Search workspace commands, routes, and current context."
      onOpenChange={setCommandOpen}
      open={commandOpen}
      showCloseButton={false}
      title="Workspace command center"
    >
      <Command
        className="flex flex-col overflow-hidden rounded-none border-0 bg-transparent p-0 shadow-none"
        label="Workspace command center"
        loop
        shouldFilter={false}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border/50 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              Workspace command center
            </p>
            <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">
              Search workspace commands, routes, and current context.
            </p>
          </div>
          <KbdGroup aria-hidden className="hidden shrink-0 gap-1 sm:flex">
            <Kbd>⌘ K</Kbd>
          </KbdGroup>
        </div>

        <CommandInput
          onValueChange={setQuery}
          placeholder="Find navigation, tools, and current context"
          value={query}
        />

        {contextEntries.length > 0 ? (
          <div
            aria-label="Current context"
            className="flex shrink-0 items-center gap-1.5 border-b border-border/45 px-3 py-2 text-xs text-muted-foreground"
          >
            {contextEntries.map((entry, index) => (
              <Fragment key={`${entry.level}-${entry.id}`}>
                {index > 0 ? (
                  <span aria-hidden className="text-border">
                    /
                  </span>
                ) : null}
                <span
                  className={cn(
                    "max-w-40 min-w-0 truncate rounded px-1.5 py-0.5",
                    index === contextEntries.length - 1
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground",
                  )}
                  title={entry.description ?? entry.label}
                >
                  {entry.label}
                </span>
              </Fragment>
            ))}
          </div>
        ) : null}

        <CommandList className="max-h-none min-h-0 flex-1">
          <CommandEmpty>
            {hasVisibleResults ? null : (
              <CommandPaletteEmptyState
                description="Try a module name, route, or organization keyword."
                label="No commands found"
              />
            )}
          </CommandEmpty>

          {filteredContextItems.length > 0 ? (
            <CommandGroup heading="Context">
              {filteredContextItems.map((item) => (
                <CommandPaletteItemRow
                  item={item}
                  key={item.id}
                  onSelect={() => handleSelect(item)}
                />
              ))}
            </CommandGroup>
          ) : null}

          {recentItems.length > 0 ? (
            <>
              {filteredContextItems.length > 0 ? <CommandSeparator /> : null}
              <CommandGroup heading="Recent">
                {recentItems.map((item) => (
                  <CommandPaletteItemRow
                    item={item}
                    key={item.id}
                    onSelect={() => handleSelect(item)}
                  />
                ))}
              </CommandGroup>
            </>
          ) : null}

          {visibleSections.map((section, index) => (
            <Fragment key={section.id}>
              {index > 0 || recentItems.length > 0 || filteredContextItems.length > 0 ? (
                <CommandSeparator />
              ) : null}
              <CommandGroup heading={section.label}>
                {section.items.map((item) => (
                  <CommandPaletteItemRow
                    item={item}
                    key={item.id}
                    onSelect={() => handleSelect(item)}
                  />
                ))}
              </CommandGroup>
            </Fragment>
          ))}
        </CommandList>

        <div
          aria-label="Keyboard shortcuts"
          className="flex shrink-0 items-center gap-3 border-t border-border/50 px-3 py-2"
          role="note"
        >
          <KbdGroup
            aria-hidden
            className="gap-1.5 text-xs text-muted-foreground/70"
          >
            <span className="inline-flex items-center gap-1">
              <Kbd>↵</Kbd>
              <span>Select</span>
            </span>
            <span aria-hidden className="text-border">
              ·
            </span>
            <span className="inline-flex items-center gap-1">
              <Kbd>Esc</Kbd>
              <span>Close</span>
            </span>
            <span aria-hidden className="text-border">
              ·
            </span>
            <span className="inline-flex items-center gap-1">
              <Kbd>↑↓</Kbd>
              <span>Navigate</span>
            </span>
          </KbdGroup>
        </div>
      </Command>
    </CommandDialog>
  );
}

function CommandPaletteEmptyState({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <Empty className="border-0 px-6 py-10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX aria-hidden />
        </EmptyMedia>
        <EmptyTitle className="text-sm">{label}</EmptyTitle>
        <EmptyDescription className="text-xs">{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function CommandPaletteItemRow({
  item,
  onSelect,
}: {
  item: AppShellCommandItem;
  onSelect: () => void;
}) {
  const Icon = item.icon
    ? APP_SHELL_PRIMARY_LEFT_RAIL_RAW_NAV_ICON_MAP[item.icon]
    : null;
  const disabledReason = item.disabledReason?.trim();
  const kindLabel = COMMAND_KIND_LABELS[item.kind];

  return (
    <CommandItem
      data-command-id={item.id}
      data-command-kind={item.kind}
      disabled={Boolean(disabledReason)}
      onSelect={disabledReason ? undefined : onSelect}
      value={[item.label, item.id, item.description].filter(Boolean).join(" ")}
    >
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-md border border-border/50",
          "bg-muted/55 text-muted-foreground",
          "group-data-selected/command-item:border-primary/20 group-data-selected/command-item:bg-primary/10 group-data-selected/command-item:text-primary",
          "transition-colors duration-100",
        )}
      >
        {Icon ? (
          <Icon aria-hidden className="size-3.5" />
        ) : (
          <span
            aria-hidden
            className="text-[10px] leading-none font-semibold uppercase"
          >
            {item.label.trim().slice(0, 1) || "?"}
          </span>
        )}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm leading-snug font-medium">
          {item.label}
        </span>
        {item.description ? (
          <span className="truncate text-[11px] leading-snug text-muted-foreground/70">
            {item.description}
          </span>
        ) : null}
        {disabledReason ? (
          <span className="truncate text-[11px] leading-snug text-warning-foreground/80">
            {disabledReason}
          </span>
        ) : null}
      </span>

      <span className="ml-auto flex max-w-[45%] shrink-0 items-center justify-end gap-1.5">
        <Badge
          className="hidden rounded px-1.5 py-0.5 text-[10px] font-medium sm:inline-flex"
          variant="secondary"
        >
          {kindLabel}
        </Badge>
        {item.shortcut ? (
          <Kbd className="shrink-0 opacity-55 group-data-selected/command-item:opacity-90">
            {item.shortcut}
          </Kbd>
        ) : item.href && !disabledReason ? (
          <ArrowRight
            aria-hidden
            className="size-3.5 shrink-0 text-muted-foreground/45 transition-transform group-data-selected/command-item:translate-x-0.5 group-data-selected/command-item:text-primary"
          />
        ) : null}
      </span>
    </CommandItem>
  );
}
