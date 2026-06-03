"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import {
  Alert,
  AlertDescription,
  Button,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  Input,
  NativeSelect,
} from "@afenda/ui";
import { GitPullRequestIcon } from "lucide-react";
import { useActionState, useId, useMemo } from "react";
import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";
import { systemAdminInlineFormMaxWidthClass } from "../../overview/surfaces/system-admin.form-layout.shared";
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
  const formId = useId();
  const copy = systemAdminApprovalsUiCopy.editor;
  const fields = copy.fields;
  const placeholders = copy.placeholders;
  const hints = copy.hints;
  const sections = copy.sections;
  const mode = editorDefaults?.mode ?? "create";
  const roleDatalistId = `${formId}-approver-role-options`;
  const [state, formAction, pending] = useActionState<
    SystemAdminActionResult | undefined,
    FormData
  >(updateApprovalRuleAction, undefined);

  const defaultApproverRoles = useMemo(
    () =>
      editorDefaults?.approverRoleKeys ??
      approverRoleOptions[0]?.value ??
      "admin",
    [approverRoleOptions, editorDefaults?.approverRoleKeys],
  );

  return (
    <form
      action={formAction}
      className={systemAdminInlineFormMaxWidthClass}
      data-testid="system-admin-approval-rule-editor"
    >
      <datalist id={roleDatalistId}>
        {approverRoleOptions.map((option) => (
          <option key={option.value} value={option.value} label={option.label} />
        ))}
      </datalist>

      <FieldGroup className="flex flex-col gap-surface-lg">
        <Alert>
          <AlertDescription>{copy.description}</AlertDescription>
        </Alert>

        <input type="hidden" name="mode" value={mode} />
        {mode === "update" ? (
          <input
            type="hidden"
            name="approvalRuleId"
            value={editorDefaults?.approvalRuleId}
          />
        ) : null}

        <FieldSet className="grid gap-surface-md @md:grid-cols-2">
          <FieldLegend className="type-section-title @md:col-span-2">
            {sections.identity}
          </FieldLegend>
          {mode === "create" ? (
            <Field className="@md:col-span-2">
              <FieldLabel htmlFor={`${formId}-approval-key`}>
                {fields.approvalKey}
              </FieldLabel>
              <Input
                id={`${formId}-approval-key`}
                name="approvalKey"
                placeholder={placeholders.approvalKey}
                autoComplete="off"
                required
              />
            </Field>
          ) : (
            <Field className="@md:col-span-2">
              <FieldLabel>{fields.approvalKey}</FieldLabel>
              <p className="type-mono-cell">{editorDefaults?.approvalRuleId}</p>
            </Field>
          )}
          <Field className="@md:col-span-2">
            <FieldLabel htmlFor={`${formId}-name`}>{fields.name}</FieldLabel>
            <Input
              id={`${formId}-name`}
              name="name"
              placeholder={placeholders.name}
              defaultValue={editorDefaults?.name}
              required
            />
          </Field>
        </FieldSet>

        <FieldSeparator />

        <FieldSet className="grid gap-surface-md @md:grid-cols-2">
          <FieldLegend className="type-section-title @md:col-span-2">
            {sections.scope}
          </FieldLegend>
          <Field>
            <FieldLabel htmlFor={`${formId}-module-key`}>
              {fields.moduleKey}
            </FieldLabel>
            <Input
              id={`${formId}-module-key`}
              name="moduleKey"
              placeholder={placeholders.moduleKey}
              defaultValue={
                editorDefaults?.moduleKey ?? APPROVAL_RULE_DEFAULT_MODULE_KEY
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${formId}-action`}>{fields.action}</FieldLabel>
            <Input
              id={`${formId}-action`}
              name="action"
              placeholder={placeholders.action}
              defaultValue={editorDefaults?.action}
              className="type-mono-cell"
              required
            />
          </Field>
          <Field className="@md:col-span-2">
            <FieldLabel htmlFor={`${formId}-target-type`}>
              {fields.targetType}
            </FieldLabel>
            <Input
              id={`${formId}-target-type`}
              name="targetType"
              defaultValue={
                editorDefaults?.targetType ?? APPROVAL_RULE_DEFAULT_TARGET_TYPE
              }
              className="type-mono-cell"
              required
            />
          </Field>
        </FieldSet>

        <FieldSeparator />

        <FieldSet className="grid gap-surface-md @md:grid-cols-2">
          <FieldLegend className="type-section-title @md:col-span-2">
            {sections.routing}
          </FieldLegend>
          <Field>
            <FieldLabel htmlFor={`${formId}-approval-mode`}>
              {fields.approvalMode}
            </FieldLabel>
            <NativeSelect
              id={`${formId}-approval-mode`}
              name="approvalMode"
              defaultValue={editorDefaults?.approvalMode ?? "parallel"}
            >
              <option value="sequential">{copy.modes.sequential}</option>
              <option value="parallel">{copy.modes.parallel}</option>
            </NativeSelect>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${formId}-min-approvals`}>
              {fields.minApprovals}
            </FieldLabel>
            <Input
              id={`${formId}-min-approvals`}
              name="minApprovals"
              type="number"
              min={APPROVAL_RULE_MIN_APPROVALS_MIN}
              max={APPROVAL_RULE_MIN_APPROVALS_MAX}
              defaultValue={
                editorDefaults?.minApprovals ?? APPROVAL_RULE_MIN_APPROVALS_MIN
              }
            />
          </Field>
          <Field className="@md:col-span-2">
            <FieldLabel htmlFor={`${formId}-approver-role-keys`}>
              {fields.approverRoleKeys}
            </FieldLabel>
            <Input
              id={`${formId}-approver-role-keys`}
              name="approverRoleKeys"
              list={roleDatalistId}
              placeholder={placeholders.approverRoleKeys}
              defaultValue={defaultApproverRoles}
              className="type-mono-cell"
              required
            />
            <FieldDescription>{hints.approverRoleKeys}</FieldDescription>
          </Field>
        </FieldSet>

        <FieldSeparator />

        <FieldSet className="grid gap-surface-md @md:grid-cols-2">
          <FieldLegend className="type-section-title @md:col-span-2">
            {sections.delegation}
          </FieldLegend>
          <Field>
            <FieldLabel htmlFor={`${formId}-delegate-role-keys`}>
              {fields.delegateToRoleKeys}
            </FieldLabel>
            <Input
              id={`${formId}-delegate-role-keys`}
              name="delegateToRoleKeys"
              list={roleDatalistId}
              placeholder={placeholders.delegateToRoleKeys}
              defaultValue={editorDefaults?.delegateToRoleKeys}
              className="type-mono-cell"
            />
            <FieldDescription>{hints.delegateToRoleKeys}</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${formId}-delegation-valid-days`}>
              {fields.delegationValidDays}
            </FieldLabel>
            <Input
              id={`${formId}-delegation-valid-days`}
              name="delegationValidDays"
              type="number"
              min={APPROVAL_RULE_DELEGATION_VALID_DAYS_MIN}
              max={APPROVAL_RULE_DELEGATION_VALID_DAYS_MAX}
              placeholder={placeholders.delegationValidDays}
              defaultValue={editorDefaults?.delegationValidDays}
            />
          </Field>
        </FieldSet>

        <FieldSeparator />

        <FieldSet className="grid gap-surface-md @md:grid-cols-2">
          <FieldLegend className="type-section-title @md:col-span-2">
            {sections.escalation}
          </FieldLegend>
          <Field>
            <FieldLabel htmlFor={`${formId}-escalation-hours`}>
              {fields.escalationAfterHours}
            </FieldLabel>
            <Input
              id={`${formId}-escalation-hours`}
              name="escalationAfterHours"
              type="number"
              min={APPROVAL_RULE_ESCALATION_HOURS_MIN}
              max={APPROVAL_RULE_ESCALATION_HOURS_MAX}
              placeholder={placeholders.escalationAfterHours}
              defaultValue={editorDefaults?.escalationAfterHours}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${formId}-escalation-behavior`}>
              {fields.escalationBehavior}
            </FieldLabel>
            <NativeSelect
              id={`${formId}-escalation-behavior`}
              name="escalationBehavior"
              defaultValue={editorDefaults?.escalationBehavior ?? "notify"}
            >
              <option value="notify">{copy.escalationBehaviors.notify}</option>
              <option value="reassign">
                {copy.escalationBehaviors.reassign}
              </option>
              <option value="expire">{copy.escalationBehaviors.expire}</option>
            </NativeSelect>
          </Field>
          <Field className="@md:col-span-2">
            <FieldLabel htmlFor={`${formId}-escalation-role-keys`}>
              {fields.escalationRoleKeys}
            </FieldLabel>
            <Input
              id={`${formId}-escalation-role-keys`}
              name="escalationRoleKeys"
              list={roleDatalistId}
              placeholder={placeholders.escalationRoleKeys}
              defaultValue={editorDefaults?.escalationRoleKeys}
              className="type-mono-cell"
            />
            <FieldDescription>{hints.escalationRoleKeys}</FieldDescription>
          </Field>
        </FieldSet>

        <FieldSeparator />

        <FieldSet className="grid gap-surface-md @md:grid-cols-2">
          <FieldLegend className="type-section-title @md:col-span-2">
            {sections.lifecycle}
          </FieldLegend>
          <Field>
            <FieldLabel htmlFor={`${formId}-status`}>{fields.status}</FieldLabel>
            <NativeSelect
              id={`${formId}-status`}
              name="status"
              defaultValue={editorDefaults?.status ?? "active"}
            >
              <option value="active">{copy.statuses.active}</option>
              <option value="disabled">{copy.statuses.disabled}</option>
              <option value="deprecated">{copy.statuses.deprecated}</option>
            </NativeSelect>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${formId}-enabled`}>{fields.enabled}</FieldLabel>
            <NativeSelect
              id={`${formId}-enabled`}
              name="enabled"
              defaultValue={editorDefaults?.enabled === false ? "false" : "true"}
            >
              <option value="true">{copy.enabledOptions.true}</option>
              <option value="false">{copy.enabledOptions.false}</option>
            </NativeSelect>
          </Field>
        </FieldSet>

        <Alert>
          <AlertDescription>{copy.footnote}</AlertDescription>
        </Alert>

        <div className="flex flex-col gap-surface-sm">
          <Button type="submit" disabled={pending} className="w-fit">
            <GitPullRequestIcon data-icon="inline-start" />
            {mode === "update" ? copy.submitUpdate : copy.submitCreate}
          </Button>
          <ActionFormErrors result={state} />
        </div>
      </FieldGroup>
    </form>
  );
}
