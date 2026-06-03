"use client";

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
  type GovernedListTrailingCellProps,
} from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";
import { SlidersHorizontalIcon } from "lucide-react";
import { useCallback } from "react";

function monitorFormId(monitorId: string) {
  return `lynx-monitor-form-${monitorId}`;
}

export function LynxOutcomeMonitorTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction;
  const monitorId = String(row.cells["monitorId"] ?? row.id);

  const focusMonitorForm = useCallback(() => {
    const target = document.getElementById(monitorFormId(monitorId));
    if (!target) {
      return;
    }
    target.scrollIntoView({ behavior: "smooth", block: "nearest" });
    if (target instanceof HTMLElement) {
      target.focus({ preventScroll: true });
    }
  }, [monitorId]);

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  const disabled = trailingAction.state === "disabled";

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled}
        onClick={focusMonitorForm}
      >
        <SlidersHorizontalIcon data-icon="inline-start" />
        Configure
      </Button>
    </GovernedTrailingActionSlot>
  );
}
