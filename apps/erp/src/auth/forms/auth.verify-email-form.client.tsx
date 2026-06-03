"use client";

import { getNormalizedAuthErrorMessage } from "../errors/normalize-auth-error.shared";
import { verifyEmailCopy } from "@afenda/kernel";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AuthFormAlert } from "../ui/auth-form-alert.client";
import { AuthSubmitButton } from "../ui/auth-submit-button.client";
import { authPendingCopy } from "../copy/auth-pending-copy.shared";
import { authSuccessCopy } from "../copy/auth-success-copy.shared";
import { neonAuthClient } from "@afenda/auth/client";
import {
  AuthField,
  AuthFieldGroup,
  AuthFormBody,
  AuthFormHeader,
  AuthInlineLink,
  AuthInput,
  AuthSecondaryButton,
} from "../ui/auth-ui.primitives";

type NeonUser = {
  emailVerified?: boolean;
};

function isEmailVerified(user: NeonUser | undefined) {
  return user?.emailVerified === true;
}

export function VerifyEmailForm({ initialEmail }: { initialEmail: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [pending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState(0);
  const copy = verifyEmailCopy;

  useEffect(() => {
    neonAuthClient.getSession().then((result) => {
      const user = result.data?.user as NeonUser | undefined;
      if (result.data?.session && isEmailVerified(user)) {
        router.replace("/onboarding");
        router.refresh();
      }
    });
  }, [router]);

  useEffect(() => {
    if (resendCooldownSeconds <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setResendCooldownSeconds((value) => Math.max(0, value - 1));
    }, 1_000);

    return () => window.clearTimeout(timer);
  }, [resendCooldownSeconds]);

  function resendVerification() {
    setErrorMessage(null);
    setStatusMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage(copy.messages.missingEmail);
      return;
    }

    startTransition(async () => {
      try {
        const client = neonAuthClient as typeof neonAuthClient & {
          sendVerificationEmail?: (input: {
            email: string;
            callbackURL: string;
          }) => Promise<{ error?: { message?: string } | null }>;
        };

        if (typeof client.sendVerificationEmail === "function") {
          const origin =
            typeof window !== "undefined" ? window.location.origin : "";
          const result = await client.sendVerificationEmail({
            email: trimmedEmail,
            callbackURL: `${origin}/verify-email`,
          });

          if (result.error) {
            setErrorMessage(getNormalizedAuthErrorMessage(result.error));
            return;
          }

          setStatusMessage(authSuccessCopy.verificationCodeSent);
          setResendCooldownSeconds(30);
          return;
        }

        const result = await neonAuthClient.emailOtp.sendVerificationOtp({
          email: trimmedEmail,
          type: "email-verification",
        });

        if (result.error) {
          setErrorMessage(getNormalizedAuthErrorMessage(result.error));
          return;
        }

        setStatusMessage(authSuccessCopy.verificationCodeSent);
        setResendCooldownSeconds(30);
      } catch (error) {
        setErrorMessage(getNormalizedAuthErrorMessage(error));
      }
    });
  }

  function handleVerify(formData: FormData) {
    setErrorMessage(null);
    setStatusMessage(null);

    const trimmedEmail = String(formData.get("email") || "").trim();
    const otp = String(formData.get("otp") || "").trim();

    if (!trimmedEmail) {
      setErrorMessage(copy.messages.missingEmail);
      return;
    }

    startTransition(async () => {
      try {
        const result = await neonAuthClient.emailOtp.verifyEmail({
          email: trimmedEmail,
          otp,
        });

        if (result.error) {
          setErrorMessage(getNormalizedAuthErrorMessage(result.error));
          return;
        }

        if (result.data && "session" in result.data && result.data.session) {
          setStatusMessage(authSuccessCopy.emailVerified);
          window.setTimeout(() => {
            router.push("/onboarding");
            router.refresh();
          }, 450);
          return;
        }

        setStatusMessage(copy.messages.verifiedSignIn);
        window.setTimeout(() => {
          router.push("/sign-in");
          router.refresh();
        }, 450);
      } catch (error) {
        setErrorMessage(getNormalizedAuthErrorMessage(error));
      }
    });
  }

  return (
    <div>
      <AuthFormHeader
        badge="Email verification"
        description={copy.description}
        title={copy.title}
      />

      <AuthFormBody>
        <form action={handleVerify} className="flex flex-col gap-5">
          <AuthFieldGroup>
            <AuthField id="verify-email" label={copy.fields.email}>
              <AuthInput
                autoComplete="email"
                id="verify-email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </AuthField>
            <AuthField id="verify-otp" label={copy.fields.verificationCode}>
              <AuthInput
                autoComplete="one-time-code"
                id="verify-otp"
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
            {copy.actions.verify}
          </AuthSubmitButton>
          <AuthSecondaryButton
            disabled={pending || resendCooldownSeconds > 0}
            onClick={resendVerification}
            type="button"
          >
            {resendCooldownSeconds > 0
              ? `Resend available in ${resendCooldownSeconds}s`
              : pending
                ? copy.actions.resendingCode
                : copy.actions.resendCode}
          </AuthSecondaryButton>
        </form>

        <p className="text-center type-muted">
          {copy.footerPrompt}{" "}
          <AuthInlineLink href="/sign-in">{copy.footerAction}</AuthInlineLink>
        </p>
      </AuthFormBody>
    </div>
  );
}
