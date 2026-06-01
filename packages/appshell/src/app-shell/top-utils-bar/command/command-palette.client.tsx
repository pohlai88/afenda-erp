"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { CommandIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@afenda/ui";

import {
  appShellCommandSearchText,
  type AppShellCommandItem,
  type AppShellCommandSection,
} from "../../appshell-props.shared";
import type { AppShellOperationalContextEntry } from "../../operational-context-stack.shared";

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

  useEffect(() => {
    if (!commandOpen) {
      setQuery("");
    }
  }, [commandOpen]);

  const recentItems = useMemo(
    () => buildRecentItems(commands, recentIds),
    [commands, recentIds],
  );
  const contextItems = useMemo(
    () => buildContextItems(contextEntries),
    [contextEntries],
  );

  const filteredSections = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return commands;
    }

    return commands
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          appShellCommandSearchText(item).includes(normalizedQuery),
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [commands, deferredQuery]);

  const handleSelect = (item: AppShellCommandItem) => {
    onSelectCommand(item.id);
    setCommandOpen(false);

    if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <CommandDialog
      className="af-appshell__command-dialog"
      description="Search workspace commands, routes, and current context."
      onOpenChange={setCommandOpen}
      open={commandOpen}
      showCloseButton
      title="Workspace command center"
    >
      <Command shouldFilter={false}>
        <CommandInput
          onValueChange={setQuery}
          placeholder="Find navigation, tools, and current context"
          value={query}
        />
        <CommandList>
          {recentItems.length > 0 ? (
            <CommandGroup heading="Recent">
              {recentItems.map((item) => (
                <CommandEntry
                  item={item}
                  key={item.id}
                  onSelect={() => handleSelect(item)}
                />
              ))}
            </CommandGroup>
          ) : null}
          {contextItems.length > 0 ? (
            <>
              {recentItems.length > 0 ? <CommandSeparator /> : null}
              <CommandGroup heading="Context">
                {contextItems.map((item) => (
                  <CommandEntry
                    item={item}
                    key={item.id}
                    onSelect={() => handleSelect(item)}
                  />
                ))}
              </CommandGroup>
            </>
          ) : null}
          {filteredSections.length > 0 ? (
            filteredSections.map((section, index) => (
              <div key={section.id}>
                {index > 0 || recentItems.length > 0 || contextItems.length > 0 ? (
                  <CommandSeparator />
                ) : null}
                <CommandGroup heading={section.label}>
                  {section.items.map((item) => (
                    <CommandEntry
                      item={item}
                      key={item.id}
                      onSelect={() => handleSelect(item)}
                    />
                  ))}
                </CommandGroup>
              </div>
            ))
          ) : (
            <CommandEmpty>No commands found.</CommandEmpty>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

function CommandEntry({
  item,
  onSelect,
}: {
  item: AppShellCommandItem;
  onSelect: () => void;
}) {
  const content = (
    <>
      <CommandIcon aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate">{item.label}</span>
        {item.description ? (
          <span className="truncate text-xs text-muted-foreground">
            {item.description}
          </span>
        ) : null}
      </div>
      {item.shortcut ? <CommandShortcut>{item.shortcut}</CommandShortcut> : null}
    </>
  );

  if (item.href && !item.disabledReason) {
    return (
      <CommandItem onSelect={onSelect} value={item.id}>
        {content}
      </CommandItem>
    );
  }

  return (
    <CommandItem
      disabled={Boolean(item.disabledReason)}
      onSelect={item.disabledReason ? undefined : onSelect}
      value={item.id}
    >
      {content}
    </CommandItem>
  );
}
