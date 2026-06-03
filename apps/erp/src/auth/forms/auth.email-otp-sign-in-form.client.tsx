"use client";

import { NeonPasswordlessSignIn } from "./auth.neon-passwordless-sign-in.client";

const EMAIL_OTP_READINESS = {
  emailOtp: true,
  magicLink: false,
} as const;

export function EmailOtpSignInForm() {
  return (
    <section
      aria-label="Email one-time-password sign in"
      data-auth-surface="email-otp-sign-in"
      data-auth-method="email-otp"
      data-auth-state="ready"
    >
      <NeonPasswordlessSignIn
        readiness={EMAIL_OTP_READINESS}
        variant="standalone"
      />
    </section>
  );
}
