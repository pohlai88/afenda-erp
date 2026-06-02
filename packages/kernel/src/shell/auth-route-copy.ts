export const authShellCopy = {
  hero: {
    eyebrow: "Afenda ERP",
    title: "Tenant-aware ERP access with full-stack organization context.",
    description:
      "Authentication, tenant membership, and protected routing share one server-side model. Operators sign in through branch-aware Neon Auth and continue into a scoped workspace.",
    thisStepLabel: "This step",
    bullets: [
      "Branch-aware Neon Auth with tenant-scoped sessions",
      "Organization onboarding before module access",
      "Role capabilities enforced on every protected route",
    ],
  },
} as const;

export const authPageMetadataCopy = {
  signIn: {
    title: "Sign in",
    description: "Sign in to your Afenda ERP workspace.",
  },
  signUp: {
    title: "Create account",
    description:
      "Create an operator account and verify your email to continue.",
  },
  forgotPassword: {
    title: "Reset password",
    description: "Request a verification code and set a new password.",
  },
  onboarding: {
    title: "Create workspace",
    description: "Create the first organization workspace for this tenant.",
  },
} as const;

export type AuthPageMetadataKey = keyof typeof authPageMetadataCopy;

export const authPageShellCopy = {
  signIn: {
    title: "Sign in",
    description: "Sign in with email, Google, or your development session.",
    suspenseDescription:
      "Sign in with email, Google, or your development session.",
  },
  signUp: {
    title: "Create account",
    description:
      "Register an operator account and verify your email before onboarding.",
    suspenseDescription:
      "Register an operator account and verify your email before onboarding.",
  },
  forgotPassword: {
    title: "Reset password",
    description: "Request a verification code and choose a new password.",
    suspenseDescription:
      "Request a verification code and choose a new password.",
  },
  onboarding: {
    title: "Organization onboarding",
    description:
      "Provision the first organization for this tenant before module access.",
    suspenseDescription:
      "Provision the first organization for this tenant before module access.",
  },
} as const;

export const neonAuthFormCopy = {
  signIn: {
    title: "Sign in to your workspace",
    description: "Use your operator credentials for this tenant workspace.",
    button: "Sign in",
    alternatePrompt: "Need an account?",
    alternateHref: "/sign-up",
    alternateLabel: "Create account",
  },
  signUp: {
    title: "Create your operator account",
    description:
      "We email a one-time verification code after registration. Verified accounts continue into organization onboarding.",
    button: "Create account",
    alternatePrompt: "Already registered?",
    alternateHref: "/sign-in",
    alternateLabel: "Sign in",
    successMessage:
      "Account created. Check your inbox for a one-time verification code, then continue to onboarding.",
  },
  googleButton: "Continue with Google",
  dividerLabel: "or",
  fields: {
    fullName: "Full name",
    email: "Email",
    password: "Password",
    passwordHint: "Use at least 8 characters.",
    forgotPassword: "Forgot password?",
  },
  pendingLabel: "Working...",
  errors: {
    googleSignIn: "Unable to continue with Google.",
    googleStart: "Google sign-in could not be started.",
    signIn: "Unable to sign in.",
    signUp: "Unable to create account.",
    generic: "Authentication failed.",
  },
} as const;

export const devSignInCopy = {
  eyebrow: "Development access",
  title: "Enter the workspace",
  description:
    "Neon Auth is disabled in this environment. Use the demo operator session to explore module routes locally.",
  fields: {
    name: "Name",
    email: "Email",
    organization: "Organization",
  },
  defaults: {
    name: "Demo Operator",
    email: "owner@afenda.local",
    organization: "Afenda Operations",
  },
  submitLabel: "Continue to dashboard",
} as const;

export const signInEnvironmentCopy = {
  disabledMessage:
    "Development sign-in is disabled in this environment. Configure Neon Auth or enable an approved e2e auth flag for smoke testing.",
} as const;

export const signUpEnvironmentCopy = {
  title: "Neon Auth is not configured",
  description:
    "Account creation requires Neon Auth in this environment. Use the development sign-in flow instead.",
  actionLabel: "Go to development sign-in",
} as const;

export const forgotPasswordCopy = {
  title: "Reset your password",
  requestDescription:
    "We will email a one-time code you can use to choose a new password.",
  resetDescription: "Enter the code from your email and set a new password.",
  fields: {
    email: "Email",
    verificationCode: "Verification code",
    newPassword: "New password",
    passwordHint: "Use at least 8 characters.",
  },
  actions: {
    sendCode: "Send reset code",
    sendingCode: "Sending...",
    updatePassword: "Update password",
    updatingPassword: "Updating...",
    sendNewCode: "Send a new code",
  },
  footerPrompt: "Remembered your password?",
  footerAction: "Back to sign in",
  messages: {
    codeSent:
      "If an account exists for this email, a verification code has been sent.",
    passwordUpdated:
      "Password updated. You can sign in with your new password.",
    sendCodeError: "Unable to send a reset code right now.",
    sendCodeFailed: "Unable to send reset code.",
    resetFailed: "Unable to reset password with that code.",
    passwordResetFailed: "Password reset failed.",
  },
} as const;

export const onboardingFormCopy = {
  title: "Create the first tenant workspace",
  description:
    "Your identity is active, but this operator account is not assigned to an organization yet. Name the initial workspace to unlock protected ERP modules.",
  organizationLabel: "Organization name",
  defaultOrganization: "Afenda Operations",
  submitLabel: "Create workspace",
} as const;

export const authLoadingCopy = {
  title: "Loading sign-in",
  description: "Preparing the authentication experience.",
} as const;

export const onboardingLoadingCopy = {
  title: "Preparing workspace",
  description: "Loading your organization setup.",
} as const;

export const appRootMetadataCopy = {
  defaultTitle: "Afenda ERP",
  titleTemplate: "%s | Afenda ERP",
  description:
    "Vercel-first ERP workspace for operations, finance, and reporting.",
} as const;

export const authApiRouteCopy = {
  neonNotConfigured: "Neon Auth is not configured for this environment.",
  routeFailed: "Authentication route failed.",
} as const;

export const uploadRouteCopy = {
  authenticationRequired: "Authentication is required.",
  organizationRequired: "An active organization is required.",
  uploadNotAllowed: "Document upload is not allowed.",
  blobNotConfigured:
    "Document uploads are unavailable. Configure object storage for this environment.",
  storageNotConfigured:
    "Document uploads are unavailable. Configure object storage for this environment.",
  invalidRequest: "Invalid document upload request.",
  uploadFailed: "Document upload failed.",
  missingTokenPayload: "Upload token payload is missing.",
  tokenMismatch: "Upload token does not match the active session.",
  documentNotFound: "Document was not found.",
  downloadNotAllowed: "Document download is not allowed.",
  blobStorageUnavailable: "Document storage is temporarily unavailable.",
} as const;

export function getAuthPageMetadataCopy(key: AuthPageMetadataKey) {
  return authPageMetadataCopy[key];
}

export function getAuthPageShellCopy(key: AuthPageMetadataKey) {
  return authPageShellCopy[key];
}

export function getNeonAuthFormModeCopy(mode: "sign-in" | "sign-up") {
  return mode === "sign-in" ? neonAuthFormCopy.signIn : neonAuthFormCopy.signUp;
}
