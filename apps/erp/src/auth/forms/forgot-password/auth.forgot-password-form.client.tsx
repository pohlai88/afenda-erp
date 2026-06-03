"use client";

import { forgotPasswordCopy } from "@afenda/kernel";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AUTH_ROUTES } from "../../contracts/auth.routes.shared";
import {
  AUTH_RECOVERY_PROVIDER,
  AUTH_RECOVERY_SURFACE,
  resolveInitialRecoveryStep,
  type AuthRecoveryStep,
} from "../../recovery/auth-recovery-flow.shared";
import {
  redirectAfterPasswordReset,
  redirectAuthenticatedGuestAway,
} from "../../recovery/auth-navigation.client";
import { checkAuthenticatedRecoveryRedirect } from "../../recovery/auth-recovery.service.client";
import {
  AuthFormBody,
  AuthFormHeader,
  AuthInlineLink,
} from "../../ui/auth-ui.primitives";
import { CompleteResetStep } from "./auth.complete-reset-step.client";
import { RequestResetStep } from "./auth.request-reset-step.client";

export function ForgotPasswordForm({
  initialEmail = "",
}: {
  initialEmail?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<AuthRecoveryStep>(() =>
    resolveInitialRecoveryStep(initialEmail),
  );
  const [email, setEmail] = useState(initialEmail);
  const copy = forgotPasswordCopy;

  useEffect(() => {
    checkAuthenticatedRecoveryRedirect().then((hasSession) => {
      if (hasSession) {
        redirectAuthenticatedGuestAway(router);
      }
    });
  }, [router]);

  function handleOtpRequested(nextEmail: string) {
    setEmail(nextEmail);
    setStep("reset");
  }

  function handleBackToRequest() {
    setStep("request");
  }

  function handleResetSuccess(signedIn: boolean) {
    redirectAfterPasswordReset(router, signedIn);
  }

  return (
    <section
      aria-label="Forgot password"
      data-auth-surface={AUTH_RECOVERY_SURFACE}
      data-auth-state={step}
      data-auth-provider={AUTH_RECOVERY_PROVIDER}
    >
      <AuthFormHeader
        badge="Credential recovery"
        description={
          step === "request" ? copy.requestDescription : copy.resetDescription
        }
        title={copy.title}
      />

      <AuthFormBody>
        {step === "request" ? (
          <RequestResetStep email={email} onOtpRequested={handleOtpRequested} />
        ) : (
          <CompleteResetStep
            email={email}
            onBackToRequest={handleBackToRequest}
            onSuccess={handleResetSuccess}
          />
        )}

        <p className="text-center type-muted">
          {copy.footerPrompt}{" "}
          <AuthInlineLink href={AUTH_ROUTES.signIn}>
            {copy.footerAction}
          </AuthInlineLink>
        </p>
      </AuthFormBody>
    </section>
  );
}
