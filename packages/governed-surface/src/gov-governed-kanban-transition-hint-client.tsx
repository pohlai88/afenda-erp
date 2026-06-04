"use client";

import { Badge } from "@afenda/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@afenda/ui/tooltip";
import { cn } from "@afenda/ui/utils";

import type { KanbanCardTransitionAvailability } from "./gov-kanban-board-schema";
import { governedKanbanTransitionTestId } from "./kanban-surface-identity.shared";
import { diagnosticsDataAttributes } from "../utils/governed-diagnostics.shared";
import { governedIdentityAttributes } from "../utils/governed-identity.shared";

export type GovernedKanbanTransitionHintProps = {
  transition: KanbanCardTransitionAvailability & {
    state: "ready" | "disabled";
  };
  surfaceKey?: string;
  sectionKey?: string;
  componentKey?: string;
  cardId?: string;
};

/**
 * Read-only kanban transition hint — mirrors `GovernedTrailingActionSlot` disabled UX.
 */
export function GovernedKanbanTransitionHint({
  transition,
  surfaceKey,
  sectionKey,
  componentKey,
  cardId,
}: GovernedKanbanTransitionHintProps) {
  const disabled = transition.state === "disabled";
  const hasDisabledReason = disabled && Boolean(transition.disabledReason);

  const resolvedComponentKey =
    componentKey ??
    ([cardId, transition.transitionId].filter(Boolean).join("-") ||
      transition.transitionId);

  const shell = (
    <span
      tabIndex={hasDisabledReason ? 0 : undefined}
      className="inline-flex"
      aria-disabled={disabled || undefined}
      aria-label={
        hasDisabledReason
          ? `${transition.label}: ${transition.disabledReason}`
          : transition.label
      }
      data-kanban-transition-state={transition.state}
      data-transition-id={transition.transitionId}
      {...governedIdentityAttributes({
        surfaceKey,
        sectionKey: sectionKey ?? surfaceKey,
        componentKey: resolvedComponentKey,
      })}
      {...diagnosticsDataAttributes({
        state: transition.state,
        testId: governedKanbanTransitionTestId(transition.transitionId),
      })}
    >
      <Badge
        variant="outline"
        className={cn("type-caption font-normal", disabled && "opacity-60")}
      >
        {transition.label}
      </Badge>
    </span>
  );

  if (hasDisabledReason) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{shell}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-pretty">
          {transition.disabledReason}
        </TooltipContent>
      </Tooltip>
    );
  }

  return shell;
}
