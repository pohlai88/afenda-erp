"use client";

import type { ReactNode } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@afenda/ui";

export function AppShellUtilityTriggerTooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="bottom" align="center" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
