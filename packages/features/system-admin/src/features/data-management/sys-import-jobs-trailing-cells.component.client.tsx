"use client";

import {
  ActionFormErrors,
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
  type GovernedListTrailingCellProps,
} from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";
import { PlayIcon, RotateCcwIcon, XCircleIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { SystemAdminDestructiveConfirmButton } from "../overview/sys-destructive-confirm-button.component.client";
import { SystemAdminTrailingActionStack } from "../overview/sys-trailing-action-stack.component.client";
import type { SystemAdminActionResult } from "../tenant-execution/sys-action-result.contract";
import {
  cancelSystemAdminImportJobAction,
  retrySystemAdminImportJobAction,
  runSystemAdminImportJobAction,
} from "./sys-import-jobs.actions.server";

export function SystemAdminImportJobsTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction;
  const jobId = String(row.cells["jobId"] ?? row.id);
  const status = String(row.cells["jobStatus"] ?? "");
  const canRun = String(row.cells["canRun"] ?? "") === "true";
  const canCancel = String(row.cells["canCancel"] ?? "") === "true";
  const [result, setResult] = useState<SystemAdminActionResult<unknown>>();
  const [isPending, startTransition] = useTransition();

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  const disabled = trailingAction.state === "disabled" || isPending;

  function run(action: () => Promise<SystemAdminActionResult<unknown> | undefined>) {
    startTransition(async () => {
      setResult(await action());
    });
  }

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <SystemAdminTrailingActionStack footer={<ActionFormErrors result={result} />}>
        {status === "ready" ? (
          <Button
            type="button"
            size="sm"
            disabled={disabled || !canRun}
            onClick={() => run(() => runSystemAdminImportJobAction(jobId))}
          >
            <PlayIcon data-icon="inline-start" />
            Run
          </Button>
        ) : null}

        {status === "failed" || status === "cancelled" ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={disabled || !canRun}
            onClick={() => run(() => retrySystemAdminImportJobAction(jobId))}
          >
            <RotateCcwIcon data-icon="inline-start" />
            Retry
          </Button>
        ) : null}

        {status === "uploaded" ||
        status === "validating" ||
        status === "ready" ||
        status === "running" ? (
          <SystemAdminDestructiveConfirmButton
            disabled={disabled || !canCancel}
            variant="outline"
            confirm={{
              title: "Cancel import job",
              description:
                "Future batches will stop. Already applied domain commands are not silently reversed.",
              confirmLabel: "Cancel job",
            }}
            onConfirm={() => run(() => cancelSystemAdminImportJobAction(jobId))}
          >
            <XCircleIcon data-icon="inline-start" />
            Cancel
          </SystemAdminDestructiveConfirmButton>
        ) : null}
      </SystemAdminTrailingActionStack>
    </GovernedTrailingActionSlot>
  );
}
