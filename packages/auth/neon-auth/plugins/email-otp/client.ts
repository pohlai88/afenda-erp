"use client";

import { neonAuthClient } from "../../runtime/neon-auth.client";

export function sendEmailVerificationOtp(email: string) {
  return neonAuthClient.emailOtp.sendVerificationOtp({ email, type: "email-verification" });
}

export function verifyEmailWithOtp(input: { email: string; otp: string }) {
  return neonAuthClient.emailOtp.verifyEmail(input);
}

export function sendSignInOtp(email: string) {
  return neonAuthClient.emailOtp.sendVerificationOtp({ email, type: "sign-in" });
}

export function signInWithEmailOtp(input: { email: string; otp: string }) {
  return neonAuthClient.signIn.emailOtp(input);
}
