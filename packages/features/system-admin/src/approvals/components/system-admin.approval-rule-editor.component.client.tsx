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
import { systemAdminApprovalsUiCopy } from "../surface/system-admin.approvals-ui.copy.shared";

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
  const copy = systemAdminApprovalsUiCopy.editor;
  const fields = copy.fields;
  const placeholders = copy.placeholders;
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
            <FieldLabel>{fields.approvalKey}</FieldLabel>
            <Input
              name="approvalKey"
              placeholder={placeholders.approvalKey}
              required
            />
          </Field>
        )}
        <Field className="@md:col-span-2">
          <FieldLabel>{fields.name}</FieldLabel>
          <Input
            name="name"
            placeholder={placeholders.name}
            defaultValue={editorDefaults?.name}
            required
          />
        </Field>
        <Field>
          <FieldLabel>{fields.moduleKey}</FieldLabel>
          <Input
            name="moduleKey"
            placeholder={placeholders.moduleKey}
            defaultValue={editorDefaults?.moduleKey ?? APPROVAL_RULE_DEFAULT_MODULE_KEY}
          />
        </Field>
        <Field>
          <FieldLabel>{fields.action}</FieldLabel>
          <Input
            name="action"
            placeholder={placeholders.action}
            defaultValue={editorDefaults?.action}
            required
          />
        </Field>
        <Field>
          <FieldLabel>{fields.targetType}</FieldLabel>
          <Input
            name="targetType"
            defaultValue={editorDefaults?.targetType ?? APPROVAL_RULE_DEFAULT_TARGET_TYPE}
            required
          />
        </Field>
        <Field>
          <FieldLabel>{fields.approvalMode}</FieldLabel>
          <NativeSelect
            name="approvalMode"
            defaultValue={editorDefaults?.approvalMode ?? "parallel"}
          >
            <option value="sequential">{copy.modes.sequential}</option>
            <option value="parallel">{copy.modes.parallel}</option>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel>{fields.approverRoleKeys}</FieldLabel>
          <Input
            name="approverRoleKeys"
            placeholder={placeholders.approverRoleKeys}
            defaultValue={
              editorDefaults?.approverRoleKeys ??
              approverRoleOptions[0]?.value ??
              "admin"
            }
            required
          />
        </Field>
        <Field>
          <FieldLabel>{fields.delegateToRoleKeys}</FieldLabel>
          <Input
            name="delegateToRoleKeys"
            placeholder={placeholders.delegateToRoleKeys}
            defaultValue={editorDefaults?.delegateToRoleKeys}
          />
        </Field>
        <Field>
          <FieldLabel>{fields.delegationValidDays}</FieldLabel>
          <Input
            name="delegationValidDays"
            type="number"
            min={APPROVAL_RULE_DELEGATION_VALID_DAYS_MIN}
            max={APPROVAL_RULE_DELEGATION_VALID_DAYS_MAX}
            placeholder={placeholders.delegationValidDays}
            defaultValue={editorDefaults?.delegationValidDays}
          />
        </Field>
        <Field>
          <FieldLabel>{fields.minApprovals}</FieldLabel>
          <Input
            name="minApprovals"
            type="number"
            min={APPROVAL_RULE_MIN_APPROVALS_MIN}
            max={APPROVAL_RULE_MIN_APPROVALS_MAX}
            defaultValue={editorDefaults?.minApprovals ?? APPROVAL_RULE_MIN_APPROVALS_MIN}
          />
        </Field>
        <Field>
          <FieldLabel>{fields.escalationAfterHours}</FieldLabel>
          <Input
            name="escalationAfterHours"
            type="number"
            min={APPROVAL_RULE_ESCALATION_HOURS_MIN}
            max={APPROVAL_RULE_ESCALATION_HOURS_MAX}
            placeholder={placeholders.escalationAfterHours}
            defaultValue={editorDefaults?.escalationAfterHours}
          />
        </Field>
        <Field>
          <FieldLabel>{fields.escalationBehavior}</FieldLabel>
          <NativeSelect
            name="escalationBehavior"
            defaultValue={editorDefaults?.escalationBehavior ?? "notify"}
          >
            <option value="notify">{copy.escalationBehaviors.notify}</option>
            <option value="reassign">{copy.escalationBehaviors.reassign}</option>
            <option value="expire">{copy.escalationBehaviors.expire}</option>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel>{fields.escalationRoleKeys}</FieldLabel>
          <Input
            name="escalationRoleKeys"
            placeholder={placeholders.escalationRoleKeys}
            defaultValue={editorDefaults?.escalationRoleKeys}
          />
        </Field>
        <Field>
          <FieldLabel>{fields.status}</FieldLabel>
          <NativeSelect
            name="status"
            defaultValue={editorDefaults?.status ?? "active"}
          >
            <option value="active">{copy.statuses.active}</option>
            <option value="disabled">{copy.statuses.disabled}</option>
            <option value="deprecated">{copy.statuses.deprecated}</option>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel>{fields.enabled}</FieldLabel>
          <NativeSelect
            name="enabled"
            defaultValue={editorDefaults?.enabled === false ? "false" : "true"}
          >
            <option value="true">{copy.enabledOptions.true}</option>
            <option value="false">{copy.enabledOptions.false}</option>
          </NativeSelect>
        </Field>
        <div className="@md:col-span-2">
          <p className="type-muted">{copy.footnote}</p>
        </div>
        <div className="flex items-end @md:col-span-2">
          <Button type="submit" disabled={pending}>
            <GitPullRequestIcon data-icon="inline-start" />
            {mode === "update" ? copy.submitUpdate : copy.submitCreate}
          </Button>
        </div>
        <div className="@md:col-span-2">
          <ActionFormErrors result={state} />
        </div>
      </FieldGroup>
    </form>
  );
}
