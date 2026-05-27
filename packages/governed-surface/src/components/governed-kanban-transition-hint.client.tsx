"use client"

import { Badge } from "@afenda/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@afenda/ui/tooltip"
import { cn } from "@afenda/ui/utils"

import type { KanbanCardTransitionAvailability } from "../schemas/kanban-board.schema"

export type GovernedKanbanTransitionHintProps = {
  transition: KanbanCardTransitionAvailability & {
    state: "ready" | "disabled"
  }
}

/**
 * Read-only kanban transition hint — mirrors `GovernedTrailingActionSlot` disabled UX.
 */
export function GovernedKanbanTransitionHint({
  transition,
}: GovernedKanbanTransitionHintProps) {
  const disabled = transition.state === "disabled"
  const badge = (
    <Badge
      variant="outline"
      className={cn("text-xs font-normal", disabled && "opacity-60")}
    >
      {transition.label}
    </Badge>
  )

  const shell = (
    <span
      className="inline-flex"
      aria-disabled={disabled || undefined}
      data-kanban-transition-state={transition.state}
      data-transition-id={transition.transitionId}
    >
      {badge}
    </span>
  )

  if (disabled && transition.disabledReason) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{shell}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-pretty">
          {transition.disabledReason}
        </TooltipContent>
      </Tooltip>
    )
  }

  return shell
}
