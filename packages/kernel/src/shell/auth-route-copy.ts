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
  otp: {
    title: "Sign in with code",
    description: "Request a one-time email code to sign in.",
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
  resetPassword: {
    title: "Set new password",
    description: "Choose a new password using the link from your email.",
  },
  verifyEmail: {
    title: "Verify email",
    description: "Enter the one-time code sent to your inbox to activate your account.",
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
  otp: {
    title: "Sign in with a one-time code",
    description:
      "Request an email code for an existing operator account and use it to enter the workspace.",
    suspenseDescription:
      "Request an email code for an existing operator account.",
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
  resetPassword: {
    title: "Set new password",
    description: "Enter a new password from your reset email link.",
    suspenseDescription: "Confirm your new password to finish resetting access.",
  },
  verifyEmail: {
    title: "Verify your email",
    description:
      "Production tenants require a verified email before organization onboarding.",
    suspenseDescription: "Confirm your operator email with a one-time code.",
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
  passwordless: {
    sectionTitle: "Other sign-in options",
    magicLink: {
      title: "Email me a sign-in link",
      description: "We send a one-time link to your inbox. Existing accounts only.",
      button: "Send sign-in link",
      success: "Check your email for the sign-in link.",
    },
    emailOtp: {
      title: "Sign in with a code",
      description: "Use a one-time code sent to your email. Existing accounts only.",
      sendButton: "Send code",
      verifyButton: "Sign in with code",
      codeLabel: "Sign-in code",
      success: "Signed in. Loading your workspace.",
    },
    errors: {
      sendFailed: "Unable to send the sign-in code or link.",
      verifyFailed: "Unable to sign in with that code.",
      missingEmail: "Enter your email address.",
      missingCode: "Enter the code from your email.",
    },
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
  emailOtpDisabledMessage:
    "Email code sign-in is not enabled for this environment. Enable Neon Auth, email delivery, and AFENDA_AUTH_EMAIL_OTP_ENABLED to use this flow.",
} as const;

export const signUpEnvironmentCopy = {
  title: "Neon Auth is not configured",
  description:
    "Account creation requires Neon Auth in this environment. Use the development sign-in flow instead.",
  devHint:
    "Neon Auth is off in this environment. Sign in with a development session to reach onboarding.",
  actionLabel: "Go to development sign-in",
} as const;

export const verifyEmailCopy = {
  title: "Verify your email",
  description:
    "Enter the one-time code from your email, or open the verification link we sent. Codes expire after 15 minutes; use resend if needed.",
  fields: {
    email: "Email",
    verificationCode: "Verification code",
  },
  actions: {
    verify: "Verify email",
    verifying: "Verifying...",
    resendCode: "Resend code",
    resendingCode: "Sending...",
  },
  footerPrompt: "Already verified?",
  footerAction: "Back to sign in",
  messages: {
    codeSent: "A new verification code has been sent when an account exists for this email.",
    verified: "Email verified. Continuing to onboarding.",
    verifiedSignIn: "Email verified. You can sign in now.",
    missingEmail: "Enter the email address you used when creating your account.",
    sendCodeError: "Unable to send a verification code right now.",
    sendCodeFailed: "Unable to send verification code.",
    verifyFailed: "Unable to verify that code.",
    verifyError: "Email verification failed.",
  },
} as const;

export const authNotFoundCopy = {
  title: "Page not found",
  description: "This sign-in route does not exist. Return to sign in to continue.",
  actionLabel: "Back to sign in",
} as const;

export const resetPasswordCopy = {
  title: "Set a new password",
  description:
    "Open the link from your reset email, then choose a new password below.",
  fields: {
    newPassword: "New password",
    confirmPassword: "Confirm password",
    passwordHint: "Use at least 8 characters.",
  },
  actions: {
    submit: "Update password",
    submitting: "Updating...",
    requestNewLink: "Request a new reset link",
  },
  footerPrompt: "Remembered your password?",
  footerAction: "Back to sign in",
  messages: {
    missingToken:
      "This reset link is invalid or expired. Request a new link from forgot password.",
    mismatch: "Passwords do not match.",
    passwordUpdated:
      "Password updated. You can sign in with your new password.",
    passwordUpdatedSignedIn:
      "Password updated. Continuing to your workspace.",
    resetFailed: "Unable to reset password with this link.",
    resetFailedGeneric: "Password reset failed.",
  },
} as const;

export const forgotPasswordCopy = {
  title: "Reset your password",
  requestDescription:
    "We will email a reset link or one-time code (expires in 15 minutes). Open the link or enter the code below to choose a new password.",
  resetDescription:
    "Enter the code from your email and set a new password. Request a new code if it expired.",
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
      "If an account exists for this email, a reset link or code has been sent.",
    linkSent:
      "If an account exists for this email, check your inbox for a reset link.",
    passwordUpdated:
      "Password updated. You can sign in with your new password.",
    passwordUpdatedSignedIn:
      "Password updated. Continuing to your workspace.",
    sendCodeError: "Unable to send a reset code right now.",
    sendCodeFailed: "Unable to send reset code.",
    resetFailed: "Unable to reset password with that code.",
    passwordResetFailed: "Password reset failed.",
  },
} as const;

export const accountSettingsCopy = {
  page: {
    title: "Account settings",
    description:
      "Update your operator display name and password for this Neon Auth identity.",
  },
  profile: {
    title: "Profile",
    description: "Display name shown in the workspace shell and audit trails.",
    nameLabel: "Display name",
    submitLabel: "Save profile",
    success: "Profile updated.",
    updateFailed: "Profile update failed.",
  },
  password: {
    title: "Password",
    description:
      "Change your password while signed in. Use forgot password if you cannot sign in.",
    currentLabel: "Current password",
    newLabel: "New password",
    confirmLabel: "Confirm new password",
    revokeLabel: "Sign out other devices",
    revokeHint: "Ends sessions on other browsers after this change.",
    submitLabel: "Change password",
    success: "Password changed successfully.",
    changeFailed: "Password change failed.",
    mismatch: "New passwords do not match.",
    forgotHref: "/forgot-password",
    forgotLabel: "Forgot your password?",
  },
  emailNote:
    "Email address is managed by Neon Auth and cannot be changed here. Contact your administrator if you need a different login email.",
  unavailable: {
    devSession:
      "Profile and password changes apply to Neon Auth accounts. Use a Neon sign-in session or update the dev cookie from the floating panel.",
    neonDisabled:
      "Neon Auth is not enabled in this environment.",
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
