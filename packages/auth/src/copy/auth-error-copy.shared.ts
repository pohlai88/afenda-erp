import type { AuthErrorCode } from "../errors/auth-error-codes.shared";

export const authErrorCopy: Record<AuthErrorCode, string> = {
  invalid_credentials:
    "The email or password is incorrect. Check your credentials and try again.",
  password_policy_failed:
    "Password does not meet the enterprise security policy.",
  email_already_registered:
    "An account already exists for this email. Sign in or reset your password.",
  verification_code_expired:
    "That verification code is expired or invalid. Request a new code.",
  too_many_attempts:
    "Too many attempts. Request a new code or try again later.",
  provider_not_configured:
    "This sign-in method is not configured for this environment. Contact your administrator.",
  email_delivery_unavailable:
    "Email delivery is not available for this environment. Contact your administrator.",
  network_unavailable:
    "Authentication service is temporarily unavailable. Check your connection and try again.",
  unknown_auth_error:
    "Authentication could not be completed. Try again or contact your administrator.",
};
