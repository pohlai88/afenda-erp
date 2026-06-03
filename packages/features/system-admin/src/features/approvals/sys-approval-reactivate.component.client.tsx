"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Alert, AlertDescription } from "@afenda/ui";
import { GitPullRequestIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { SystemAdminDestructiveConfirmButton } from "../../overview/components/system-admin.destructive-confirm-button.component.client";
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
    <div
      className="@container flex flex-col gap-surface-sm"
      data-testid={`system-admin-approval-reactivate:${approvalKey}`}
    >
      <Alert>
        <AlertDescription>{copy.description}</AlertDescription>
      </Alert>
      <div className="flex flex-wrap items-center gap-2">
        <SystemAdminDestructiveConfirmButton
          confirm={{
            title: copy.confirmTitle,
            description: copy.confirmDescription,
            confirmLabel: copy.confirmLabel,
          }}
          variant="outline"
          disabled={isPending}
          onConfirm={() =>
            startTransition(async () => {
              setResult(
                await reactivateDeprecatedApprovalRuleAction({ approvalKey }),
              );
            })
          }
        >
          <GitPullRequestIcon data-icon="inline-start" />
          {copy.actionLabel}
        </SystemAdminDestructiveConfirmButton>
        <ActionFormErrors result={result} />
      </div>
    </div>
  );
}
