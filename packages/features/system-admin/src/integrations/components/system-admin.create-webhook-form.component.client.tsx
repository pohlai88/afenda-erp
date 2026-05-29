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
import { RadioTowerIcon } from "lucide-react";
import { useActionState, useMemo, useState } from "react";

import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";
import type { CreateWebhookActionData } from "../contracts/system-admin.integrations-action-dtos.contract";
import {
  systemAdminDefaultWebhookEventPresets,
  systemAdminWebhookEvents,
} from "../contracts/system-admin.integrations-catalog.contract";
import { SystemAdminOneTimeSecretPanel } from "../../overview/components/system-admin.one-time-secret.component.client";

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
    <form action={formAction} className="@container">
      <FieldGroup className="grid gap-surface-md @lg:grid-cols-[1fr_1.4fr_auto]">
        <input type="hidden" name="eventFilters" value={eventValue} />
        <Field>
          <FieldLabel>Label</FieldLabel>
          <Input name="label" required />
        </Field>
        <Field>
          <FieldLabel>URL</FieldLabel>
          <Input name="url" type="url" required />
        </Field>
        <div className="flex items-end">
          <Button type="submit" disabled={pending || selectedEvents.length === 0}>
            <RadioTowerIcon data-icon="inline-start" />
            Register
          </Button>
        </div>
        <FieldSet className="grid gap-2 rounded-control border border-border p-3 type-body @sm:grid-cols-2 @lg:col-span-3">
          <FieldLegend className="px-1 text-muted-foreground">Events</FieldLegend>
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
                <span className="block type-caption">
                  {event.description}
                </span>
              </span>
            </label>
          ))}
        </FieldSet>
        <div className="@lg:col-span-3">
          <ActionFormErrors result={state} />
          {state?.ok && state.data ? (
            <SystemAdminOneTimeSecretPanel
              title="One-time webhook signing secret"
              secret={state.data.signingSecret}
            />
          ) : null}
        </div>
      </FieldGroup>
    </form>
  );
}
