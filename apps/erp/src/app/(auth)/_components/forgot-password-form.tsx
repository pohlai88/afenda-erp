"use client";

import { neonAuthClient } from "@afenda/auth/client";
import { forgotPasswordCopy } from "@afenda/domain";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  AuthField,
  AuthInlineLink,
  AuthInput,
  AuthNotice,
  AuthPrimaryButton,
  AuthSecondaryButton,
} from "./auth-ui";

type ForgotPasswordStep = "request" | "reset";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<ForgotPasswordStep>("request");
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const copy = forgotPasswordCopy;

  function handleRequestCode(formData: FormData) {
    setErrorMessage(null);
    setStatusMessage(null);

    const nextEmail = String(formData.get("email") || "").trim();

    startTransition(async () => {
      try {
        const result = await neonAuthClient.forgetPassword.emailOtp({
          email: nextEmail,
        });

        if (result.error) {
          setErrorMessage(result.error.message || copy.messages.sendCodeError);
          return;
        }

        setEmail(nextEmail);
        setStep("reset");
        setStatusMessage(copy.messages.codeSent);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : copy.messages.sendCodeFailed,
        );
      }
    });
  }

  function handleResetPassword(formData: FormData) {
    setErrorMessage(null);
    setStatusMessage(null);

    const otp = String(formData.get("otp") || "").trim();
    const password = String(formData.get("password") || "");

    startTransition(async () => {
      try {
        const result = await neonAuthClient.emailOtp.resetPassword({
          email,
          otp,
          password,
        });

        if (result.error) {
          setErrorMessage(result.error.message || copy.messages.resetFailed);
          return;
        }

        setStatusMessage(copy.messages.passwordUpdated);
        router.push("/sign-in");
        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : copy.messages.passwordResetFailed,
        );
      }
    });
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground">{copy.title}</h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {step === "request" ? copy.requestDescription : copy.resetDescription}
      </p>

      {step === "request" ? (
        <form action={handleRequestCode} className="mt-8 space-y-5">
          <AuthField id="reset-email" label={copy.fields.email}>
            <AuthInput
              autoComplete="email"
              defaultValue={email}
              id="reset-email"
              name="email"
              required
              type="email"
            />
          </AuthField>
          {errorMessage ? (
            <AuthNotice tone="error">{errorMessage}</AuthNotice>
          ) : null}
          {statusMessage ? (
            <AuthNotice tone="success">{statusMessage}</AuthNotice>
          ) : null}
          <AuthPrimaryButton disabled={pending} type="submit">
            {pending ? copy.actions.sendingCode : copy.actions.sendCode}
          </AuthPrimaryButton>
        </form>
      ) : (
        <form action={handleResetPassword} className="mt-8 space-y-5">
          <AuthField id="reset-email-readonly" label={copy.fields.email}>
            <AuthInput
              id="reset-email-readonly"
              name="email"
              readOnly
              value={email}
            />
          </AuthField>
          <AuthField id="reset-otp" label={copy.fields.verificationCode}>
            <AuthInput
              autoComplete="one-time-code"
              id="reset-otp"
              inputMode="numeric"
              name="otp"
              required
            />
          </AuthField>
          <AuthField
            id="reset-password"
            hint={copy.fields.passwordHint}
            label={copy.fields.newPassword}
          >
            <AuthInput
              autoComplete="new-password"
              id="reset-password"
              minLength={8}
              name="password"
              required
              type="password"
            />
          </AuthField>
          {errorMessage ? (
            <AuthNotice tone="error">{errorMessage}</AuthNotice>
          ) : null}
          {statusMessage ? (
            <AuthNotice tone="success">{statusMessage}</AuthNotice>
          ) : null}
          <AuthPrimaryButton disabled={pending} type="submit">
            {pending
              ? copy.actions.updatingPassword
              : copy.actions.updatePassword}
          </AuthPrimaryButton>
          <AuthSecondaryButton
            disabled={pending}
            onClick={() => {
              setStep("request");
              setStatusMessage(null);
              setErrorMessage(null);
            }}
            type="button"
          >
            {copy.actions.sendNewCode}
          </AuthSecondaryButton>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {copy.footerPrompt}{" "}
        <AuthInlineLink href="/sign-in">{copy.footerAction}</AuthInlineLink>
      </p>
    </div>
  );
}
