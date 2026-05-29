"use client";

import { organizationRoles } from "@afenda/auth";
import { ActionFormErrors } from "@afenda/governed-surface/client";
import {
  Alert,
  AlertDescription,
  Button,
  Checkbox,
  Field,
  FieldGroup,
  FieldLabel,
  NativeSelect,
} from "@afenda/ui";
import { SaveIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useActionState } from "react";

import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";
import { systemAdminPermissionCatalog } from "../contracts/system-admin.permission-catalog.contract";
import {
  isSystemAdminDeprecatedPermissionKey,
  requiresElevatedPermissionConfirmation,
  requiresHighRiskPermissionConfirmation,
  resolveSystemAdminPermissionRiskLevel,
} from "../contracts/system-admin.permission-risk.shared";

type SetRoleOverrideAction = (
  state: SystemAdminActionResult | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult | undefined>;

export function RoleOverrideForm({
  setRoleOverrideAction,
}: {
  setRoleOverrideAction: SetRoleOverrideAction;
}) {
  const [permissionKey, setPermissionKey] = useState(
    "system-admin.audit.read",
  );
  const [enabled, setEnabled] = useState(true);
  const [confirmHighRisk, setConfirmHighRisk] = useState(false);
  const [state, formAction, pending] = useActionState<
    SystemAdminActionResult | undefined,
    FormData
  >(setRoleOverrideAction, undefined);

  const riskLevel = useMemo(
    () => resolveSystemAdminPermissionRiskLevel(permissionKey),
    [permissionKey],
  );
  const isDeprecated = isSystemAdminDeprecatedPermissionKey(permissionKey);
  const needsHighRiskConfirmation = requiresHighRiskPermissionConfirmation(
    permissionKey,
    enabled,
  );
  const needsElevatedConfirmation = requiresElevatedPermissionConfirmation(
    permissionKey,
    enabled,
  );

  return (
    <form action={formAction} className="@container">
      <FieldGroup className="grid gap-surface-md @md:grid-cols-[160px_1fr_160px_auto]">
        <Field>
          <FieldLabel>Role</FieldLabel>
          <NativeSelect name="role" defaultValue="staff">
            {organizationRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel>Permission</FieldLabel>
          <NativeSelect
            name="permissionKey"
            value={permissionKey}
            onChange={(event) => {
              setPermissionKey(event.target.value);
              setConfirmHighRisk(false);
            }}
          >
            {systemAdminPermissionCatalog.map((permission) => (
              <option key={permission.value} value={permission.value}>
                {permission.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel>State</FieldLabel>
          <NativeSelect
            name="enabled"
            value={enabled ? "true" : "false"}
            onChange={(event) => {
              setEnabled(event.target.value === "true");
              setConfirmHighRisk(false);
            }}
          >
            <option value="true">Enable</option>
            <option value="false">Disable</option>
          </NativeSelect>
        </Field>
        <div className="flex items-end">
          <Button
            type="submit"
            variant="outline"
            disabled={
              pending ||
              (isDeprecated && enabled) ||
              (needsHighRiskConfirmation && !confirmHighRisk)
            }
          >
            <SaveIcon data-icon="inline-start" />
            Save
          </Button>
        </div>

        <div className="@md:col-span-4 flex flex-col gap-surface-sm">
          <p className="type-muted">
            Risk level: <span className="type-label">{riskLevel}</span>
          </p>

          {isDeprecated && enabled ? (
            <Alert variant="destructive">
              <AlertDescription>
                Deprecated permissions cannot be newly assigned to roles.
              </AlertDescription>
            </Alert>
          ) : null}

          {needsHighRiskConfirmation ? (
            <Field orientation="horizontal">
              <Checkbox
                id="confirmHighRisk"
                name="confirmHighRisk"
                value="true"
                checked={confirmHighRisk}
                onCheckedChange={(checked) =>
                  setConfirmHighRisk(checked === true)
                }
              />
              <FieldLabel htmlFor="confirmHighRisk">
                {needsElevatedConfirmation
                  ? "I confirm this critical permission should be granted to the selected role."
                  : "I confirm this high-risk permission should be granted to the selected role."}
              </FieldLabel>
            </Field>
          ) : (
            <input type="hidden" name="confirmHighRisk" value="false" />
          )}

          <ActionFormErrors result={state} />
          {state?.ok ? (
            <p className="type-muted" role="status">
              Role override saved.
            </p>
          ) : null}
        </div>
      </FieldGroup>
    </form>
  );
}
