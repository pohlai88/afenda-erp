"use client";

import {
  credentialsSignInSchema,
  credentialsSignUpSchema,
} from "../contracts/auth.action-schemas.shared";
import { getNormalizedAuthErrorMessage } from "../errors/normalize-auth-error.shared";
import type { AuthMethodReadiness } from "../policy/auth-method-readiness.shared";
import { isPasswordPolicySatisfied } from "../policy/password-policy.shared";
import { getNeonAuthFormModeCopy, neonAuthFormCopy } from "@afenda/kernel";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AuthFormAlert } from "../ui/auth-form-alert.client";
import { AuthSubmitButton } from "../ui/auth-submit-button.client";
import { PasswordRequirementList } from "../ui/password-requirement-list.client";
import { authPendingCopy } from "../copy/auth-pending-copy.shared";
import { authSuccessCopy } from "../copy/auth-success-copy.shared";
import { neonAuthClient } from "@afenda/neon-auth/client";
import {
  AuthDivider,
  AuthField,
  AuthFieldGroup,
  AuthFormBody,
  AuthFormHeader,
  AuthInlineLink,
  AuthInput,
  AuthSecondaryButton,
  GoogleMark,
} from "../ui/auth-ui.primitives";

type AuthMode = "sign-in" | "sign-up";

type NeonAuthFormProps = {
  mode: AuthMode;
  showGoogleOAuth?: boolean;
  readiness?: Pick<AuthMethodReadiness, "google" | "forgotPassword">;
};

export function NeonAuthForm({
  mode,
  showGoogleOAuth = true,
  readiness = { google: false, forgotPassword: true },
}: NeonAuthFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const labels = getNeonAuthFormModeCopy(mode);
  const fields = neonAuthFormCopy.fields;
  const showPasswordPolicy = mode === "sign-up";
  const passwordPolicyMet =
    mode === "sign-in" || isPasswordPolicySatisfied(password);
  const confirmPasswordMet =
    mode === "sign-in" ||
    (confirmPassword.length > 0 && password === confirmPassword);
  const signUpSubmitDisabled =
    mode === "sign-up" && (!passwordPolicyMet || !confirmPasswordMet);

  function redirectAfterStatus(href: string) {
    window.setTimeout(() => {
      router.push(href);
      router.refresh();
    }, 450);
  }

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
          setErrorMessage(getNormalizedAuthErrorMessage(result.error));
          return;
        }

        if (result.data?.url) {
          window.location.assign(result.data.url);
          return;
        }

        router.refresh();
      } catch (error) {
        setErrorMessage(getNormalizedAuthErrorMessage(error));
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
            setErrorMessage(getNormalizedAuthErrorMessage(result.error));
            return;
          }

          setStatusMessage(authSuccessCopy.signIn);
          redirectAfterStatus(result.data?.url || "/");
          return;
        }

        const passwordValue = String(formData.get("password") || "");
        const confirmPasswordValue = String(
          formData.get("confirmPassword") || "",
        );

        if (!isPasswordPolicySatisfied(passwordValue)) {
          setErrorMessage(getNormalizedAuthErrorMessage("password policy"));
          return;
        }

        if (passwordValue !== confirmPasswordValue) {
          setErrorMessage("Passwords do not match.");
          return;
        }

        const parsed = credentialsSignUpSchema.parse({
          name: String(formData.get("name") || ""),
          email: String(formData.get("email") || ""),
          password: passwordValue,
        });

        const result = await neonAuthClient.signUp.email({
          ...parsed,
          callbackURL: "/onboarding",
        });

        if (result.error) {
          setErrorMessage(getNormalizedAuthErrorMessage(result.error));
          return;
        }

        const nextLocation =
          result.data &&
          "url" in result.data &&
          typeof result.data.url === "string"
            ? result.data.url
            : null;

        if (nextLocation) {
          setStatusMessage(authSuccessCopy.signUp);
          redirectAfterStatus(nextLocation);
          return;
        }

        const signUpUser = result.data?.user as
          | { emailVerified?: boolean }
          | undefined;

        if (signUpUser && signUpUser.emailVerified === false) {
          setStatusMessage(authSuccessCopy.signUp);
          redirectAfterStatus(
            `/verify-email?email=${encodeURIComponent(parsed.email)}`,
          );
          return;
        }

        const sessionCheck = await neonAuthClient.getSession();
        if (sessionCheck.data?.session) {
          setStatusMessage("Account created. Continuing to onboarding.");
          redirectAfterStatus("/onboarding");
          return;
        }

        setStatusMessage(authSuccessCopy.signUp);
        redirectAfterStatus(
          `/verify-email?email=${encodeURIComponent(parsed.email)}`,
        );
      } catch (error) {
        setErrorMessage(getNormalizedAuthErrorMessage(error));
      }
    });
  }

  return (
    <div>
      <AuthFormHeader
        badge={mode === "sign-up" ? "Operator onboarding" : "Workspace access"}
        description={labels.description}
        title={labels.title}
      />

      <AuthFormBody>
        {showGoogleOAuth && readiness.google ? (
          <div className="flex flex-col gap-5">
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
          className="flex flex-col gap-5"
        >
          <AuthFieldGroup>
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
              hint={mode === "sign-up" ? undefined : fields.passwordHint}
              error={
                showPasswordPolicy && password.length > 0 && !passwordPolicyMet
                  ? "Password does not meet the enterprise policy."
                  : null
              }
            >
              <AuthInput
                autoComplete={
                  mode === "sign-in" ? "current-password" : "new-password"
                }
                id="auth-password"
                minLength={8}
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </AuthField>
            {showPasswordPolicy ? (
              <>
                <PasswordRequirementList
                  id="auth-password-requirements"
                  password={password}
                />
                <AuthField
                  error={
                    confirmPassword.length > 0 && !confirmPasswordMet
                      ? "Passwords do not match."
                      : null
                  }
                  id="auth-confirm-password"
                  label="Confirm password"
                >
                  <AuthInput
                    autoComplete="new-password"
                    id="auth-confirm-password"
                    name="confirmPassword"
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    type="password"
                    value={confirmPassword}
                  />
                </AuthField>
              </>
            ) : null}
          </AuthFieldGroup>

          {mode === "sign-in" && readiness.forgotPassword ? (
            <div className="text-right">
              <AuthInlineLink href="/forgot-password">
                {fields.forgotPassword}
              </AuthInlineLink>
            </div>
          ) : null}

          <AuthFormAlert message={errorMessage} tone="error" />
          <AuthFormAlert message={statusMessage} tone="success" />

          <AuthSubmitButton
            disabled={signUpSubmitDisabled}
            pending={pending}
            pendingLabel={
              mode === "sign-in"
                ? authPendingCopy.signIn
                : authPendingCopy.signUp
            }
            type="submit"
          >
            {labels.button}
          </AuthSubmitButton>
        </form>

        <p className="text-center type-muted">
          {labels.alternatePrompt}{" "}
          <AuthInlineLink href={labels.alternateHref}>
            {labels.alternateLabel}
          </AuthInlineLink>
        </p>
      </AuthFormBody>
    </div>
  );
}
