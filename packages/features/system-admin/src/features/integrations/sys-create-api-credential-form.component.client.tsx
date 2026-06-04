"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import {
  Button,
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  Input,
} from "@afenda/ui";
import { KeyRoundIcon } from "lucide-react";
import { useActionState, useMemo, useState } from "react";

import type { SystemAdminActionResult } from "../tenant-execution/sys-action-result.contract";
import type { CreateApiCredentialActionData } from "./sys-integrations-action-dtos.contract";
import { systemAdminApiScopes } from "./sys-integrations-catalog.contract";
import { SystemAdminOneTimeSecretPanel } from "../overview/sys-one-time-secret.component.client";

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
    <form action={formAction} className="@container">
      <FieldGroup className="grid gap-surface-md @lg:grid-cols-[1fr_2fr_auto]">
        <input type="hidden" name="scopes" value={scopeValue} />
        <Field>
          <FieldLabel>Label</FieldLabel>
          <Input name="label" required />
        </Field>
        <FieldSet className="grid gap-2 rounded-control border border-border p-3 type-body @sm:grid-cols-2">
          <FieldLegend className="px-1 text-muted-foreground">Scopes</FieldLegend>
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
                <span className="block type-caption">
                  {scope.description}
                </span>
              </span>
            </label>
          ))}
        </FieldSet>
        <div className="flex items-end">
          <Button type="submit" disabled={pending || selectedScopes.length === 0}>
            <KeyRoundIcon data-icon="inline-start" />
            Create
          </Button>
        </div>
        <div className="@lg:col-span-3">
          <ActionFormErrors result={state} />
          {state?.ok && state.data ? (
            <SystemAdminOneTimeSecretPanel
              title="One-time API key"
              detail={`Prefix: ${state.data.keyPrefix}`}
              secret={state.data.rawKey}
            />
          ) : null}
        </div>
      </FieldGroup>
    </form>
  );
}
