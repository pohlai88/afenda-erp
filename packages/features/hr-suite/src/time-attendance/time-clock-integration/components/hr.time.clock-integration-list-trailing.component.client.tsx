"use client";

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
  type GovernedListTrailingCellProps,
} from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";

import { hrTimeClockUiCopy } from "../surface/hr.time.clock-integration-ui.copy.shared";

export function HrTimeClockListTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const trailing = row.trailingAction;
  if (!isListSurfaceTrailingActionRenderable(trailing)) {
    return null;
  }

  return (
    <GovernedTrailingActionSlot trailingAction={trailing}>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={trailing.state !== "ready"}
      >
        {trailing.descriptor?.label ?? hrTimeClockUiCopy.devices.colActions}
      </Button>
    </GovernedTrailingActionSlot>
  );
}
