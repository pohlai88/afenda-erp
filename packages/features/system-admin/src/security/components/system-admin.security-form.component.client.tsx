"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Alert, AlertDescription, Button, Input, NativeSelect, NativeSelectOption } from "@afenda/ui";
import { useActionState } from "react";
import type { SystemAdminActionResult } from "../../contracts";
import type { OrganizationSecuritySettings } from "../contracts/system-admin.security-settings.contract";

type UpdateSecuritySettingsAction = (
  state: SystemAdminActionResult | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult | undefined>;

function booleanSelectValue(value: boolean) {
  return value ? "true" : "false";
}

export function SystemAdminSecurityForm({
  security,
  updateSecuritySettingsAction,
}: {
  security: OrganizationSecuritySettings;
  updateSecuritySettingsAction: UpdateSecuritySettingsAction;
}) {
  const [state, formAction, pending] = useActionState<
    SystemAdminActionResult | undefined,
    FormData
  >(updateSecuritySettingsAction, undefined);

  return (
    <form action={formAction} className="grid max-w-3xl gap-4 md:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Require MFA for admins</span>
        <NativeSelect
          name="requireMfaForAdmins"
          defaultValue={booleanSelectValue(security.requireMfaForAdmins)}
        >
          <NativeSelectOption value="true">Required</NativeSelectOption>
          <NativeSelectOption value="false">Optional</NativeSelectOption>
        </NativeSelect>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Sensitive action confirmation</span>
        <NativeSelect
          name="requireSensitiveActionConfirmation"
          defaultValue={booleanSelectValue(
            security.requireSensitiveActionConfirmation,
          )}
        >
          <NativeSelectOption value="true">Required</NativeSelectOption>
          <NativeSelectOption value="false">Disabled</NativeSelectOption>
        </NativeSelect>
      </label>

      <label className="flex flex-col gap-1 text-sm md:col-span-2">
        <span className="text-muted-foreground">
          Allowed email domains (comma-separated)
        </span>
        <Input
          name="allowedEmailDomains"
          defaultValue={security.allowedEmailDomains.join(", ")}
          placeholder="example.com, afenda.com"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Session max age (minutes)</span>
        <Input
          name="sessionMaxAgeMinutes"
          type="number"
          min={15}
          max={43200}
          defaultValue={String(security.sessionMaxAgeMinutes)}
          required
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Idle timeout (minutes)</span>
        <Input
          name="idleTimeoutMinutes"
          type="number"
          min={5}
          max={1440}
          defaultValue={String(security.idleTimeoutMinutes)}
          required
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Restrict invites to allowed domains</span>
        <NativeSelect
          name="restrictInvitesToAllowedDomains"
          defaultValue={booleanSelectValue(
            security.restrictInvitesToAllowedDomains,
          )}
        >
          <NativeSelectOption value="true">Enabled</NativeSelectOption>
          <NativeSelectOption value="false">Disabled</NativeSelectOption>
        </NativeSelect>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Admin lockout protection</span>
        <NativeSelect
          name="adminLockoutProtectionEnabled"
          defaultValue={booleanSelectValue(
            security.adminLockoutProtectionEnabled,
          )}
        >
          <NativeSelectOption value="true">Enabled</NativeSelectOption>
          <NativeSelectOption value="false">Disabled</NativeSelectOption>
        </NativeSelect>
      </label>

      <label className="flex flex-col gap-1 text-sm md:col-span-2">
        <span className="text-muted-foreground">
          Confirm lockout protection downgrade
        </span>
        <NativeSelect name="confirmDisableLockoutProtection" defaultValue="false">
          <NativeSelectOption value="false">No</NativeSelectOption>
          <NativeSelectOption value="true">
            Yes — I understand this weakens admin protection
          </NativeSelectOption>
        </NativeSelect>
      </label>

      <Alert className="md:col-span-2">
        <AlertDescription>
          At least one admin protection must remain enabled. Disabling lockout
          protection requires explicit confirmation below.
        </AlertDescription>
      </Alert>

      <div className="md:col-span-2">
        <ActionFormErrors result={state} />
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save security settings"}
        </Button>
      </div>
    </form>
  );
}
