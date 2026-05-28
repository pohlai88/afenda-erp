"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";
import { Input } from "@afenda/ui/input";
import { useActionState } from "react";

import type { SystemAdminActionResult } from "../../contracts";

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
    <form action={formAction} className="grid max-w-xl gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1 type-control">
        <span className="text-muted-foreground">Timezone</span>
        <Input name="timezone" defaultValue={defaults.timezone} required />
      </label>
      <label className="flex flex-col gap-1 type-control">
        <span className="text-muted-foreground">Locale</span>
        <Input name="locale" defaultValue={defaults.locale} required />
      </label>
      <label className="flex flex-col gap-1 type-control">
        <span className="text-muted-foreground">Currency (3-letter code)</span>
        <Input
          name="currency"
          defaultValue={defaults.currency}
          maxLength={3}
          minLength={3}
          required
        />
      </label>
      <label className="flex flex-col gap-1 type-control">
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
      <label className="flex flex-col gap-1 type-control">
        <span className="text-muted-foreground">Document prefix</span>
        <Input
          name="documentPrefix"
          defaultValue={defaults.documentPrefix}
          maxLength={16}
          required
        />
      </label>
      <label className="flex flex-col gap-1 type-control">
        <span className="text-muted-foreground">Numbering prefix</span>
        <Input
          name="numberingPrefix"
          defaultValue={defaults.numberingPrefix}
          maxLength={16}
          required
        />
      </label>
      <div className="flex flex-col gap-3 sm:col-span-2">
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
    </form>
  );
}
