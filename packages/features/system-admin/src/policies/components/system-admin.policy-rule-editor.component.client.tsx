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

type PolicyRuleAction = (
  state: SystemAdminActionResult | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult>;

export function SystemAdminPolicyRuleEditor({
  updatePolicyRuleAction,
  effectOptions,
}: {
  updatePolicyRuleAction: PolicyRuleAction;
  effectOptions: readonly string[];
}) {
  const [state, formAction, pending] = useActionState<
    SystemAdminActionResult | undefined,
    FormData
  >(updatePolicyRuleAction, undefined);

  return (
    <form action={formAction} className="@container">
      <FieldGroup className="grid gap-surface-md @md:grid-cols-2">
        <input type="hidden" name="mode" value="create" />
        <Field className="@md:col-span-2">
          <FieldLabel>Policy key</FieldLabel>
          <Input
            name="policyKey"
            placeholder="finance.invoice.posted.lock"
            required
          />
        </Field>
        <Field className="@md:col-span-2">
          <FieldLabel>Display name</FieldLabel>
          <Input name="name" placeholder="Lock posted invoice edits" required />
        </Field>
        <Field>
          <FieldLabel>Module</FieldLabel>
          <Input name="moduleKey" placeholder="finance" defaultValue="*" />
        </Field>
        <Field>
          <FieldLabel>Action</FieldLabel>
          <Input
            name="action"
            placeholder="finance.invoice.update"
            required
          />
        </Field>
        <Field>
          <FieldLabel>Target type</FieldLabel>
          <Input name="targetType" defaultValue="erp-record" required />
        </Field>
        <Field>
          <FieldLabel>Effect</FieldLabel>
          <NativeSelect name="effect" defaultValue="lock">
            {effectOptions.map((effect) => (
              <option key={effect} value={effect}>
                {effect}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel>Priority</FieldLabel>
          <Input name="priority" type="number" min={0} max={1000} defaultValue={100} />
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
        <Field className="@md:col-span-2">
          <FieldLabel>Condition JSON</FieldLabel>
          <Textarea
            name="conditionJson"
            rows={4}
            placeholder='{"status":"posted"}'
            defaultValue="{}"
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
            Save policy rule
          </Button>
        </div>
        <div className="@md:col-span-2">
          <ActionFormErrors result={state} />
        </div>
      </FieldGroup>
    </form>
  );
}
