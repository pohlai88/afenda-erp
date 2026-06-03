import "server-only";

export {
  bootstrapCurrentUserOrganization,
  bootstrapDevSessionTenant,
  createDevSessionCookie,
  getActiveOrganization,
  getApiAuthContext,
  getDevSessionCookieMaxAge,
  getOrganizationContext,
  getPostSignInDestination,
  getSession,
  requireCapability,
  requireSession,
  signOut,
  switchActiveOrganization,
  type ApiAuthContext,
} from "./session/auth.session.server";
export {
  documentReadCapability,
  documentWriteCapability,
  hasDocumentReadAccess,
  hasDocumentWriteAccess,
} from "./index";
export {
  resolveAuthMethodReadiness,
  type AuthMethodReadiness,
  type AuthMethodReadinessReason,
  type AuthMethodReadinessState,
} from "./policy/auth-method-readiness.shared";
