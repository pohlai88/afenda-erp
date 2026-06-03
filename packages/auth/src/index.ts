export {
  OPERATING_CONTEXT_BRANDING_KEY,
  buildOperatingContextSwitchOptions,
  organizationOperatingContextBrandingSchema,
  readOrganizationOperatingContextLabels,
  resolveOrganizationOperatingContext,
  type OperatingContextSwitchOption,
  type OrganizationOperatingContextLabels,
  type OrganizationOperatingContextSource,
  type ResolvedOrganizationOperatingContext,
} from "./contracts/auth.operating-context";
export {
  AUTH_PASSWORD_POLICY,
  evaluatePasswordPolicy,
  getPasswordPolicyFailureMessage,
  isPasswordPolicySatisfied,
  type AuthPasswordRequirementKey,
  type AuthPasswordRequirementResult,
} from "./policy/password-policy.shared";
export {
  resolveAuthMethodReadiness,
  type AuthMethodReadiness,
  type AuthMethodReadinessReason,
  type AuthMethodReadinessState,
} from "./policy/auth-method-readiness.shared";
export {
  authErrorCodes,
  type AuthErrorCode,
} from "./errors/auth-error-codes.shared";
export {
  getNormalizedAuthErrorMessage,
  normalizeAuthError,
} from "./errors/normalize-auth-error.shared";
export { authErrorCopy } from "./copy/auth-error-copy.shared";
export { authPendingCopy } from "./copy/auth-pending-copy.shared";
export { authSuccessCopy } from "./copy/auth-success-copy.shared";
export {
  AFENDA_SESSION_COOKIE,
  DEMO_ORG_ID,
  DEMO_ORG_NAME,
  DEMO_USER_EMAIL,
  DEMO_USER_ID,
  DEMO_USER_NAME,
  DEV_SESSION_MAX_AGE_SECONDS,
} from "./contracts/auth.constants.shared";
export {
  appCapabilities,
  capabilitiesForRole,
  documentReadCapability,
  documentSensitiveReadCapability,
  documentWriteCapability,
  hasDocumentReadAccess,
  hasDocumentSensitiveReadAccess,
  hasDocumentWriteAccess,
  isAppCapability,
  normalizeCapabilities,
  normalizeOrganizationSlug,
  organizationRoles,
  type AppCapability,
  type OrganizationRole,
} from "./contracts/auth.capability-policy.shared";
export {
  organizationSummarySchema,
  userSessionSchema,
  type OrganizationSummary,
  type UserSession,
} from "./contracts/auth.session-contracts.shared";
export {
  changePasswordSchema,
  credentialsSignInSchema,
  credentialsSignUpSchema,
  devSignInSchema,
  organizationOnboardingSchema,
  switchOrganizationSchema,
  updateProfileSchema,
} from "./contracts/auth.action-schemas.shared";
