"use client";

import { neonAuthClient } from "../../runtime/neon-auth.client";

type AuthAdapterError = { message?: string } | null | undefined;

export type AuthAdapterResult = {
  error?: AuthAdapterError;
};

type ForgetPasswordEmailFn = (input: {
  email: string;
  redirectTo?: string;
}) => Promise<AuthAdapterResult>;

function resolveForgetPasswordEmail(): ForgetPasswordEmailFn | null {
  const forgetPassword = neonAuthClient.forgetPassword as { email?: ForgetPasswordEmailFn };
  return typeof forgetPassword.email === "function" ? forgetPassword.email : null;
}

export function isNeonEmailResetAvailable() {
  return resolveForgetPasswordEmail() !== null;
}

export async function neonHasActiveSession(): Promise<boolean> {
  const result = await neonAuthClient.getSession();
  return Boolean(result.data?.session);
}

export async function neonRequestResetViaEmail(
  email: string,
  redirectTo: string,
): Promise<AuthAdapterResult> {
  const fn = resolveForgetPasswordEmail();
  if (!fn) throw new Error("Email reset is not available.");
  return fn({ email, redirectTo });
}

export async function neonRequestResetViaOtp(email: string): Promise<AuthAdapterResult> {
  return neonAuthClient.forgetPassword.emailOtp({ email });
}

export async function neonCompleteResetViaOtp(input: {
  email: string;
  otp: string;
  password: string;
}) {
  return neonAuthClient.emailOtp.resetPassword(input);
}

export function resetPasswordWithToken(input: { token: string; newPassword: string }) {
  return neonAuthClient.resetPassword(input);
}

/** @deprecated Use neonRequestResetViaEmail */
export const requestPasswordResetViaEmail = neonRequestResetViaEmail;

/** @deprecated Use neonRequestResetViaOtp */
export const requestPasswordResetViaOtp = neonRequestResetViaOtp;

/** @deprecated Use neonCompleteResetViaOtp */
export const completePasswordResetViaOtp = neonCompleteResetViaOtp;
