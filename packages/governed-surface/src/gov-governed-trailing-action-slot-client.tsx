"use client";

import type { ReactNode } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@afenda/ui/tooltip";

import { isListSurfaceTrailingActionRenderable } from "./list-surface-trailing-action.shared";
import type { ListSurfaceRowTrailingAction } from "./gov-list-surface-row-trailing-action-schema";
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

  /**
   * Stable component identity.
   * Defaults to descriptor id, then row id.
   */
  componentKey?: string;

  /**
   * Stable business/domain row identity.
   */
  rowId?: string;
};

/**
 * Governed wrapper for Pattern C row trailing actions.
 *
 * Responsibilities:
 * - renders only valid trailing actions
 * - exposes stable diagnostics and test identity
 * - provides disabled affordance + disabled reason tooltip
 * - prevents disabled row action children from receiving pointer interaction
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

  const descriptorId = trailingAction.descriptor?.id;
  const descriptorLabel = trailingAction.descriptor?.label;

  const resolvedRowId = rowId ?? descriptorId ?? "unknown-row";
  const resolvedSurfaceKey = surfaceKey ?? "governed-trailing-action";
  const resolvedComponentKey =
    componentKey ?? descriptorId ?? `${resolvedRowId}-trailing-action`;

  const disabled = trailingAction.state === "disabled";
  const disabledReason = disabled ? trailingAction.disabledReason?.trim() : "";
  const hasDisabledReason = Boolean(disabledReason);

  const accessibleLabel =
    hasDisabledReason || descriptorLabel
      ? hasDisabledReason
        ? disabledReason
        : descriptorLabel
      : undefined;

  const shell = (
    <span
      className={[
        "inline-flex items-center",
        disabled ? "cursor-not-allowed opacity-60 [&_*]:pointer-events-none" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      tabIndex={hasDisabledReason ? 0 : undefined}
      role={hasDisabledReason ? "button" : undefined}
      aria-disabled={disabled || undefined}
      aria-label={accessibleLabel}
      data-row-id={resolvedRowId}
      data-trailing-action-state={trailingAction.state}
      data-action-descriptor-id={descriptorId}
      {...governedIdentityAttributes({
        surfaceKey: resolvedSurfaceKey,
        sectionKey,
        componentKey: resolvedComponentKey,
      })}
      {...diagnosticsDataAttributes({
        state: trailingAction.state,
        testId: governedTestId("trailing-action", resolvedComponentKey),
      })}
    >
      {children}
    </span>
  );

  if (!hasDisabledReason) {
    return shell;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{shell}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-pretty">
        {disabledReason}
      </TooltipContent>
    </Tooltip>
  );
}
