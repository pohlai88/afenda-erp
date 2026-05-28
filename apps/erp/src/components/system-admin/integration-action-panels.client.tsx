"use client";

import {
  ActionFormErrors,
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
  type GovernedListTrailingCellProps,
} from "@afenda/governed-surface/client";
import {
  systemAdminApiScopes,
  systemAdminDefaultWebhookEventPresets,
  systemAdminWebhookEvents,
  type CreateApiCredentialActionData,
  type CreateWebhookActionData,
  type SystemAdminActionResult,
} from "@afenda/feature-system-admin/client";
import { Button } from "@afenda/ui/button";
import { Input } from "@afenda/ui/input";
import { BanIcon, KeyRoundIcon, PowerIcon, RadioTowerIcon } from "lucide-react";
import { useActionState, useMemo, useState, useTransition } from "react";

import {
  createApiCredentialFormAction,
  createWebhookFormAction,
  revokeApiCredentialAction,
  setWebhookEnabledAction,
} from "@/app/(app)/system-admin/integrations/actions";

const defaultApiScopes =
  systemAdminApiScopes.length > 0 ? [systemAdminApiScopes[0].value] : [];
const defaultWebhookEvents = [...systemAdminDefaultWebhookEventPresets];

function OneTimeSecretPanel(input: {
  title: string;
  secret: string;
  detail?: string;
}) {
  return (
    <div className="mt-3 rounded-md border border-border bg-muted/50 p-3 text-sm">
      <p className="font-medium text-foreground">{input.title}</p>
      {input.detail ? (
        <p className="mt-1 text-xs text-muted-foreground">{input.detail}</p>
      ) : null}
      <code className="mt-2 block overflow-x-auto rounded bg-background px-3 py-2 text-xs">
        {input.secret}
      </code>
    </div>
  );
}

export function CreateApiCredentialForm() {
  const [selectedScopes, setSelectedScopes] = useState<string[]>(
    defaultApiScopes,
  );
  const [state, formAction, pending] = useActionState<
    SystemAdminActionResult<CreateApiCredentialActionData> | undefined,
    FormData
  >(createApiCredentialFormAction, undefined);
  const scopeValue = useMemo(() => selectedScopes.join(","), [selectedScopes]);

  return (
    <form action={formAction} className="grid gap-4 lg:grid-cols-[1fr_2fr_auto]">
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
              <span className="block font-medium text-foreground">{scope.label}</span>
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
          <OneTimeSecretPanel
            title="One-time API key"
            detail={`Prefix: ${state.data.keyPrefix}`}
            secret={state.data.rawKey}
          />
        ) : null}
      </div>
    </form>
  );
}

export function CreateWebhookForm() {
  const [selectedEvents, setSelectedEvents] = useState<string[]>(
    defaultWebhookEvents,
  );
  const [state, formAction, pending] = useActionState<
    SystemAdminActionResult<CreateWebhookActionData> | undefined,
    FormData
  >(createWebhookFormAction, undefined);
  const eventValue = useMemo(() => selectedEvents.join(","), [selectedEvents]);

  return (
    <form action={formAction} className="grid gap-4 lg:grid-cols-[1fr_1.4fr_auto]">
      <input type="hidden" name="eventFilters" value={eventValue} />
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Label</span>
        <Input name="label" required />
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">URL</span>
        <Input name="url" type="url" required />
      </label>
      <div className="flex items-end">
        <Button type="submit" disabled={pending || selectedEvents.length === 0}>
          <RadioTowerIcon data-icon="inline-start" />
          Register
        </Button>
      </div>
      <fieldset className="grid gap-2 rounded-md border border-border p-3 text-sm sm:grid-cols-2 lg:col-span-3">
        <legend className="px-1 text-muted-foreground">Events</legend>
        {systemAdminWebhookEvents.map((event) => (
          <label key={event.value} className="flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-1"
              checked={selectedEvents.includes(event.value)}
              onChange={(changeEvent) => {
                setSelectedEvents((current) =>
                  changeEvent.currentTarget.checked
                    ? [...current, event.value]
                    : current.filter((value) => value !== event.value),
                );
              }}
            />
            <span>
              <span className="block font-medium text-foreground">{event.label}</span>
              <span className="block text-xs text-muted-foreground">
                {event.description}
              </span>
            </span>
          </label>
        ))}
      </fieldset>
      <div className="lg:col-span-3">
        <ActionFormErrors result={state} />
        {state?.ok && state.data ? (
          <OneTimeSecretPanel
            title="One-time webhook signing secret"
            secret={state.data.signingSecret}
          />
        ) : null}
      </div>
    </form>
  );
}

export function WebhookTrailingCell({ row }: GovernedListTrailingCellProps) {
  const [result, setResult] = useState<SystemAdminActionResult>();
  const [isPending, startTransition] = useTransition();
  const trailingAction = row.trailingAction;
  const status = String(row.cells["status"] ?? "");
  const nextEnabled = status !== "enabled";

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  const disabled = trailingAction.state === "disabled" || isPending;

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={nextEnabled ? "outline" : "destructive"}
          disabled={disabled}
          onClick={() =>
            startTransition(async () => {
              setResult(
                await setWebhookEnabledAction({
                  webhookId: row.id,
                  enabled: nextEnabled,
                }),
              );
            })
          }
        >
          {nextEnabled ? (
            <PowerIcon data-icon="inline-start" />
          ) : (
            <BanIcon data-icon="inline-start" />
          )}
          {nextEnabled ? "Enable" : "Disable"}
        </Button>
        <ActionFormErrors result={result} />
      </div>
    </GovernedTrailingActionSlot>
  );
}

export function ApiCredentialTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const [result, setResult] = useState<SystemAdminActionResult>();
  const [isPending, startTransition] = useTransition();
  const trailingAction = row.trailingAction;

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  const disabled = trailingAction.state === "disabled" || isPending;

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={disabled}
          onClick={() =>
            startTransition(async () => {
              setResult(await revokeApiCredentialAction(row.id));
            })
          }
        >
          <BanIcon data-icon="inline-start" />
          Revoke
        </Button>
        <ActionFormErrors result={result} />
      </div>
    </GovernedTrailingActionSlot>
  );
}
