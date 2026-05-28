"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";
import { Input } from "@afenda/ui/input";
import { RadioTowerIcon } from "lucide-react";
import { useActionState, useMemo, useState } from "react";

import type {
  CreateWebhookActionData,
  SystemAdminActionResult,
} from "../contracts";
import {
  systemAdminDefaultWebhookEventPresets,
  systemAdminWebhookEvents,
} from "../contracts";
import { SystemAdminOneTimeSecretPanel } from "./system-admin.one-time-secret.component.client";

type CreateWebhookFormAction = (
  state: SystemAdminActionResult<CreateWebhookActionData> | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult<CreateWebhookActionData> | undefined>;

const defaultWebhookEvents = [...systemAdminDefaultWebhookEventPresets];

export function CreateWebhookForm({
  createWebhookFormAction,
}: {
  createWebhookFormAction: CreateWebhookFormAction;
}) {
  const [selectedEvents, setSelectedEvents] =
    useState<string[]>(defaultWebhookEvents);
  const [state, formAction, pending] = useActionState<
    SystemAdminActionResult<CreateWebhookActionData> | undefined,
    FormData
  >(createWebhookFormAction, undefined);
  const eventValue = useMemo(() => selectedEvents.join(","), [selectedEvents]);

  return (
    <form
      action={formAction}
      className="grid gap-4 lg:grid-cols-[1fr_1.4fr_auto]"
    >
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
              <span className="block font-medium text-foreground">
                {event.label}
              </span>
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
          <SystemAdminOneTimeSecretPanel
            title="One-time webhook signing secret"
            secret={state.data.signingSecret}
          />
        ) : null}
      </div>
    </form>
  );
}
