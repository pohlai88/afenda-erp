"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import {
  Button,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
  NativeSelect,
  Textarea,
} from "@afenda/ui";
import { ScaleIcon } from "lucide-react";
import { useActionState } from "react";
import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";
import type { SystemAdminPolicyRuleEditorDefaults } from "../contracts/system-admin.policy-rule.contract";

type PolicyRuleAction = (
  state: SystemAdminActionResult | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult>;

export function SystemAdminPolicyRuleEditor({
  updatePolicyRuleAction,
  effectOptions,
  editorDefaults,
}: {
  updatePolicyRuleAction: PolicyRuleAction;
  effectOptions: readonly string[];
  editorDefaults?: SystemAdminPolicyRuleEditorDefaults;
}) {
  const mode = editorDefaults?.mode ?? "create";
  const [state, formAction, pending] = useActionState<
    SystemAdminActionResult | undefined,
    FormData
  >(updatePolicyRuleAction, undefined);

  return (
    <form action={formAction} className="@container">
      <FieldGroup className="grid gap-surface-md @md:grid-cols-2">
        <input type="hidden" name="mode" value={mode} />
        {mode === "update" ? (
          <input
            type="hidden"
            name="policyRuleId"
            value={editorDefaults?.policyRuleId}
          />
        ) : (
          <Field className="@md:col-span-2">
            <FieldLabel>Policy key</FieldLabel>
            <Input
              name="policyKey"
              placeholder="finance.invoice.posted.lock"
              required
            />
          </Field>
        )}
        <Field className="@md:col-span-2">
          <FieldLabel>Display name</FieldLabel>
          <Input
            name="name"
            placeholder="Lock posted invoice edits"
            defaultValue={editorDefaults?.name}
            required
          />
        </Field>
        <Field>
          <FieldLabel>Module</FieldLabel>
          <Input
            name="moduleKey"
            placeholder="finance"
            defaultValue={editorDefaults?.moduleKey ?? "*"}
          />
        </Field>
        <Field>
          <FieldLabel>Action</FieldLabel>
          <Input
            name="action"
            placeholder="finance.invoice.update"
            defaultValue={editorDefaults?.action}
            required
          />
        </Field>
        <Field>
          <FieldLabel>Target type</FieldLabel>
          <Input
            name="targetType"
            defaultValue={editorDefaults?.targetType ?? "erp-record"}
            required
          />
        </Field>
        <Field>
          <FieldLabel>Effect</FieldLabel>
          <NativeSelect
            name="effect"
            defaultValue={editorDefaults?.effect ?? "lock"}
          >
            {effectOptions.map((effect) => (
              <option key={effect} value={effect}>
                {effect}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel>Priority</FieldLabel>
          <Input
            name="priority"
            type="number"
            min={0}
            max={1000}
            defaultValue={editorDefaults?.priority ?? 100}
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
        <Field className="@md:col-span-2">
          <FieldLabel>Condition JSON</FieldLabel>
          <Textarea
            name="conditionJson"
            rows={4}
            placeholder='{"status":"posted"}'
            defaultValue={editorDefaults?.conditionJson ?? "{}"}
          />
        </Field>
        <div className="@md:col-span-2">
          <p className="type-muted">
            Policy rules are organization-scoped. The execution kernel evaluates
            active rules by priority during protected mutations.
          </p>
        </div>
        <div className="flex items-end @md:col-span-2">
          <Button type="submit" disabled={pending}>
            <ScaleIcon data-icon="inline-start" />
            {mode === "update" ? "Update policy rule" : "Save policy rule"}
          </Button>
        </div>
        <div className="@md:col-span-2">
          <ActionFormErrors result={state} />
        </div>
      </FieldGroup>
    </form>
  );
}
