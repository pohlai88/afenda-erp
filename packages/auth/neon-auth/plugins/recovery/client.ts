"use client";

import { neonAuthClient } from "../../runtime/neon-auth.client";

export type NeonAuthClientResult = { error?: { message?: string } | null };

type ForgetPasswordEmailFn = (input: {
  email: string;
  redirectTo?: string;
}) => Promise<NeonAuthClientResult>;

function resolveForgetPasswordEmail(): ForgetPasswordEmailFn | null {
  const forgetPassword = neonAuthClient.forgetPassword as { email?: ForgetPasswordEmailFn };
  return typeof forgetPassword.email === "function" ? forgetPassword.email : null;
}

export function isNeonEmailResetAvailable() {
  return resolveForgetPasswordEmail() !== null;
}

export async function requestPasswordResetViaEmail(email: string, redirectTo: string) {
  const fn = resolveForgetPasswordEmail();
  if (!fn) throw new Error("Email reset is not available.");
  return fn({ email, redirectTo });
}

export function requestPasswordResetViaOtp(email: string) {
  return neonAuthClient.forgetPassword.emailOtp({ email });
}

export function completePasswordResetViaOtp(input: { email: string; otp: string; password: string }) {
  return neonAuthClient.emailOtp.resetPassword(input);
}

export function resetPasswordWithToken(input: { token: string; newPassword: string }) {
  return neonAuthClient.resetPassword(input);
}
