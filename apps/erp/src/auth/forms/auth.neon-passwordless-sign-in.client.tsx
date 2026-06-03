"use client";

import { getNormalizedAuthErrorMessage } from "../errors/normalize-auth-error.shared";
import type { AuthMethodReadiness } from "../policy/auth-method-readiness.shared";
import { neonAuthFormCopy } from "@afenda/kernel";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { z } from "zod";
import { AuthFormAlert } from "../ui/auth-form-alert.client";
import { AuthSubmitButton } from "../ui/auth-submit-button.client";
import { authPendingCopy } from "../copy/auth-pending-copy.shared";
import { authSuccessCopy } from "../copy/auth-success-copy.shared";
import { neonAuthClient } from "@afenda/auth/client";
import {
  AuthField,
  AuthFieldGroup,
  AuthInput,
  AuthSecondaryButton,
} from "../ui/auth-ui.primitives";

const emailSchema = z.object({
  email: z.email(),
});

const emailOtpSchema = z.object({
  email: z.email(),
  otp: z.string().trim().min(4).max(8),
});

type PasswordlessMode = "magic-link" | "email-otp";
type EmailOtpStep = "request" | "verify";

export function NeonPasswordlessSignIn({
  readiness = { magicLink: false, emailOtp: false },
  variant = "embedded",
}: {
  readiness?: Pick<AuthMethodReadiness, "magicLink" | "emailOtp">;
  variant?: "embedded" | "standalone";
}) {
  const router = useRouter();
  const initialMode: PasswordlessMode = readiness.magicLink
    ? "magic-link"
    : "email-otp";
  const [mode, setMode] = useState<PasswordlessMode>(initialMode);
  const [otpStep, setOtpStep] = useState<EmailOtpStep>("request");
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const copy = neonAuthFormCopy.passwordless;

  function resetMessages() {
    setErrorMessage(null);
    setStatusMessage(null);
  }

  function handleMagicLink(formData: FormData) {
    resetMessages();
    startTransition(async () => {
      try {
        const parsed = emailSchema.parse({
          email: String(formData.get("email") || ""),
        });

        const origin =
          typeof window !== "undefined" ? window.location.origin : "";
        const result = await neonAuthClient.signIn.magicLink({
          email: parsed.email,
          callbackURL: origin ? `${origin}/` : "/",
        });

        if (result.error) {
          setErrorMessage(getNormalizedAuthErrorMessage(result.error));
          return;
        }

        setStatusMessage(authSuccessCopy.magicLinkSent);
      } catch (error) {
        setErrorMessage(getNormalizedAuthErrorMessage(error));
      }
    });
  }

  function handleEmailOtpRequest(formData: FormData) {
    resetMessages();
    startTransition(async () => {
      try {
        const parsed = emailSchema.parse({
          email: String(formData.get("email") || ""),
        });

        const result = await neonAuthClient.emailOtp.sendVerificationOtp({
          email: parsed.email,
          type: "sign-in",
        });

        if (result.error) {
          setErrorMessage(getNormalizedAuthErrorMessage(result.error));
          return;
        }

        setEmail(parsed.email);
        setOtpStep("verify");
        setStatusMessage(authSuccessCopy.emailOtpSent);
      } catch (error) {
        setErrorMessage(getNormalizedAuthErrorMessage(error));
      }
    });
  }

  function handleEmailOtpVerify(formData: FormData) {
    resetMessages();
    startTransition(async () => {
      try {
        const parsed = emailOtpSchema.parse({
          email: String(formData.get("email") || email),
          otp: String(formData.get("otp") || ""),
        });

        const result = await neonAuthClient.signIn.emailOtp({
          email: parsed.email,
          otp: parsed.otp,
        });

        if (result.error) {
          setErrorMessage(getNormalizedAuthErrorMessage(result.error));
          return;
        }

        setStatusMessage(authSuccessCopy.signIn);
        window.setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 450);
      } catch (error) {
        setErrorMessage(getNormalizedAuthErrorMessage(error));
      }
    });
  }

  if (!readiness.magicLink && !readiness.emailOtp) {
    return null;
  }

  const showModeSwitch = variant === "embedded" && readiness.magicLink;

  return (
    <div
      className={
        variant === "embedded"
          ? "mt-surface-3xl flex flex-col gap-surface-lg border-t border-border pt-surface-3xl"
          : "flex flex-col gap-surface-lg"
      }
    >
      {variant === "embedded" ? (
        <div className="flex flex-col gap-1">
          <h3 className="type-subheading">{copy.sectionTitle}</h3>
        </div>
      ) : null}

      {showModeSwitch ? (
        <div className="flex flex-wrap gap-2">
          {readiness.magicLink ? (
            <AuthSecondaryButton
              disabled={pending}
              onClick={() => {
                resetMessages();
                setMode("magic-link");
                setOtpStep("request");
              }}
              type="button"
            >
              {copy.magicLink.title}
            </AuthSecondaryButton>
          ) : null}
          {readiness.emailOtp ? (
            <AuthSecondaryButton
              disabled={pending}
              onClick={() => {
                resetMessages();
                setMode("email-otp");
                setOtpStep("request");
              }}
              type="button"
            >
              {copy.emailOtp.title}
            </AuthSecondaryButton>
          ) : null}
        </div>
      ) : null}

      {mode === "magic-link" && readiness.magicLink ? (
        <form action={handleMagicLink} className="flex flex-col gap-surface-md">
          <p className="type-caption text-muted-foreground">
            {copy.magicLink.description}
          </p>
          <AuthFieldGroup className="gap-surface-md">
            <AuthField
              id="magic-link-email"
              label={neonAuthFormCopy.fields.email}
            >
              <AuthInput
                autoComplete="email"
                id="magic-link-email"
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
            pendingLabel={authPendingCopy.sendMagicLink}
            type="submit"
          >
            {copy.magicLink.button}
          </AuthSubmitButton>
        </form>
      ) : readiness.emailOtp ? (
        <div className="flex flex-col gap-surface-md">
          <p className="type-caption text-muted-foreground">
            {copy.emailOtp.description}
          </p>
          {otpStep === "request" ? (
            <form
              action={handleEmailOtpRequest}
              className="flex flex-col gap-surface-md"
            >
              <AuthFieldGroup className="gap-surface-md">
                <AuthField
                  id="otp-sign-in-email"
                  label={neonAuthFormCopy.fields.email}
                >
                  <AuthInput
                    autoComplete="email"
                    defaultValue={email}
                    id="otp-sign-in-email"
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
                pendingLabel={authPendingCopy.sendVerificationCode}
                type="submit"
              >
                {copy.emailOtp.sendButton}
              </AuthSubmitButton>
            </form>
          ) : (
            <form
              action={handleEmailOtpVerify}
              className="flex flex-col gap-surface-md"
            >
              <input name="email" type="hidden" value={email} />
              <p className="type-caption text-muted-foreground">
                {neonAuthFormCopy.fields.email}: {email}
              </p>
              <AuthFieldGroup className="gap-surface-md">
                <AuthField
                  id="otp-sign-in-code"
                  label={copy.emailOtp.codeLabel}
                >
                  <AuthInput
                    autoComplete="one-time-code"
                    id="otp-sign-in-code"
                    inputMode="numeric"
                    name="otp"
                    required
                  />
                </AuthField>
              </AuthFieldGroup>
              <AuthFormAlert message={errorMessage} tone="error" />
              <AuthFormAlert message={statusMessage} tone="success" />
              <AuthSubmitButton
                pending={pending}
                pendingLabel={authPendingCopy.verifyCode}
                type="submit"
              >
                {copy.emailOtp.verifyButton}
              </AuthSubmitButton>
              <AuthSecondaryButton
                disabled={pending}
                onClick={() => setOtpStep("request")}
                type="button"
              >
                {copy.emailOtp.sendButton}
              </AuthSecondaryButton>
            </form>
          )}
        </div>
      ) : null}
    </div>
  );
}
