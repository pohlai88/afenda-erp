"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import {
  Alert,
  AlertDescription,
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
import type { OrganizationSecuritySettings } from "./sys-security-settings.contract";

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
    <form action={formAction} className="@container max-w-3xl">
      <FieldGroup className="grid gap-surface-md @md:grid-cols-2">
        <Field>
          <FieldLabel>Require MFA for admins</FieldLabel>
          <NativeSelect
            name="requireMfaForAdmins"
            defaultValue={booleanSelectValue(security.requireMfaForAdmins)}
          >
            <NativeSelectOption value="true">Required</NativeSelectOption>
            <NativeSelectOption value="false">Optional</NativeSelectOption>
          </NativeSelect>
        </Field>

        <Field>
          <FieldLabel>Sensitive action confirmation</FieldLabel>
          <NativeSelect
            name="requireSensitiveActionConfirmation"
            defaultValue={booleanSelectValue(
              security.requireSensitiveActionConfirmation,
            )}
          >
            <NativeSelectOption value="true">Required</NativeSelectOption>
            <NativeSelectOption value="false">Disabled</NativeSelectOption>
          </NativeSelect>
        </Field>

        <Field className="@md:col-span-2">
          <FieldLabel>Allowed email domains (comma-separated)</FieldLabel>
          <Input
            name="allowedEmailDomains"
            defaultValue={security.allowedEmailDomains.join(", ")}
            placeholder="example.com, afenda.com"
          />
        </Field>

        <Field>
          <FieldLabel>Session max age (minutes)</FieldLabel>
          <Input
            name="sessionMaxAgeMinutes"
            type="number"
            min={15}
            max={43200}
            defaultValue={String(security.sessionMaxAgeMinutes)}
            required
          />
        </Field>

        <Field>
          <FieldLabel>Idle timeout (minutes)</FieldLabel>
          <Input
            name="idleTimeoutMinutes"
            type="number"
            min={5}
            max={1440}
            defaultValue={String(security.idleTimeoutMinutes)}
            required
          />
        </Field>

        <Field>
          <FieldLabel>Restrict invites to allowed domains</FieldLabel>
          <NativeSelect
            name="restrictInvitesToAllowedDomains"
            defaultValue={booleanSelectValue(
              security.restrictInvitesToAllowedDomains,
            )}
          >
            <NativeSelectOption value="true">Enabled</NativeSelectOption>
            <NativeSelectOption value="false">Disabled</NativeSelectOption>
          </NativeSelect>
        </Field>

        <Field>
          <FieldLabel>Admin lockout protection</FieldLabel>
          <NativeSelect
            name="adminLockoutProtectionEnabled"
            defaultValue={booleanSelectValue(
              security.adminLockoutProtectionEnabled,
            )}
          >
            <NativeSelectOption value="true">Enabled</NativeSelectOption>
            <NativeSelectOption value="false">Disabled</NativeSelectOption>
          </NativeSelect>
        </Field>

        <Field className="@md:col-span-2">
          <FieldLabel>Confirm lockout protection downgrade</FieldLabel>
          <NativeSelect name="confirmDisableLockoutProtection" defaultValue="false">
            <NativeSelectOption value="false">No</NativeSelectOption>
            <NativeSelectOption value="true">
              Yes — I understand this weakens admin protection
            </NativeSelectOption>
          </NativeSelect>
        </Field>

        <Alert className="@md:col-span-2">
          <AlertDescription>
            At least one admin protection must remain enabled. Disabling lockout
            protection requires explicit confirmation below.
          </AlertDescription>
        </Alert>

        <div className="@md:col-span-2">
          <ActionFormErrors result={state} />
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save security settings"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
