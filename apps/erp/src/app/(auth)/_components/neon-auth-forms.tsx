"use client";

import { credentialsSignInSchema, credentialsSignUpSchema } from "@afenda/auth";
import { neonAuthClient } from "@afenda/auth/client";
import { getNeonAuthFormModeCopy, neonAuthFormCopy } from "@afenda/domain";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  AuthDivider,
  AuthField,
  AuthInlineLink,
  AuthInput,
  AuthNotice,
  AuthPrimaryButton,
  AuthSecondaryButton,
  GoogleMark,
} from "./auth-ui";

type AuthMode = "sign-in" | "sign-up";

type NeonAuthFormProps = {
  mode: AuthMode;
  showGoogleOAuth?: boolean;
};

export function NeonAuthForm({
  mode,
  showGoogleOAuth = true,
}: NeonAuthFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const labels = getNeonAuthFormModeCopy(mode);
  const fields = neonAuthFormCopy.fields;
  const errors = neonAuthFormCopy.errors;

  function handleGoogleSignIn() {
    setErrorMessage(null);
    setStatusMessage(null);

    startTransition(async () => {
      try {
        const result = await neonAuthClient.signIn.social({
          provider: "google",
          callbackURL: "/",
          newUserCallbackURL: "/onboarding",
        });

        if (result.error) {
          setErrorMessage(result.error.message || errors.googleSignIn);
          return;
        }

        if (result.data?.url) {
          window.location.assign(result.data.url);
          return;
        }

        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : errors.googleStart,
        );
      }
    });
  }

  function handleSubmit(formData: FormData) {
    setErrorMessage(null);
    setStatusMessage(null);

    startTransition(async () => {
      try {
        if (mode === "sign-in") {
          const parsed = credentialsSignInSchema.parse({
            email: String(formData.get("email") || ""),
            password: String(formData.get("password") || ""),
          });

          const result = await neonAuthClient.signIn.email({
            ...parsed,
            callbackURL: "/",
          });

          if (result.error) {
            setErrorMessage(result.error.message || errors.signIn);
            return;
          }

          router.push(result.data?.url || "/");
          router.refresh();
          return;
        }

        const parsed = credentialsSignUpSchema.parse({
          name: String(formData.get("name") || ""),
          email: String(formData.get("email") || ""),
          password: String(formData.get("password") || ""),
        });

        const result = await neonAuthClient.signUp.email({
          ...parsed,
          callbackURL: "/onboarding",
        });

        if (result.error) {
          setErrorMessage(result.error.message || errors.signUp);
          return;
        }

        setStatusMessage(neonAuthFormCopy.signUp.successMessage);

        const nextLocation =
          result.data &&
          "url" in result.data &&
          typeof result.data.url === "string"
            ? result.data.url
            : null;

        if (nextLocation) {
          router.push(nextLocation);
          router.refresh();
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : errors.generic,
        );
      }
    });
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground">{labels.title}</h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {labels.description}
      </p>

      {showGoogleOAuth ? (
        <div className="mt-8 space-y-5">
          <AuthSecondaryButton
            disabled={pending}
            onClick={handleGoogleSignIn}
            type="button"
          >
            <GoogleMark />
            {neonAuthFormCopy.googleButton}
          </AuthSecondaryButton>
          <AuthDivider label={neonAuthFormCopy.dividerLabel} />
        </div>
      ) : null}

      <form
        action={handleSubmit}
        aria-busy={pending}
        className={showGoogleOAuth ? "space-y-5" : "mt-8 space-y-5"}
      >
        {mode === "sign-up" ? (
          <AuthField id="auth-name" label={fields.fullName}>
            <AuthInput
              autoComplete="name"
              id="auth-name"
              name="name"
              required
            />
          </AuthField>
        ) : null}
        <AuthField id="auth-email" label={fields.email}>
          <AuthInput
            autoComplete="email"
            id="auth-email"
            name="email"
            required
            type="email"
          />
        </AuthField>
        <AuthField
          id="auth-password"
          label={fields.password}
          hint={mode === "sign-up" ? fields.passwordHint : undefined}
        >
          <AuthInput
            autoComplete={
              mode === "sign-in" ? "current-password" : "new-password"
            }
            id="auth-password"
            minLength={8}
            name="password"
            required
            type="password"
          />
        </AuthField>

        {mode === "sign-in" ? (
          <div className="text-right">
            <AuthInlineLink href="/forgot-password">
              {fields.forgotPassword}
            </AuthInlineLink>
          </div>
        ) : null}

        {errorMessage ? (
          <AuthNotice tone="error">{errorMessage}</AuthNotice>
        ) : null}
        {statusMessage ? (
          <AuthNotice tone="success">{statusMessage}</AuthNotice>
        ) : null}

        <AuthPrimaryButton disabled={pending} type="submit">
          {pending ? neonAuthFormCopy.pendingLabel : labels.button}
        </AuthPrimaryButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {labels.alternatePrompt}{" "}
        <AuthInlineLink href={labels.alternateHref}>
          {labels.alternateLabel}
        </AuthInlineLink>
      </p>
    </div>
  );
}
