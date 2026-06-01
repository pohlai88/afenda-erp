"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button, Field, FieldGroup, FieldLabel, Input, NativeSelect } from "@afenda/ui";
import { GitPullRequestIcon } from "lucide-react";
import { useActionState } from "react";
import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";
import {
  APPROVAL_RULE_DEFAULT_MODULE_KEY,
  APPROVAL_RULE_DEFAULT_TARGET_TYPE,
  APPROVAL_RULE_DELEGATION_VALID_DAYS_MAX,
  APPROVAL_RULE_DELEGATION_VALID_DAYS_MIN,
  APPROVAL_RULE_ESCALATION_HOURS_MAX,
  APPROVAL_RULE_ESCALATION_HOURS_MIN,
  APPROVAL_RULE_MIN_APPROVALS_MAX,
  APPROVAL_RULE_MIN_APPROVALS_MIN,
} from "../contracts/system-admin.approval-rule.limits.shared";
import type {
  SystemAdminApprovalRuleEditorDefaults,
  SystemAdminApproverRoleOption,
} from "../contracts";

type ApprovalRuleAction = (
  state: SystemAdminActionResult | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult>;

export function SystemAdminApprovalRuleEditor({
  updateApprovalRuleAction,
  approverRoleOptions,
  editorDefaults,
}: {
  updateApprovalRuleAction: ApprovalRuleAction;
  approverRoleOptions: readonly SystemAdminApproverRoleOption[];
  editorDefaults?: SystemAdminApprovalRuleEditorDefaults;
}) {
  const mode = editorDefaults?.mode ?? "create";
  const [state, formAction, pending] = useActionState<
    SystemAdminActionResult | undefined,
    FormData
  >(updateApprovalRuleAction, undefined);

  return (
    <form action={formAction} className="@container">
      <FieldGroup className="grid gap-surface-md @md:grid-cols-2">
        <input type="hidden" name="mode" value={mode} />
        {mode === "update" ? (
          <input
            type="hidden"
            name="approvalRuleId"
            value={editorDefaults?.approvalRuleId}
          />
        ) : (
          <Field className="@md:col-span-2">
            <FieldLabel>Approval key</FieldLabel>
            <Input
              name="approvalKey"
              placeholder="purchasing.po.high-value"
              required
            />
          </Field>
        )}
        <Field className="@md:col-span-2">
          <FieldLabel>Display name</FieldLabel>
          <Input
            name="name"
            placeholder="Purchase order above threshold"
            defaultValue={editorDefaults?.name}
            required
          />
        </Field>
        <Field>
          <FieldLabel>Module</FieldLabel>
          <Input
            name="moduleKey"
            placeholder="purchasing"
            defaultValue={editorDefaults?.moduleKey ?? APPROVAL_RULE_DEFAULT_MODULE_KEY}
          />
        </Field>
        <Field>
          <FieldLabel>Action</FieldLabel>
          <Input
            name="action"
            placeholder="purchasing.purchase-order.create"
            defaultValue={editorDefaults?.action}
            required
          />
        </Field>
        <Field>
          <FieldLabel>Target type</FieldLabel>
          <Input
            name="targetType"
            defaultValue={editorDefaults?.targetType ?? APPROVAL_RULE_DEFAULT_TARGET_TYPE}
            required
          />
        </Field>
        <Field>
          <FieldLabel>Approval mode</FieldLabel>
          <NativeSelect
            name="approvalMode"
            defaultValue={editorDefaults?.approvalMode ?? "parallel"}
          >
            <option value="sequential">Sequential</option>
            <option value="parallel">Parallel</option>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel>Approver roles</FieldLabel>
          <Input
            name="approverRoleKeys"
            placeholder="finance-manager,owner"
            defaultValue={
              editorDefaults?.approverRoleKeys ??
              approverRoleOptions[0]?.value ??
              "admin"
            }
            required
          />
        </Field>
        <Field>
          <FieldLabel>Delegation roles (optional)</FieldLabel>
          <Input
            name="delegateToRoleKeys"
            placeholder="operations-manager"
            defaultValue={editorDefaults?.delegateToRoleKeys}
          />
        </Field>
        <Field>
          <FieldLabel>Delegation valid days</FieldLabel>
          <Input
            name="delegationValidDays"
            type="number"
            min={APPROVAL_RULE_DELEGATION_VALID_DAYS_MIN}
            max={APPROVAL_RULE_DELEGATION_VALID_DAYS_MAX}
            placeholder="30"
            defaultValue={editorDefaults?.delegationValidDays}
          />
        </Field>
        <Field>
          <FieldLabel>Minimum approvals</FieldLabel>
          <Input
            name="minApprovals"
            type="number"
            min={APPROVAL_RULE_MIN_APPROVALS_MIN}
            max={APPROVAL_RULE_MIN_APPROVALS_MAX}
            defaultValue={editorDefaults?.minApprovals ?? APPROVAL_RULE_MIN_APPROVALS_MIN}
          />
        </Field>
        <Field>
          <FieldLabel>Escalation (hours)</FieldLabel>
          <Input
            name="escalationAfterHours"
            type="number"
            min={APPROVAL_RULE_ESCALATION_HOURS_MIN}
            max={APPROVAL_RULE_ESCALATION_HOURS_MAX}
            placeholder="24"
            defaultValue={editorDefaults?.escalationAfterHours}
          />
        </Field>
        <Field>
          <FieldLabel>Escalation behavior</FieldLabel>
          <NativeSelect
            name="escalationBehavior"
            defaultValue={editorDefaults?.escalationBehavior ?? "notify"}
          >
            <option value="notify">Notify</option>
            <option value="reassign">Reassign</option>
            <option value="expire">Expire</option>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel>Escalation roles</FieldLabel>
          <Input
            name="escalationRoleKeys"
            placeholder="owner"
            defaultValue={editorDefaults?.escalationRoleKeys}
          />
        </Field>
        <Field>
          <FieldLabel>Status</FieldLabel>
          <NativeSelect
            name="status"
            defaultValue={editorDefaults?.status ?? "active"}
          >
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
            <option value="deprecated">Deprecated</option>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel>Enabled</FieldLabel>
          <NativeSelect
            name="enabled"
            defaultValue={editorDefaults?.enabled === false ? "false" : "true"}
          >
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
            {mode === "update" ? "Update approval rule" : "Save approval rule"}
          </Button>
        </div>
        <div className="@md:col-span-2">
          <ActionFormErrors result={state} />
        </div>
      </FieldGroup>
    </form>
  );
}
