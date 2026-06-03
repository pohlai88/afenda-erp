import "server-only";

export {
  auth,
  getNeonAuthServer,
  isNeonAuthReady,
  isNeonAuthUiReady,
} from "./runtime/neon-auth.server";
export {
  hasNeonAuthSessionToken,
  readNeonAuthSessionPayload,
  type NeonAuthSessionPayload,
} from "./runtime/neon-session.server";
export { NEON_AUTH_SESSION_TOKEN_COOKIE } from "./runtime/neon-cookies.shared";
export { verifyNeonAuthAccessToken } from "./security/jwt-verify.server";
export { verifyNeonAuthWebhookPayload } from "./security/webhook-verify.server";
export { handleNeonAuthWebhookPost } from "./webhooks/handler.server";
export {
  getNeonAuthWebhookHooks,
  registerNeonAuthWebhookHooks,
  resetNeonAuthWebhookHooksForTests,
  type NeonAuthWebhookHooks,
} from "./webhooks/hooks.server";
export * from "./contracts";
