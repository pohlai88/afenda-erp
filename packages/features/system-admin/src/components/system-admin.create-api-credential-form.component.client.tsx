"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";
import { Input } from "@afenda/ui/input";
import { KeyRoundIcon } from "lucide-react";
import { useActionState, useMemo, useState } from "react";

import type {
  CreateApiCredentialActionData,
  SystemAdminActionResult,
} from "../contracts";
import { systemAdminApiScopes } from "../contracts";
import { SystemAdminOneTimeSecretPanel } from "./system-admin.one-time-secret.component.client";

type CreateApiCredentialFormAction = (
  state: SystemAdminActionResult<CreateApiCredentialActionData> | undefined,
  payload: FormData,
) => Promise<
  SystemAdminActionResult<CreateApiCredentialActionData> | undefined
>;

const defaultApiScopes =
  systemAdminApiScopes.length > 0 ? [systemAdminApiScopes[0].value] : [];

export function CreateApiCredentialForm({
  createApiCredentialFormAction,
}: {
  createApiCredentialFormAction: CreateApiCredentialFormAction;
}) {
  const [selectedScopes, setSelectedScopes] =
    useState<string[]>(defaultApiScopes);
  const [state, formAction, pending] = useActionState<
    SystemAdminActionResult<CreateApiCredentialActionData> | undefined,
    FormData
  >(createApiCredentialFormAction, undefined);
  const scopeValue = useMemo(() => selectedScopes.join(","), [selectedScopes]);

  return (
    <form
      action={formAction}
      className="grid gap-4 lg:grid-cols-[1fr_2fr_auto]"
    >
      <input type="hidden" name="scopes" value={scopeValue} />
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Label</span>
        <Input name="label" required />
      </label>
      <fieldset className="grid gap-2 rounded-md border border-border p-3 text-sm sm:grid-cols-2">
        <legend className="px-1 text-muted-foreground">Scopes</legend>
        {systemAdminApiScopes.map((scope) => (
          <label key={scope.value} className="flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-1"
              checked={selectedScopes.includes(scope.value)}
              onChange={(event) => {
                setSelectedScopes((current) =>
                  event.currentTarget.checked
                    ? [...current, scope.value]
                    : current.filter((value) => value !== scope.value),
                );
              }}
            />
            <span>
              <span className="block font-medium text-foreground">
                {scope.label}
              </span>
              <span className="block text-xs text-muted-foreground">
                {scope.description}
              </span>
            </span>
          </label>
        ))}
      </fieldset>
      <div className="flex items-end">
        <Button type="submit" disabled={pending || selectedScopes.length === 0}>
          <KeyRoundIcon data-icon="inline-start" />
          Create
        </Button>
      </div>
      <div className="lg:col-span-3">
        <ActionFormErrors result={state} />
        {state?.ok && state.data ? (
          <SystemAdminOneTimeSecretPanel
            title="One-time API key"
            detail={`Prefix: ${state.data.keyPrefix}`}
            secret={state.data.rawKey}
          />
        ) : null}
      </div>
    </form>
  );
}
