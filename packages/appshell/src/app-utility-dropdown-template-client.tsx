"use client";

import { useState, type ReactNode } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@afenda/ui";

import { cn } from "@afenda/ui/utils";

import { APP_SHELL_UTILITY_ICON_BUTTON_CLASS } from "./app-utility-chrome-shared";
import { AppShellUtilityPanel } from "./app-utility-panel-client";
import { AppShellUtilityTriggerTooltip } from "./app-utility-trigger-tooltip-client";
import { APP_SHELL_UTILITY_DROPDOWN_CONTENT_CLASS } from "./app-utility-dropdown-chrome-shared";

export function AppShellUtilityDropdownTemplate({
  open,
  onOpenChange,
  triggerLabel,
  triggerTooltip,
  icon,
  title,
  description,
  children,
  contentClassName,
  triggerClassName,
  footer,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerLabel: string;
  triggerTooltip: string;
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  contentClassName?: string;
  triggerClassName?: string;
  footer?: ReactNode;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const resolvedOpen = open ?? uncontrolledOpen;
  const handleOpenChange = onOpenChange ?? setUncontrolledOpen;

  return (
    <Popover open={resolvedOpen} onOpenChange={handleOpenChange}>
      <AppShellUtilityTriggerTooltip label={triggerTooltip}>
        <PopoverTrigger asChild>
          <button
            aria-label={triggerLabel}
            className={cn(APP_SHELL_UTILITY_ICON_BUTTON_CLASS, triggerClassName)}
            type="button"
          >
            {icon}
          </button>
        </PopoverTrigger>
      </AppShellUtilityTriggerTooltip>
      <PopoverContent
        align="end"
        className={cn(APP_SHELL_UTILITY_DROPDOWN_CONTENT_CLASS, contentClassName)}
      >
        {resolvedOpen ? (
          <AppShellUtilityPanel description={description} title={title}>
            {children}
          </AppShellUtilityPanel>
        ) : null}
        {footer ? <div className="mt-3 border-t border-border/60 pt-3">{footer}</div> : null}
      </PopoverContent>
    </Popover>
  );
}
