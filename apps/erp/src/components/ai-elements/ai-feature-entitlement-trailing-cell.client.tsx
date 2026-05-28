"use client";

import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client";
import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";
import { useTransition } from "react";

import { updateAiFeatureEntitlement } from "@/app/(app)/system-admin/machine-layer/actions";

const AI_FEATURE_IDS = [
  "assistant",
  "document-extraction",
  "approval-tool",
  "solution-provider",
  "lynx-truth",
  "lynx-operator",
] as const;

type AiFeatureId = (typeof AI_FEATURE_IDS)[number];

function isAiFeatureId(value: string): value is AiFeatureId {
  return AI_FEATURE_IDS.includes(value as AiFeatureId);
}

export function AiFeatureEntitlementTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const [isPending, startTransition] = useTransition();
  const trailingAction = row.trailingAction;
  const feature = row.id;
  const enabled = row.cells["enabled"] === "enabled";

  if (!isAiFeatureId(feature)) {
    return (
      <span className="text-xs text-muted-foreground">unsupported feature</span>
    );
  }

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  const disabled =
    trailingAction.state === "disabled" || isPending;

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <Button
        type="button"
        size="sm"
        variant={enabled ? "ghost" : "secondary"}
        disabled={disabled}
        onClick={() =>
          startTransition(() =>
            updateAiFeatureEntitlement({
              feature,
              enabled: !enabled,
            }),
          )
        }
      >
        {enabled ? "Disable" : "Enable"}
      </Button>
    </GovernedTrailingActionSlot>
  );
}
