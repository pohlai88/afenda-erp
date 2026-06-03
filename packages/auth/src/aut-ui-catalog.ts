/** Neon Auth UI surfaces re-exported from `@neondatabase/auth-ui`. @see docs/auth/reference/ui-components */
export const implementedNeonAuthUiComponents = [
  "AuthView",
  "AccountView",
  "SignInForm",
  "SignUpForm",
  "ForgotPasswordForm",
  "ResetPasswordForm",
  "UserButton",
  "UserAvatar",
  "SignedIn",
  "SignedOut",
  "RedirectToSignIn",
  "RedirectToSignUp",
  "NeonAuthUIProvider",
] as const;

export type ImplementedNeonAuthUiComponent = (typeof implementedNeonAuthUiComponents)[number];
