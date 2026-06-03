"use client";

import { forgotPasswordCopy } from "@afenda/kernel";
import { useId, useState, useTransition } from "react";

import { authPendingCopy } from "../../copy/auth-pending-copy.shared";
import { isPasswordPolicySatisfied } from "../../policy/password-policy.shared";
import { completePasswordReset } from "../../recovery/auth-recovery.service.client";
import { AuthFormAlert } from "../../ui/auth-form-alert.client";
import { AuthSubmitButton } from "../../ui/auth-submit-button.client";
import { PasswordRequirementList } from "../../ui/password-requirement-list.client";
import {
  AuthField,
  AuthFieldGroup,
  AuthInput,
  AuthSecondaryButton,
} from "../../ui/auth-ui.primitives";

type CompleteResetStepProps = {
  email: string;
  onBackToRequest: () => void;
  onSuccess: (signedIn: boolean) => void;
};

export function CompleteResetStep({
  email,
  onBackToRequest,
  onSuccess,
}: CompleteResetStepProps) {
  const formId = useId();
  const copy = forgotPasswordCopy;
  const [pending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordPolicyMet = isPasswordPolicySatisfied(password);
  const confirmPasswordMet =
    confirmPassword.length > 0 && password === confirmPassword;
  const canSubmit = passwordPolicyMet && confirmPasswordMet && !pending;

  function resetSensitiveFields() {
    setPassword("");
    setConfirmPassword("");
  }

  function handleSubmit(formData: FormData) {
    setErrorMessage(null);
    setStatusMessage(null);

    startTransition(async () => {
      const result = await completePasswordReset({ email, formData });

      if (!result.ok) {
        setErrorMessage(result.errorMessage);
        return;
      }

      resetSensitiveFields();
      setStatusMessage(result.statusMessage);
      onSuccess(result.signedIn);
    });
  }

  return (
    <form
      action={handleSubmit}
      aria-busy={pending}
      data-auth-component="complete-reset-step"
      data-auth-state={pending ? "submitting" : "ready"}
      className="flex flex-col gap-5"
    >
      <AuthFieldGroup>
        <AuthField id={`${formId}-email-readonly`} label={copy.fields.email}>
          <AuthInput
            disabled={pending}
            id={`${formId}-email-readonly`}
            name="email"
            readOnly
            value={email}
          />
        </AuthField>

        <AuthField
          id={`${formId}-otp`}
          label={copy.fields.verificationCode}
        >
          <AuthInput
            autoComplete="one-time-code"
            disabled={pending}
            id={`${formId}-otp`}
            inputMode="numeric"
            name="otp"
            required
          />
        </AuthField>

        <AuthField
          error={
            password.length > 0 && !passwordPolicyMet
              ? "Password does not meet the enterprise policy."
              : null
          }
          hint={copy.fields.passwordHint}
          id={`${formId}-password`}
          label={copy.fields.newPassword}
        >
          <AuthInput
            autoComplete="new-password"
            disabled={pending}
            id={`${formId}-password`}
            minLength={8}
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </AuthField>

        <PasswordRequirementList password={password} />

        <AuthField
          error={
            confirmPassword.length > 0 && !confirmPasswordMet
              ? "Passwords do not match."
              : null
          }
          id={`${formId}-confirm-password`}
          label="Confirm password"
        >
          <AuthInput
            autoComplete="new-password"
            disabled={pending}
            id={`${formId}-confirm-password`}
            minLength={8}
            name="confirmPassword"
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            type="password"
            value={confirmPassword}
          />
        </AuthField>
      </AuthFieldGroup>

      <AuthFormAlert message={errorMessage} tone="error" />
      <AuthFormAlert message={statusMessage} tone="success" />

      <AuthSubmitButton
        disabled={!canSubmit}
        pending={pending}
        pendingLabel={authPendingCopy.updatePassword}
        type="submit"
      >
        {copy.actions.updatePassword}
      </AuthSubmitButton>

      <AuthSecondaryButton
        disabled={pending}
        onClick={onBackToRequest}
        type="button"
      >
        {copy.actions.sendNewCode}
      </AuthSecondaryButton>
    </form>
  );
}
