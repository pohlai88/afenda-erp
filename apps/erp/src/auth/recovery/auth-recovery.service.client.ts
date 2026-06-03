"use client";

import { forgotPasswordCopy } from "@afenda/kernel";

import {
  completePasswordResetSchema,
  requestPasswordResetSchema,
} from "../contracts/auth.action-schemas.shared";
import { authSuccessCopy } from "../copy/auth-success-copy.shared";
import { getNormalizedAuthErrorMessage } from "../errors/normalize-auth-error.shared";
import { buildResetRedirectUrl } from "./auth-navigation.client";
import {
  isNeonEmailResetAvailable,
  neonCompleteResetViaOtp,
  neonHasActiveSession,
  neonRequestResetViaEmail,
  neonRequestResetViaOtp,
} from "./auth-recovery-adapter.client";

export type RequestPasswordResetResult =
  | {
      ok: true;
      strategy: "email-link" | "otp";
      email: string;
      statusMessage: string;
    }
  | { ok: false; errorMessage: string };

export type CompletePasswordResetResult =
  | { ok: true; signedIn: boolean; statusMessage: string }
  | { ok: false; errorMessage: string };

export async function checkAuthenticatedRecoveryRedirect(): Promise<boolean> {
  return neonHasActiveSession();
}

export async function requestPasswordReset(
  formData: FormData,
): Promise<RequestPasswordResetResult> {
  try {
    const parsed = requestPasswordResetSchema.parse({
      email: String(formData.get("email") ?? "").trim(),
    });

    if (isNeonEmailResetAvailable()) {
      const result = await neonRequestResetViaEmail(
        parsed.email,
        buildResetRedirectUrl(),
      );

      if (result.error) {
        return {
          ok: false,
          errorMessage: getNormalizedAuthErrorMessage(result.error),
        };
      }

      return {
        ok: true,
        strategy: "email-link",
        email: parsed.email,
        statusMessage: authSuccessCopy.resetDeliverySent,
      };
    }

    const result = await neonRequestResetViaOtp(parsed.email);

    if (result.error) {
      return {
        ok: false,
        errorMessage: getNormalizedAuthErrorMessage(result.error),
      };
    }

    return {
      ok: true,
      strategy: "otp",
      email: parsed.email,
      statusMessage: authSuccessCopy.resetDeliverySent,
    };
  } catch (error) {
    return {
      ok: false,
      errorMessage: getNormalizedAuthErrorMessage(error),
    };
  }
}

export async function completePasswordReset(input: {
  email: string;
  formData: FormData;
}): Promise<CompletePasswordResetResult> {
  try {
    const parsed = completePasswordResetSchema.parse({
      otp: String(input.formData.get("otp") ?? "").trim(),
      password: String(input.formData.get("password") ?? ""),
      confirmPassword: String(input.formData.get("confirmPassword") ?? ""),
    });

    const result = await neonCompleteResetViaOtp({
      email: input.email,
      otp: parsed.otp,
      password: parsed.password,
    });

    if (result.error) {
      return {
        ok: false,
        errorMessage: getNormalizedAuthErrorMessage(result.error),
      };
    }

    const signedIn = Boolean(
      result.data && "session" in result.data && result.data.session,
    );

    return {
      ok: true,
      signedIn,
      statusMessage: signedIn
        ? forgotPasswordCopy.messages.passwordUpdatedSignedIn
        : authSuccessCopy.passwordUpdated,
    };
  } catch (error) {
    return {
      ok: false,
      errorMessage: getNormalizedAuthErrorMessage(error),
    };
  }
}
