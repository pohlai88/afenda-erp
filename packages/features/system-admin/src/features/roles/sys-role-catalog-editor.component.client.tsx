"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import {
  systemAdminEmailRoleActionFormFooterClass,
  systemAdminEmailRoleActionFormGridClass,
} from "../../overview/surfaces/system-admin.form-layout.shared";
import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";
import {
  Button,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
  NativeSelect,
  Textarea,
} from "@afenda/ui";
import { ShieldOffIcon, ShieldPlusIcon, UserPenIcon } from "lucide-react";
import { useActionState } from "react";
import { systemAdminSeedRoles } from "./sys-roles.contract";

type RoleFormAction = (formData: FormData) => Promise<SystemAdminActionResult>;

export function SystemAdminRoleCatalogEditor({
  updateRoleAction,
  deprecateRoleAction,
  reactivateRoleAction,
}: {
  updateRoleAction: RoleFormAction;
  deprecateRoleAction: RoleFormAction;
  reactivateRoleAction: RoleFormAction;
}) {
  const [updateState, updateFormAction, updatePending] = useActionState<
    SystemAdminActionResult | undefined,
    FormData
  >(async (_prev, formData) => updateRoleAction(formData), undefined);
  const [deprecateState, deprecateFormAction, deprecatePending] =
    useActionState<SystemAdminActionResult | undefined, FormData>(
      async (_prev, formData) => deprecateRoleAction(formData),
      undefined,
    );
  const [reactivateState, reactivateFormAction, reactivatePending] =
    useActionState<SystemAdminActionResult | undefined, FormData>(
      async (_prev, formData) => reactivateRoleAction(formData),
      undefined,
    );

  const editableRoles = systemAdminSeedRoles.filter(
    (role) => role.key !== "owner",
  );

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <form action={updateFormAction} className="@container">
        <FieldGroup className={systemAdminEmailRoleActionFormGridClass}>
          <Field>
            <FieldLabel>Role</FieldLabel>
            <NativeSelect name="role" defaultValue="staff">
              {editableRoles.map((role) => (
                <option key={role.key} value={role.key}>
                  {role.name}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field>
            <FieldLabel>Display name</FieldLabel>
            <Input name="displayName" required minLength={2} maxLength={80} />
          </Field>
          <Field className="col-span-full">
            <FieldLabel>Description</FieldLabel>
            <Textarea name="description" maxLength={500} rows={3} />
          </Field>
          <div className="flex items-end">
            <Button type="submit" disabled={updatePending}>
              <UserPenIcon data-icon="inline-start" />
              Save metadata
            </Button>
          </div>
          <div className={systemAdminEmailRoleActionFormFooterClass}>
            <ActionFormErrors result={updateState} />
          </div>
        </FieldGroup>
      </form>

      <div className="flex flex-wrap gap-surface-lg">
        <form action={deprecateFormAction} className="@container">
          <FieldGroup className="flex flex-row flex-wrap items-end gap-surface-sm">
            <Field>
              <FieldLabel>Deprecate role</FieldLabel>
              <NativeSelect name="role" defaultValue="staff">
                {editableRoles
                  .filter((role) => role.key !== "admin")
                  .map((role) => (
                    <option key={role.key} value={role.key}>
                      {role.name}
                    </option>
                  ))}
              </NativeSelect>
            </Field>
            <Button type="submit" variant="outline" disabled={deprecatePending}>
              <ShieldOffIcon data-icon="inline-start" />
              Deprecate
            </Button>
          </FieldGroup>
          <ActionFormErrors result={deprecateState} />
        </form>

        <form action={reactivateFormAction} className="@container">
          <FieldGroup className="flex flex-row flex-wrap items-end gap-surface-sm">
            <Field>
              <FieldLabel>Reactivate role</FieldLabel>
              <NativeSelect name="role" defaultValue="staff">
                {editableRoles.map((role) => (
                  <option key={role.key} value={role.key}>
                    {role.name}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Button type="submit" variant="outline" disabled={reactivatePending}>
              <ShieldPlusIcon data-icon="inline-start" />
              Reactivate
            </Button>
          </FieldGroup>
          <ActionFormErrors result={reactivateState} />
        </form>
      </div>
    </div>
  );
}
