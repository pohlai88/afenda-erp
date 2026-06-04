"use client";

import Link from "next/link";

import { Button } from "@afenda/ui/button";

import {
  GovernedTrailingActionSlot,
} from "./gov-governed-trailing-action-slot-client";
import { isListSurfaceTrailingActionRenderable } from "./list-surface-trailing-action.shared";
import type { GovernedListTrailingCellProps } from "./governed-pattern-c-trailing-column.shared";
import { asGovernedRoute } from "./gov-governed-safe-route";

export function GovernedMetadataTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction;

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  const renderableTrailingAction = trailingAction;
  const disabled = renderableTrailingAction.state === "disabled";
  const label = renderableTrailingAction.descriptor?.label ?? "Action";
  const surfaceKey = context?.surfaceKey ?? "governed-metadata";
  const sectionKey = context?.sectionKey ?? surfaceKey;
  const componentKey = context?.componentKey
    ? `${context.componentKey}-${row.id}-trailing-action`
    : row.id;

  return (
    <GovernedTrailingActionSlot
      trailingAction={renderableTrailingAction}
      surfaceKey={surfaceKey}
      sectionKey={sectionKey}
      componentKey={componentKey}
      rowId={row.id}
    >
      {!disabled && row.rowHref ? (
        <Button asChild size="sm" variant="secondary">
          <Link
            href={asGovernedRoute(row.rowHref)}
            onClick={(event) => event.stopPropagation()}
            prefetch={false}
          >
            {label}
          </Link>
        </Button>
      ) : (
        <Button type="button" size="sm" variant="secondary" disabled={disabled}>
          {label}
        </Button>
      )}
    </GovernedTrailingActionSlot>
  );
}
