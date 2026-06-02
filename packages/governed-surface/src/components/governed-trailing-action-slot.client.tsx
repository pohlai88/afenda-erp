"use client";

import type { ReactNode } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@afenda/ui/tooltip";

import { isListSurfaceTrailingActionRenderable } from "../list-surface-trailing-action.shared";
import type { ListSurfaceRowTrailingAction } from "../schemas/list-surface-row-trailing-action.schema";
import { diagnosticsDataAttributes } from "../utils/governed-diagnostics.shared";
import {
  governedIdentityAttributes,
  governedTestId,
} from "../utils/governed-identity.shared";

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
  const hasDisabledReason = disabled && Boolean(trailingAction.disabledReason);
  const actionKey = trailingAction.descriptor?.id ?? componentKey ?? rowId;

  const shell = (
    <span
      className={disabled ? "inline-flex opacity-60" : "inline-flex"}
      tabIndex={hasDisabledReason ? 0 : undefined}
      aria-disabled={disabled || undefined}
      aria-label={
        hasDisabledReason
          ? trailingAction.disabledReason
          : trailingAction.descriptor?.label
      }
      data-row-id={rowId}
      data-trailing-action-state={trailingAction.state}
      data-action-descriptor-id={trailingAction.descriptor?.id}
      {...governedIdentityAttributes({
        surfaceKey,
        sectionKey,
        componentKey: componentKey ?? rowId,
      })}
      {...diagnosticsDataAttributes({
        state: trailingAction.state,
        testId: actionKey
          ? governedTestId("trailing-action", actionKey)
          : undefined,
      })}
    >
      {children}
    </span>
  );

  if (hasDisabledReason) {
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
