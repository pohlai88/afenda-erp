"use client";

import type { ReactNode } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@afenda/ui/tooltip";

import type { ListSurfaceRowTrailingAction } from "../schemas/list-surface-row-trailing-action.schema";
import { isListSurfaceTrailingActionRenderable } from "../list-surface-trailing-action.shared";
import { diagnosticsDataAttributes } from "../utils/governed-diagnostics.shared";
import { governedIdentityAttributes } from "../utils/governed-identity.shared";

export type GovernedTrailingActionSlotProps = {
  trailingAction?: ListSurfaceRowTrailingAction;
  children: ReactNode;
  surfaceKey?: string;
  sectionKey?: string;
  componentKey?: string;
  rowId?: string;
};

/**
 * Wraps Pattern C trailing-column mutation UI with consistent disabled chrome
 * and tooltip copy from row metadata (`disabledReason`).
 */
export function GovernedTrailingActionSlot({
  trailingAction,
  children,
  surfaceKey,
  sectionKey,
  componentKey,
  rowId,
}: GovernedTrailingActionSlotProps) {
  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  const disabled = trailingAction.state === "disabled";
  const shell = (
    <span
      className={disabled ? "inline-flex opacity-60" : "inline-flex"}
      aria-disabled={disabled || undefined}
      data-row-id={rowId}
      data-trailing-action-state={trailingAction.state}
      data-action-descriptor-id={trailingAction.descriptor?.id}
      {...governedIdentityAttributes({
        surfaceKey,
        sectionKey,
        componentKey: componentKey ?? rowId,
      })}
      {...diagnosticsDataAttributes({ state: "ready" })}
    >
      {children}
    </span>
  );

  if (disabled && trailingAction.disabledReason) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{shell}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-pretty">
          {trailingAction.disabledReason}
        </TooltipContent>
      </Tooltip>
    );
  }

  return shell;
}
