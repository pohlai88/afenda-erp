"use client";

import { forgotPasswordCopy } from "@afenda/kernel";
import { useId, useState, useTransition } from "react";

import { authPendingCopy } from "../../copy/auth-pending-copy.shared";
import { requestPasswordReset } from "../../recovery/auth-recovery.service.client";
import { AuthFormAlert } from "../../ui/auth-form-alert.client";
import { AuthSubmitButton } from "../../ui/auth-submit-button.client";
import {
  AuthField,
  AuthFieldGroup,
  AuthInput,
} from "../../ui/auth-ui.primitives";

type RequestResetStepProps = {
  email: string;
  onOtpRequested: (email: string) => void;
};

export function RequestResetStep({
  email,
  onOtpRequested,
}: RequestResetStepProps) {
  const formId = useId();
  const copy = forgotPasswordCopy;
  const [pending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setErrorMessage(null);
    setStatusMessage(null);

    startTransition(async () => {
      const result = await requestPasswordReset(formData);

      if (!result.ok) {
        setErrorMessage(result.errorMessage);
        return;
      }

      setStatusMessage(result.statusMessage);

      if (result.strategy === "otp") {
        onOtpRequested(result.email);
      }
    });
  }

  return (
    <form
      action={handleSubmit}
      aria-busy={pending}
      data-auth-component="request-reset-step"
      data-auth-state={pending ? "submitting" : "ready"}
      className="flex flex-col gap-5"
    >
      <AuthFieldGroup>
        <AuthField id={`${formId}-email`} label={copy.fields.email}>
          <AuthInput
            autoComplete="email"
            defaultValue={email}
            disabled={pending}
            id={`${formId}-email`}
            name="email"
            required
            type="email"
          />
        </AuthField>
      </AuthFieldGroup>

      <AuthFormAlert message={errorMessage} tone="error" />
      <AuthFormAlert message={statusMessage} tone="success" />

      <AuthSubmitButton
        pending={pending}
        pendingLabel={authPendingCopy.sendResetLink}
        type="submit"
      >
        {copy.actions.sendCode}
      </AuthSubmitButton>
    </form>
  );
}
