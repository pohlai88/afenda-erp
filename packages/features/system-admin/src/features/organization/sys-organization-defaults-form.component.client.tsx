"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import {
  Button,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
  NativeSelect,
  NativeSelectOption,
} from "@afenda/ui";
import { useActionState } from "react";

import type { SystemAdminActionResult } from "../tenant-execution/sys-action-result.contract";

type UpdateOrganizationDefaultsAction = (
  state: SystemAdminActionResult | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult | undefined>;

export type OrganizationDefaultsFormDefaults = {
  timezone: string;
  locale: string;
  currency: string;
  fiscalYearStartMonth: number;
  documentPrefix: string;
  numberingPrefix: string;
  dataRegion: string;
  zdrEnabled: boolean;
};

export function SystemAdminOrganizationDefaultsForm({
  defaults,
  updateOrganizationDefaultsAction,
}: {
  defaults: OrganizationDefaultsFormDefaults;
  updateOrganizationDefaultsAction: UpdateOrganizationDefaultsAction;
}) {
  const [state, formAction, pending] = useActionState<
    SystemAdminActionResult | undefined,
    FormData
  >(updateOrganizationDefaultsAction, undefined);

  return (
    <form action={formAction} className="@container max-w-xl">
      <FieldGroup className="grid gap-surface-md @sm:grid-cols-2">
        <Field>
          <FieldLabel>Timezone</FieldLabel>
          <Input name="timezone" defaultValue={defaults.timezone} required />
        </Field>
        <Field>
          <FieldLabel>Locale</FieldLabel>
          <Input name="locale" defaultValue={defaults.locale} required />
        </Field>
        <Field>
          <FieldLabel>Currency (3-letter code)</FieldLabel>
          <Input
            name="currency"
            defaultValue={defaults.currency}
            maxLength={3}
            minLength={3}
            required
          />
        </Field>
        <Field>
          <FieldLabel>Fiscal year start month</FieldLabel>
          <Input
            name="fiscalYearStartMonth"
            type="number"
            min={1}
            max={12}
            defaultValue={defaults.fiscalYearStartMonth}
            required
          />
        </Field>
        <Field>
          <FieldLabel>Document prefix</FieldLabel>
          <Input
            name="documentPrefix"
            defaultValue={defaults.documentPrefix}
            maxLength={16}
            required
          />
        </Field>
        <Field>
          <FieldLabel>Numbering prefix</FieldLabel>
          <Input
            name="numberingPrefix"
            defaultValue={defaults.numberingPrefix}
            maxLength={16}
            required
          />
        </Field>
        <Field>
          <FieldLabel>Data region</FieldLabel>
          <Input name="dataRegion" defaultValue={defaults.dataRegion} required />
        </Field>
        <Field>
          <FieldLabel>Zero data retention</FieldLabel>
          <NativeSelect
            className="w-full"
            name="zdrEnabled"
            defaultValue={defaults.zdrEnabled ? "true" : "false"}
          >
            <NativeSelectOption value="false">Disabled</NativeSelectOption>
            <NativeSelectOption value="true">Enabled</NativeSelectOption>
          </NativeSelect>
        </Field>
        <div className="flex flex-col gap-3 @sm:col-span-2">
          <ActionFormErrors result={state} />
          {state?.ok ? (
            <p className="type-muted" role="status">
              Organization defaults saved.
            </p>
          ) : null}
          <div className="flex items-end">
            <Button disabled={pending} type="submit">
              {pending ? "Saving…" : "Save organization defaults"}
            </Button>
          </div>
        </div>
      </FieldGroup>
    </form>
  );
}
