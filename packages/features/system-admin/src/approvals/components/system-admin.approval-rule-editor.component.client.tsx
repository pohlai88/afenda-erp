"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button, Field, FieldGroup, FieldLabel, Input, NativeSelect } from "@afenda/ui";
import { GitPullRequestIcon } from "lucide-react";
import { useActionState } from "react";
import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";

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
    <form action={formAction} className="@container">
      <FieldGroup className="grid gap-surface-md @md:grid-cols-2">
        <input type="hidden" name="mode" value="create" />
        <Field className="@md:col-span-2">
          <FieldLabel>Approval key</FieldLabel>
          <Input
            name="approvalKey"
            placeholder="purchasing.po.high-value"
            required
          />
        </Field>
        <Field className="@md:col-span-2">
          <FieldLabel>Display name</FieldLabel>
          <Input
            name="name"
            placeholder="Purchase order above threshold"
            required
          />
        </Field>
        <Field>
          <FieldLabel>Module</FieldLabel>
          <Input name="moduleKey" placeholder="purchasing" defaultValue="*" />
        </Field>
        <Field>
          <FieldLabel>Action</FieldLabel>
          <Input
            name="action"
            placeholder="purchasing.purchase-order.create"
            required
          />
        </Field>
        <Field>
          <FieldLabel>Target type</FieldLabel>
          <Input name="targetType" defaultValue="erp-record" required />
        </Field>
        <Field>
          <FieldLabel>Approver roles</FieldLabel>
          <Input
            name="approverRoleKeys"
            placeholder="finance-manager,owner"
            defaultValue={approverRoleOptions[0]?.value ?? "admin"}
            required
          />
        </Field>
        <Field>
          <FieldLabel>Minimum approvals</FieldLabel>
          <Input name="minApprovals" type="number" min={1} max={10} defaultValue={1} />
        </Field>
        <Field>
          <FieldLabel>Escalation (hours)</FieldLabel>
          <Input
            name="escalationAfterHours"
            type="number"
            min={1}
            max={720}
            placeholder="24"
          />
        </Field>
        <Field>
          <FieldLabel>Status</FieldLabel>
          <NativeSelect name="status" defaultValue="active">
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
            <option value="deprecated">Deprecated</option>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel>Enabled</FieldLabel>
          <NativeSelect name="enabled" defaultValue="true">
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </NativeSelect>
        </Field>
        <div className="@md:col-span-2">
          <p className="type-muted">
            Approval law is configured here. Workflow runtime creates tasks;
            System Admin does not execute approvals directly.
          </p>
        </div>
        <div className="flex items-end @md:col-span-2">
          <Button type="submit" disabled={pending}>
            <GitPullRequestIcon data-icon="inline-start" />
            Save approval rule
          </Button>
        </div>
        <div className="@md:col-span-2">
          <ActionFormErrors result={state} />
        </div>
      </FieldGroup>
    </form>
  );
}
