"use client";

import {
  ActionFormErrors,
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
  type GovernedListTrailingCellProps,
} from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";
import { useState, useTransition } from "react";

import type { SystemAdminActionResult } from "../contracts";
import { updateAiFeatureEntitlement } from "../actions/system-admin.lynx.actions.server";

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
  const [result, setResult] = useState<SystemAdminActionResult>();
  const [isPending, startTransition] = useTransition();
  const trailingAction = row.trailingAction;
  const feature = row.id;
  const enabled = row.cells["enabled"] === "enabled";

  if (!isAiFeatureId(feature)) {
    return (
      <span className="type-caption">unsupported feature</span>
    );
  }

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  const disabled = trailingAction.state === "disabled" || isPending;

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={enabled ? "ghost" : "secondary"}
          disabled={disabled}
          onClick={() =>
            startTransition(async () => {
              try {
                await updateAiFeatureEntitlement({
                  feature,
                  enabled: !enabled,
                });
                setResult(undefined);
              } catch (error) {
                setResult({
                  ok: false,
                  error:
                    error instanceof Error
                      ? error.message
                      : "Feature entitlement update failed.",
                });
              }
            })
          }
        >
          {enabled ? "Disable" : "Enable"}
        </Button>
        <ActionFormErrors result={result} />
      </div>
    </GovernedTrailingActionSlot>
  );
}
