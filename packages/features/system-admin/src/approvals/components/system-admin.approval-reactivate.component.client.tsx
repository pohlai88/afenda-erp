"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";
import { GitPullRequestIcon } from "lucide-react";
import { useState, useTransition } from "react";
import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";
import { systemAdminApprovalsUiCopy } from "../surface/system-admin.approvals-ui.copy.shared";

type ReactivateAction = (input: {
  approvalKey: string;
}) => Promise<SystemAdminActionResult>;

export function SystemAdminApprovalReactivateControl({
  approvalKey,
  reactivateDeprecatedApprovalRuleAction,
}: {
  approvalKey: string;
  reactivateDeprecatedApprovalRuleAction: ReactivateAction;
}) {
  const copy = systemAdminApprovalsUiCopy.detail.reactivate;
  const [result, setResult] = useState<SystemAdminActionResult>();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-surface-sm">
      <p className="type-muted">{copy.description}</p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              setResult(
                await reactivateDeprecatedApprovalRuleAction({ approvalKey }),
              );
            })
          }
        >
          <GitPullRequestIcon data-icon="inline-start" />
          {copy.actionLabel}
        </Button>
        <ActionFormErrors result={result} />
      </div>
    </div>
  );
}
