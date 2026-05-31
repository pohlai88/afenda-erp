"use client";

import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";

import { hrTimeClockUiCopy } from "../surface/hr.time.clock-integration-ui.copy.shared";

export function HrTimeClockListTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const trailing = row.trailingAction;
  if (!trailing || trailing.state === "hidden") {
    return null;
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={trailing.state !== "ready"}
      title={trailing.disabledReason}
    >
      {trailing.descriptor?.label ?? hrTimeClockUiCopy.devices.colActions}
    </Button>
  );
}
