"use client";

import { getNormalizedAuthErrorMessage } from "../errors/normalize-auth-error.shared";
import { isPasswordPolicySatisfied } from "../policy/password-policy.shared";
import { resetPasswordCopy } from "@afenda/kernel";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AuthFormAlert } from "../ui/auth-form-alert.client";
import { AuthSubmitButton } from "../ui/auth-submit-button.client";
import { PasswordRequirementList } from "../ui/password-requirement-list.client";
import { authPendingCopy } from "../copy/auth-pending-copy.shared";
import { authSuccessCopy } from "../copy/auth-success-copy.shared";
import { neonAuthClient } from "@afenda/neon-auth/client";
import {
  AuthField,
  AuthFieldGroup,
  AuthFormBody,
  AuthFormHeader,
  AuthInlineLink,
  AuthInput,
  AuthNotice,
} from "../ui/auth-ui.primitives";

type ResetPasswordClient = typeof neonAuthClient & {
  resetPassword: (input: { newPassword: string; token: string }) => Promise<{
    error?: { message?: string } | null;
    data?: { session?: unknown } | null;
  }>;
};

export function ResetPasswordForm({
  initialToken = "",
}: {
  initialToken?: string;
}) {
  const router = useRouter();
  const [token, setToken] = useState(initialToken);
  const [pending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [passwordValue, setPasswordValue] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");
  const copy = resetPasswordCopy;
  const passwordPolicyMet = isPasswordPolicySatisfied(passwordValue);
  const confirmPasswordMet =
    confirmPasswordValue.length > 0 && passwordValue === confirmPasswordValue;

  useEffect(() => {
    if (initialToken) {
      setToken(initialToken);
    }
  }, [initialToken]);

  useEffect(() => {
    neonAuthClient.getSession().then((result) => {
      if (result.data?.session && !token) {
        router.replace("/dashboard");
        router.refresh();
      }
    });
  }, [router, token]);

  function handleSubmit(formData: FormData) {
    setErrorMessage(null);
    setStatusMessage(null);

    const nextToken = String(formData.get("token") || token).trim();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (!nextToken) {
      setErrorMessage(copy.messages.missingToken);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(copy.messages.mismatch);
      return;
    }

    if (!isPasswordPolicySatisfied(password)) {
      setErrorMessage(getNormalizedAuthErrorMessage("password policy"));
      return;
    }

    startTransition(async () => {
      try {
        const client = neonAuthClient as ResetPasswordClient;
        if (typeof client.resetPassword !== "function") {
          setErrorMessage(copy.messages.resetFailed);
          return;
        }

        const result = await client.resetPassword({
          newPassword: password,
          token: nextToken,
        });

        if (result.error) {
          setErrorMessage(getNormalizedAuthErrorMessage(result.error));
          return;
        }

        if (result.data && "session" in result.data && result.data.session) {
          setStatusMessage(copy.messages.passwordUpdatedSignedIn);
          window.setTimeout(() => {
            router.push("/dashboard");
            router.refresh();
          }, 450);
          return;
        }

        setStatusMessage(authSuccessCopy.passwordUpdated);
        window.setTimeout(() => {
          router.push("/sign-in");
          router.refresh();
        }, 450);
      } catch (error) {
        setErrorMessage(getNormalizedAuthErrorMessage(error));
      }
    });
  }

  if (!token) {
    return (
      <div>
        <AuthFormHeader
          badge="Recovery"
          description="Open the reset link from your email to continue."
          title={copy.title}
        />
        <AuthFormBody>
          <AuthNotice tone="error">{copy.messages.missingToken}</AuthNotice>
          <p>
            <AuthInlineLink href="/forgot-password">
              {copy.actions.requestNewLink}
            </AuthInlineLink>
          </p>
          <p className="text-center type-muted">
            {copy.footerPrompt}{" "}
            <AuthInlineLink href="/sign-in">{copy.footerAction}</AuthInlineLink>
          </p>
        </AuthFormBody>
      </div>
    );
  }

  return (
    <div>
      <AuthFormHeader
        badge="Recovery"
        description={copy.description}
        title={copy.title}
      />

      <AuthFormBody>
        <form action={handleSubmit} className="flex flex-col gap-5">
          <input name="token" type="hidden" value={token} />
          <AuthFieldGroup>
            <AuthField
              error={
                passwordValue.length > 0 && !passwordPolicyMet
                  ? "Password does not meet the enterprise policy."
                  : null
              }
              hint={copy.fields.passwordHint}
              id="reset-new-password"
              label={copy.fields.newPassword}
            >
              <AuthInput
                autoComplete="new-password"
                id="reset-new-password"
                minLength={8}
                name="password"
                onChange={(event) => setPasswordValue(event.target.value)}
                required
                type="password"
                value={passwordValue}
              />
            </AuthField>
            <PasswordRequirementList password={passwordValue} />
            <AuthField
              error={
                confirmPasswordValue.length > 0 && !confirmPasswordMet
                  ? copy.messages.mismatch
                  : null
              }
              id="reset-confirm-password"
              label={copy.fields.confirmPassword}
            >
              <AuthInput
                autoComplete="new-password"
                id="reset-confirm-password"
                minLength={8}
                name="confirmPassword"
                onChange={(event) =>
                  setConfirmPasswordValue(event.target.value)
                }
                required
                type="password"
                value={confirmPasswordValue}
              />
            </AuthField>
          </AuthFieldGroup>
          <AuthFormAlert message={errorMessage} tone="error" />
          <AuthFormAlert message={statusMessage} tone="success" />
          <AuthSubmitButton
            disabled={!passwordPolicyMet || !confirmPasswordMet}
            pending={pending}
            pendingLabel={authPendingCopy.updatePassword}
            type="submit"
          >
            {copy.actions.submit}
          </AuthSubmitButton>
        </form>

        <p className="text-center type-muted">
          {copy.footerPrompt}{" "}
          <AuthInlineLink href="/sign-in">{copy.footerAction}</AuthInlineLink>
        </p>
      </AuthFormBody>
    </div>
  );
}
