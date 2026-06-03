import { ZodError } from "zod";
import { authErrorCopy } from "../copy/auth-error-copy.shared";
import type { AuthErrorCode } from "./auth-error-codes.shared";

type ProviderErrorLike = {
  code?: unknown;
  message?: unknown;
  status?: unknown;
};

function readErrorText(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof ZodError) {
    return "validation_error password policy invalid input";
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const candidate = error as ProviderErrorLike;
    return [candidate.code, candidate.message, candidate.status]
      .filter((value): value is string | number => {
        return typeof value === "string" || typeof value === "number";
      })
      .join(" ");
  }

  return "";
}

export function normalizeAuthError(error: unknown): AuthErrorCode {
  const text = readErrorText(error).toLowerCase();

  if (
    text.includes("invalid credential") ||
    text.includes("invalid password") ||
    text.includes("incorrect") ||
    text.includes("unauthorized")
  ) {
    return "invalid_credentials";
  }

  if (
    text.includes("password") &&
    (text.includes("policy") ||
      text.includes("minimum") ||
      text.includes("validation"))
  ) {
    return "password_policy_failed";
  }

  if (
    text.includes("already") ||
    text.includes("duplicate") ||
    text.includes("exists")
  ) {
    return "email_already_registered";
  }

  if (
    text.includes("expired") ||
    text.includes("invalid token") ||
    text.includes("invalid code") ||
    text.includes("otp")
  ) {
    return "verification_code_expired";
  }

  if (
    text.includes("too many") ||
    text.includes("rate") ||
    text.includes("attempt")
  ) {
    return "too_many_attempts";
  }

  if (
    text.includes("not configured") ||
    text.includes("provider") ||
    text.includes("plugin")
  ) {
    return "provider_not_configured";
  }

  if (
    text.includes("email") &&
    (text.includes("delivery") ||
      text.includes("send") ||
      text.includes("smtp"))
  ) {
    return "email_delivery_unavailable";
  }

  if (
    text.includes("network") ||
    text.includes("fetch") ||
    text.includes("timeout") ||
    text.includes("service unavailable")
  ) {
    return "network_unavailable";
  }

  return "unknown_auth_error";
}

export function getNormalizedAuthErrorMessage(error: unknown): string {
  return authErrorCopy[normalizeAuthError(error)];
}
