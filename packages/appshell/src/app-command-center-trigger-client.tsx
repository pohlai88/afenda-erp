"use client";

import type { CSSProperties } from "react";
import { Search } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Kbd,
} from "@afenda/ui";
import { cn } from "@afenda/ui/utils";

/** 70% of legacy 21.75rem × 2rem utility command field. */
export const APP_SHELL_COMMAND_TRIGGER_WIDTH = "15.225rem";
export const APP_SHELL_COMMAND_TRIGGER_HEIGHT = "1.4rem";

export function AppShellCommandCenterTrigger({
  placeholder,
  onOpen,
}: {
  placeholder: string;
  onOpen: () => void;
}) {
  return (
    <button
      aria-label="Open command center"
      className={cn(
        "inline-flex max-w-full shrink-0 rounded-control border-0 bg-transparent p-0",
        "cursor-pointer outline-none",
        "focus-visible:ring-3 focus-visible:ring-ring/30",
      )}
      onClick={onOpen}
      style={
        {
          "--af-command-trigger-width": APP_SHELL_COMMAND_TRIGGER_WIDTH,
          "--af-command-trigger-height": APP_SHELL_COMMAND_TRIGGER_HEIGHT,
        } as CSSProperties
      }
      type="button"
    >
      <InputGroup
        aria-hidden
        className={cn(
          "pointer-events-none w-[var(--af-command-trigger-width)]",
          "h-[var(--af-command-trigger-height)] min-h-[var(--af-command-trigger-height)]",
          "border-border/60 bg-muted/70 shadow-none",
        )}
        tabIndex={-1}
      >
        <InputGroupAddon align="inline-start" className="py-0 pl-2">
          <Search
            aria-hidden="true"
            className="size-3 shrink-0 text-muted-foreground"
          />
        </InputGroupAddon>
        <InputGroupText
          className={cn(
            "min-w-0 flex-1 justify-start truncate py-0 text-xs leading-none",
            "font-normal text-muted-foreground",
          )}
        >
          {placeholder}
        </InputGroupText>
        <InputGroupAddon align="inline-end" className="py-0 pr-1.5">
          <Kbd>⌘ K</Kbd>
        </InputGroupAddon>
      </InputGroup>
    </button>
  );
}
