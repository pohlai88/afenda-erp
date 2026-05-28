"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";
import { Input } from "@afenda/ui/input";
import { NativeSelect, NativeSelectOption } from "@afenda/ui/native-select";
import { useActionState } from "react";

import type { SystemAdminActionResult } from "../contracts";

type UpdateTenantSettingsAction = (
  state: SystemAdminActionResult | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult | undefined>;

export type TenantSettingsFormDefaults = {
  timezone: string;
  locale: string;
  currency: string;
  fiscalYearStartMonth: number;
  dataRegion: string;
  zdrEnabled: boolean;
};

export function TenantSettingsForm({
  defaults,
  updateTenantSettingsAction,
}: {
  defaults: TenantSettingsFormDefaults;
  updateTenantSettingsAction: UpdateTenantSettingsAction;
}) {
  const [state, formAction, pending] = useActionState<
    SystemAdminActionResult | undefined,
    FormData
  >(updateTenantSettingsAction, undefined);

  return (
    <form action={formAction} className="grid max-w-xl gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Timezone</span>
        <Input name="timezone" defaultValue={defaults.timezone} required />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Locale</span>
        <Input name="locale" defaultValue={defaults.locale} required />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Currency</span>
        <Input
          name="currency"
          defaultValue={defaults.currency}
          maxLength={3}
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Fiscal year start month</span>
        <Input
          name="fiscalYearStartMonth"
          type="number"
          min={1}
          max={12}
          defaultValue={defaults.fiscalYearStartMonth}
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Data region</span>
        <Input name="dataRegion" defaultValue={defaults.dataRegion} required />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Zero data retention</span>
        <NativeSelect
          className="w-full"
          name="zdrEnabled"
          defaultValue={defaults.zdrEnabled ? "true" : "false"}
        >
          <NativeSelectOption value="false">Disabled</NativeSelectOption>
          <NativeSelectOption value="true">Enabled</NativeSelectOption>
        </NativeSelect>
      </label>
      <div className="flex flex-col gap-3 sm:col-span-2">
        <ActionFormErrors result={state} />
        {state?.ok ? (
          <p className="text-sm text-muted-foreground" role="status">
            Tenant settings saved.
          </p>
        ) : null}
        <div className="flex items-end">
          <Button disabled={pending} type="submit">
            {pending ? "Saving…" : "Save settings"}
          </Button>
        </div>
      </div>
    </form>
  );
}
