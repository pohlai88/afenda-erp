"use client";

import { Badge } from "@afenda/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@afenda/ui/tooltip";
import { cn } from "@afenda/ui/utils";

import type { KanbanCardTransitionAvailability } from "../schemas/kanban-board.schema";
import { diagnosticsDataAttributes } from "../utils/governed-diagnostics.shared";
import { governedIdentityAttributes } from "../utils/governed-identity.shared";
import { governedKanbanTransitionTestId } from "../kanban-surface-identity.shared";

export type GovernedKanbanTransitionHintProps = {
  transition: KanbanCardTransitionAvailability & {
    state: "ready" | "disabled";
  };
  surfaceKey?: string;
  cardId?: string;
};

/**
 * Read-only kanban transition hint — mirrors `GovernedTrailingActionSlot` disabled UX.
 */
export function GovernedKanbanTransitionHint({
  transition,
  surfaceKey,
  cardId,
}: GovernedKanbanTransitionHintProps) {
  const disabled = transition.state === "disabled";
  const badge = (
    <Badge
      variant="outline"
      className={cn("type-caption font-normal", disabled && "opacity-60")}
    >
      {transition.label}
    </Badge>
  );

  const shell = (
    <span
      className="inline-flex"
      aria-disabled={disabled || undefined}
      data-kanban-transition-state={transition.state}
      data-transition-id={transition.transitionId}
      {...governedIdentityAttributes({
        surfaceKey,
        sectionKey: surfaceKey,
        componentKey: cardId,
      })}
      {...diagnosticsDataAttributes({
        state: "ready",
        testId: governedKanbanTransitionTestId(transition.transitionId),
      })}
    >
      {badge}
    </span>
  );

  if (disabled && transition.disabledReason) {
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
