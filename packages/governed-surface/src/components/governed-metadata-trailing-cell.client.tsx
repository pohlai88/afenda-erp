"use client";

import { Button } from "@afenda/ui/button";
import Link from "next/link";
import type { Route } from "next";
import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "../client";

import type { GovernedListTrailingCellProps } from "../governed-pattern-c-trailing-column.shared";

export function GovernedMetadataTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction;
  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }
  const disabled = trailingAction.state === "disabled";
  const label = trailingAction.descriptor?.label ?? "Action";
  const button = (
    <Button type="button" size="sm" variant="secondary" disabled={disabled}>
      {label}
    </Button>
  );

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      {!disabled && row.rowHref ? (
        <Link
          href={row.rowHref as Route}
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
