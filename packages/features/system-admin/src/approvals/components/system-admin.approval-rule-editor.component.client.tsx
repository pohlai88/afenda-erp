"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";
import { Input } from "@afenda/ui/input";
import { NativeSelect } from "@afenda/ui/native-select";
import { GitPullRequestIcon } from "lucide-react";
import { useActionState } from "react";
import type { SystemAdminActionResult } from "../../contracts";

type ApprovalRuleAction = (
  state: SystemAdminActionResult | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult>;

export function SystemAdminApprovalRuleEditor({
  updateApprovalRuleAction,
  approverRoleOptions,
}: {
  updateApprovalRuleAction: ApprovalRuleAction;
  approverRoleOptions: ReadonlyArray<{ value: string; label: string }>;
}) {
  const [state, formAction, pending] = useActionState<
    SystemAdminActionResult | undefined,
    FormData
  >(updateApprovalRuleAction, undefined);

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="mode" value="create" />
      <label className="flex min-w-0 flex-col gap-1 text-sm md:col-span-2">
        <span className="text-muted-foreground">Approval key</span>
        <Input
          name="approvalKey"
          placeholder="purchasing.po.high-value"
          required
        />
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm md:col-span-2">
        <span className="text-muted-foreground">Display name</span>
        <Input
          name="name"
          placeholder="Purchase order above threshold"
          required
        />
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Module</span>
        <Input name="moduleKey" placeholder="purchasing" defaultValue="*" />
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Action</span>
        <Input
          name="action"
          placeholder="purchasing.purchase-order.create"
          required
        />
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Target type</span>
        <Input name="targetType" defaultValue="erp-record" required />
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Approver roles</span>
        <Input
          name="approverRoleKeys"
          placeholder="finance-manager,owner"
          defaultValue={approverRoleOptions[0]?.value ?? "admin"}
          required
        />
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Minimum approvals</span>
        <Input name="minApprovals" type="number" min={1} max={10} defaultValue={1} />
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Escalation (hours)</span>
        <Input
          name="escalationAfterHours"
          type="number"
          min={1}
          max={720}
          placeholder="24"
        />
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Status</span>
        <NativeSelect name="status" defaultValue="active">
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
          <option value="deprecated">Deprecated</option>
        </NativeSelect>
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Enabled</span>
        <NativeSelect name="enabled" defaultValue="true">
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </NativeSelect>
      </label>
      <div className="md:col-span-2">
        <p className="type-muted">
          Approval law is configured here. Workflow runtime creates tasks;
          System Admin does not execute approvals directly.
        </p>
      </div>
      <div className="flex items-end md:col-span-2">
        <Button type="submit" disabled={pending}>
          <GitPullRequestIcon data-icon="inline-start" />
          Save approval rule
        </Button>
      </div>
      <div className="md:col-span-2">
        <ActionFormErrors result={state} />
      </div>
    </form>
  );
}
