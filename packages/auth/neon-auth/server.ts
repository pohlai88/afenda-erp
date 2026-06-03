import "server-only";

export {
  auth,
  getNeonAuthServer,
  isNeonAuthReady,
  isNeonAuthUiReady,
  resetNeonAuthServerForTests,
  signOutNeonSession,
} from "./runtime/neon-auth.server";
export {
  hasNeonAuthSessionToken,
  readNeonAuthSessionPayload,
  type NeonAuthSessionPayload,
} from "./runtime/neon-session.server";
export { NEON_AUTH_SESSION_TOKEN_COOKIE } from "./runtime/neon-cookies.shared";
export { verifyNeonAuthAccessToken, resetNeonAuthJwtVerifyCacheForTests } from "./security/jwt-verify.server";
export { verifyNeonAuthWebhookPayload } from "./security/webhook-verify.server";
export { resetNeonAuthJwksCacheForTests } from "./security/jwks.shared.server";
export { handleNeonAuthWebhookPost } from "./webhooks/handler.server";
export {
  getNeonAuthWebhookHooks,
  registerNeonAuthWebhookHooks,
  resetNeonAuthWebhookHooksForTests,
  type NeonAuthWebhookHooks,
} from "./webhooks/hooks.server";
export * from "./contracts";
