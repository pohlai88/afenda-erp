/**
 * Re-export Neon Auth UI components for `@afenda/auth/neon-auth/ui`.
 * Prefer these over `@neondatabase/auth-ui` direct imports in apps/erp.
 */
export {
  AccountView,
  AuthCallback,
  AuthView,
  ForgotPasswordForm,
  RedirectToSignIn,
  RedirectToSignUp,
  ResetPasswordForm,
  SignedIn,
  SignedOut,
  SignInForm,
  SignUpForm,
  UserAvatar,
  UserButton,
} from "@neondatabase/auth-ui";

export { NeonAuthUIProvider, type NeonAuthUIProviderProps } from "@neondatabase/auth-ui";
