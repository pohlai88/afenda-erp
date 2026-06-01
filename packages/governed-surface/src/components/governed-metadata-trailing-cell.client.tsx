"use client";

import { Button } from "@afenda/ui/button";
import Link from "next/link";
import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "../client";

import type { GovernedListTrailingCellProps } from "../governed-pattern-c-trailing-column.shared";
import { asGovernedRoute } from "../utils/governed-safe-route";

export function GovernedMetadataTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction;
  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }
  const disabled = trailingAction.state === "disabled";
  const label = trailingAction.descriptor?.label ?? "Action";
  const surfaceKey = context?.surfaceKey;
  const button = (
    <Button type="button" size="sm" variant="secondary" disabled={disabled}>
      {label}
    </Button>
  );

  return (
    <GovernedTrailingActionSlot
      trailingAction={trailingAction}
      surfaceKey={surfaceKey}
      sectionKey={surfaceKey}
      componentKey={row.id}
      rowId={row.id}
    >
      {!disabled && row.rowHref ? (
        <Link
          href={asGovernedRoute(row.rowHref)}
          onClick={(event) => event.stopPropagation()}
        >
          {button}
        </Link>
      ) : (
        button
      )}
    </GovernedTrailingActionSlot>
  );
}
