"use client";

import { accountSettingsCopy } from "@afenda/kernel";
import { useId, useState, useTransition } from "react";

import { changePasswordSchema } from "../contracts/auth.action-schemas.shared";
import { authPendingCopy } from "../copy/auth-pending-copy.shared";
import { getNormalizedAuthErrorMessage } from "../errors/normalize-auth-error.shared";
import { neonAuthClient } from "@afenda/neon-auth/client";
import { isPasswordPolicySatisfied } from "../policy/password-policy.shared";
import { AuthFormAlert } from "../ui/auth-form-alert.client";
import { AuthSubmitButton } from "../ui/auth-submit-button.client";
import {
  AuthCheckboxField,
  AuthField,
  AuthFieldGroup,
  AuthInlineLink,
  AuthInput,
} from "../ui/auth-ui.primitives";
import { PasswordRequirementList } from "../ui/password-requirement-list.client";

export function ChangePasswordForm() {
  const formId = useId();
  const [pending, startTransition] = useTransition();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const copy = accountSettingsCopy.password;

  const passwordPolicyMet = isPasswordPolicySatisfied(newPassword);
  const confirmPasswordMet =
    confirmPassword.length > 0 && newPassword === confirmPassword;

  const canSubmit = passwordPolicyMet && confirmPasswordMet && !pending;

  function resetSensitiveFields() {
    setNewPassword("");
    setConfirmPassword("");
  }

  function handleSubmit(formData: FormData) {
    setErrorMessage(null);
    setStatusMessage(null);

    startTransition(async () => {
      try {
        const parsed = changePasswordSchema.parse({
          currentPassword: String(formData.get("currentPassword") ?? ""),
          newPassword: String(formData.get("newPassword") ?? ""),
          confirmPassword: String(formData.get("confirmPassword") ?? ""),
          revokeOtherSessions: formData.get("revokeOtherSessions") === "on",
        });

        const result = await neonAuthClient.changePassword({
          currentPassword: parsed.currentPassword,
          newPassword: parsed.newPassword,
          revokeOtherSessions: parsed.revokeOtherSessions ?? false,
        });

        if (result.error) {
          setErrorMessage(getNormalizedAuthErrorMessage(result.error));
          return;
        }

        resetSensitiveFields();
        setStatusMessage(copy.success);
      } catch (error) {
        setErrorMessage(getNormalizedAuthErrorMessage(error));
      }
    });
  }

  return (
    <form
      action={handleSubmit}
      aria-busy={pending}
      data-auth-component="change-password-form"
      data-auth-state={pending ? "submitting" : "ready"}
      className="flex flex-col gap-surface-lg"
    >
      <AuthFieldGroup className="gap-surface-lg">
        <AuthField
          id={`${formId}-current-password`}
          label={copy.currentLabel}
        >
          <AuthInput
            autoComplete="current-password"
            disabled={pending}
            id={`${formId}-current-password`}
            name="currentPassword"
            required
            type="password"
          />
        </AuthField>

        <AuthField
          error={
            newPassword.length > 0 && !passwordPolicyMet
              ? "Password does not meet the enterprise policy."
              : null
          }
          id={`${formId}-new-password`}
          label={copy.newLabel}
        >
          <AuthInput
            autoComplete="new-password"
            disabled={pending}
            id={`${formId}-new-password`}
            name="newPassword"
            onChange={(event) => setNewPassword(event.target.value)}
            required
            type="password"
            value={newPassword}
          />
        </AuthField>

        <PasswordRequirementList password={newPassword} />

        <AuthField
          error={
            confirmPassword.length > 0 && !confirmPasswordMet
              ? copy.mismatch
              : null
          }
          id={`${formId}-confirm-password`}
          label={copy.confirmLabel}
        >
          <AuthInput
            autoComplete="new-password"
            disabled={pending}
            id={`${formId}-confirm-password`}
            name="confirmPassword"
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            type="password"
            value={confirmPassword}
          />
        </AuthField>

        <AuthCheckboxField
          description={copy.revokeHint}
          disabled={pending}
          id={`${formId}-revoke-other-sessions`}
          label={copy.revokeLabel}
          name="revokeOtherSessions"
          value="on"
        />
      </AuthFieldGroup>

      <AuthFormAlert message={errorMessage} tone="error" />
      <AuthFormAlert message={statusMessage} tone="success" />

      <AuthSubmitButton
        disabled={!canSubmit}
        pending={pending}
        pendingLabel={authPendingCopy.updatePassword}
        type="submit"
      >
        {copy.submitLabel}
      </AuthSubmitButton>

      <p className="type-caption text-muted-foreground">
        <AuthInlineLink href={copy.forgotHref}>
          {copy.forgotLabel}
        </AuthInlineLink>
      </p>
    </form>
  );
}
