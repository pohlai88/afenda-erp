"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";
import { Input } from "@afenda/ui/input";
import { NativeSelect } from "@afenda/ui/native-select";
import { Textarea } from "@afenda/ui/textarea";
import { ScaleIcon } from "lucide-react";
import { useActionState } from "react";
import type { SystemAdminActionResult } from "../../contracts";

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
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="mode" value="create" />
      <label className="flex min-w-0 flex-col gap-1 text-sm md:col-span-2">
        <span className="text-muted-foreground">Policy key</span>
        <Input
          name="policyKey"
          placeholder="finance.invoice.posted.lock"
          required
        />
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm md:col-span-2">
        <span className="text-muted-foreground">Display name</span>
        <Input name="name" placeholder="Lock posted invoice edits" required />
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Module</span>
        <Input name="moduleKey" placeholder="finance" defaultValue="*" />
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Action</span>
        <Input
          name="action"
          placeholder="finance.invoice.update"
          required
        />
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Target type</span>
        <Input name="targetType" defaultValue="erp-record" required />
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Effect</span>
        <NativeSelect name="effect" defaultValue="lock">
          {effectOptions.map((effect) => (
            <option key={effect} value={effect}>
              {effect}
            </option>
          ))}
        </NativeSelect>
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Priority</span>
        <Input name="priority" type="number" min={0} max={1000} defaultValue={100} />
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
      <label className="flex min-w-0 flex-col gap-1 text-sm md:col-span-2">
        <span className="text-muted-foreground">Condition JSON</span>
        <Textarea
          name="conditionJson"
          rows={4}
          placeholder='{"status":"posted"}'
          defaultValue="{}"
        />
      </label>
      <div className="md:col-span-2">
        <p className="type-muted">
          Policy rules are organization-scoped. The execution kernel evaluates
          active rules by priority during protected mutations.
        </p>
      </div>
      <div className="flex items-end md:col-span-2">
        <Button type="submit" disabled={pending}>
          <ScaleIcon data-icon="inline-start" />
          Save policy rule
        </Button>
      </div>
      <div className="md:col-span-2">
        <ActionFormErrors result={state} />
      </div>
    </form>
  );
}
